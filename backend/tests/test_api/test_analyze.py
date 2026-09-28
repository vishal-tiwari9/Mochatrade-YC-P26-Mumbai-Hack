from fastapi.testclient import TestClient

from backend.main import app

client = TestClient(app)


def test_analyze_returns_deterministic_fx_result():
    response = client.post("/api/analyze", json={"amount": 50000, "currency": "USD", "days_to_payment": 45, "counterparty": "ABC Electronics", "base_rate": 87})

    assert response.status_code == 200
    assert response.json()["current_inr_exposure"] == 4350000
    assert response.json()["risk_level"] == "medium"
