"""Centralized, environment-driven application settings."""
from dataclasses import dataclass, field
import os


def _cors_origins() -> list[str]:
    """Read a comma-separated origin allowlist from the environment."""
    raw_origins = os.getenv("FRONTEND_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
    return [origin.strip() for origin in raw_origins.split(",") if origin.strip()]


@dataclass(frozen=True)
class Settings:
    app_name: str = field(default_factory=lambda: os.getenv("APP_NAME", "HedgeMind API"))
    environment: str = field(default_factory=lambda: os.getenv("ENVIRONMENT", "development"))
    cors_origins: list[str] = field(default_factory=_cors_origins)
    database_url: str = field(default_factory=lambda: os.getenv("DATABASE_URL", "sqlite:///./hedgemind.db"))

settings = Settings()
