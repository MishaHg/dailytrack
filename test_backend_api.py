"""
Test backend logic and endpoints for DailyTrack
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.app.database import db
from backend.app.routers.tasks import get_tasks, get_today_tasks, create_task, toggle_task
from backend.app.routers.habits import get_habits, toggle_habit
from backend.app.routers.stats import get_overall_stats
from backend.app.routers.settings import get_settings
from backend.app.schemas import TaskCreate, HabitToggleRequest

def test_api():
    print("Testing DailyTrack Backend Database & Routers...")

    # 1. Settings
    settings = get_settings()
    assert settings["theme"] in ["dark", "light"]
    print(f"[OK] Settings OK: theme={settings['theme']}, db_size={settings['db_size_kb']}KB, tasks={settings['tasks_count']}")

    # 2. Tasks
    tasks = get_tasks(status="all", priority="all", search="")
    assert isinstance(tasks, list)
    print(f"[OK] Tasks list OK: {len(tasks)} tasks found")

    today_tasks = get_today_tasks()
    print(f"[OK] Today tasks OK: {len(today_tasks)} tasks for today")

    # 3. Habits
    habits = get_habits(days=7)
    assert isinstance(habits, list)
    print(f"[OK] Habits list OK: {len(habits)} habits found")
    if habits:
        h = habits[0]
        print(f"  First habit: '{h['name']}', streak: {h['current_streak']}, best: {h['best_streak']}, done today: {h['completed_today']}")

    # 4. Stats
    stats = get_overall_stats()
    assert "tasks" in stats and "habits" in stats
    print(f"[OK] Stats OK: total tasks={stats['tasks']['total']}, completion rate={stats['tasks']['completion_rate']}%")
    print(f"  Activity 14 days entries: {len(stats['activity_14_days'])}")

    print("\n[OK] Vsechny backendove testy probehly uspesne!")

if __name__ == "__main__":
    test_api()
