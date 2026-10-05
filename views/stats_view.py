"""
DailyTrack - Statistiky a analýzy (Stats View)
Zobrazuje klíčové metriky, úspěšnost, streaky a integrované Matplotlib grafy.
"""

from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QFrame,
    QScrollArea, QGridLayout
)
from PySide6.QtCore import Qt

from database import Database
from widgets.chart_widget import TaskDonutChart, HabitActivityBarChart
from theme import Theme


class StatsView(QWidget):
    def __init__(self, db: Database, parent=None):
        super().__init__(parent)
        self.db = db
        self.current_theme = Theme.DARK
        self.setup_ui()

    def setup_ui(self):
        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(24, 20, 24, 20)
        main_layout.setSpacing(16)

        # Hlavička
        header_col = QVBoxLayout()
        title = QLabel("Statistiky a přehledy")
        title.setProperty("class", "page-title")
        header_col.addWidget(title)

        subtitle = QLabel("Přehledná vizualizace vaší produktivity a plnění návyků")
        subtitle.setProperty("class", "page-subtitle")
        header_col.addWidget(subtitle)
        main_layout.addLayout(header_col)

        # Posuvná oblast pro přehledy a grafy
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll_content = QWidget()
        self.content_layout = QVBoxLayout(scroll_content)
        self.content_layout.setContentsMargins(0, 4, 8, 8)
        self.content_layout.setSpacing(18)

        # Mřížka s KPI kartami
        cards_grid = QGridLayout()
        cards_grid.setSpacing(12)

        self.kpi_completed = self._create_kpi_card("DOKONČENÉ ÚKOLY", "0", "ze všech evidovaných")
        self.kpi_pending = self._create_kpi_card("NESPLNĚNÉ ÚKOLY", "0", "čeká na splnění")
        self.kpi_rate = self._create_kpi_card("ÚSPĚŠNOST ÚKOLŮ", "0 %", "poměr dokončených")
        self.kpi_streak = self._create_kpi_card("NEJDELŠÍ STREAK", "0 dní", "historické maximum")

        cards_grid.addWidget(self.kpi_completed["frame"], 0, 0)
        cards_grid.addWidget(self.kpi_pending["frame"], 0, 1)
        cards_grid.addWidget(self.kpi_rate["frame"], 0, 2)
        cards_grid.addWidget(self.kpi_streak["frame"], 0, 3)

        self.content_layout.addLayout(cards_grid)

        # Sekce grafů (2 sloupce vedle sebe nebo pod sebou)
        charts_layout = QHBoxLayout()
        charts_layout.setSpacing(16)

        # Graf 1: Poměr úkolů
        task_chart_frame = QFrame()
        task_chart_frame.setProperty("class", "card")
        tc_layout = QVBoxLayout(task_chart_frame)
        tc_layout.setContentsMargins(14, 12, 14, 12)

        tc_title = QLabel("Stav úkolů")
        tc_title.setProperty("class", "section-header")
        tc_layout.addWidget(tc_title)

        self.task_chart = TaskDonutChart()
        tc_layout.addWidget(self.task_chart)
        charts_layout.addWidget(task_chart_frame, stretch=1)

        # Graf 2: Aktivita návyků
        habit_chart_frame = QFrame()
        habit_chart_frame.setProperty("class", "card")
        hc_layout = QVBoxLayout(habit_chart_frame)
        hc_layout.setContentsMargins(14, 12, 14, 12)

        hc_title = QLabel("Aktivita návyků (posledních 14 dní)")
        hc_title.setProperty("class", "section-header")
        hc_layout.addWidget(hc_title)

        self.habit_chart = HabitActivityBarChart()
        hc_layout.addWidget(self.habit_chart)
        charts_layout.addWidget(habit_chart_frame, stretch=2)

        self.content_layout.addLayout(charts_layout)

        # Doplňující shrnutí
        summary_frame = QFrame()
        summary_frame.setProperty("class", "card")
        sum_layout = QVBoxLayout(summary_frame)
        sum_layout.setContentsMargins(16, 14, 16, 14)

        sum_title = QLabel("Doplňující metriky")
        sum_title.setProperty("class", "section-header")
        sum_layout.addWidget(sum_title)

        self.summary_text = QLabel()
        self.summary_text.setProperty("class", "page-subtitle")
        self.summary_text.setWordWrap(True)
        sum_layout.addWidget(self.summary_text)

        self.content_layout.addWidget(summary_frame)

        self.content_layout.addStretch()
        scroll.setWidget(scroll_content)
        main_layout.addWidget(scroll)

        self.refresh()

    def _create_kpi_card(self, title_text: str, val_text: str, sub_text: str) -> dict:
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

    def set_theme(self, theme_name: str):
        self.current_theme = theme_name
        self.refresh()

    def refresh(self):
        t_stats = self.db.get_task_statistics()
        h_stats = self.db.get_habit_statistics()

        # KPI hodnoty
        self.kpi_completed["val"].setText(str(t_stats["completed"]))
        self.kpi_completed["sub"].setText(f"z celkem {t_stats['total']} úkolů")

        self.kpi_pending["val"].setText(str(t_stats["pending"]))
        self.kpi_pending["sub"].setText(f"{t_stats['overdue']} po termínu" if t_stats['overdue'] > 0 else "žádný po termínu")

        self.kpi_rate["val"].setText(f"{t_stats['completion_rate']} %")
        self.kpi_rate["sub"].setText("míra dokončení")

        self.kpi_streak["val"].setText(f"{h_stats['best_overall_streak']} dní")
        self.kpi_streak["sub"].setText(f"akt. maximum: {h_stats['current_max_streak']} dní")

        # Aktualizace grafů
        self.task_chart.update_chart(
            completed=t_stats["completed"],
            pending=t_stats["pending"],
            theme_name=self.current_theme
        )

        daily_data = self.db.get_habit_activity_last_days(days=14)
        self.habit_chart.update_chart(
            daily_data=daily_data,
            theme_name=self.current_theme
        )

        # Shrnutí
        p_counts = t_stats.get("priority_counts", {})
        high_p = p_counts.get("Vysoká", 0)
        med_p = p_counts.get("Střední", 0)
        low_p = p_counts.get("Nízká", 0)

        sum_msg = (
            f"Celkem evidováno: <b>{t_stats['total']}</b> úkolů "
            f"(vysoká priorita: <b>{high_p}</b>, střední: <b>{med_p}</b>, nízká: <b>{low_p}</b>). "
            f"Sledováno je <b>{h_stats['total_habits']}</b> návyků s celkem <b>{h_stats['total_checkins']}</b> zaznamenanými splněními."
        )
        self.summary_text.setText(sum_msg)
