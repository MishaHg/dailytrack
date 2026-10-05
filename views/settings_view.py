"""
DailyTrack - Nastavení aplikace (Settings View)
Volba grafického tématu, správa databáze a informace o aplikaci.
"""

import os
from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton,
    QFrame, QComboBox, QMessageBox, QScrollArea
)
from PySide6.QtCore import Qt, Signal

from database import Database
from theme import Theme


class SettingsView(QWidget):
    theme_changed = Signal(str)
    data_reset = Signal()

    def __init__(self, db: Database, current_theme: str = Theme.DARK, parent=None):
        super().__init__(parent)
        self.db = db
        self.current_theme = current_theme
        self.setup_ui()

    def setup_ui(self):
        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(24, 20, 24, 20)
        main_layout.setSpacing(16)

        # Hlavička
        header_col = QVBoxLayout()
        title = QLabel("Nastavení")
        title.setProperty("class", "page-title")
        header_col.addWidget(title)

        subtitle = QLabel("Přizpůsobení aplikace a správa uložených dat")
        subtitle.setProperty("class", "page-subtitle")
        header_col.addWidget(subtitle)
        main_layout.addLayout(header_col)

        # Posuvná oblast
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll_content = QWidget()
        content_layout = QVBoxLayout(scroll_content)
        content_layout.setContentsMargins(0, 4, 8, 8)
        content_layout.setSpacing(16)

        # Karta 1: Vzhled
        theme_card = QFrame()
        theme_card.setProperty("class", "card")
        tc_layout = QVBoxLayout(theme_card)
        tc_layout.setSpacing(12)

        tc_title = QLabel("Vzhled aplikace")
        tc_title.setProperty("class", "section-header")
        tc_layout.addWidget(tc_title)

        tc_sub = QLabel("Vyberte preferované barevné téma rozhraní:")
        tc_sub.setProperty("class", "page-subtitle")
        tc_layout.addWidget(tc_sub)

        theme_row = QHBoxLayout()
        self.theme_combo = QComboBox()
        self.theme_combo.addItem("🌙  Tmavý režim (Dark Mode)", Theme.DARK)
        self.theme_combo.addItem("☀️  Světlý režim (Light Mode)", Theme.LIGHT)

        # Nastavení aktuální hodnoty
        idx = 0 if self.current_theme == Theme.DARK else 1
        self.theme_combo.setCurrentIndex(idx)
        self.theme_combo.currentIndexChanged.connect(self._on_theme_changed)
        theme_row.addWidget(self.theme_combo)
        theme_row.addStretch()
        tc_layout.addLayout(theme_row)

        content_layout.addWidget(theme_card)

        # Karta 2: Správa dat a úložiště
        data_card = QFrame()
        data_card.setProperty("class", "card")
        dc_layout = QVBoxLayout(data_card)
        dc_layout.setSpacing(12)

        dc_title = QLabel("Data a lokální úložiště")
        dc_title.setProperty("class", "section-header")
        dc_layout.addWidget(dc_title)

        self.db_info_label = QLabel()
        self.db_info_label.setProperty("class", "page-subtitle")
        self.db_info_label.setWordWrap(True)
        dc_layout.addWidget(self.db_info_label)

        btn_row = QHBoxLayout()
        btn_row.setSpacing(10)

        clean_tasks_btn = QPushButton("Vyčistit dokončené úkoly")
        clean_tasks_btn.setProperty("class", "action-btn")
        clean_tasks_btn.setCursor(Qt.PointingHandCursor)
        clean_tasks_btn.clicked.connect(self._clean_completed_tasks)
        btn_row.addWidget(clean_tasks_btn)

        reset_btn = QPushButton("Resetovat všechna data")
        reset_btn.setProperty("class", "danger-btn")
        reset_btn.setCursor(Qt.PointingHandCursor)
        reset_btn.clicked.connect(self._reset_all_data)
        btn_row.addWidget(reset_btn)

        btn_row.addStretch()
        dc_layout.addLayout(btn_row)

        content_layout.addWidget(data_card)

        # Karta 3: O aplikaci
        about_card = QFrame()
        about_card.setProperty("class", "card")
        ac_layout = QVBoxLayout(about_card)
        ac_layout.setSpacing(8)

        ac_title = QLabel("O aplikaci DailyTrack")
        ac_title.setProperty("class", "section-header")
        ac_layout.addWidget(ac_title)

        about_desc = QLabel(
            "DailyTrack je osobní organizér a habit tracker běžící plně offline na vašem počítači.<br>"
            "Veškerá data jsou bezpečně uložena v lokální SQLite databázi.<br><br>"
            "<b>Verze:</b> 1.0.0<br>"
            "<b>Technologie:</b> Python 3, PySide6 (Qt for Python), SQLite, Matplotlib<br>"
            "<b>Licence:</b> Open Source"
        )
        about_desc.setProperty("class", "page-subtitle")
        about_desc.setTextFormat(Qt.RichText)
        ac_layout.addWidget(about_desc)

        content_layout.addWidget(about_card)

        content_layout.addStretch()
        scroll.setWidget(scroll_content)
        main_layout.addWidget(scroll)

        self.refresh()

    def set_theme_selection(self, theme_name: str):
        self.current_theme = theme_name
        idx = 0 if theme_name == Theme.DARK else 1
        self.theme_combo.blockSignals(True)
        self.theme_combo.setCurrentIndex(idx)
        self.theme_combo.blockSignals(False)

    def _on_theme_changed(self, index: int):
        new_theme = self.theme_combo.currentData()
        self.current_theme = new_theme
        self.theme_changed.emit(new_theme)

    def refresh(self):
        db_abs_path = os.path.abspath(self.db.db_path)
        size_kb = 0
        if os.path.exists(db_abs_path):
            size_kb = round(os.path.getsize(db_abs_path) / 1024, 1)

        t_stats = self.db.get_task_statistics()
        h_stats = self.db.get_habit_statistics()

        info = (
            f"<b>Databázový soubor:</b> {db_abs_path}<br>"
            f"<b>Velikost souboru:</b> {size_kb} KB<br>"
            f"<b>Záznamy:</b> {t_stats['total']} úkolů, {h_stats['total_habits']} návyků, "
            f"{h_stats['total_checkins']} zaznamenaných splnění."
        )
        self.db_info_label.setText(info)

    def _clean_completed_tasks(self):
        confirm = QMessageBox.question(
            self,
            "Vyčistit hotové úkoly",
            "Opravdu si přejete trvale odstranit všechny dokončené úkoly?",
            QMessageBox.Yes | QMessageBox.No,
            QMessageBox.No
        )
        if confirm == QMessageBox.Yes:
            self.db.clear_completed_tasks()
            self.refresh()
            self.data_reset.emit()
            QMessageBox.information(self, "Hotovo", "Dokončené úkoly byly odstraněny.")

    def _reset_all_data(self):
        confirm = QMessageBox.warning(
            self,
            "Resetovat všechna data",
            "VAROVÁNÍ: Tato akce smaže všechny vaše úkoly, návyky i historii splnění!\nOpravdu chcete pokračovat?",
            QMessageBox.Yes | QMessageBox.No,
            QMessageBox.No
        )
        if confirm == QMessageBox.Yes:
            self.db.reset_all_data()
            self.refresh()
            self.data_reset.emit()
            QMessageBox.information(self, "Data resetována", "Všechna data byla vymazána.")
