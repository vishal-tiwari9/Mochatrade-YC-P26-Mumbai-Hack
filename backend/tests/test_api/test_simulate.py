import pytest
from fastapi.testclient import TestClient

from backend.main import app

client = TestClient(app)


def test_simulate_returns_unhedged_cost_and_impact():
    response = client.post("/api/simulate", json={"amount": 50_000, "currency": "USD", "days_to_payment": 45, "base_rate": 87, "scenario_rate": 93})

    assert response.status_code == 200
    assert response.json()["unhedged_scenario_cost"] == 4_650_000
    assert response.json()["additional_unhedged_cost"] == 300_000
    assert response.json()["risk_score"] == 36


@pytest.mark.parametrize("scenario_rate", [0, -1])
def test_simulate_rejects_non_positive_rate(scenario_rate):
    response = client.post("/api/simulate", json={"amount": 100, "currency": "USD", "days_to_payment": 1, "base_rate": 87, "scenario_rate": scenario_rate})

    assert response.status_code == 422
