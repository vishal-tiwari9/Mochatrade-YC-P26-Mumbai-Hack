import pytest
from unittest.mock import patch, MagicMock
from app.services.ai_service import extract_exposure, explain_risk
from app.api.schemas import ExposureInput
@pytest.fixture
def mock_provider():
    with patch("app.services.ai_service.provider") as mock:
        yield mock

@pytest.fixture
def mock_rate_service():
    with patch("app.services.ai_service.get_live_inr_rate") as mock:
        yield mock

def test_extract_exposure_success(mock_provider, mock_rate_service):
    from app.services.ai_service import _ExposureRaw
    mock_provider.generate_structured.return_value = _ExposureRaw(
        amount=50000,
        currency="USD",
        days_to_payment=45,
        counterparty="ABC Electronics",
        exposure_type="payable"
    )
    mock_rate_service.return_value = 87.0
    
    result = extract_exposure("We owe ABC Electronics $50,000 in 45 days.")
    
    assert result.amount == 50000
    assert result.currency == "USD"
    assert result.days_to_payment == 45
    assert result.counterparty == "ABC Electronics"
    assert result.exposure_type == "payable"
    assert result.base_rate == 87.0
    mock_provider.generate_structured.assert_called_once()

def test_explain_risk_success(mock_provider):
    mock_provider.generate_text.return_value = "This means you have an exposure of 43.5L INR."
    
    context = {"current_inr_exposure": 4350000}
    result = explain_risk(context)
    
    assert result == "This means you have an exposure of 43.5L INR."
    mock_provider.generate_text.assert_called_once()
