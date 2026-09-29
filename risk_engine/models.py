from dataclasses import dataclass


@dataclass(frozen=True)
class FXExposure:
    """A foreign-currency payable used in the prototype FX workflow."""

    amount: float
    currency: str
    days_to_payment: int
    counterparty: str | None = None
    exposure_type: str = "payable"


@dataclass(frozen=True)
class FXAnalysis:
    exposure: FXExposure
    base_rate: float
    current_inr_exposure: float
    risk_score: int
    risk_level: str


@dataclass(frozen=True)
class FXScenarioAnalysis:
    """Deterministic unhedged result at one user-supplied USD/INR scenario rate."""

    exposure: FXExposure
    base_rate: float
    scenario_rate: float
    current_inr_exposure: float
    unhedged_scenario_cost: float
    additional_unhedged_cost: float
    rate_change: float
    rate_change_percent: float


@dataclass(frozen=True)
class FXMitigationAnalysis:
    """Illustrative partial-hedge result based on explicit user assumptions."""

    exposure: FXExposure
    base_rate: float
    scenario_rate: float
    hedge_ratio: float
    assumed_hedge_rate: float
    current_inr_exposure: float
    unhedged_scenario_cost: float
    hedged_portion: float
    unhedged_portion: float
    protected_cost: float
    unprotected_cost: float
    illustrative_hedged_scenario_cost: float
    illustrative_benefit: float
