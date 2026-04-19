import uvicorn
from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from typing import List, Optional
import uuid

app = FastAPI()
templates = Jinja2Templates(directory="templates")

class Todo:
    def __init__(self, text: str):
        self.id = str(uuid.uuid4())
        self.text = text
        self.completed = False

todos: List[Todo] = []
current_filter = "all"

def get_filtered_todos():
    if current_filter == "active":
        return [t for t in todos if not t.completed]
    elif current_filter == "completed":
        return [t for t in todos if t.completed]
    return todos

def get_counts():
    active = len([t for t in todos if not t.completed])
    return active, len(todos) - active


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    active_count, _ = get_counts()
    return templates.TemplateResponse("index.html", {
        "request": request,
        "todos": get_filtered_todos(),
        "filter": current_filter,
        "active_count": active_count,
        "has_completed": any(t.completed for t in todos)
    })

@app.post("/add", response_class=HTMLResponse)
async def add_todo(request: Request, text: str = Form(...)):
    if text.strip():
        todos.insert(0, Todo(text))

    return templates.TemplateResponse("list.html", {
        "request": request,
        "todos": get_filtered_todos(),
        "filter": current_filter,
        "oob_update": True
    })

@app.post("/toggle/{todo_id}", response_class=HTMLResponse)
async def toggle_todo(request: Request, todo_id: str):
    for t in todos:
        if t.id == todo_id:
            t.completed = not t.completed
            break

    return templates.TemplateResponse("list.html", {
        "request": request,
        "todos": get_filtered_todos(),
        "filter": current_filter,
        "oob_update": True
    })

@app.delete("/delete/{todo_id}", response_class=HTMLResponse)
async def delete_todo(request: Request, todo_id: str):
    global todos
    todos = [t for t in todos if t.id != todo_id]

    return templates.TemplateResponse("list.html", {
        "request": request,
        "todos": get_filtered_todos(),
        "filter": current_filter,
        "oob_update": True
    })

@app.post("/filter/{filter_type}", response_class=HTMLResponse)
async def set_filter(request: Request, filter_type: str):
    global current_filter
    current_filter = filter_type

    return templates.TemplateResponse("list.html", {
        "request": request,
        "todos": get_filtered_todos(),
        "filter": current_filter,
        "oob_update": False
    })

@app.post("/clear-completed", response_class=HTMLResponse)
async def clear_completed(request: Request):
    global todos
    todos = [t for t in todos if not t.completed]

    return templates.TemplateResponse("list.html", {
        "request": request,
        "todos": get_filtered_todos(),
        "filter": current_filter,
        "oob_update": True
    })

templates.env.globals["get_counts"] = get_counts

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)