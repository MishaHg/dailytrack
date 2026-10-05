"""
DailyTrack - Datové modely aplikace
"""

from dataclasses import dataclass, field
from typing import Optional, List, Dict
from datetime import datetime, date


class Priority:
    LOW = "Nízká"
    MEDIUM = "Střední"
    HIGH = "Vysoká"

    ALL = [LOW, MEDIUM, HIGH]

    @classmethod
    def color(cls, priority: str) -> str:
        colors = {
            cls.LOW: "#10B981",     # Zelená / Teal
            cls.MEDIUM: "#F59E0B",  # Oranžová / Amber
            cls.HIGH: "#EF4444",    # Červená / Rose
        }
        return colors.get(priority, "#6B7280")


class Recurrence:
    NONE = "Žádné"
    DAILY = "Denně"
    WEEKLY = "Týdně"
    MONTHLY = "Měsíčně"

    ALL = [NONE, DAILY, WEEKLY, MONTHLY]


@dataclass
class Task:
    id: Optional[int]
    title: str
    description: str = ""
    priority: str = Priority.MEDIUM
    due_date: Optional[str] = None       # Format: YYYY-MM-DD
    recurrence: str = Recurrence.NONE
    completed: bool = False
    completed_at: Optional[str] = None
    created_at: Optional[str] = None

    @property
    def is_overdue(self) -> bool:
        if not self.due_date or self.completed:
            return False
        try:
            due = datetime.strptime(self.due_date, "%Y-%m-%d").date()
            return due < date.today()
        except ValueError:
            return False

    @property
    def is_due_today(self) -> bool:
        if not self.due_date:
            return False
        try:
            due = datetime.strptime(self.due_date, "%Y-%m-%d").date()
            return due == date.today()
        except ValueError:
            return False


@dataclass
class Habit:
    id: Optional[int]
    name: str
    description: str = ""
    color: str = "#6366F1"               # Výchozí indigo
    created_at: Optional[str] = None
    current_streak: int = 0
    best_streak: int = 0
    completed_today: bool = False
    recent_history: Dict[str, bool] = field(default_factory=dict)  # YYYY-MM-DD -> True/False
