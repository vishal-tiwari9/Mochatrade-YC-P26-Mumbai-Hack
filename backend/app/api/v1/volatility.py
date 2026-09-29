from fastapi import APIRouter
from app.api.schemas import VolatilityRequest, VolatilityResponse
from app.services.volatility_service import generate_risk_scenario


router = APIRouter(tags=["analytics"])


@router.post(
    "/volatility",
    response_model=VolatilityResponse,
    summary="Historical FX Risk Range",
    description="Calculates historical FX volatility and generates a one-standard-deviation stress range over the user's payment horizon. It also provides a transparent rule-based hedge suggestion derived from the modeled historical FX risk. This is scenario analysis, not a prediction of future exchange rates."
)
def calculate_volatility_endpoint(payload: VolatilityRequest) -> VolatilityResponse:
    """
    Endpoint to compute the historical volatility and potential INR exposure under stress scenarios.
    """
    result = generate_risk_scenario(
        currency=payload.currency,
        target_currency=payload.target_currency,
        payment_days=payload.days,
        amount=payload.amount
    )
    return VolatilityResponse(**result)
