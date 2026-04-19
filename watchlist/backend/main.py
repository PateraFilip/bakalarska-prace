import os
import httpx
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Depends, Body, Request, Form
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from dotenv import load_dotenv
import asyncio
import random

load_dotenv()

SECRET_KEY = "super-tajne-heslo-pro-bakalarku"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/login")

app = FastAPI()

def format_date(value):
    if not value: return "Neznámé datum"
    try:
        d = datetime.strptime(value, "%Y-%m-%d")
        return d.strftime("%d. %m. %Y")
    except:
        return value

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

@app.get("/api/search")
async def search_api(query: str):
    headers = {"accept": "application/json", "Authorization": os.getenv("TMDB_API_KEY")}
    url = f"https://api.themoviedb.org/3/search/movie?query={query}&include_adult=false&language=cs-CZ&page=1"
    async with httpx.AsyncClient() as c:
        resp = await c.get(url, headers=headers)
        return resp.json()

@app.get("/api/movies")
async def get_movies_api(user: str = Depends(get_current_user)):
    movies = await db["movies"].find({"owner": user}).to_list(1000)
    for m in movies: m["_id"] = str(m["_id"])
    return movies

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

@app.get("/api/admin/generate-real")
async def generate_real_api(user: str = Depends(get_current_user)):
    await db["movies"].delete_many({"owner": user})

    api_key = os.getenv("TMDB_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Chybí TMDB_API_KEY v .env")

    headers = {"accept": "application/json", "Authorization": api_key}

    async def fetch_page(client, page):
        url = f"https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=cs-CZ&page={page}&sort_by=popularity.desc"
        try:
            resp = await client.get(url, headers=headers)
            if resp.status_code == 200:
                return resp.json().get("results", [])
            return []
        except:
            return []

    all_results = []

    async with httpx.AsyncClient() as client:
        for chunk in range(0, 50, 10):
            tasks = [fetch_page(client, page) for page in range(chunk + 1, chunk + 11)]
            results = await asyncio.gather(*tasks)
            for r in results:
                all_results.extend(r)
            await asyncio.sleep(0.2)

    batch = []
    seen_ids = set()

    for m in all_results:
        if not m.get("poster_path") or m["id"] in seen_ids:
            continue

        seen_ids.add(m["id"])

        status = random.choice(["to_watch", "watched", "watched", "to_watch"])

        my_rating = None
        if status == "watched":
            base_score = int(m.get("vote_average", 5))
            my_rating = max(1, min(10, base_score + random.randint(-2, 2)))

        movie_doc = {
            "tmdb_id": m["id"],
            "title": m["title"],
            "original_title": m.get("original_title"),
            "poster_path": m["poster_path"],
            "release_date": m.get("release_date"),
            "overview": m.get("overview") or "Popis není k dispozici.",
            "vote_average": m.get("vote_average", 0),
            "status": status,
            "rating": my_rating,
            "comment": "Automaticky importováno z TMDB Top 1000.",
            "owner": user,
            "is_in_library": True
        }
        batch.append(movie_doc)

        if len(batch) >= 1000:
            break

    if batch:
        await db["movies"].insert_many(batch)

    return {
        "msg": "Success",
        "count": len(batch),
        "info": "Filmy byly staženy z TMDB Popular listu."
    }
