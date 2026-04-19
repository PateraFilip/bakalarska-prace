from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

@app.get("/")
def home(request: Request):
    return templates.TemplateResponse("home.html", {"request": request})

@app.get("/info-todo")
def info_todo(request: Request):
    return templates.TemplateResponse("info-todo.html", {"request": request})

@app.get("/info-watchlist")
def info_watchlist(request: Request):
    return templates.TemplateResponse("info-watchlist.html", {"request": request})

@app.get("/info-game")
def info_game(request: Request):
    return templates.TemplateResponse("info-game.html", {"request": request})