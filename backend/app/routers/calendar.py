import os

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from app.config import settings

router = APIRouter()


@router.get("/calendar/{session_id}/plan.ics")
async def download_plan(session_id: str) -> FileResponse:
    if session_id != os.path.basename(session_id):
        raise HTTPException(status_code=400, detail="Invalid session id")
    path = os.path.join(settings.DATA_DIR, "sessions", session_id, "plan.ics")
    if not os.path.isfile(path):
        raise HTTPException(status_code=404, detail="No calendar plan found for this session")
    return FileResponse(path, media_type="text/calendar", filename="plan.ics")
