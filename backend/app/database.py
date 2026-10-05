"""
DailyTrack - Databázová vrstva SQLite pro Web Backend
Zajišťuje bezpečné transakce, CRUD operace, výpočty streaků a statistik.
"""

import sqlite3
import os
from datetime import datetime, date, timedelta
from typing import List, Optional, Tuple, Dict, Any


class Priority:
    LOW = "Nízká"
    MEDIUM = "Střední"
    HIGH = "Vysoká"
    ALL = [LOW, MEDIUM, HIGH]


class Recurrence:
    NONE = "Žádné"
    DAILY = "Denně"
    WEEKLY = "Týdně"
    MONTHLY = "Měsíčně"
    ALL = [NONE, DAILY, WEEKLY, MONTHLY]


class Database:
    def __init__(self, db_path: Optional[str] = None):
        if db_path is None:
            # Výchozí cesta je root projektu d:/Databaze 4/dailytrack.db
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            self.db_path = os.path.join(base_dir, "dailytrack.db")
        else:
            self.db_path = db_path
        self.init_db()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path, timeout=10.0, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON;")
        return conn

    def init_db(self):
        """Inicializace tabulek a výchozího nastavení."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS tasks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    description TEXT DEFAULT '',
                    priority TEXT DEFAULT 'Střední',
                    due_date TEXT,
                    recurrence TEXT DEFAULT 'Žádné',
                    completed INTEGER DEFAULT 0,
                    completed_at TEXT,
                    created_at TEXT DEFAULT (datetime('now', 'localtime'))
                );
            """)

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS habits (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    description TEXT DEFAULT '',
                    color TEXT DEFAULT '#6366F1',
                    created_at TEXT DEFAULT (datetime('now', 'localtime'))
                );
            """)

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS habit_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    habit_id INTEGER NOT NULL,
                    date TEXT NOT NULL,
                    created_at TEXT DEFAULT (datetime('now', 'localtime')),
                    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
                    UNIQUE(habit_id, date)
                );
            """)

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS settings (
                    key TEXT PRIMARY KEY,
                    value TEXT
                );
            """)
            conn.commit()

        self._seed_sample_data_if_empty()

    def _seed_sample_data_if_empty(self):
        with self._get_connection() as conn:
            c = conn.cursor()
            c.execute("SELECT COUNT(*) FROM tasks")
            tasks_count = c.fetchone()[0]
            c.execute("SELECT COUNT(*) FROM habits")
            habits_count = c.fetchone()[0]

            if tasks_count == 0 and habits_count == 0:
                today = date.today().strftime("%Y-%m-%d")
                tomorrow = (date.today() + timedelta(days=1)).strftime("%Y-%m-%d")

                # Ukázkové úkoly
                c.execute("""
                    INSERT INTO tasks (title, description, priority, due_date, recurrence, completed, completed_at)
                    VALUES (?, ?, ?, ?, ?, 0, NULL)
                """, ("Příprava týdenního reportu", "Shrnout hlavní metriky a odeslat týmu", Priority.HIGH, today, Recurrence.WEEKLY))

                c.execute("""
                    INSERT INTO tasks (title, description, priority, due_date, recurrence, completed, completed_at)
                    VALUES (?, ?, ?, ?, ?, 0, NULL)
                """, ("Zaplatit fakturu za internet", "Variabilní symbol 202609", Priority.MEDIUM, tomorrow, Recurrence.MONTHLY))

                c.execute("""
                    INSERT INTO tasks (title, description, priority, due_date, recurrence, completed, completed_at)
                    VALUES (?, ?, ?, ?, ?, 1, ?)
                """, ("Uspořádat pracovní stůl", "Čisté pracovní prostředí", Priority.LOW, today, Recurrence.NONE, today))

                # Ukázkové návyky
                habits_data = [
                    ("Cvičení a strečink", "Alespoň 20 minut pohybu nebo protahování", "#10B981"),
                    ("Čtení odborné knihy", "Minimálně 15 stránek denně", "#6366F1"),
                    ("Pitný režim (2 litry)", "Pravidelný příjem čisté vody během dne", "#06B6D4")
                ]

                for name, desc, color in habits_data:
                    c.execute("INSERT INTO habits (name, description, color) VALUES (?, ?, ?)", (name, desc, color))
                    h_id = c.lastrowid

                    for d_offset in range(1, 4):
                        past_date = (date.today() - timedelta(days=d_offset)).strftime("%Y-%m-%d")
                        c.execute("INSERT OR IGNORE INTO habit_logs (habit_id, date) VALUES (?, ?)", (h_id, past_date))

                # Nastavení výchozího tématu
                c.execute("INSERT OR REPLACE INTO settings (key, value) VALUES ('theme', 'dark')")
                conn.commit()

    # ==========================================
    # ÚKOLY (TASKS) CRUD
    # ==========================================

    def _task_row_to_dict(self, row: sqlite3.Row) -> Dict[str, Any]:
        today = date.today()
        today_str = today.strftime("%Y-%m-%d")
        due_date = row["due_date"]
        completed = bool(row["completed"])

        is_overdue = False
        is_due_today = False
        if due_date:
            try:
                d = datetime.strptime(due_date, "%Y-%m-%d").date()
                if not completed and d < today:
                    is_overdue = True
                if d == today:
                    is_due_today = True
            except ValueError:
                pass

        return {
            "id": row["id"],
            "title": row["title"],
            "description": row["description"] or "",
            "priority": row["priority"] or Priority.MEDIUM,
            "due_date": due_date,
            "recurrence": row["recurrence"] or Recurrence.NONE,
            "completed": completed,
            "completed_at": row["completed_at"],
            "created_at": row["created_at"],
            "is_overdue": is_overdue,
            "is_due_today": is_due_today
        }

    def get_tasks(self, status_filter: str = "all", priority_filter: str = "all", search_query: str = "") -> List[Dict[str, Any]]:
        conditions = []
        params = []

        if status_filter == "pending":
            conditions.append("completed = 0")
        elif status_filter == "completed":
            conditions.append("completed = 1")

        if priority_filter in Priority.ALL:
            conditions.append("priority = ?")
            params.append(priority_filter)

        if search_query.strip():
            conditions.append("(title LIKE ? OR description LIKE ?)")
            q = f"%{search_query.strip()}%"
            params.extend([q, q])

        where_clause = " WHERE " + " AND ".join(conditions) if conditions else ""
        sql = f"""
            SELECT id, title, description, priority, due_date, recurrence, completed, completed_at, created_at
            FROM tasks
            {where_clause}
            ORDER BY completed ASC,
                     CASE WHEN due_date IS NULL THEN 1 ELSE 0 END,
                     due_date ASC,
                     CASE priority WHEN 'Vysoká' THEN 1 WHEN 'Střední' THEN 2 ELSE 3 END
        """

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(sql, params)
            return [self._task_row_to_dict(r) for r in cursor.fetchall()]

    def get_today_tasks(self) -> List[Dict[str, Any]]:
        today_str = date.today().strftime("%Y-%m-%d")
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT id, title, description, priority, due_date, recurrence, completed, completed_at, created_at
                FROM tasks
                WHERE (completed = 0 AND (due_date <= ? OR due_date IS NULL))
                   OR (completed = 1 AND DATE(completed_at) = ?)
                ORDER BY completed ASC,
                         CASE priority WHEN 'Vysoká' THEN 1 WHEN 'Střední' THEN 2 ELSE 3 END,
                         due_date ASC
            """, (today_str, today_str))
            return [self._task_row_to_dict(r) for r in cursor.fetchall()]

    def get_task_by_id(self, task_id: int) -> Optional[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM tasks WHERE id = ?", (task_id,))
            row = cursor.fetchone()
            return self._task_row_to_dict(row) if row else None

    def add_task(self, title: str, description: str = "", priority: str = Priority.MEDIUM,
                 due_date: Optional[str] = None, recurrence: str = Recurrence.NONE) -> Dict[str, Any]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO tasks (title, description, priority, due_date, recurrence, completed)
                VALUES (?, ?, ?, ?, ?, 0)
            """, (title.strip(), description.strip(), priority, due_date, recurrence))
            conn.commit()
            task_id = cursor.lastrowid
        return self.get_task_by_id(task_id)

    def update_task(self, task_id: int, title: str, description: str, priority: str,
                    due_date: Optional[str], recurrence: str) -> Optional[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE tasks
                SET title = ?, description = ?, priority = ?, due_date = ?, recurrence = ?
                WHERE id = ?
            """, (title.strip(), description.strip(), priority, due_date, recurrence, task_id))
            conn.commit()
        return self.get_task_by_id(task_id)

    def toggle_task_completion(self, task_id: int) -> Optional[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM tasks WHERE id = ?", (task_id,))
            row = cursor.fetchone()
            if not row:
                return None

            now_completed = 0 if row["completed"] else 1
            completed_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S") if now_completed else None

            cursor.execute("UPDATE tasks SET completed = ?, completed_at = ? WHERE id = ?",
                           (now_completed, completed_at, task_id))

            if now_completed and row["recurrence"] and row["recurrence"] != Recurrence.NONE:
                self._create_next_recurring_task(conn, row)

            conn.commit()
        return self.get_task_by_id(task_id)

    def _create_next_recurring_task(self, conn: sqlite3.Connection, current_task: sqlite3.Row):
        rec = current_task["recurrence"]
        base_date = date.today()
        if current_task["due_date"]:
            try:
                parsed = datetime.strptime(current_task["due_date"], "%Y-%m-%d").date()
                if parsed >= date.today():
                    base_date = parsed
            except ValueError:
                pass

        if rec == Recurrence.DAILY:
            next_due = base_date + timedelta(days=1)
        elif rec == Recurrence.WEEKLY:
            next_due = base_date + timedelta(days=7)
        elif rec == Recurrence.MONTHLY:
            month = base_date.month + 1
            year = base_date.year
            if month > 12:
                month = 1
                year += 1
            day = min(base_date.day, 28)
            next_due = date(year, month, day)
        else:
            return

        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO tasks (title, description, priority, due_date, recurrence, completed)
            VALUES (?, ?, ?, ?, ?, 0)
        """, (current_task["title"], current_task["description"], current_task["priority"],
              next_due.strftime("%Y-%m-%d"), current_task["recurrence"]))

    def delete_task(self, task_id: int) -> bool:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
            conn.commit()
            return cursor.rowcount > 0

    # ==========================================
    # NÁVYKY (HABITS) CRUD A STREAKS
    # ==========================================

    def add_habit(self, name: str, description: str = "", color: str = "#6366F1") -> Dict[str, Any]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO habits (name, description, color)
                VALUES (?, ?, ?)
            """, (name.strip(), description.strip(), color))
            conn.commit()
            h_id = cursor.lastrowid
        return self.get_habit_by_id(h_id)

    def update_habit(self, habit_id: int, name: str, description: str, color: str) -> Optional[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE habits
                SET name = ?, description = ?, color = ?
                WHERE id = ?
            """, (name.strip(), description.strip(), color, habit_id))
            conn.commit()
        return self.get_habit_by_id(habit_id)

    def delete_habit(self, habit_id: int) -> bool:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM habits WHERE id = ?", (habit_id,))
            conn.commit()
            return cursor.rowcount > 0

    def toggle_habit_date(self, habit_id: int, target_date: Optional[str] = None) -> bool:
        if not target_date:
            target_date = date.today().strftime("%Y-%m-%d")

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM habit_logs WHERE habit_id = ? AND date = ?", (habit_id, target_date))
            row = cursor.fetchone()
            if row:
                cursor.execute("DELETE FROM habit_logs WHERE id = ?", (row["id"],))
                conn.commit()
                return False
            else:
                cursor.execute("INSERT INTO habit_logs (habit_id, date) VALUES (?, ?)", (habit_id, target_date))
                conn.commit()
                return True

    def calculate_streaks(self, habit_id: int) -> Tuple[int, int]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT DISTINCT date FROM habit_logs WHERE habit_id = ? ORDER BY date ASC", (habit_id,))
            rows = cursor.fetchall()
            if not rows:
                return (0, 0)

            logged_dates = set()
            date_list = []
            for r in rows:
                try:
                    d = datetime.strptime(r["date"], "%Y-%m-%d").date()
                    logged_dates.add(d)
                    date_list.append(d)
                except ValueError:
                    continue

            if not date_list:
                return (0, 0)

            date_list.sort()

            best_streak = 0
            current_run = 0
            prev_d = None

            for d in date_list:
                if prev_d is None:
                    current_run = 1
                elif (d - prev_d).days == 1:
                    current_run += 1
                elif (d - prev_d).days == 0:
                    pass
                else:
                    current_run = 1
                if current_run > best_streak:
                    best_streak = current_run
                prev_d = d

            today = date.today()
            yesterday = today - timedelta(days=1)

            current_streak = 0
            if today in logged_dates:
                check_day = today
                while check_day in logged_dates:
                    current_streak += 1
                    check_day -= timedelta(days=1)
            elif yesterday in logged_dates:
                check_day = yesterday
                while check_day in logged_dates:
                    current_streak += 1
                    check_day -= timedelta(days=1)
            else:
                current_streak = 0

            return (current_streak, best_streak)

    def get_habit_by_id(self, habit_id: int, history_days: int = 7) -> Optional[Dict[str, Any]]:
        today = date.today()
        today_str = today.strftime("%Y-%m-%d")
        past_dates = [(today - timedelta(days=i)).strftime("%Y-%m-%d") for i in range(history_days - 1, -1, -1)]

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id, name, description, color, created_at FROM habits WHERE id = ?", (habit_id,))
            row = cursor.fetchone()
            if not row:
                return None

            current_s, best_s = self.calculate_streaks(habit_id)
            cursor.execute("""
                SELECT date FROM habit_logs
                WHERE habit_id = ? AND date >= ?
            """, (habit_id, past_dates[0]))
            logs = {r["date"] for r in cursor.fetchall()}

            history_dict = {d_str: (d_str in logs) for d_str in past_dates}
            is_completed_today = (today_str in logs)

            return {
                "id": row["id"],
                "name": row["name"],
                "description": row["description"] or "",
                "color": row["color"] or "#6366F1",
                "created_at": row["created_at"],
                "current_streak": current_s,
                "best_streak": best_s,
                "completed_today": is_completed_today,
                "recent_history": history_dict
            }

    def get_habits_with_details(self, history_days: int = 7) -> List[Dict[str, Any]]:
        today = date.today()
        today_str = today.strftime("%Y-%m-%d")
        past_dates = [(today - timedelta(days=i)).strftime("%Y-%m-%d") for i in range(history_days - 1, -1, -1)]

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id, name, description, color, created_at FROM habits ORDER BY id ASC")
            habit_rows = cursor.fetchall()

            result = []
            for h in habit_rows:
                h_id = h["id"]
                current_s, best_s = self.calculate_streaks(h_id)

                cursor.execute("""
                    SELECT date FROM habit_logs
                    WHERE habit_id = ? AND date >= ?
                """, (h_id, past_dates[0]))
                logs = {r["date"] for r in cursor.fetchall()}

                history_dict = {d_str: (d_str in logs) for d_str in past_dates}
                is_completed_today = (today_str in logs)

                result.append({
                    "id": h_id,
                    "name": h["name"],
                    "description": h["description"] or "",
                    "color": h["color"] or "#6366F1",
                    "created_at": h["created_at"],
                    "current_streak": current_s,
                    "best_streak": best_s,
                    "completed_today": is_completed_today,
                    "recent_history": history_dict
                })
            return result

    # ==========================================
    # STATISTIKY (ANALYTICS)
    # ==========================================

    def get_task_statistics(self) -> Dict[str, Any]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM tasks")
            total = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM tasks WHERE completed = 1")
            completed = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM tasks WHERE completed = 0")
            pending = cursor.fetchone()[0]

            today_str = date.today().strftime("%Y-%m-%d")
            cursor.execute("SELECT COUNT(*) FROM tasks WHERE completed = 0 AND due_date < ?", (today_str,))
            overdue = cursor.fetchone()[0]

            rate = round((completed / total * 100), 1) if total > 0 else 0.0

            cursor.execute("""
                SELECT priority, COUNT(*) as cnt
                FROM tasks
                GROUP BY priority
            """)
            priority_counts = {r["priority"]: r["cnt"] for r in cursor.fetchall()}

            return {
                "total": total,
                "completed": completed,
                "pending": pending,
                "overdue": overdue,
                "completion_rate": rate,
                "priority_counts": priority_counts
            }

    def get_habit_statistics(self) -> Dict[str, Any]:
        habits = self.get_habits_with_details(history_days=1)
        total_habits = len(habits)
        completed_today = sum(1 for h in habits if h["completed_today"])
        best_overall_streak = max((h["best_streak"] for h in habits), default=0)
        current_max_streak = max((h["current_streak"] for h in habits), default=0)

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM habit_logs")
            total_checkins = cursor.fetchone()[0]

        return {
            "total_habits": total_habits,
            "completed_today": completed_today,
            "best_overall_streak": best_overall_streak,
            "current_max_streak": current_max_streak,
            "total_checkins": total_checkins
        }

    def get_habit_activity_last_days(self, days: int = 14) -> List[Dict[str, Any]]:
        today = date.today()
        result = []

        with self._get_connection() as conn:
            cursor = conn.cursor()
            for i in range(days - 1, -1, -1):
                d = today - timedelta(days=i)
                d_str = d.strftime("%Y-%m-%d")
                label = f"{d.day}.{d.month}."
                cursor.execute("SELECT COUNT(*) FROM habit_logs WHERE date = ?", (d_str,))
                cnt = cursor.fetchone()[0]
                result.append({"date": d_str, "label": label, "count": cnt})

        return result

    # ==========================================
    # NASTAVENÍ (SETTINGS) & SPRÁVA DAT
    # ==========================================

    def get_setting(self, key: str, default: str = "") -> str:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT value FROM settings WHERE key = ?", (key,))
            row = cursor.fetchone()
            return row["value"] if row else default

    def set_setting(self, key: str, value: str):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", (key, value))
            conn.commit()

    def get_db_info(self) -> Dict[str, Any]:
        size_kb = 0.0
        if os.path.exists(self.db_path):
            size_kb = round(os.path.getsize(self.db_path) / 1024, 1)

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM tasks")
            tasks_count = cursor.fetchone()[0]
            cursor.execute("SELECT COUNT(*) FROM habits")
            habits_count = cursor.fetchone()[0]

        theme = self.get_setting("theme", "dark")
        return {
            "theme": theme,
            "db_size_kb": size_kb,
            "tasks_count": tasks_count,
            "habits_count": habits_count
        }

    def clear_completed_tasks(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM tasks WHERE completed = 1")
            conn.commit()

    def reset_all_data(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM habit_logs")
            cursor.execute("DELETE FROM habits")
            cursor.execute("DELETE FROM tasks")
            conn.commit()
        self._seed_sample_data_if_empty()

    def export_data(self) -> Dict[str, Any]:
        """Exportuje veškerá data (úkoly, návyky, logy, nastavení) jako slovník pro JSON zálohu."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM tasks")
            tasks = [dict(row) for row in cursor.fetchall()]

            cursor.execute("SELECT * FROM habits")
            habits = [dict(row) for row in cursor.fetchall()]

            cursor.execute("SELECT * FROM habit_logs")
            logs = [dict(row) for row in cursor.fetchall()]

            cursor.execute("SELECT * FROM settings")
            settings = {row["key"]: row["value"] for row in cursor.fetchall()}

        return {
            "version": "1.0",
            "exported_at": datetime.now().isoformat(),
            "tasks": tasks,
            "habits": habits,
            "habit_logs": logs,
            "settings": settings
        }

    def import_data(self, data: Dict[str, Any]) -> bool:
        """Importuje data ze zálohy JSON a nahradí stávající stav."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            if "tasks" in data and isinstance(data["tasks"], list):
                cursor.execute("DELETE FROM tasks")
                for t in data["tasks"]:
                    cursor.execute("""
                        INSERT INTO tasks (id, title, description, priority, recurrence, completed, due_date, created_at, completed_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        t.get("id"), t.get("title", ""), t.get("description", ""), t.get("priority", "Nízká"),
                        t.get("recurrence", "Žádné"), 1 if t.get("completed") else 0, t.get("due_date"),
                        t.get("created_at"), t.get("completed_at")
                    ))

            if "habits" in data and isinstance(data["habits"], list):
                cursor.execute("DELETE FROM habits")
                for h in data["habits"]:
                    cursor.execute("""
                        INSERT INTO habits (id, name, description, color, created_at)
                        VALUES (?, ?, ?, ?, ?)
                    """, (
                        h.get("id"), h.get("name", ""), h.get("description", ""), h.get("color", "#6366f1"), h.get("created_at")
                    ))

            if "habit_logs" in data and isinstance(data["habit_logs"], list):
                cursor.execute("DELETE FROM habit_logs")
                for log in data["habit_logs"]:
                    cursor.execute("""
                        INSERT INTO habit_logs (id, habit_id, date, created_at)
                        VALUES (?, ?, ?, ?)
                    """, (
                        log.get("id"), log.get("habit_id"), log.get("date"), log.get("created_at")
                    ))

            if "settings" in data and isinstance(data["settings"], dict):
                for k, v in data["settings"].items():
                    cursor.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", (str(k), str(v)))

            conn.commit()
        return True


# Globální singleton instance databáze
db = Database()

