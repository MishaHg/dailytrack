"""
DailyTrack - Router pro statistiky a vizualizace
"""

from fastapi import APIRouter, Query
from ..database import db
from ..schemas import OverallStatsResponse, TaskStatsResponse, HabitStatsResponse

router = APIRouter(prefix="/api/stats", tags=["Stats"])


@router.get("", response_model=OverallStatsResponse)
def get_overall_stats():
    task_stats = db.get_task_statistics()
    habit_stats = db.get_habit_statistics()
    activity = db.get_habit_activity_last_days(days=14)

    return {
        "tasks": task_stats,
        "habits": habit_stats,
        "activity_14_days": activity
    }


@router.get("/tasks", response_model=TaskStatsResponse)
def get_task_stats():
    return db.get_task_statistics()


@router.get("/habits", response_model=HabitStatsResponse)
def get_habit_stats():
    return db.get_habit_statistics()


@router.get("/habits/activity")
def get_habit_activity(days: int = Query(default=14, ge=3, le=90)):
    return db.get_habit_activity_last_days(days=days)
