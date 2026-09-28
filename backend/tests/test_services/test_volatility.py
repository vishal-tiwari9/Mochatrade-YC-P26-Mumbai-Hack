import pytest
import math
from unittest.mock import patch
from fastapi.testclient import TestClient
from app.services.volatility_service import calculate_historical_volatility, generate_risk_scenario
from backend.main import app

client = TestClient(app)


def test_calculate_historical_volatility():
    # Mathematical test
    # Suppose rates go 100 -> 101 -> 102
    rates = [100.0, 101.0, 102.0]
    # ln(101/100) = 0.00995033
    # ln(102/101) = 0.00985222
    # standard deviation of these two should be roughly 0.00006937
    vol = calculate_historical_volatility(rates)
    assert 0.00005 < vol < 0.00008


@patch("app.services.volatility_service.urllib.request.urlopen")
def test_volatility_endpoint_success(mock_urlopen):
    # We will test integration through the client but mock the urllib responses
    # This avoids hitting the live internet during tests
    import json
    from io import BytesIO

    class MockResponse:
        def __init__(self, json_data):
            self.data = json_data
            
        def read(self):
            return json.dumps(self.data).encode('utf-8')
            
        def __enter__(self):
            return self
            
        def __exit__(self, *args):
            pass

    # First call is latest rate, second is historical
    latest_mock = MockResponse({"date": "2026-09-11", "rate": 110.0})
    
    # Provide 10 dummy historical rates to pass the minimum observation check
    hist_mock = MockResponse([
        {"date": f"2026-09-0{i}", "rate": 110.0 + (i * 0.1)} for i in range(1, 12)
    ])
    
    mock_urlopen.side_effect = [latest_mock, hist_mock]

    response = client.post(
        "/api/volatility",
        json={
            "currency": "GBP",
            "target_currency": "INR",
            "days": 30,
            "amount": 1000
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["currency"] == "GBP"
    assert data["current_rate"] == 110.0
    assert data["payment_horizon_days"] == 30
    assert data["amount"] == 1000.0
    assert data["current_liability"] == 110000.0
    # ensure it didn't fabricate future predictions
    assert data["scenario_type"] == "historical_volatility_1sigma"


def test_volatility_unsupported_currency():
    response = client.post(
        "/api/volatility",
        json={
            "currency": "AED",
            "target_currency": "INR",
            "days": 30
        }
    )
    assert response.status_code == 400
    assert "Historical data unavailable for AED/INR" in response.json()["detail"]


@patch("app.services.volatility_service.urllib.request.urlopen")
def test_insufficient_data(mock_urlopen):
    import json

    class MockResponse:
        def __init__(self, json_data):
            self.data = json_data
        def read(self):
            return json.dumps(self.data).encode('utf-8')
        def __enter__(self): return self
        def __exit__(self, *args): pass

    latest_mock = MockResponse({"date": "2026-09-11", "rate": 110.0})
    # Only 2 historical data points, requires 10
    hist_mock = MockResponse([
        {"date": "2026-09-01", "rate": 110.0},
        {"date": "2026-09-02", "rate": 110.1}
    ])
    
    mock_urlopen.side_effect = [latest_mock, hist_mock]

    response = client.post(
        "/api/volatility",
        json={
            "currency": "GBP",
            "target_currency": "INR",
            "days": 30
        }
    )
    
    assert response.status_code == 400
    assert "Insufficient historical observations" in response.json()["detail"]


@patch("app.services.volatility_service.urllib.request.urlopen")
def test_hedge_recommendation_thresholds(mock_urlopen):
    import json
    class MockResponse:
        def __init__(self, json_data): self.data = json_data
        def read(self): return json.dumps(self.data).encode('utf-8')
        def __enter__(self): return self
        def __exit__(self, *args): pass

    # We mock responses to produce a known stress_cost_ratio.
    # We can actually just mock the calculate_historical_volatility function to force the ratio, 
    # but we'll just mock the fetch_historical_rates directly for easier control.
    
    with patch("app.services.volatility_service.fetch_historical_rates") as mock_fetch:
        # 1. Low risk (<2%)
        # current_rate=100. upside=101 -> stress_cost_ratio = 1%
        # To get upside=101 from 100, exp(horizon_vol) = 1.01 -> horizon_vol = ln(1.01) = 0.00995
        mock_fetch.return_value = (100.0, [100.0, 100.1])
        with patch("app.services.volatility_service.calculate_historical_volatility", return_value=0.001):
            response = client.post("/api/volatility", json={"currency": "GBP", "target_currency": "INR", "days": 30, "amount": 1000})
            assert response.json()["recommended_hedge_ratio"] == 0.25

        # 2. Moderate risk (2-5%)
        with patch("app.services.volatility_service.calculate_historical_volatility", return_value=0.008):
            response = client.post("/api/volatility", json={"currency": "GBP", "target_currency": "INR", "days": 30, "amount": 1000})
            assert response.json()["recommended_hedge_ratio"] == 0.50
            
        # 3. High risk (>5%)
        with patch("app.services.volatility_service.calculate_historical_volatility", return_value=0.02):
            response = client.post("/api/volatility", json={"currency": "GBP", "target_currency": "INR", "days": 30, "amount": 1000})
            assert response.json()["recommended_hedge_ratio"] == 0.75
