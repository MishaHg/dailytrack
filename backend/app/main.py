"""
DailyTrack - Hlavní aplikace FastAPI
Poskytuje REST API a servíruje moderní React frontend.
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from .routers import tasks, habits, stats, settings

app = FastAPI(
    title="DailyTrack API",
    description="REST API pro moderní osobní organizér a habit tracker DailyTrack",
    version="1.0.0"
)

# CORS konfigurace pro bezproblémový vývoj i běh v síti
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Zapojení modulárních routerů
app.include_router(tasks.router)
app.include_router(habits.router)
app.include_router(stats.router)
app.include_router(settings.router)


@app.get("/api/health", tags=["System"])
def health_check():
    return {"status": "ok", "app": "DailyTrack Web", "version": "1.0.0"}


# Mapování frontendových statických souborů
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")

if os.path.exists(FRONTEND_DIR):
    app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_frontend(full_path: str):
        # Pokud požadovaný soubor existuje ve frontend složce, vrátíme ho
        requested_file = os.path.join(FRONTEND_DIR, full_path)
        if full_path and os.path.exists(requested_file) and not os.path.isdir(requested_file):
            return FileResponse(requested_file)
        # Jinak vrátíme index.html pro Single Page Application routing
        index_file = os.path.join(FRONTEND_DIR, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"message": "Frontend nebyl nalezen. Otevřete /docs pro Swagger API dokumentaci."}
