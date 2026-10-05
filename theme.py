"""
DailyTrack - Vzhled a grafická témata (Světlý a Tmavý režim)
Moderní minimalistický design s promyšlenou typografií a barevnou paletou.
"""

from typing import Dict, Any


class Theme:
    LIGHT = "light"
    DARK = "dark"

    # Barevné konstanty pro použití v Qt a Matplotlib
    PALETTE = {
        "dark": {
            "bg_app": "#0F172A",          # Hluboká břidlicová modř
            "bg_card": "#1E293B",         # Karta / panel
            "bg_sidebar": "#090D16",      # Postranní panel
            "bg_input": "#0F172A",        # Pole vstupů
            "border": "#334155",          # Ohraničení
            "border_focus": "#6366F1",    # Zvýraznění při focusu
            "text_primary": "#F8FAFC",    # Hlavní text
            "text_secondary": "#94A3B8",  # Vedlejší text
            "text_muted": "#64748B",      # Ztlumený text
            "accent": "#6366F1",          # Indigo
            "accent_hover": "#4F46E5",
            "accent_text": "#FFFFFF",
            "success": "#10B981",         # Zelená
            "danger": "#EF4444",          # Červená
            "warning": "#F59E0B",         # Oranžová
            "info": "#06B6D4",            # Tyrkys
            "chart_bg": "#1E293B",
            "chart_text": "#E2E8F0",
            "chart_grid": "#334155"
        },
        "light": {
            "bg_app": "#F8FAFC",          # Čisté světlé pozadí
            "bg_card": "#FFFFFF",         # Bílá karta
            "bg_sidebar": "#F1F5F9",      # Světlý postranní panel
            "bg_input": "#FFFFFF",        # Bílé vstupní pole
            "border": "#E2E8F0",          # Jemné šedé ohraničení
            "border_focus": "#4F46E5",
            "text_primary": "#0F172A",    # Tmavý text
            "text_secondary": "#475569",  # Středně šedý text
            "text_muted": "#94A3B8",
            "accent": "#4F46E5",          # Indigo
            "accent_hover": "#4338CA",
            "accent_text": "#FFFFFF",
            "success": "#059669",
            "danger": "#DC2626",
            "warning": "#D97706",
            "info": "#0891B2",
            "chart_bg": "#FFFFFF",
            "chart_text": "#1E293B",
            "chart_grid": "#E2E8F0"
        }
    }

    @classmethod
    def get_palette(cls, theme_name: str) -> Dict[str, str]:
        return cls.PALETTE.get(theme_name, cls.PALETTE["dark"])

    @classmethod
    def get_stylesheet(cls, theme_name: str = DARK) -> str:
        p = cls.get_palette(theme_name)

        return f"""
        /* Globální nastavení */
        QWidget {{
            background-color: {p["bg_app"]};
            color: {p["text_primary"]};
            font-family: "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
            font-size: 13px;
        }}

        /* Hlavní okno */
        QMainWindow {{
            background-color: {p["bg_app"]};
        }}

        /* Postranní lišta */
        #SidebarContainer {{
            background-color: {p["bg_sidebar"]};
            border-right: 1px solid {p["border"]};
        }}

        #SidebarTitle {{
            color: {p["text_primary"]};
            font-size: 18px;
            font-weight: 700;
            padding: 8px 12px;
        }}

        #SidebarSubtitle {{
            color: {p["text_muted"]};
            font-size: 11px;
            font-weight: 500;
            padding: 0px 12px 10px 12px;
        }}

        /* Tlačítka v postranní liště */
        QPushButton.nav-btn {{
            background-color: transparent;
            color: {p["text_secondary"]};
            font-size: 14px;
            font-weight: 600;
            text-align: left;
            padding: 10px 16px;
            border-radius: 8px;
            border: 1px solid transparent;
            margin: 2px 8px;
        }}

        QPushButton.nav-btn:hover {{
            background-color: {p["bg_card"]};
            color: {p["text_primary"]};
        }}

        QPushButton.nav-btn.active {{
            background-color: {p["accent"]};
            color: {p["accent_text"]};
            font-weight: 700;
        }}

        /* Karty obsahu */
        QFrame.card {{
            background-color: {p["bg_card"]};
            border: 1px solid {p["border"]};
            border-radius: 12px;
            padding: 16px;
        }}

        QFrame.card:hover {{
            border: 1px solid {p["accent"]};
        }}

        /* Stat karty */
        QFrame.stat-card {{
            background-color: {p["bg_card"]};
            border: 1px solid {p["border"]};
            border-radius: 12px;
            padding: 14px;
        }}

        QLabel.stat-number {{
            font-size: 26px;
            font-weight: 800;
            color: {p["accent"]};
        }}

        QLabel.stat-label {{
            font-size: 12px;
            font-weight: 600;
            color: {p["text_secondary"]};
            text-transform: uppercase;
        }}

        /* Běžná tlačítka */
        QPushButton {{
            background-color: {p["bg_card"]};
            color: {p["text_primary"]};
            border: 1px solid {p["border"]};
            border-radius: 8px;
            padding: 8px 14px;
            font-weight: 600;
        }}

        QPushButton:hover {{
            background-color: {p["border"]};
        }}

        /* Primární tlačítko */
        QPushButton.primary-btn {{
            background-color: {p["accent"]};
            color: {p["accent_text"]};
            border: none;
            border-radius: 8px;
            padding: 9px 18px;
            font-weight: 700;
        }}

        QPushButton.primary-btn:hover {{
            background-color: {p["accent_hover"]};
        }}

        /* Nebezpečné tlačítko (Smazat) */
        QPushButton.danger-btn {{
            background-color: transparent;
            color: {p["danger"]};
            border: 1px solid {p["danger"]};
            border-radius: 6px;
            padding: 5px 10px;
            font-size: 12px;
            font-weight: 600;
        }}

        QPushButton.danger-btn:hover {{
            background-color: {p["danger"]};
            color: #FFFFFF;
        }}

        /* Drobná akční tlačítka */
        QPushButton.action-btn {{
            background-color: transparent;
            color: {p["text_secondary"]};
            border: 1px solid {p["border"]};
            border-radius: 6px;
            padding: 5px 10px;
            font-size: 12px;
            font-weight: 600;
        }}

        QPushButton.action-btn:hover {{
            background-color: {p["bg_app"]};
            color: {p["text_primary"]};
        }}

        /* Tlačítko splněno */
        QPushButton.check-btn {{
            background-color: transparent;
            color: {p["text_secondary"]};
            border: 2px solid {p["border"]};
            border-radius: 8px;
            padding: 6px 12px;
            font-weight: 700;
        }}

        QPushButton.check-btn.checked {{
            background-color: {p["success"]};
            color: #FFFFFF;
            border: 2px solid {p["success"]};
        }}

        /* Vstupní formuláře */
        QLineEdit, QTextEdit, QComboBox, QDateEdit {{
            background-color: {p["bg_input"]};
            color: {p["text_primary"]};
            border: 1px solid {p["border"]};
            border-radius: 8px;
            padding: 8px 12px;
            selection-background-color: {p["accent"]};
        }}

        QLineEdit:focus, QTextEdit:focus, QComboBox:focus, QDateEdit:focus {{
            border: 1px solid {p["border_focus"]};
        }}

        /* ComboBox rozbalovací seznam */
        QComboBox::drop-down {{
            border: none;
            width: 24px;
        }}

        QComboBox QAbstractItemView {{
            background-color: {p["bg_card"]};
            color: {p["text_primary"]};
            border: 1px solid {p["border"]};
            selection-background-color: {p["accent"]};
            selection-color: #FFFFFF;
            border-radius: 6px;
            padding: 4px;
        }}

        /* Checkbox */
        QCheckBox {{
            spacing: 10px;
            font-size: 14px;
            color: {p["text_primary"]};
        }}

        QCheckBox::indicator {{
            width: 20px;
            height: 20px;
            border-radius: 6px;
            border: 2px solid {p["border"]};
            background-color: {p["bg_input"]};
        }}

        QCheckBox::indicator:hover {{
            border-color: {p["accent"]};
        }}

        QCheckBox::indicator:checked {{
            background-color: {p["accent"]};
            border-color: {p["accent"]};
            image: none;
        }}

        /* Scrollbar */
        QScrollBar:vertical {{
            background: {p["bg_app"]};
            width: 8px;
            margin: 0px;
            border-radius: 4px;
        }}

        QScrollBar::handle:vertical {{
            background: {p["border"]};
            min-height: 25px;
            border-radius: 4px;
        }}

        QScrollBar::handle:vertical:hover {{
            background: {p["text_muted"]};
        }}

        QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {{
            height: 0px;
        }}

        QScrollArea {{
            border: none;
            background: transparent;
        }}

        QScrollArea > QWidget > QWidget {{
            background: transparent;
        }}

        /* Nadpisy */
        QLabel.page-title {{
            font-size: 22px;
            font-weight: 800;
            color: {p["text_primary"]};
        }}

        QLabel.page-subtitle {{
            font-size: 13px;
            color: {p["text_secondary"]};
        }}

        QLabel.section-header {{
            font-size: 15px;
            font-weight: 700;
            color: {p["text_primary"]};
        }}

        /* Dialogy */
        QDialog {{
            background-color: {p["bg_card"]};
        }}

        QDialog QLabel {{
            background-color: transparent;
        }}
        """
