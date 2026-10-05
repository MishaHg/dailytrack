"""
DailyTrack - Hlavní vstupní bod aplikace
Kompletní osobní organizér (PySide6, SQLite, Matplotlib)
"""

import sys
import os

# Zajištění načítání modulů ze složky aplikace
app_dir = os.path.dirname(os.path.abspath(__file__))
if app_dir not in sys.path:
    sys.path.insert(0, app_dir)

from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QHBoxLayout,
    QStackedWidget
)
from PySide6.QtCore import Qt
from PySide6.QtGui import QIcon

from database import Database
from theme import Theme
from views.sidebar import Sidebar
from views.today_view import TodayView
from views.tasks_view import TasksView
from views.habits_view import HabitsView
from views.stats_view import StatsView
from views.settings_view import SettingsView


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("DailyTrack - Osobní organizér")
        self.resize(1060, 720)
        self.setMinimumSize(840, 540)  # Skvělá použitelnost i na menších monitorech

        # Inicializace databáze
        db_path = os.path.join(app_dir, "dailytrack.db")
        self.db = Database(db_path)

        # Načtení preferovaného motivu z databáze
        saved_theme = self.db.get_setting("theme", Theme.DARK)
        self.current_theme = saved_theme if saved_theme in [Theme.DARK, Theme.LIGHT] else Theme.DARK

        self.setup_ui()
        self.apply_theme(self.current_theme)

    def setup_ui(self):
        central_widget = QWidget(self)
        self.setCentralWidget(central_widget)

        main_layout = QHBoxLayout(central_widget)
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)

        # 1. Levý postranní panel
        self.sidebar = Sidebar(self)
        self.sidebar.page_changed.connect(self._on_page_changed)
        self.sidebar.theme_toggle_requested.connect(self._toggle_theme)
        main_layout.addWidget(self.sidebar)

        # 2. Pravá oblast s přepínatelnými pohledy
        self.stacked_widget = QStackedWidget(self)

        self.today_view = TodayView(self.db, self)
        self.tasks_view = TasksView(self.db, self)
        self.habits_view = HabitsView(self.db, self)
        self.stats_view = StatsView(self.db, self)
        self.settings_view = SettingsView(self.db, current_theme=self.current_theme, parent=self)

        self.stacked_widget.addWidget(self.today_view)     # Index 0
        self.stacked_widget.addWidget(self.tasks_view)     # Index 1
        self.stacked_widget.addWidget(self.habits_view)    # Index 2
        self.stacked_widget.addWidget(self.stats_view)     # Index 3
        self.stacked_widget.addWidget(self.settings_view)  # Index 4

        main_layout.addWidget(self.stacked_widget, stretch=1)

        # Propojení signálů pro vzájemnou synchronizaci dat mezi pohledy
        self.today_view.data_changed.connect(self._sync_all_views)
        self.tasks_view.data_changed.connect(self._sync_all_views)
        self.habits_view.data_changed.connect(self._sync_all_views)
        self.settings_view.theme_changed.connect(self.apply_theme)
        self.settings_view.data_reset.connect(self._sync_all_views)

    def _on_page_changed(self, index: int):
        self.stacked_widget.setCurrentIndex(index)
        current_view = self.stacked_widget.currentWidget()
        if hasattr(current_view, "refresh"):
            current_view.refresh()

    def _sync_all_views(self):
        """Aktualizuje data ve všech pohledech po změně (přidání, editace, splnění)."""
        self.today_view.refresh()
        self.tasks_view.refresh()
        self.habits_view.refresh()
        self.stats_view.refresh()
        self.settings_view.refresh()

    def _toggle_theme(self):
        new_theme = Theme.LIGHT if self.current_theme == Theme.DARK else Theme.DARK
        self.apply_theme(new_theme)

    def apply_theme(self, theme_name: str):
        self.current_theme = theme_name
        self.db.set_setting("theme", theme_name)

        # Aplikace globálního QSS stylu
        qss = Theme.get_stylesheet(theme_name)
        QApplication.instance().setStyleSheet(qss)

        # Aktualizace prvků závislých na motivu
        is_dark = (theme_name == Theme.DARK)
        self.sidebar.set_theme_display(is_dark)
        self.settings_view.set_theme_selection(theme_name)
        self.stats_view.set_theme(theme_name)


def main():
    # Nastavení podpory High DPI displejů
    app = QApplication(sys.argv)
    app.setApplicationName("DailyTrack")
    app.setOrganizationName("DailyTrack")

    window = MainWindow()
    window.show()

    sys.exit(app.exec())


if __name__ == "__main__":
    main()
