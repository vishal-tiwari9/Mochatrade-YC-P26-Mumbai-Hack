from fastapi import APIRouter, HTTPException

from app.api.schemas import MitigationInput, MitigationResponse
from risk_engine import FXExposure, calculate_fx_analysis, calculate_illustrative_mitigation, simulate_fx_scenario

router = APIRouter(tags=["mitigation"])

ILLUSTRATIVE_DISCLAIMER = (
    "Illustrative scenario model. The assumed protected rate is not a live derivative quote or execution price."
)


@router.post("/mitigate", response_model=MitigationResponse)
def mitigate_exposure(payload: MitigationInput) -> MitigationResponse:
    """Compare a user-supplied hedge assumption against the unhedged scenario."""
    try:
        exposure = FXExposure(payload.amount, payload.currency, payload.days_to_payment, payload.counterparty, payload.exposure_type)
        analysis = calculate_fx_analysis(exposure, payload.base_rate)
        scenario = simulate_fx_scenario(exposure, payload.base_rate, payload.scenario_rate)
        result = calculate_illustrative_mitigation(
            exposure, payload.base_rate, payload.scenario_rate, payload.hedge_ratio, payload.assumed_hedge_rate
        )
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    return MitigationResponse(
        **payload.model_dump(),
        current_inr_exposure=analysis.current_inr_exposure,
        risk_score=analysis.risk_score,
        risk_level=analysis.risk_level,
        unhedged_scenario_cost=scenario.unhedged_scenario_cost,
        additional_unhedged_cost=scenario.additional_unhedged_cost,
        rate_change=scenario.rate_change,
        rate_change_percent=scenario.rate_change_percent,
        hedged_portion=result.hedged_portion,
        unhedged_portion=result.unhedged_portion,
        protected_cost=result.protected_cost,
        unprotected_cost=result.unprotected_cost,
        illustrative_hedged_scenario_cost=result.illustrative_hedged_scenario_cost,
        illustrative_benefit=result.illustrative_benefit,
        disclaimer=ILLUSTRATIVE_DISCLAIMER,
    )
