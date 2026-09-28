import json
from typing import Any, Optional
from pydantic import BaseModel
from app.api.schemas import ExposureInput
from app.services.ai_provider import provider
from app.services.rate_service import get_live_inr_rate


# Gemini-compatible schema — NO validators (gt, ge, etc.) as they
# produce JSON Schema keywords (exclusiveMinimum) that the SDK rejects.
class _ExposureRaw(BaseModel):
    amount: float
    currency: str
    days_to_payment: int
    counterparty: Optional[str] = None
    exposure_type: str

class _RiskExplanationRaw(BaseModel):
    primary_concern: str
    key_observation: str
    current_status: str
    recommended_action: str


def extract_exposure(text: str) -> ExposureInput:
    """Extracts structured FX exposure data from unstructured text using AI."""

    prompt = f"""
    You are a financial data extraction assistant. Extract the foreign-currency exposure from the following text.
    - amount: A positive number (float). Extract the numerical value.
    - currency: A 3-letter ISO currency code (e.g., USD, EUR, GBP).
    - days_to_payment: Integer number of days until the payment is due.
    - counterparty: The name of the person or business involved, or null if not mentioned.
    - exposure_type: Use 'payable' if money is owed to someone. Use 'receivable' if money is expected to come in.

    Text: "{text}"
    """

    # Step 1: LLM returns a simple flat dict (no validators, Gemini-safe)
    raw = provider.generate_structured(prompt, _ExposureRaw)

    # Step 2: Automatically fetch the live exchange rate for the extracted currency!
    currency_code = raw.currency.upper()[:3]
    live_rate = get_live_inr_rate(currency_code)

    # Step 3: Validate/coerce into the real ExposureInput (applies gt=0, etc.)
    return ExposureInput(
        amount=raw.amount,
        currency=currency_code,
        days_to_payment=max(0, raw.days_to_payment),
        counterparty=raw.counterparty,
        exposure_type=raw.exposure_type,
        base_rate=live_rate,
    )


def explain_risk(context: dict[str, Any]) -> dict[str, str]:
    """Generates a structured risk explanation using AI."""

    prompt = f"""
    You are a helpful business risk analyst. Explain the following calculated FX risk metrics in plain English.
    Keep it concise (1-2 sentences max per point) and business-focused.
    DO NOT invent any new numerical values, percentages, or arbitrary limits. Only use the EXACT numbers provided in the Context below.
    If a limit is not provided, do not mention a limit.

    The context contains the full pipeline:
    - Exposure and overall risk score
    - Historical Volatility (from ECB reference data) and stress scenario impact
    - A selected Hedge Mitigation strategy showing projected savings

    You must provide four short statements:
    - primary_concern: The biggest risk factor identified in the exposure (e.g. amount, timeline, or volatility).
    - key_observation: An important insight based on the historical stress scenario and potential additional costs.
    - current_status: The overall state of the exposure and how much of it the user has chosen to hedge vs the algorithm's recommendation.
    - recommended_action: A clear next step highlighting the illustrative benefit/savings of the selected hedge.

    Calculated Data Context:
    {json.dumps(context, indent=2)}
    """

    raw = provider.generate_structured(prompt, _RiskExplanationRaw)
    return raw.model_dump()
