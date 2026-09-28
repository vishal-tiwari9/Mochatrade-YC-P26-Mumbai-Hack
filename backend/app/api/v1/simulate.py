from fastapi import APIRouter, HTTPException

from app.api.schemas import ScenarioInput, ScenarioResponse
from risk_engine import FXExposure, calculate_fx_analysis, simulate_fx_scenario

router = APIRouter(tags=["simulation"])


@router.post("/simulate", response_model=ScenarioResponse)
def simulate_exposure(payload: ScenarioInput) -> ScenarioResponse:
    """Return a deterministic unhedged outcome at a user-selected USD/INR rate."""
    try:
        exposure = FXExposure(payload.amount, payload.currency, payload.days_to_payment, payload.counterparty, payload.exposure_type)
        analysis = calculate_fx_analysis(exposure, payload.base_rate)
        result = simulate_fx_scenario(exposure, payload.base_rate, payload.scenario_rate)
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    return ScenarioResponse(
        **payload.model_dump(),
        current_inr_exposure=result.current_inr_exposure,
        risk_score=analysis.risk_score,
        risk_level=analysis.risk_level,
        unhedged_scenario_cost=result.unhedged_scenario_cost,
        additional_unhedged_cost=result.additional_unhedged_cost,
        rate_change=result.rate_change,
        rate_change_percent=result.rate_change_percent,
    )
