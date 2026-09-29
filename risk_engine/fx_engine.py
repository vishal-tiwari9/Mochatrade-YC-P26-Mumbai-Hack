from .models import FXAnalysis, FXExposure, FXMitigationAnalysis, FXScenarioAnalysis
from .scoring import calculate_risk_score, risk_level
from .validators import validate_exposure, validate_hedge_ratio, validate_rate


def _money(value: float) -> float:
    """Round INR and foreign-currency money values to two decimal places."""
    return round(value, 2)


def calculate_fx_analysis(exposure: FXExposure, base_rate: float) -> FXAnalysis:
    """Calculate current INR liability for a USD payable without AI or market calls."""
    validate_exposure(exposure.amount, exposure.currency, exposure.days_to_payment)
    validate_rate(base_rate)
    score = calculate_risk_score(exposure.amount, exposure.days_to_payment, base_rate)
    return FXAnalysis(
        exposure=exposure,
        base_rate=base_rate,
        current_inr_exposure=_money(exposure.amount * base_rate),
        risk_score=score,
        risk_level=risk_level(score),
    )


def simulate_fx_scenario(exposure: FXExposure, base_rate: float, scenario_rate: float) -> FXScenarioAnalysis:
    """Calculate one unhedged USD/INR scenario without forecasts or market-data calls."""
    validate_exposure(exposure.amount, exposure.currency, exposure.days_to_payment)
    validate_rate(base_rate)
    validate_rate(scenario_rate)
    current_inr_exposure = _money(exposure.amount * base_rate)
    unhedged_scenario_cost = _money(exposure.amount * scenario_rate)
    rate_change = round(scenario_rate - base_rate, 4)
    return FXScenarioAnalysis(
        exposure=exposure,
        base_rate=base_rate,
        scenario_rate=scenario_rate,
        current_inr_exposure=current_inr_exposure,
        unhedged_scenario_cost=unhedged_scenario_cost,
        additional_unhedged_cost=_money(unhedged_scenario_cost - current_inr_exposure),
        rate_change=rate_change,
        rate_change_percent=round((rate_change / base_rate) * 100, 4),
    )


def calculate_illustrative_mitigation(
    exposure: FXExposure,
    base_rate: float,
    scenario_rate: float,
    hedge_ratio: float,
    assumed_hedge_rate: float,
) -> FXMitigationAnalysis:
    """Compare an unhedged payable with an illustrative partial hedge.

    ``assumed_hedge_rate`` is an explicit model assumption, not a tradeable quote.
    """
    validate_exposure(exposure.amount, exposure.currency, exposure.days_to_payment)
    validate_rate(base_rate)
    validate_rate(scenario_rate)
    validate_rate(assumed_hedge_rate)
    validate_hedge_ratio(hedge_ratio)
    hedged_portion = _money(exposure.amount * hedge_ratio)
    unhedged_portion = _money(exposure.amount * (1 - hedge_ratio))
    unhedged_scenario_cost = _money(exposure.amount * scenario_rate)
    protected_cost = _money(hedged_portion * assumed_hedge_rate)
    unprotected_cost = _money(unhedged_portion * scenario_rate)
    illustrative_hedged_scenario_cost = _money(protected_cost + unprotected_cost)
    return FXMitigationAnalysis(
        exposure=exposure,
        base_rate=base_rate,
        scenario_rate=scenario_rate,
        hedge_ratio=hedge_ratio,
        assumed_hedge_rate=assumed_hedge_rate,
        current_inr_exposure=_money(exposure.amount * base_rate),
        unhedged_scenario_cost=unhedged_scenario_cost,
        hedged_portion=hedged_portion,
        unhedged_portion=unhedged_portion,
        protected_cost=protected_cost,
        unprotected_cost=unprotected_cost,
        illustrative_hedged_scenario_cost=illustrative_hedged_scenario_cost,
        illustrative_benefit=_money(unhedged_scenario_cost - illustrative_hedged_scenario_cost),
    )
