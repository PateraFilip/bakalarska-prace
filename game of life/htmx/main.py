import uvicorn
from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import random

app = FastAPI()

templates = Jinja2Templates(directory="templates")

class GameState:
    def __init__(self, rows=30, cols=30):
        self.rows = rows
        self.cols = cols
        self.grid = [[0 for _ in range(cols)] for _ in range(rows)]
        self.running = False

    def resize(self, new_rows, new_cols):
        self.rows = new_rows
        self.cols = new_cols
        self.grid = [[0 for _ in range(new_cols)] for _ in range(new_rows)]

    def toggle(self, r, c):
        if 0 <= r < self.rows and 0 <= c < self.cols:
            self.grid[r][c] = 1 if self.grid[r][c] == 0 else 0

    def reset(self):
        self.grid = [[0 for _ in range(self.cols)] for _ in range(self.rows)]

    def randomize(self):
        self.grid = [[random.choice([0, 1]) for _ in range(self.cols)] for _ in range(self.rows)]

    def next_generation(self):
        new_grid = [[0 for _ in range(self.cols)] for _ in range(self.rows)]
        for r in range(self.rows):
            for c in range(self.cols):
                neighbors = 0
                for i in range(-1, 2):
                    for j in range(-1, 2):
                        if i == 0 and j == 0: continue

                        nr = (r + i) % self.rows
                        nc = (c + j) % self.cols

                        neighbors += self.grid[nr][nc]

                if self.grid[r][c] == 1:
                    new_grid[r][c] = 1 if neighbors in [2, 3] else 0
                else:
                    new_grid[r][c] = 1 if neighbors == 3 else 0
        self.grid = new_grid

game = GameState()

@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index.html", {
        "request": request,
        "grid": game.grid,
        "rows": game.rows,
        "cols": game.cols
    })

@app.post("/resize")
async def resize_grid(request: Request, rows: int = Form(...), cols: int = Form(...)):
    rows = max(5, min(100, rows))
    cols = max(5, min(100, cols))
    game.resize(rows, cols)
    return templates.TemplateResponse("grid.html", {"request": request, "grid": game.grid})

@app.post("/toggle/{r}/{c}")
async def toggle_cell(request: Request, r: int, c: int):
    game.toggle(r, c)
    is_alive = game.grid[r][c] == 1
    return HTMLResponse(
        f'<div hx-post="/toggle/{r}/{c}" hx-swap="outerHTML" '
        f'class="w-5 h-5 border border-gray-700/50 cursor-pointer transition-colors duration-75 '
        f'{"bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" if is_alive else "bg-gray-900 hover:bg-gray-800"}"></div>'
    )

@app.post("/step")
async def step(request: Request):
    game.next_generation()
    return templates.TemplateResponse("grid.html", {"request": request, "grid": game.grid})

@app.post("/reset")
async def reset(request: Request):
    game.reset()
    return templates.TemplateResponse("grid.html", {"request": request, "grid": game.grid})

@app.post("/random")
async def randomize(request: Request):
    game.randomize()
    return templates.TemplateResponse("grid.html", {"request": request, "grid": game.grid})

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)