from fastapi import APIRouter
from fastapi.testclient import TestClient

from backend.config import Settings
from backend.main import app


def test_cors_allows_configured_localhost_and_loopback_origins():
    for origin in ("http://localhost:5173", "http://127.0.0.1:5173"):
        response = TestClient(app).options(
            "/api/analyze",
            headers={"Origin": origin, "Access-Control-Request-Method": "POST"},
        )
        assert response.headers["access-control-allow-origin"] == origin


def test_settings_parse_a_comma_separated_cors_allowlist(monkeypatch):
    monkeypatch.setenv("FRONTEND_ORIGINS", "https://app.example.com, https://preview.example.com")
    assert Settings().cors_origins == ["https://app.example.com", "https://preview.example.com"]


def test_unhandled_errors_use_a_safe_json_response():
    router = APIRouter()

    @router.get("/__test_unhandled_error")
    def raise_error():
        raise RuntimeError("internal detail that must not be returned")

    app.include_router(router)
    response = TestClient(app, raise_server_exceptions=False).get("/__test_unhandled_error")

    assert response.status_code == 500
    assert response.json() == {"detail": "An unexpected server error occurred."}
