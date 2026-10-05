"""
Testovací skript pro ověření logiky databáze, modelů a grafického rozhraní DailyTrack
"""

import sys
import os

# Nastavení cesty
app_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, app_dir)

from datetime import date, timedelta
from database import Database
from models import Priority, Recurrence
from theme import Theme


def test_database_and_logic():
    print("=== 1. Test databaze a logiky ===")
    test_db_path = os.path.join(app_dir, "test_dailytrack.db")
    if os.path.exists(test_db_path):
        try:
            os.remove(test_db_path)
        except OSError:
            pass

    try:
        db = Database(test_db_path)

        # 1. Test seeding
        tasks = db.get_tasks()
        assert len(tasks) >= 3, f"Ocekavany alespon 3 seedovane ukoly, nalezeno {len(tasks)}"
        print(f"[OK] Uspesne seedovano: {len(tasks)} ukolu")

        habits = db.get_habits_with_details()
        assert len(habits) >= 3, f"Ocekavany alespon 3 seedovane navyky, nalezeno {len(habits)}"
        print(f"[OK] Uspesne seedovano: {len(habits)} navyku")

        # 2. Test pridani ukolu
        t_id = db.add_task(
            title="Novy testovaci ukol",
            description="Popis ukolu",
            priority=Priority.HIGH,
            due_date=date.today().strftime("%Y-%m-%d"),
            recurrence=Recurrence.DAILY
        )
        assert t_id is not None
        print(f"[OK] Ukol uspesne vytvoren s ID: {t_id}")

        # 3. Test dokonceni opakovaneho ukolu
        completed_res = db.toggle_task_completion(t_id)
        assert completed_res is True
        # Mel by se vytvorit dalsi opakovany ukol
        all_tasks_now = db.get_tasks()
        assert len(all_tasks_now) == len(tasks) + 2
        print("[OK] Dokonceni opakovaneho ukolu automaticky vytvorilo dalsi instanci s budoucim terminem.")

        # 4. Test streaku u navyku
        h_id = db.add_habit("Testovaci cviceni", "Protahovani", "#10B981")
        today = date.today()
        db.toggle_habit_date(h_id, today.strftime("%Y-%m-%d"))
        db.toggle_habit_date(h_id, (today - timedelta(days=1)).strftime("%Y-%m-%d"))
        db.toggle_habit_date(h_id, (today - timedelta(days=2)).strftime("%Y-%m-%d"))

        current_s, best_s = db.calculate_streaks(h_id)
        assert current_s == 3, f"Ocekavan streak 3, vypocteno {current_s}"
        assert best_s == 3, f"Ocekavan best streak 3, vypocteno {best_s}"
        print(f"[OK] Vypocet streaku funguje spravne: current={current_s}, best={best_s}")

        # 5. Test statistik
        t_stats = db.get_task_statistics()
        assert t_stats["total"] > 0
        assert "completion_rate" in t_stats
        print(f"[OK] Statistiky ukolu: total={t_stats['total']}, completed={t_stats['completed']}, rate={t_stats['completion_rate']}%")

        h_stats = db.get_habit_statistics()
        assert h_stats["total_habits"] > 0
        print(f"[OK] Statistiky navyku: total={h_stats['total_habits']}, best_streak={h_stats['best_overall_streak']}")

        # 6. Test nastaveni
        db.set_setting("theme", "light")
        assert db.get_setting("theme") == "light"
        print("[OK] Ulozeni a nacteni nastaveni funguje.")

    finally:
        if os.path.exists(test_db_path):
            try:
                os.remove(test_db_path)
            except OSError:
                pass

    print("=== Vsechny testy databaze a logiky probehly uspesne! ===\n")


def test_gui_offscreen():
    print("=== 2. Test grafickeho rozhrani (PySide6 offscreen) ===")
    os.environ["QT_QPA_PLATFORM"] = "offscreen"

    from PySide6.QtWidgets import QApplication
    from main import MainWindow

    app = QApplication.instance() or QApplication(sys.argv)
    window = MainWindow()

    # Overime inicializaci vsech 5 zalozek
    assert window.stacked_widget.count() == 5
    print("[OK] Vsech 5 pohledu uspesne nacteno v QStackedWidget.")

    # Simulace prepinani stranek
    for page_idx in range(5):
        window.sidebar.select_page(page_idx)
        assert window.stacked_widget.currentIndex() == page_idx
    print("[OK] Prepinani stranek v postrannim panelu funguje.")

    # Simulace prepnuti motivu
    window.apply_theme(Theme.LIGHT)
    assert window.current_theme == Theme.LIGHT
    window.apply_theme(Theme.DARK)
    assert window.current_theme == Theme.DARK
    print("[OK] Prepinani svetleho a tmaveho motivu funguje bez chyb.")

    # Simulace synchronizace dat
    window._sync_all_views()
    print("[OK] Vsech 5 pohledu se uspesne synchronizovalo a vykreslilo grafy.")

    window.close()
    print("=== GUI test v offscreen rezimu probehl bez chyby! ===\n")


if __name__ == "__main__":
    test_database_and_logic()
    test_gui_offscreen()
    print(">>> VSECHNY TESTY PROSLY NA 100% <<<")
