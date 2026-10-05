"""
DailyTrack - Dialog pro vytvoření a úpravu úkolu
"""

from typing import Optional
from datetime import datetime, date
from PySide6.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout, QLabel, QLineEdit,
    QTextEdit, QComboBox, QDateEdit, QPushButton, QCheckBox,
    QMessageBox
)
from PySide6.QtCore import QDate, Qt

from models import Task, Priority, Recurrence


class TaskDialog(QDialog):
    def __init__(self, parent=None, task: Optional[Task] = None):
        super().__init__(parent)
        self.task = task
        self.setWindowTitle("Upravit úkol" if task else "Nový úkol")
        self.setMinimumWidth(440)
        self.setup_ui()

        if task:
            self.load_task_data(task)

    def setup_ui(self):
        layout = QVBoxLayout(self)
        layout.setSpacing(14)
        layout.setContentsMargins(20, 20, 20, 20)

        # Nadpis dialogu
        title_lbl = QLabel("Upravit úkol" if self.task else "Vytvořit nový úkol")
        title_lbl.setStyleSheet("font-size: 16px; font-weight: bold;")
        layout.addWidget(title_lbl)

        # Název úkolu (povinný)
        layout.addWidget(QLabel("Název úkolu *:"))
        self.title_input = QLineEdit()
        self.title_input.setPlaceholderText("např. Dokončit analýzu projektu...")
        layout.addWidget(self.title_input)

        # Popis úkolu (volitelný)
        layout.addWidget(QLabel("Popis úkolu:"))
        self.desc_input = QTextEdit()
        self.desc_input.setPlaceholderText("Doplňující poznámky nebo podrobnosti...")
        self.desc_input.setMaximumHeight(90)
        layout.addWidget(self.desc_input)

        # Priorita a Opakování v řádku vedle sebe
        row1_layout = QHBoxLayout()

        priority_col = QVBoxLayout()
        priority_col.addWidget(QLabel("Priorita:"))
        self.priority_combo = QComboBox()
        self.priority_combo.addItems(Priority.ALL)
        self.priority_combo.setCurrentText(Priority.MEDIUM)
        priority_col.addWidget(self.priority_combo)
        row1_layout.addLayout(priority_col)

        recurrence_col = QVBoxLayout()
        recurrence_col.addWidget(QLabel("Opakování:"))
        self.recurrence_combo = QComboBox()
        self.recurrence_combo.addItems(Recurrence.ALL)
        self.recurrence_combo.setCurrentText(Recurrence.NONE)
        recurrence_col.addWidget(self.recurrence_combo)
        row1_layout.addLayout(recurrence_col)

        layout.addLayout(row1_layout)

        # Termín splnění (Deadline)
        due_col = QVBoxLayout()
        due_header_layout = QHBoxLayout()
        self.due_checkbox = QCheckBox("Nastavit termín splnění:")
        self.due_checkbox.setChecked(True)
        self.due_checkbox.toggled.connect(self._on_due_toggle)
        due_header_layout.addWidget(self.due_checkbox)
        due_header_layout.addStretch()
        due_col.addLayout(due_header_layout)

        self.date_picker = QDateEdit()
        self.date_picker.setCalendarPopup(True)
        self.date_picker.setDate(QDate.currentDate())
        self.date_picker.setDisplayFormat("yyyy-MM-dd")
        due_col.addWidget(self.date_picker)
        layout.addLayout(due_col)

        layout.addSpacing(6)

        # Tlačítka Uložit a Zrušit
        btn_layout = QHBoxLayout()
        btn_layout.addStretch()

        self.cancel_btn = QPushButton("Zrušit")
        self.cancel_btn.setProperty("class", "action-btn")
        self.cancel_btn.clicked.connect(self.reject)
        btn_layout.addWidget(self.cancel_btn)

        self.save_btn = QPushButton("Uložit úkol")
        self.save_btn.setProperty("class", "primary-btn")
        self.save_btn.clicked.connect(self._on_save)
        btn_layout.addWidget(self.save_btn)

        layout.addLayout(btn_layout)

    def _on_due_toggle(self, checked: bool):
        self.date_picker.setEnabled(checked)

    def load_task_data(self, task: Task):
        self.title_input.setText(task.title)
        self.desc_input.setPlainText(task.description)
        self.priority_combo.setCurrentText(task.priority)
        self.recurrence_combo.setCurrentText(task.recurrence)

        if task.due_date:
            try:
                parts = [int(p) for p in task.due_date.split("-")]
                self.date_picker.setDate(QDate(parts[0], parts[1], parts[2]))
                self.due_checkbox.setChecked(True)
                self.date_picker.setEnabled(True)
            except Exception:
                self.due_checkbox.setChecked(False)
                self.date_picker.setEnabled(False)
        else:
            self.due_checkbox.setChecked(False)
            self.date_picker.setEnabled(False)

    def _on_save(self):
        title = self.title_input.text().strip()
        if not title:
            QMessageBox.warning(self, "Chyba zadání", "Název úkolu nesmí být prázdný.")
            self.title_input.setFocus()
            return

        self.accept()

    def get_data(self) -> dict:
        due = None
        if self.due_checkbox.isChecked():
            qdate = self.date_picker.date()
            due = f"{qdate.year():04d}-{qdate.month():02d}-{qdate.day():02d}"

        return {
            "title": self.title_input.text().strip(),
            "description": self.desc_input.toPlainText().strip(),
            "priority": self.priority_combo.currentText(),
            "recurrence": self.recurrence_combo.currentText(),
            "due_date": due
        }
