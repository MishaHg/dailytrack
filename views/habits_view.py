"""
DailyTrack - Sledování návyků (Habits View)
Vytvoření, editace, mazání, sledování sérií (streaks), interaktivní 7denní přehled.
"""

from datetime import date, timedelta
from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton,
    QFrame, QScrollArea, QMessageBox
)
from PySide6.QtCore import Qt, Signal

from database import Database
from models import Habit
from widgets.habit_dialog import HabitDialog


class HabitsView(QWidget):
    data_changed = Signal()

    def __init__(self, db: Database, parent=None):
        super().__init__(parent)
        self.db = db
        self.setup_ui()

    def setup_ui(self):
        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(24, 20, 24, 20)
        main_layout.setSpacing(16)

        # Horní hlavička
        header_layout = QHBoxLayout()
        title_col = QVBoxLayout()
        title = QLabel("Sledování návyků")
        title.setProperty("class", "page-title")
        title_col.addWidget(title)

        subtitle = QLabel("Budujte pozitivní návyky a udržujte své série bez přerušení")
        subtitle.setProperty("class", "page-subtitle")
        title_col.addWidget(subtitle)
        header_layout.addLayout(title_col)

        header_layout.addStretch()

        new_btn = QPushButton("+ Nový návyk")
        new_btn.setProperty("class", "primary-btn")
        new_btn.setCursor(Qt.PointingHandCursor)
        new_btn.clicked.connect(self._create_habit)
        header_layout.addWidget(new_btn)

        main_layout.addLayout(header_layout)

        # Seznam návyků v posuvném kontejneru
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll_content = QWidget()
        self.habits_layout = QVBoxLayout(scroll_content)
        self.habits_layout.setContentsMargins(0, 4, 8, 8)
        self.habits_layout.setSpacing(12)

        scroll.setWidget(scroll_content)
        main_layout.addWidget(scroll)

        self.refresh()

    def refresh(self):
        # Vyčištění layoutu
        while self.habits_layout.count():
            item = self.habits_layout.takeAt(0)
            widget = item.widget()
            if widget:
                widget.deleteLater()

        habits = self.db.get_habits_with_details(history_days=7)

        if not habits:
            empty_card = QFrame()
            empty_card.setProperty("class", "card")
            e_layout = QVBoxLayout(empty_card)
            e_layout.setAlignment(Qt.AlignCenter)
            e_layout.setContentsMargins(24, 36, 24, 36)

            empty_lbl = QLabel("Zatím nemáte vytvořené žádné návyky. Začněte kliknutím na '+ Nový návyk'!")
            empty_lbl.setProperty("class", "page-subtitle")
            empty_lbl.setAlignment(Qt.AlignCenter)
            e_layout.addWidget(empty_lbl)

            self.habits_layout.addWidget(empty_card)
        else:
            for habit in habits:
                self.habits_layout.addWidget(self._build_habit_card(habit))

        self.habits_layout.addStretch()

    def _build_habit_card(self, habit: Habit) -> QWidget:
        card = QFrame()
        card.setProperty("class", "card")
        v_layout = QVBoxLayout(card)
        v_layout.setContentsMargins(16, 14, 16, 14)
        v_layout.setSpacing(12)

        # Horní řádek: Barva + Název + Streaks + Akce
        top_row = QHBoxLayout()
        top_row.setSpacing(10)

        # Barevný indikátor
        color_dot = QFrame()
        color_dot.setFixedSize(14, 14)
        color_dot.setStyleSheet(f"background-color: {habit.color}; border-radius: 7px;")
        top_row.addWidget(color_dot)

        # Název a popis
        title_col = QVBoxLayout()
        title_col.setSpacing(2)
        name_lbl = QLabel(habit.name)
        name_lbl.setStyleSheet("font-size: 16px; font-weight: 700;")
        title_col.addWidget(name_lbl)

        if habit.description:
            desc_lbl = QLabel(habit.description)
            desc_lbl.setProperty("class", "page-subtitle")
            title_col.addWidget(desc_lbl)
        top_row.addLayout(title_col, stretch=1)

        # Badge: Aktuální streak
        curr_badge = QLabel(f"🔥 {habit.current_streak} dní")
        curr_badge.setStyleSheet("""
            background-color: rgba(245, 158, 11, 0.15);
            color: #F59E0B;
            font-weight: 700;
            font-size: 12px;
            padding: 4px 10px;
            border-radius: 12px;
        """)
        top_row.addWidget(curr_badge)

        # Badge: Nejdelší streak
        best_badge = QLabel(f"🏆 Rekord: {habit.best_streak} dní")
        best_badge.setStyleSheet("""
            background-color: rgba(99, 102, 241, 0.15);
            color: #818CF8;
            font-weight: 600;
            font-size: 12px;
            padding: 4px 10px;
            border-radius: 12px;
        """)
        top_row.addWidget(best_badge)

        # Tlačítka Upravit a Smazat
        edit_btn = QPushButton("Upravit")
        edit_btn.setProperty("class", "action-btn")
        edit_btn.setCursor(Qt.PointingHandCursor)
        edit_btn.clicked.connect(lambda checked=False, h=habit: self._edit_habit(h))
        top_row.addWidget(edit_btn)

        del_btn = QPushButton("Smazat")
        del_btn.setProperty("class", "danger-btn")
        del_btn.setCursor(Qt.PointingHandCursor)
        del_btn.clicked.connect(lambda checked=False, hid=habit.id, hname=habit.name: self._delete_habit(hid, hname))
        top_row.addWidget(del_btn)

        v_layout.addLayout(top_row)

        # Oddělovač
        sep = QFrame()
        sep.setFrameShape(QFrame.HLine)
        sep.setStyleSheet("background-color: rgba(148, 163, 184, 0.15); max-height: 1px;")
        v_layout.addWidget(sep)

        # Spodní řádek: Interaktivní 7denní přehled + Tlačítko pro dnešek
        bottom_row = QHBoxLayout()
        bottom_row.setSpacing(12)

        # 7denní vizuální kalendář
        days_layout = QHBoxLayout()
        days_layout.setSpacing(6)

        day_abbrs = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"]
        today = date.today()

        for offset in range(6, -1, -1):
            past_d = today - timedelta(days=offset)
            date_str = past_d.strftime("%Y-%m-%d")
            is_done = habit.recent_history.get(date_str, False)
            day_name = day_abbrs[past_d.weekday()]

            day_box = QVBoxLayout()
            day_box.setSpacing(3)
            day_box.setAlignment(Qt.AlignCenter)

            d_lbl = QLabel(day_name if offset > 0 else "Dnes")
            d_lbl.setStyleSheet(f"""
                font-size: 10px;
                font-weight: {'bold' if offset == 0 else 'normal'};
                color: {'#6366F1' if offset == 0 else '#94A3B8'};
            """)
            d_lbl.setAlignment(Qt.AlignCenter)
            day_box.addWidget(d_lbl)

            # Klikací tlačítko pro daný den
            dot_btn = QPushButton("✓" if is_done else "")
            dot_btn.setFixedSize(28, 28)
            dot_btn.setCursor(Qt.PointingHandCursor)
            dot_btn.setToolTip(f"{date_str}: {'Splněno' if is_done else 'Nesplněno'}")

            bg = habit.color if is_done else "transparent"
            border = habit.color if is_done else "rgba(148, 163, 184, 0.3)"
            txt_color = "#FFFFFF" if is_done else "transparent"

            dot_btn.setStyleSheet(f"""
                QPushButton {{
                    background-color: {bg};
                    border: 2px solid {border};
                    border-radius: 14px;
                    color: {txt_color};
                    font-weight: bold;
                    font-size: 12px;
                    padding: 0px;
                }}
                QPushButton:hover {{
                    border-color: {habit.color};
                }}
            """)
            dot_btn.clicked.connect(lambda checked=False, hid=habit.id, d=date_str: self._toggle_habit_day(hid, d))
            day_box.addWidget(dot_btn)

            days_layout.addLayout(day_box)

        bottom_row.addLayout(days_layout)
        bottom_row.addStretch()

        # Velké tlačítko pro dnešek
        today_btn = QPushButton("✓ Dnes splněno" if habit.completed_today else "Označit dnešek jako splněný")
        today_btn.setCursor(Qt.PointingHandCursor)
        if habit.completed_today:
            today_btn.setProperty("class", "check-btn checked")
        else:
            today_btn.setProperty("class", "check-btn")

        today_btn.clicked.connect(lambda checked=False, hid=habit.id: self._toggle_habit_day(hid, date.today().strftime("%Y-%m-%d")))
        bottom_row.addWidget(today_btn)

        v_layout.addLayout(bottom_row)

        return card

    def _toggle_habit_day(self, habit_id: int, date_str: str):
        self.db.toggle_habit_date(habit_id, date_str)
        self.refresh()
        self.data_changed.emit()

    def _create_habit(self):
        dlg = HabitDialog(self)
        if dlg.exec():
            data = dlg.get_data()
            self.db.add_habit(
                name=data["name"],
                description=data["description"],
                color=data["color"]
            )
            self.refresh()
            self.data_changed.emit()

    def _edit_habit(self, habit: Habit):
        dlg = HabitDialog(self, habit=habit)
        if dlg.exec():
            data = dlg.get_data()
            self.db.update_habit(
                habit_id=habit.id,
                name=data["name"],
                description=data["description"],
                color=data["color"]
            )
            self.refresh()
            self.data_changed.emit()

    def _delete_habit(self, habit_id: int, habit_name: str):
        confirm = QMessageBox.question(
            self,
            "Smazat návyk",
            f"Opravdu si přejete smazat návyk '{habit_name}' a celou jeho historii?",
            QMessageBox.Yes | QMessageBox.No,
            QMessageBox.No
        )
        if confirm == QMessageBox.Yes:
            self.db.delete_habit(habit_id)
            self.refresh()
            self.data_changed.emit()
