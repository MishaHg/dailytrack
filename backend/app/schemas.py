"""
DailyTrack - Pydantic schémata a datové modely pro REST API
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import date


class PriorityEnum:
    LOW = "Nízká"
    MEDIUM = "Střední"
    HIGH = "Vysoká"
    ALL = [LOW, MEDIUM, HIGH]


class RecurrenceEnum:
    NONE = "Žádné"
    DAILY = "Denně"
    WEEKLY = "Týdně"
    MONTHLY = "Měsíčně"
    ALL = [NONE, DAILY, WEEKLY, MONTHLY]


# ==========================================
# ÚKOLY (TASKS) SCHÉMATA
# ==========================================

class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, description="Název úkolu")
    description: Optional[str] = Field(default="", description="Volitelný popis úkolu")
    priority: str = Field(default="Střední", description="Priorita: Nízká, Střední, Vysoká")
    due_date: Optional[str] = Field(default=None, description="Termín splnění ve formátu YYYY-MM-DD")
    recurrence: str = Field(default="Žádné", description="Opakování: Žádné, Denně, Týdně, Měsíčně")


class TaskCreate(TaskBase):
    pass


class TaskUpdate(TaskBase):
    pass


class TaskResponse(TaskBase):
    id: int
    completed: bool
    completed_at: Optional[str] = None
    created_at: Optional[str] = None
    is_overdue: bool = False
    is_due_today: bool = False

    class Config:
        from_attributes = True


# ==========================================
# NÁVYKY (HABITS) SCHÉMATA
# ==========================================

class HabitBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Název návyku")
    description: Optional[str] = Field(default="", description="Popis nebo cíl návyku")
    color: str = Field(default="#6366F1", description="HEX kód barvy návyku")


class HabitCreate(HabitBase):
    pass


class HabitUpdate(HabitBase):
    pass


class HabitToggleRequest(BaseModel):
    date: Optional[str] = Field(default=None, description="Cílové datum ve formátu YYYY-MM-DD (výchozí dnešek)")


class HabitResponse(HabitBase):
    id: int
    created_at: Optional[str] = None
    current_streak: int = 0
    best_streak: int = 0
    completed_today: bool = False
    recent_history: Dict[str, bool] = Field(default_factory=dict)

    class Config:
        from_attributes = True


# ==========================================
# STATISTIKY (STATS) SCHÉMATA
# ==========================================

class TaskStatsResponse(BaseModel):
    total: int
    completed: int
    pending: int
    overdue: int
    completion_rate: float
    priority_counts: Dict[str, int]


class HabitStatsResponse(BaseModel):
    total_habits: int
    completed_today: int
    best_overall_streak: int
    current_max_streak: int
    total_checkins: int


class HabitActivityItem(BaseModel):
    date: str
    label: str
    count: int


class OverallStatsResponse(BaseModel):
    tasks: TaskStatsResponse
    habits: HabitStatsResponse
    activity_14_days: List[HabitActivityItem]


# ==========================================
# NASTAVENÍ (SETTINGS) SCHÉMATA
# ==========================================

class SettingsResponse(BaseModel):
    theme: str = "dark"
    db_size_kb: float = 0.0
    tasks_count: int = 0
    habits_count: int = 0


class SettingUpdate(BaseModel):
    key: str
    value: str
