"""
DailyTrack - Spouštěcí skript aplikace
Spustí Uvicorn server a otevře webový prohlížeč.
"""

import sys
import os
import time
import threading
import webbrowser
import uvicorn 

# Bezpečné kódování pro Windows konzoli (ochrana před UnicodeEncodeError s emotikony)
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
if hasattr(sys.stderr, "reconfigure"):
    try:
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Nastavení cesty k projektu a pracovního adresáře
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)
os.chdir(ROOT_DIR)

import socket

def get_local_ip() -> str:
    """Zjistí lokální IP adresu počítače v síti."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(0.2)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def open_browser_delayed(target_url: str):
    """Počká na start serveru a bezpečně otevře prohlížeč na lokálním stroji."""
    time.sleep(1.2)
    try:
        webbrowser.open(target_url)
    except Exception:
        pass

if __name__ == "__main__":
    # Port lze volitelně zadat argumentem (např. python run.py 8080) nebo proměnnou PORT
    if len(sys.argv) > 1 and sys.argv[1].isdigit():
        port = int(sys.argv[1])
    else:
        port = int(os.environ.get("PORT", 8000))

    # Host 0.0.0.0 umožní připojení z jakéhokoliv PC v síti
    host = "0.0.0.0"
    local_ip = get_local_ip()
    local_url = f"http://localhost:{port}"
    network_url = f"http://{local_ip}:{port}"

    print("\n" + "=" * 60)
    print("🚀 DailyTrack Web server spuštěn a dostupný:")
    print(f"   💻 Tento počítač:               {local_url}")
    if local_ip != "127.0.0.1":
        print(f"   📱 Jakýkoliv jiný PC / mobil:   {network_url}")
    print(f"   📖 API Dokumentace (Swagger):   {local_url}/docs")
    print("=" * 60 + "\n")
    
    # Otevřeme prohlížeč na lokálním počítači (v cloudu jako Render/Railway se neotevírá)
    is_cloud = bool(os.environ.get("RENDER") or os.environ.get("RAILWAY_ENVIRONMENT") or os.environ.get("DYNO"))
    if not is_cloud and sys.platform == "win32":
        threading.Thread(target=open_browser_delayed, args=(local_url,), daemon=True).start()

    reload_mode = not is_cloud
    uvicorn.run("backend.app.main:app", host=host, port=port, reload=reload_mode, app_dir=ROOT_DIR)


