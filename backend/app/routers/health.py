from fastapi import APIRouter
from app.config import settings

router = APIRouter()


@router.get("/health")
async def health_check():
    return {"status": "ok", "message": "You have reached the python backend."}
