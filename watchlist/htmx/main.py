import os
import httpx
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Depends, Body, Request, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = "super-tajne-heslo-pro-bakalarku"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/login")

app = FastAPI()

if not os.path.exists("static"):
    os.makedirs("static")
app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")

def format_date(value):
    if not value: return "Neznámé datum"
    try:
        d = datetime.strptime(value, "%Y-%m-%d")
        return d.strftime("%d. %m. %Y")
    except:
        return value

templates.env.filters["format_date"] = format_date

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = AsyncIOMotorClient(os.getenv("MONGODB_URL"))
db = client[os.getenv("DB_NAME")]

class MovieSchema(BaseModel):
    tmdb_id: int
    title: str
    poster_path: Optional[str] = None
    release_date: Optional[str] = None
    overview: Optional[str] = None
    vote_average: Optional[float] = 0.0
    status: str = "to_watch"
    rating: Optional[int] = None
    comment: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

def get_password_hash(password): return pwd_context.hash(password[:72])
def verify_password(plain, hashed): return pwd_context.verify(plain, hashed)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None: raise HTTPException(status_code=401)
        return username
    except JWTError: raise HTTPException(status_code=401)

@app.post("/api/register")
async def register(form_data: OAuth2PasswordRequestForm = Depends()):
    hashed = get_password_hash(form_data.password)
    await db["users"].insert_one({"username": form_data.username, "password": hashed})
    return {"msg": "User created"}

@app.post("/api/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await db["users"].find_one({"username": form_data.username})
    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Nesprávné údaje")
    access_token = jwt.encode({"sub": user["username"], "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)}, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/movies")
async def add_movie_api(movie: MovieSchema, user: str = Depends(get_current_user)):
    existing = await db["movies"].find_one({"tmdb_id": movie.tmdb_id, "owner": user})
    if existing: raise HTTPException(status_code=400, detail="Již existuje")
    movie_dict = movie.dict()
    movie_dict["owner"] = user
    await db["movies"].insert_one(movie_dict)
    if "_id" in movie_dict: movie_dict["_id"] = str(movie_dict["_id"])
    return movie_dict

@app.put("/api/movies/{tmdb_id}")
async def update_movie_api(tmdb_id: int, data: dict, user: str = Depends(get_current_user)):
    result = await db["movies"].update_one({"tmdb_id": tmdb_id, "owner": user}, {"$set": data})
    if result.matched_count == 0: raise HTTPException(status_code=404)
    return {"msg": "Updated"}

@app.delete("/api/movies/{tmdb_id}")
async def delete_movie_api(tmdb_id: int, user: str = Depends(get_current_user)):
    await db["movies"].delete_one({"tmdb_id": tmdb_id, "owner": user})
    return {"msg": "Deleted"}

@app.get("/", response_class=HTMLResponse)
async def serve_home(request: Request):
    return templates.TemplateResponse(
    request=request,
    name="index.html",
    context={}
)

@app.get("/htmx/login-form", response_class=HTMLResponse)
async def serve_login_form(request: Request):
    return templates.TemplateResponse(request=request, name="login.html")

@app.get("/htmx/movies", response_class=HTMLResponse)
async def serve_movies_grid(request: Request, user: str = Depends(get_current_user)):
    movies = await db["movies"].find({"owner": user}).to_list(1000)
    for m in movies:
        m["_id"] = str(m["_id"])
        m["vote_average"] = m.get("vote_average", 0)
        m["rating"] = m.get("rating", 0)

    return templates.TemplateResponse(
    request=request,
    name="movie_list.html",
    context={
        "movies": movies,
        "view_type": "library"
    }
)

@app.get("/htmx/search", response_class=HTMLResponse)
async def serve_search_results(request: Request, query: str, user: str = Depends(get_current_user)):
    headers = {"accept": "application/json", "Authorization": os.getenv("TMDB_API_KEY")}
    url = f"https://api.themoviedb.org/3/search/movie?query={query}&include_adult=false&language=cs-CZ&page=1"

    async with httpx.AsyncClient() as c:
        resp = await c.get(url, headers=headers)
        data = resp.json()

    results = [r for r in data.get("results", []) if r.get("media_type") != "person"]
    total_results = len(results)

    local_movies = await db["movies"].find({"owner": user}).to_list(1000)
    local_ids = {m["tmdb_id"]: m for m in local_movies}

    for r in results:
        r["tmdb_id"] = r["id"]
        if r["id"] in local_ids:
            r["is_in_library"] = True
            r["local_status"] = local_ids[r["id"]]["status"]
            r["local_rating"] = local_ids[r["id"]].get("rating")
        else:
            r["is_in_library"] = False

    return templates.TemplateResponse(
        request=request,
        name="movie_list.html",
        context={
            "movies": results,
            "view_type": "search",
            "total_results": total_results
        }
    )

@app.get("/htmx/modal/{source}/{id}", response_class=HTMLResponse)
async def serve_modal(request: Request, source: str, id: str, user: str = Depends(get_current_user)):
    local_movie = await db["movies"].find_one({"tmdb_id": int(id), "owner": user})
    movie = None
    is_local = False

    if local_movie:
        movie = local_movie
        is_local = True
    else:
        headers = {"Authorization": os.getenv("TMDB_API_KEY")}
        url = f"https://api.themoviedb.org/3/movie/{id}?language=cs-CZ"
        async with httpx.AsyncClient() as c:
            resp = await c.get(url, headers=headers)
            movie = resp.json()
            movie['tmdb_id'] = movie['id']

    movie['release_date'] = movie.get('release_date') or movie.get('first_air_date')
    movie['vote_average'] = movie.get('vote_average', 0)
    movie['overview'] = movie.get('overview', "Popis není k dispozici.")

    return templates.TemplateResponse(
        request=request,
        name="modal.html",
        context={
            "movie": movie,
            "is_local": is_local
        }
    )