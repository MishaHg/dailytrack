"""
DailyTrack - Router pro nastavení a správu databáze
"""

from fastapi import APIRouter, Body
from typing import Dict, Any
from ..database import db
from ..schemas import SettingsResponse, SettingUpdate

router = APIRouter(prefix="/api/settings", tags=["Settings"])


@router.get("", response_model=SettingsResponse)
def get_settings():
    info = db.get_db_info()
    return info


@router.post("")
def update_setting(body: SettingUpdate):
    db.set_setting(body.key, body.value)
    return {"success": True, "key": body.key, "value": body.value}


@router.get("/export")
def export_database():
    """Vrátí kompletní JSON zálohu všech úkolů, návyků a nastavení."""
    return db.export_data()


@router.post("/import")
def import_database(payload: Dict[str, Any] = Body(...)):
    """Obnoví databázi z dodaného JSON exportu."""
    success = db.import_data(payload)
    return {"success": success, "message": "Data byla úspěšně importována"}


@router.post("/clear-completed")
def clear_completed_tasks():
    db.clear_completed_tasks()
    return {"success": True, "message": "Dokončené úkoly byly smazány"}


@router.post("/reset-data")
def reset_data():
    db.reset_all_data()
    return {"success": True, "message": "Veškerá data byla resetována na ukázkový stav"}

