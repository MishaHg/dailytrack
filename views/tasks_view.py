"""
DailyTrack - Správa úkolů (Tasks View)
Vytvoření, úprava, mazání, filtrace podle stavu i priority, vyhledávání.
"""

from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton,
    QLineEdit, QComboBox, QFrame, QScrollArea, QCheckBox,
    QMessageBox
)
from PySide6.QtCore import Qt, Signal

from database import Database
from models import Task, Priority, Recurrence
from widgets.task_dialog import TaskDialog


class TasksView(QWidget):
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
        title = QLabel("Správa úkolů")
        title.setProperty("class", "page-title")
        title_col.addWidget(title)

        subtitle = QLabel("Plánujte, organizujte a sledujte své denní povinnosti")
        subtitle.setProperty("class", "page-subtitle")
        title_col.addWidget(subtitle)
        header_layout.addLayout(title_col)

        header_layout.addStretch()

        new_btn = QPushButton("+ Nový úkol")
        new_btn.setProperty("class", "primary-btn")
        new_btn.setCursor(Qt.PointingHandCursor)
        new_btn.clicked.connect(self._create_task)
        header_layout.addWidget(new_btn)

        main_layout.addLayout(header_layout)

        # Panel filtrů a vyhledávání
        filter_frame = QFrame()
        filter_frame.setProperty("class", "card")
        filter_layout = QHBoxLayout(filter_frame)
        filter_layout.setContentsMargins(12, 10, 12, 10)
        filter_layout.setSpacing(12)

        # Vyhledávací pole
        self.search_input = QLineEdit()
        self.search_input.setPlaceholderText("🔍  Hledat v úkolech...")
        self.search_input.textChanged.connect(self.refresh)
        filter_layout.addWidget(self.search_input, stretch=2)

        # Filtr podle stavu
        filter_layout.addWidget(QLabel("Stav:"))
        self.status_combo = QComboBox()
        self.status_combo.addItem("Všechny úkoly", "all")
        self.status_combo.addItem("K vyřízení", "pending")
        self.status_combo.addItem("Dokončené", "completed")
        self.status_combo.currentIndexChanged.connect(self.refresh)
        filter_layout.addWidget(self.status_combo, stretch=1)

        # Filtr podle priority
        filter_layout.addWidget(QLabel("Priorita:"))
        self.priority_combo = QComboBox()
        self.priority_combo.addItem("Všechny priority", "all")
        for p in Priority.ALL:
            self.priority_combo.addItem(p, p)
        self.priority_combo.currentIndexChanged.connect(self.refresh)
        filter_layout.addWidget(self.priority_combo, stretch=1)

        main_layout.addWidget(filter_frame)

        # Seznam úkolů v posuvném kontejneru
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll_content = QWidget()
        self.tasks_layout = QVBoxLayout(scroll_content)
        self.tasks_layout.setContentsMargins(0, 4, 8, 8)
        self.tasks_layout.setSpacing(10)

        scroll.setWidget(scroll_content)
        main_layout.addWidget(scroll)

        self.refresh()

    def refresh(self):
        # Vyčištění layoutu
        while self.tasks_layout.count():
            item = self.tasks_layout.takeAt(0)
            widget = item.widget()
            if widget:
                widget.deleteLater()

        status_filter = self.status_combo.currentData() or "all"
        priority_filter = self.priority_combo.currentData() or "all"
        search_query = self.search_input.text().strip()

        tasks = self.db.get_tasks(
            status_filter=status_filter,
            priority_filter=priority_filter,
            search_query=search_query
        )

        if not tasks:
            empty_card = QFrame()
            empty_card.setProperty("class", "card")
            e_layout = QVBoxLayout(empty_card)
            e_layout.setAlignment(Qt.AlignCenter)
            e_layout.setContentsMargins(24, 36, 24, 36)

            empty_lbl = QLabel("Nebyly nalezeny žádné úkoly odpovídající zadaným kritériím.")
            empty_lbl.setProperty("class", "page-subtitle")
            empty_lbl.setAlignment(Qt.AlignCenter)
            e_layout.addWidget(empty_lbl)

            self.tasks_layout.addWidget(empty_card)
        else:
            for task in tasks:
                self.tasks_layout.addWidget(self._build_task_card(task))

        self.tasks_layout.addStretch()

    def _build_task_card(self, task: Task) -> QWidget:
        card = QFrame()
        card.setProperty("class", "card")
        h_layout = QHBoxLayout(card)
        h_layout.setContentsMargins(14, 12, 14, 12)
        h_layout.setSpacing(14)

        # Checkbox
        chk = QCheckBox()
        chk.setChecked(task.completed)
        chk.toggled.connect(lambda state, tid=task.id: self._toggle_task(tid))
        h_layout.addWidget(chk)

        # Střední sloupec s názvem a popisem
        info_col = QVBoxLayout()
        info_col.setSpacing(4)

        title_style = "font-size: 15px; font-weight: 700;"
        if task.completed:
            title_style += " text-decoration: line-through; opacity: 0.6;"

        title_lbl = QLabel(task.title)
        title_lbl.setStyleSheet(title_style)
        info_col.addWidget(title_lbl)

        if task.description:
            desc_lbl = QLabel(task.description)
            desc_lbl.setProperty("class", "page-subtitle")
            desc_lbl.setWordWrap(True)
            info_col.addWidget(desc_lbl)

        # Řádek s metadaty (priorita, termín, opakování)
        meta_layout = QHBoxLayout()
        meta_layout.setSpacing(8)

        # Priorita
        p_color = Priority.color(task.priority)
        p_badge = QLabel(f"● {task.priority}")
        p_badge.setStyleSheet(f"""
            background-color: {p_color}1A;
            color: {p_color};
            font-weight: 700;
            font-size: 11px;
            padding: 3px 8px;
            border-radius: 6px;
        """)
        meta_layout.addWidget(p_badge)

        # Termín
        if task.due_date:
            due_color = "#EF4444" if task.is_overdue else "#64748B"
            due_text = "Dnes" if task.is_due_today else ("Zpožděno!" if task.is_overdue else task.due_date)
            due_badge = QLabel(f"📅 {due_text}")
            due_badge.setStyleSheet(f"""
                background-color: {'#EF444422' if task.is_overdue else 'transparent'};
                color: {due_color};
                font-weight: 600;
                font-size: 11px;
                padding: 3px 6px;
                border-radius: 4px;
            """)
            meta_layout.addWidget(due_badge)

        # Opakování
        if task.recurrence and task.recurrence != Recurrence.NONE:
            rec_badge = QLabel(f"🔄 {task.recurrence}")
            rec_badge.setStyleSheet("color: #6366F1; font-weight: 600; font-size: 11px;")
            meta_layout.addWidget(rec_badge)

        meta_layout.addStretch()
        info_col.addLayout(meta_layout)

        h_layout.addLayout(info_col, stretch=1)

        # Tlačítka pro akce
        actions_layout = QHBoxLayout()
        actions_layout.setSpacing(6)

        edit_btn = QPushButton("Upravit")
        edit_btn.setProperty("class", "action-btn")
        edit_btn.setCursor(Qt.PointingHandCursor)
        edit_btn.clicked.connect(lambda checked=False, t=task: self._edit_task(t))
        actions_layout.addWidget(edit_btn)

        del_btn = QPushButton("Smazat")
        del_btn.setProperty("class", "danger-btn")
        del_btn.setCursor(Qt.PointingHandCursor)
        del_btn.clicked.connect(lambda checked=False, tid=task.id, tname=task.title: self._delete_task(tid, tname))
        actions_layout.addWidget(del_btn)

        h_layout.addLayout(actions_layout)

        return card

    def _toggle_task(self, task_id: int):
        self.db.toggle_task_completion(task_id)
        self.refresh()
        self.data_changed.emit()

    def _create_task(self):
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

    def _edit_task(self, task: Task):
        dlg = TaskDialog(self, task=task)
        if dlg.exec():
            data = dlg.get_data()
            self.db.update_task(
                task_id=task.id,
                title=data["title"],
                description=data["description"],
                priority=data["priority"],
                due_date=data["due_date"],
                recurrence=data["recurrence"]
            )
            self.refresh()
            self.data_changed.emit()

    def _delete_task(self, task_id: int, task_name: str):
        confirm = QMessageBox.question(
            self,
            "Smazat úkol",
            f"Opravdu si přejete smazat úkol '{task_name}'?",
            QMessageBox.Yes | QMessageBox.No,
            QMessageBox.No
        )
        if confirm == QMessageBox.Yes:
            self.db.delete_task(task_id)
            self.refresh()
            self.data_changed.emit()
