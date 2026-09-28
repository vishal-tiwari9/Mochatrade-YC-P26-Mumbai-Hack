import pytest

from risk_engine import FXExposure, calculate_illustrative_mitigation


@pytest.mark.parametrize(
    ("hedge_ratio", "scenario_rate", "expected_cost", "expected_benefit"),
    [
        (0, 100, 5_000_000, 0),
        (0.5, 100, 4_675_000, 325_000),
        (1, 100, 4_350_000, 650_000),
        (1, 120, 4_350_000, 1_650_000),
        (0.7, 100, 4_545_000, 455_000),
    ],
)
def test_calculates_illustrative_partial_hedge_comparison(hedge_ratio, scenario_rate, expected_cost, expected_benefit):
    result = calculate_illustrative_mitigation(
        FXExposure(50_000, "USD", 45), base_rate=87, scenario_rate=scenario_rate, hedge_ratio=hedge_ratio, assumed_hedge_rate=87
    )

    assert result.illustrative_hedged_scenario_cost == expected_cost
    assert result.illustrative_benefit == expected_benefit
    assert result.illustrative_benefit == result.unhedged_scenario_cost - result.illustrative_hedged_scenario_cost


def test_split_costs_use_protected_rate_only_for_protected_portion():
    result = calculate_illustrative_mitigation(FXExposure(50_000, "USD", 45), 87, 100, 0.5, 87)

    assert result.hedged_portion == 25_000
    assert result.unhedged_portion == 25_000
    assert result.protected_cost == 2_175_000
    assert result.unprotected_cost == 2_500_000


@pytest.mark.parametrize("hedge_ratio", [-0.01, 1.01])
def test_rejects_hedge_ratios_outside_zero_to_one(hedge_ratio):
    with pytest.raises(ValueError, match="hedge_ratio must be between 0 and 1"):
        calculate_illustrative_mitigation(FXExposure(100, "USD", 1), 87, 93, hedge_ratio, 87)


def test_zero_hedge_has_no_illustrative_benefit():
    result = calculate_illustrative_mitigation(FXExposure(100, "USD", 1), 87, 93, 0, 87)

    assert result.illustrative_hedged_scenario_cost == result.unhedged_scenario_cost
    assert result.illustrative_benefit == 0
