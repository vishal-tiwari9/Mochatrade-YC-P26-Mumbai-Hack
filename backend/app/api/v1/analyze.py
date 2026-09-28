from fastapi import APIRouter, HTTPException

from app.api.schemas import AnalysisResponse, BatchAnalysisResponse, ExposureInput
from risk_engine import FXExposure, calculate_fx_analysis

router = APIRouter(tags=["analysis"])


@router.post("/analyze", response_model=BatchAnalysisResponse)
def analyze_exposure(payload: list[ExposureInput]) -> BatchAnalysisResponse:
    results = []
    for exp in payload:
        try:
            result = calculate_fx_analysis(
                FXExposure(exp.amount, exp.currency, exp.days_to_payment, exp.counterparty, exp.exposure_type),
                exp.base_rate,
            )
            results.append(AnalysisResponse(
                **exp.model_dump(),
                current_inr_exposure=result.current_inr_exposure,
                risk_score=result.risk_score,
                risk_level=result.risk_level,
            ))
        except ValueError as error:
            raise HTTPException(status_code=422, detail=str(error)) from error
    return BatchAnalysisResponse(exposures=results)
