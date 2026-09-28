import pytest

from risk_engine import FXExposure, simulate_fx_scenario


def test_simulates_unhedged_usd_payable_at_a_higher_rate():
    result = simulate_fx_scenario(FXExposure(50_000, "USD", 45), base_rate=87, scenario_rate=93)

    assert result.current_inr_exposure == 4_350_000
    assert result.unhedged_scenario_cost == 4_650_000
    assert result.additional_unhedged_cost == 300_000
    assert result.rate_change == 6
    assert result.rate_change_percent == 6.8966


def test_rounds_scenario_money_and_percentage_outputs():
    result = simulate_fx_scenario(FXExposure(1.11, "USD", 1), base_rate=87.1234, scenario_rate=92.5678)

    assert result.current_inr_exposure == 96.71
    assert result.unhedged_scenario_cost == 102.75
    assert result.additional_unhedged_cost == 6.04
    assert result.rate_change_percent == 6.2491


def test_simulates_a_favorable_lower_rate_as_negative_additional_cost():
    result = simulate_fx_scenario(FXExposure(10_000, "USD", 30), base_rate=87, scenario_rate=84)

    assert result.additional_unhedged_cost == -30_000


@pytest.mark.parametrize("scenario_rate", [0, -1])
def test_rejects_invalid_scenario_rates(scenario_rate):
    with pytest.raises(ValueError, match="USD/INR rate must be greater than zero"):
        simulate_fx_scenario(FXExposure(10_000, "USD", 30), base_rate=87, scenario_rate=scenario_rate)
