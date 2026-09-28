"""Versioned API router composition."""
from fastapi import APIRouter
from app.api.v1 import analyze, mitigate, simulate, upload, extract, explain, volatility

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(upload.router)
api_router.include_router(analyze.router)
api_router.include_router(simulate.router)
api_router.include_router(mitigate.router)
api_router.include_router(extract.router)
api_router.include_router(explain.router)
api_router.include_router(volatility.router)
