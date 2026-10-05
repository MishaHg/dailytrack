"""
DailyTrack - Router pro správu úkolů (Tasks)
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from ..database import db, Priority
from ..schemas import TaskResponse, TaskCreate, TaskUpdate

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


@router.get("", response_model=List[TaskResponse])
def get_tasks(
    status: str = Query(default="all", description="Filtr stavu: all, pending, completed"),
    priority: str = Query(default="all", description="Filtr priority: all, Nízká, Střední, Vysoká"),
    search: str = Query(default="", description="Vyhledávání v názvu nebo popisu")
):
    return db.get_tasks(status_filter=status, priority_filter=priority, search_query=search)


@router.get("/today", response_model=List[TaskResponse])
def get_today_tasks():
    return db.get_today_tasks()


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: int):
    task = db.get_task_by_id(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Úkol nenalezen")
    return task


@router.post("", response_model=TaskResponse, status_code=201)
def create_task(task: TaskCreate):
    created = db.add_task(
        title=task.title,
        description=task.description or "",
        priority=task.priority,
        due_date=task.due_date,
        recurrence=task.recurrence
    )
    return created


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, task: TaskUpdate):
    updated = db.update_task(
        task_id=task_id,
        title=task.title,
        description=task.description or "",
        priority=task.priority,
        due_date=task.due_date,
        recurrence=task.recurrence
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Úkol nenalezen")
    return updated


@router.post("/{task_id}/toggle", response_model=TaskResponse)
def toggle_task(task_id: int):
    toggled = db.toggle_task_completion(task_id)
    if not toggled:
        raise HTTPException(status_code=404, detail="Úkol nenalezen")
    return toggled


@router.delete("/{task_id}")
def delete_task(task_id: int):
    deleted = db.delete_task(task_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Úkol nenalezen")
    return {"success": True, "message": "Úkol byl úspěšně smazán"}
