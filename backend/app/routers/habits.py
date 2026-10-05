"""
DailyTrack - Router pro správu návyků (Habits)
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from ..database import db
from ..schemas import HabitResponse, HabitCreate, HabitUpdate, HabitToggleRequest

router = APIRouter(prefix="/api/habits", tags=["Habits"])


@router.get("", response_model=List[HabitResponse])
def get_habits(days: int = Query(default=7, ge=1, le=30, description="Počet dní historie pro mřížku")):
    return db.get_habits_with_details(history_days=days)


@router.get("/{habit_id}", response_model=HabitResponse)
def get_habit(habit_id: int):
    habit = db.get_habit_by_id(habit_id)
    if not habit:
        raise HTTPException(status_code=404, detail="Návyk nenalezen")
    return habit


@router.post("", response_model=HabitResponse, status_code=201)
def create_habit(habit: HabitCreate):
    created = db.add_habit(
        name=habit.name,
        description=habit.description or "",
        color=habit.color
    )
    return created


@router.put("/{habit_id}", response_model=HabitResponse)
def update_habit(habit_id: int, habit: HabitUpdate):
    updated = db.update_habit(
        habit_id=habit_id,
        name=habit.name,
        description=habit.description or "",
        color=habit.color
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Návyk nenalezen")
    return updated


@router.post("/{habit_id}/toggle")
def toggle_habit(habit_id: int, body: Optional[HabitToggleRequest] = None):
    target_date = body.date if body and body.date else None
    habit = db.get_habit_by_id(habit_id)
    if not habit:
        raise HTTPException(status_code=404, detail="Návyk nenalezen")

    is_completed = db.toggle_habit_date(habit_id, target_date)
    # Vrátíme aktualizovaný objekt návyku
    updated = db.get_habit_by_id(habit_id)
    return {"completed": is_completed, "habit": updated}


@router.delete("/{habit_id}")
def delete_habit(habit_id: int):
    deleted = db.delete_habit(habit_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Návyk nenalezen")
    return {"success": True, "message": "Návyk byl úspěšně smazán"}
