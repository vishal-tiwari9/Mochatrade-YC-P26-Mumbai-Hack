import pytest
from fastapi.testclient import TestClient

from backend.main import app

client = TestClient(app)


def test_mitigate_returns_illustrative_partial_hedge_comparison():
    response = client.post(
        "/api/mitigate",
        json={"amount": 50_000, "currency": "USD", "days_to_payment": 45, "base_rate": 87, "scenario_rate": 93, "hedge_ratio": 0.5, "assumed_hedge_rate": 87},
    )

    assert response.status_code == 200
    assert response.json()["illustrative_hedged_scenario_cost"] == 4_500_000
    assert response.json()["illustrative_benefit"] == 150_000
    assert response.json()["protected_cost"] == 2_175_000
    assert response.json()["unprotected_cost"] == 2_325_000
    assert "Illustrative scenario model" in response.json()["disclaimer"]


@pytest.mark.parametrize("hedge_ratio", [-0.01, 1.01])
def test_mitigate_rejects_invalid_hedge_ratio(hedge_ratio):
    response = client.post(
        "/api/mitigate",
        json={"amount": 100, "currency": "USD", "days_to_payment": 1, "base_rate": 87, "scenario_rate": 93, "hedge_ratio": hedge_ratio, "assumed_hedge_rate": 87},
    )

    assert response.status_code == 422
