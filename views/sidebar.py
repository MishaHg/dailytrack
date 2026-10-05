"""
DailyTrack - Postranní navigační panel (Sidebar)
Kategorie: Dnes, Úkoly, Návyky, Statistiky, Nastavení
"""

from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QPushButton, QLabel, QFrame
)
from PySide6.QtCore import Signal, Qt


class Sidebar(QWidget):
    page_changed = Signal(int)
    theme_toggle_requested = Signal()

    NAV_ITEMS = [
        ("☀️  Dnes", 0),
        ("📋  Úkoly", 1),
        ("🔄  Návyky", 2),
        ("📊  Statistiky", 3),
        ("⚙️  Nastavení", 4),
    ]

    def __init__(self, parent=None):
        super().__init__(parent)
        self.setObjectName("SidebarContainer")
        self.setFixedWidth(210)
        self.buttons = []
        self.active_index = 0
        self.is_dark_mode = True

        self.setup_ui()

    def setup_ui(self):
        layout = QVBoxLayout(self)
        layout.setContentsMargins(12, 20, 12, 16)
        layout.setSpacing(6)

        # Hlavička aplikace v sidebaru
        title = QLabel("DailyTrack")
        title.setObjectName("SidebarTitle")
        layout.addWidget(title)

        subtitle = QLabel("Osobní organizér")
        subtitle.setObjectName("SidebarSubtitle")
        layout.addWidget(subtitle)

        layout.addSpacing(10)

        # Navigační tlačítka
        for label, idx in self.NAV_ITEMS:
            btn = QPushButton(label)
            btn.setProperty("class", "nav-btn")
            btn.setCursor(Qt.PointingHandCursor)
            btn.clicked.connect(lambda checked=False, i=idx: self.select_page(i))
            self.buttons.append(btn)
            layout.addWidget(btn)

        layout.addStretch()

        # Rychlý přepínač motivu ve spodní části
        theme_frame = QFrame()
        theme_layout = QHBoxLayout(theme_frame)
        theme_layout.setContentsMargins(4, 4, 4, 4)

        self.theme_btn = QPushButton("🌙  Tmavý režim")
        self.theme_btn.setProperty("class", "action-btn")
        self.theme_btn.setCursor(Qt.PointingHandCursor)
        self.theme_btn.clicked.connect(self.theme_toggle_requested.emit)
        theme_layout.addWidget(self.theme_btn)

        layout.addWidget(theme_frame)

        # Nastavení výchozího aktivního tlačítka
        self.update_active_button(0)

    def select_page(self, index: int):
        self.active_index = index
        self.update_active_button(index)
        self.page_changed.emit(index)

    def update_active_button(self, index: int):
        for i, btn in enumerate(self.buttons):
            if i == index:
                btn.setProperty("class", "nav-btn active")
            else:
                btn.setProperty("class", "nav-btn")
            # Refresh stylu po změně dynamické property
            btn.style().unpolish(btn)
            btn.style().polish(btn)

    def set_theme_display(self, is_dark: bool):
        self.is_dark_mode = is_dark
        if is_dark:
            self.theme_btn.setText("🌙  Tmavý režim")
        else:
            self.theme_btn.setText("☀️  Světlý režim")
