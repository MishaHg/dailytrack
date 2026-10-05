"""
End-to-End Test for DailyTrack FastAPI and Frontend serving
"""

import sys
import os
import time
import urllib.request
import threading
import uvicorn

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.app.main import app

def run_test():
    config = uvicorn.Config(app, host="127.0.0.1", port=8008, log_level="warning")
    server = uvicorn.Server(config)

    thread = threading.Thread(target=server.run, daemon=True)
    thread.start()

    time.sleep(1.5)

    base_url = "http://127.0.0.1:8008"

    def fetch(url_path):
        url = f"{base_url}{url_path}"
        req = urllib.request.Request(url, headers={"User-Agent": "DailyTrackTest"})
        with urllib.request.urlopen(req, timeout=5) as res:
            return res.status, res.read().decode("utf-8")

    try:
        # 1. Root /
        status, html = fetch("/")
        assert status == 200, f"Root / failed: {status}"
        assert "DailyTrack - Osobní organizér" in html, "App title not in root HTML"
        print("[OK] E2E: Root / served index.html correctly")

        # 2. Static app.jsx
        status, js = fetch("/static/app.jsx")
        assert status == 200, f"/static/app.jsx failed: {status}"
        assert "ReactDOM.createRoot" in js, "app.jsx missing root render"
        print("[OK] E2E: /static/app.jsx served correctly")

        # 3. Health API
        status, health = fetch("/api/health")
        assert status == 200 and "ok" in health
        print("[OK] E2E: /api/health returned 200 OK")

        # 4. Settings API
        status, settings = fetch("/api/settings")
        assert status == 200 and "theme" in settings
        print("[OK] E2E: /api/settings returned 200 OK")

        # 5. Tasks API
        status, tasks = fetch("/api/tasks")
        assert status == 200 and "[" in tasks
        print("[OK] E2E: /api/tasks returned 200 OK")

        # 6. Habits API
        status, habits = fetch("/api/habits")
        assert status == 200 and "[" in habits
        print("[OK] E2E: /api/habits returned 200 OK")

        # 7. Stats API
        status, stats = fetch("/api/stats")
        assert status == 200 and "activity_14_days" in stats
        print("[OK] E2E: /api/stats returned 200 OK")

        print("\n[SUCCESS] Celé webové řešení (FastAPI + React SPA + SQLite) je plně funkční!")
    finally:
        server.should_exit = True

if __name__ == "__main__":
    run_test()
