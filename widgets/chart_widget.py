"""
DailyTrack - Komponenty pro zobrazení grafů (Matplotlib v PySide6)
Podporuje automatické přebarvení podle aktivního motivu (světlý / tmavý).
"""

from typing import List, Tuple, Dict
from PySide6.QtWidgets import QWidget, QVBoxLayout, QLabel
from PySide6.QtCore import Qt

import matplotlib
matplotlib.use("QtAgg")
from matplotlib.backends.backend_qtagg import FigureCanvasQTAgg as FigureCanvas
from matplotlib.figure import Figure

from theme import Theme


class TaskDonutChart(QWidget):
    """Koláčový / prstencový graf dokončených vs čekajících úkolů."""

    def __init__(self, parent=None):
        super().__init__(parent)
        self.layout = QVBoxLayout(self)
        self.layout.setContentsMargins(4, 4, 4, 4)

        self.figure = Figure(figsize=(4, 3), dpi=100)
        self.canvas = FigureCanvas(self.figure)
        self.layout.addWidget(self.canvas)

    def update_chart(self, completed: int, pending: int, theme_name: str = Theme.DARK):
        p = Theme.get_palette(theme_name)
        self.figure.clear()
        self.figure.patch.set_facecolor(p["chart_bg"])

        ax = self.figure.add_subplot(111)
        ax.set_facecolor(p["chart_bg"])

        total = completed + pending
        if total == 0:
            ax.text(0.5, 0.5, "Žádné úkoly k zobrazení",
                    horizontalalignment='center', verticalalignment='center',
                    color=p["text_muted"], fontsize=11, transform=ax.transAxes)
            ax.axis('off')
        else:
            labels = []
            sizes = []
            colors = []

            if completed > 0:
                labels.append(f"Hotovo ({completed})")
                sizes.append(completed)
                colors.append(p["success"])

            if pending > 0:
                labels.append(f"K vyřízení ({pending})")
                sizes.append(pending)
                colors.append(p["accent"])

            wedges, texts, autotexts = ax.pie(
                sizes,
                labels=labels,
                autopct='%1.0f%%',
                startangle=90,
                colors=colors,
                pctdistance=0.75,
                wedgeprops=dict(width=0.45, edgecolor=p["chart_bg"], linewidth=2),
                textprops=dict(color=p["chart_text"], fontsize=10, weight='bold')
            )

            for t in autotexts:
                t.set_color("#FFFFFF")
                t.set_fontsize(10)
                t.set_weight('bold')

            ax.axis('equal')

        self.figure.tight_layout()
        self.canvas.draw()


class HabitActivityBarChart(QWidget):
    """Sloupcový graf aktivity návyků za posledních 14 dní."""

    def __init__(self, parent=None):
        super().__init__(parent)
        self.layout = QVBoxLayout(self)
        self.layout.setContentsMargins(4, 4, 4, 4)

        self.figure = Figure(figsize=(6, 3), dpi=100)
        self.canvas = FigureCanvas(self.figure)
        self.layout.addWidget(self.canvas)

    def update_chart(self, daily_data: List[Tuple[str, int]], theme_name: str = Theme.DARK):
        """daily_data: seznam (štítek_dne, počet_splněných_návyků)"""
        p = Theme.get_palette(theme_name)
        self.figure.clear()
        self.figure.patch.set_facecolor(p["chart_bg"])

        ax = self.figure.add_subplot(111)
        ax.set_facecolor(p["chart_bg"])

        if not daily_data:
            ax.text(0.5, 0.5, "Zatím žádná data o návycích",
                    horizontalalignment='center', verticalalignment='center',
                    color=p["text_muted"], fontsize=11, transform=ax.transAxes)
            ax.axis('off')
        else:
            labels = [item[0] for item in daily_data]
            counts = [item[1] for item in daily_data]

            bars = ax.bar(labels, counts, color=p["accent"], width=0.6,
                          edgecolor=p["border"], linewidth=0.5, zorder=3)

            # Zvýraznění sloupců
            for bar in bars:
                if bar.get_height() > 0:
                    bar.set_color(p["accent"])
                else:
                    bar.set_color(p["border"])
                    bar.set_height(0.08)  # Jemná vizuální linka pro 0

            ax.grid(axis='y', linestyle='--', alpha=0.3, color=p["chart_grid"], zorder=0)
            ax.set_axisbelow(True)

            # Barvy popisků a os
            ax.tick_params(axis='x', colors=p["chart_text"], labelsize=8.5, rotation=40)
            ax.tick_params(axis='y', colors=p["chart_text"], labelsize=9)

            # Skrytí horního a pravého okraje
            for spine in ['top', 'right']:
                ax.spines[spine].set_visible(False)
            ax.spines['left'].set_color(p["border"])
            ax.spines['bottom'].set_color(p["border"])

            # Celočíselné kroky na ose Y
            max_y = max(counts) if counts and max(counts) > 0 else 3
            ax.set_ylim(0, max_y + 1)
            import matplotlib.ticker as ticker
            ax.yaxis.set_major_locator(ticker.MaxNLocator(integer=True))

        self.figure.tight_layout()
        self.canvas.draw()
