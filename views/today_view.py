"""
DailyTrack - Přehled "Dnes" (Dashboard)
Zobrazuje dnešní a zpožděné úkoly, návyky k dnešnímu splnění a rychlé statistiky.
"""

from datetime import date, datetime
from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton,
    QFrame, QScrollArea, QCheckBox, QMessageBox
)
from PySide6.QtCore import Qt, Signal

from database import Database
from models import Priority, Task, Habit
from widgets.task_dialog import TaskDialog


class TodayView(QWidget):
    data_changed = Signal()

    def __init__(self, db: Database, parent=None):
        super().__init__(parent)
        self.db = db
        self.setup_ui()

    def setup_ui(self):
        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(24, 20, 24, 20)
        main_layout.setSpacing(18)

        # Hlavička s datem a uvítáním
        header_layout = QHBoxLayout()
        title_col = QVBoxLayout()

        self.date_label = QLabel()
        self.date_label.setProperty("class", "page-subtitle")
        title_col.addWidget(self.date_label)

        title = QLabel("Dnešní přehled")
        title.setProperty("class", "page-title")
        title_col.addWidget(title)
        header_layout.addLayout(title_col)

        header_layout.addStretch()

        # Rychlé tlačítko pro nový úkol
        new_task_btn = QPushButton("+ Přidat úkol")
        new_task_btn.setProperty("class", "primary-btn")
        new_task_btn.setCursor(Qt.PointingHandCursor)
        new_task_btn.clicked.connect(self._add_task)
        header_layout.addWidget(new_task_btn)

        main_layout.addLayout(header_layout)

        # Karty rychlých metrik
        metrics_layout = QHBoxLayout()
        metrics_layout.setSpacing(12)

        self.tasks_stat_card = self._create_metric_card("ÚKOLY NA DNEŠEK", "0", "0 hotovo")
        self.habits_stat_card = self._create_metric_card("NÁVYKY NA DNEŠEK", "0/0", "0 % splněno")
        self.streak_stat_card = self._create_metric_card("NEJLEPŠÍ SÉRIE", "0 dní", "Aktivní streak")

        metrics_layout.addWidget(self.tasks_stat_card["frame"])
        metrics_layout.addWidget(self.habits_stat_card["frame"])
        metrics_layout.addWidget(self.streak_stat_card["frame"])
        main_layout.addLayout(metrics_layout)

        # Posuvná oblast pro obsah dneška
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll_content = QWidget()
        self.scroll_layout = QVBoxLayout(scroll_content)
        self.scroll_layout.setContentsMargins(0, 8, 8, 8)
        self.scroll_layout.setSpacing(16)

        # Sekce 1: Dnešní návyky
        habits_header = QLabel("Dnešní návyky")
        habits_header.setProperty("class", "section-header")
        self.scroll_layout.addWidget(habits_header)

        self.habits_container = QVBoxLayout()
        self.habits_container.setSpacing(8)
        self.scroll_layout.addLayout(self.habits_container)

        # Sekce 2: Dnešní a zpožděné úkoly
        tasks_header = QLabel("Úkoly na dnešek a zpožděné")
        tasks_header.setProperty("class", "section-header")
        self.scroll_layout.addWidget(tasks_header)

        self.tasks_container = QVBoxLayout()
        self.tasks_container.setSpacing(8)
        self.scroll_layout.addLayout(self.tasks_container)

        self.scroll_layout.addStretch()
        scroll.setWidget(scroll_content)
        main_layout.addWidget(scroll)

        self.refresh()

    def _create_metric_card(self, title_text: str, val_text: str, sub_text: str) -> dict:
        frame = QFrame()
        frame.setProperty("class", "stat-card")
        layout = QVBoxLayout(frame)
        layout.setContentsMargins(14, 12, 14, 12)
        layout.setSpacing(4)

        lbl_title = QLabel(title_text)
        lbl_title.setProperty("class", "stat-label")
        layout.addWidget(lbl_title)

        lbl_val = QLabel(val_text)
        lbl_val.setProperty("class", "stat-number")
        layout.addWidget(lbl_val)

        lbl_sub = QLabel(sub_text)
        lbl_sub.setProperty("class", "page-subtitle")
        layout.addWidget(lbl_sub)

        return {"frame": frame, "val": lbl_val, "sub": lbl_sub}

    def _format_czech_date(self) -> str:
        now = datetime.now()
        days = ["Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota", "Neděle"]
        months = ["ledna", "února", "března", "dubna", "května", "června",
                  "července", "srpna", "září", "října", "listopadu", "prosince"]
        day_name = days[now.weekday()]
        month_name = months[now.month - 1]
        return f"{day_name}, {now.day}. {month_name} {now.year}"

    def refresh(self):
        self.date_label.setText(self._format_czech_date())

        # Vyčištění kontejnerů
        self._clear_layout(self.habits_container)
        self._clear_layout(self.tasks_container)

        # Načtení dat
        today_tasks = self.db.get_today_tasks()
        habits = self.db.get_habits_with_details(history_days=7)

        # Aktualizace metrik
        pending_tasks = sum(1 for t in today_tasks if not t.completed)
        completed_tasks = sum(1 for t in today_tasks if t.completed)
        self.tasks_stat_card["val"].setText(str(pending_tasks))
        self.tasks_stat_card["sub"].setText(f"{completed_tasks} dnes hotovo")

        total_habits = len(habits)
        done_habits = sum(1 for h in habits if h.completed_today)
        pct = round(done_habits / total_habits * 100) if total_habits > 0 else 0
        self.habits_stat_card["val"].setText(f"{done_habits} / {total_habits}")
        self.habits_stat_card["sub"].setText(f"{pct} % splněno")

        max_streak = max((h.current_streak for h in habits), default=0)
        self.streak_stat_card["val"].setText(f"{max_streak} dní")
        self.streak_stat_card["sub"].setText("Nejvyšší aktivní série")

        # Vykreslení návyků
        if not habits:
            empty_lbl = QLabel("Zatím nemáte žádné návyky. Vytvořte si je v sekci Návyky!")
            empty_lbl.setProperty("class", "page-subtitle")
            self.habits_container.addWidget(empty_lbl)
        else:
            for habit in habits:
                self.habits_container.addWidget(self._build_habit_row(habit))

        # Vykreslení úkolů
        if not today_tasks:
            empty_lbl = QLabel("Na dnešek nemáte žádné čekající úkoly. Skvělá práce!")
            empty_lbl.setProperty("class", "page-subtitle")
            self.tasks_container.addWidget(empty_lbl)
        else:
            for task in today_tasks:
                self.tasks_container.addWidget(self._build_task_row(task))

    def _clear_layout(self, layout):
        while layout.count():
            item = layout.takeAt(0)
            widget = item.widget()
            if widget:
                widget.deleteLater()

    def _build_habit_row(self, habit: Habit) -> QWidget:
        card = QFrame()
        card.setProperty("class", "card")
        h_layout = QHBoxLayout(card)
        h_layout.setContentsMargins(14, 10, 14, 10)
        h_layout.setSpacing(12)

        # Barevný indikátor návyku
        color_dot = QFrame()
        color_dot.setFixedSize(12, 12)
        color_dot.setStyleSheet(f"background-color: {habit.color}; border-radius: 6px;")
        h_layout.addWidget(color_dot)

        # Informace o návyku
        info_col = QVBoxLayout()
        info_col.setSpacing(2)
        name_lbl = QLabel(habit.name)
        name_lbl.setStyleSheet("font-size: 14px; font-weight: 700;")
        info_col.addWidget(name_lbl)

        if habit.description:
            desc_lbl = QLabel(habit.description)
            desc_lbl.setProperty("class", "page-subtitle")
            info_col.addWidget(desc_lbl)
        h_layout.addLayout(info_col)

        h_layout.addStretch()

        # Streak štítek
        streak_lbl = QLabel(f"🔥 {habit.current_streak} dní")
        streak_lbl.setStyleSheet("""
            background-color: rgba(245, 158, 11, 0.15);
            color: #F59E0B;
            font-weight: bold;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 12px;
        """)
        h_layout.addWidget(streak_lbl)

        # Tlačítko splněno
        check_btn = QPushButton("✓ Splněno" if habit.completed_today else "Označit splněno")
        check_btn.setCursor(Qt.PointingHandCursor)
        if habit.completed_today:
            check_btn.setProperty("class", "check-btn checked")
        else:
            check_btn.setProperty("class", "check-btn")

        check_btn.clicked.connect(lambda checked=False, hid=habit.id: self._toggle_habit(hid))
        h_layout.addWidget(check_btn)

        return card

    def _build_task_row(self, task: Task) -> QWidget:
        card = QFrame()
        card.setProperty("class", "card")
        h_layout = QHBoxLayout(card)
        h_layout.setContentsMargins(14, 10, 14, 10)
        h_layout.setSpacing(12)

        # Checkbox pro splnění
        chk = QCheckBox()
        chk.setChecked(task.completed)
        chk.toggled.connect(lambda state, tid=task.id: self._toggle_task(tid))
        h_layout.addWidget(chk)

        # Text úkolu
        info_col = QVBoxLayout()
        info_col.setSpacing(2)

        title_style = "font-size: 14px; font-weight: 600;"
        if task.completed:
            title_style += " text-decoration: line-through; opacity: 0.6;"

        title_lbl = QLabel(task.title)
        title_lbl.setStyleSheet(title_style)
        info_col.addWidget(title_lbl)

        if task.description:
            desc_lbl = QLabel(task.description)
            desc_lbl.setProperty("class", "page-subtitle")
            info_col.addWidget(desc_lbl)
        h_layout.addLayout(info_col)

        h_layout.addStretch()

        # Priorita štítek
        p_color = Priority.color(task.priority)
        p_badge = QLabel(task.priority)
        p_badge.setStyleSheet(f"""
            background-color: {p_color}22;
            color: {p_color};
            font-weight: 700;
            font-size: 11px;
            padding: 3px 8px;
            border-radius: 6px;
        """)
        h_layout.addWidget(p_badge)

        # Termín
        if task.due_date:
            due_color = "#EF4444" if task.is_overdue else "#94A3B8"
            due_text = "Dnes" if task.is_due_today else ("Zpožděno!" if task.is_overdue else task.due_date)
            due_lbl = QLabel(f"📅 {due_text}")
            due_lbl.setStyleSheet(f"color: {due_color}; font-weight: 600; font-size: 12px;")
            h_layout.addWidget(due_lbl)

        # Opakování
        if task.recurrence and task.recurrence != "Žádné":
            rec_lbl = QLabel(f"🔄 {task.recurrence}")
            rec_lbl.setStyleSheet("color: #6366F1; font-size: 11px; font-weight: 600;")
            h_layout.addWidget(rec_lbl)

        return card

    def _toggle_habit(self, habit_id: int):
        self.db.toggle_habit_date(habit_id)
        self.refresh()
        self.data_changed.emit()

    def _toggle_task(self, task_id: int):
        self.db.toggle_task_completion(task_id)
        self.refresh()
        self.data_changed.emit()

    def _add_task(self):
        dlg = TaskDialog(self)
        if dlg.exec():
            data = dlg.get_data()
            self.db.add_task(
                title=data["title"],
                description=data["description"],
                priority=data["priority"],
                due_date=data["due_date"],
                recurrence=data["recurrence"]
            )
            self.refresh()
            self.data_changed.emit()
