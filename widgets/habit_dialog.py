"""
DailyTrack - Dialog pro vytvoření a úpravu návyku
"""

from typing import Optional
from PySide6.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout, QLabel, QLineEdit,
    QPushButton, QMessageBox, QColorDialog
)
from PySide6.QtCore import Qt
from PySide6.QtGui import QColor

from models import Habit


class HabitDialog(QDialog):
    PRESET_COLORS = [
        "#6366F1",  # Indigo
        "#10B981",  # Emerald / Zelená
        "#F59E0B",  # Amber / Oranžová
        "#EF4444",  # Rose / Červená
        "#06B6D4",  # Cyan / Tyrkys
        "#8B5CF6",  # Fialová
        "#EC4899",  # Růžová
    ]

    def __init__(self, parent=None, habit: Optional[Habit] = None):
        super().__init__(parent)
        self.habit = habit
        self.selected_color = habit.color if habit else self.PRESET_COLORS[0]
        self.setWindowTitle("Upravit návyk" if habit else "Nový návyk")
        self.setMinimumWidth(400)
        self.color_buttons = []
        self.setup_ui()

        if habit:
            self.load_habit_data(habit)

    def setup_ui(self):
        layout = QVBoxLayout(self)
        layout.setSpacing(14)
        layout.setContentsMargins(20, 20, 20, 20)

        # Nadpis
        title_lbl = QLabel("Upravit návyk" if self.habit else "Vytvořit nový návyk")
        title_lbl.setStyleSheet("font-size: 16px; font-weight: bold;")
        layout.addWidget(title_lbl)

        # Název návyku
        layout.addWidget(QLabel("Název návyku *:"))
        self.name_input = QLineEdit()
        self.name_input.setPlaceholderText("např. Ranní rozcvička, Čtení, Pití vody...")
        layout.addWidget(self.name_input)

        # Popis
        layout.addWidget(QLabel("Cíl / Popis:"))
        self.desc_input = QLineEdit()
        self.desc_input.setPlaceholderText("např. 20 minut denně bez rušení")
        layout.addWidget(self.desc_input)

        # Výběr barvy
        layout.addWidget(QLabel("Barevný akcent:"))
        color_layout = QHBoxLayout()
        color_layout.setSpacing(8)

        for hex_color in self.PRESET_COLORS:
            btn = QPushButton()
            btn.setFixedSize(30, 30)
            btn.setCursor(Qt.PointingHandCursor)
            btn.setStyleSheet(f"""
                QPushButton {{
                    background-color: {hex_color};
                    border: 2px solid {'#FFFFFF' if hex_color.lower() == self.selected_color.lower() else 'transparent'};
                    border-radius: 15px;
                }}
            """)
            btn.clicked.connect(lambda checked=False, c=hex_color: self._select_color(c))
            self.color_buttons.append((btn, hex_color))
            color_layout.addWidget(btn)

        # Vlastní barva
        self.custom_color_btn = QPushButton("Vlastní...")
        self.custom_color_btn.setProperty("class", "action-btn")
        self.custom_color_btn.clicked.connect(self._pick_custom_color)
        color_layout.addWidget(self.custom_color_btn)
        color_layout.addStretch()

        layout.addLayout(color_layout)
        layout.addSpacing(10)

        # Tlačítka Uložit a Zrušit
        btn_layout = QHBoxLayout()
        btn_layout.addStretch()

        self.cancel_btn = QPushButton("Zrušit")
        self.cancel_btn.setProperty("class", "action-btn")
        self.cancel_btn.clicked.connect(self.reject)
        btn_layout.addWidget(self.cancel_btn)

        self.save_btn = QPushButton("Uložit návyk")
        self.save_btn.setProperty("class", "primary-btn")
        self.save_btn.clicked.connect(self._on_save)
        btn_layout.addWidget(self.save_btn)

        layout.addLayout(btn_layout)

    def _select_color(self, hex_color: str):
        self.selected_color = hex_color
        for btn, c in self.color_buttons:
            is_active = (c.lower() == hex_color.lower())
            btn.setStyleSheet(f"""
                QPushButton {{
                    background-color: {c};
                    border: 2px solid {'#FFFFFF' if is_active else 'transparent'};
                    border-radius: 15px;
                }}
            """)

    def _pick_custom_color(self):
        col = QColorDialog.getColor(QColor(self.selected_color), self, "Vyberte barvu návyku")
        if col.isValid():
            self._select_color(col.name())

    def load_habit_data(self, habit: Habit):
        self.name_input.setText(habit.name)
        self.desc_input.setText(habit.description)
        self._select_color(habit.color)

    def _on_save(self):
        name = self.name_input.text().strip()
        if not name:
            QMessageBox.warning(self, "Chyba zadání", "Název návyku nesmí být prázdný.")
            self.name_input.setFocus()
            return

        self.accept()

    def get_data(self) -> dict:
        return {
            "name": self.name_input.text().strip(),
            "description": self.desc_input.text().strip(),
            "color": self.selected_color
        }
