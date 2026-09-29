from pathlib import Path
import sys

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BACKEND_DIR.parent
sys.path[:0] = [str(BACKEND_DIR), str(PROJECT_ROOT)]
from app.api.routes import api_router  # noqa: E402
from app.middleware.error_handler import register_error_handlers  # noqa: E402
from config import settings  # noqa: E402

app = FastAPI(title=settings.app_name, version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origins, allow_methods=["*"], allow_headers=["*"])
register_error_handlers(app)
app.include_router(api_router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
