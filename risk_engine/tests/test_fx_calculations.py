import pytest

from risk_engine.fx_engine import calculate_fx_analysis
from risk_engine.models import FXExposure


def test_calculates_current_inr_exposure_for_demo_payable():
    result = calculate_fx_analysis(FXExposure(50_000, "USD", 45, "ABC Electronics"), 87)

    assert result.current_inr_exposure == 4_350_000
    assert result.risk_score == 36
    assert result.risk_level == "medium"


@pytest.mark.parametrize("amount,currency,days,rate", [(0, "USD", 1, 87), (1, "EUR", 1, 87), (1, "USD", -1, 87), (1, "USD", 1, 0)])
def test_rejects_invalid_fx_inputs(amount, currency, days, rate):
    with pytest.raises(ValueError):
        calculate_fx_analysis(FXExposure(amount, currency, days), rate)
