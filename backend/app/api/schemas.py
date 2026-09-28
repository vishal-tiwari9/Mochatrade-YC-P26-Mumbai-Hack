from pydantic import BaseModel, Field, field_validator


class ExposureInput(BaseModel):
    amount: float = Field(gt=0, description="Foreign-currency amount")
    currency: str = Field(default="USD", min_length=3, max_length=3)
    days_to_payment: int = Field(ge=0, le=3650)
    counterparty: str | None = None
    exposure_type: str = "payable"
    base_rate: float = Field(gt=0, description="Base foreign/INR rate")

    @field_validator("currency")
    @classmethod
    def normalize_currency(cls, value: str) -> str:
        return value.upper()


class AnalysisResponse(BaseModel):
    amount: float
    currency: str
    days_to_payment: int
    counterparty: str | None
    exposure_type: str
    base_rate: float
    current_inr_exposure: float
    risk_score: int
    risk_level: str

class BatchAnalysisResponse(BaseModel):
    exposures: list[AnalysisResponse]


class UploadResponse(BaseModel):
    filename: str
    rows_processed: int
    exposures: list[ExposureInput]


class ScenarioInput(ExposureInput):
    scenario_rate: float = Field(gt=0, description="User-supplied foreign/INR scenario rate")


class ScenarioResponse(AnalysisResponse):
    scenario_rate: float
    unhedged_scenario_cost: float
    additional_unhedged_cost: float
    rate_change: float
    rate_change_percent: float


class MitigationInput(ScenarioInput):
    hedge_ratio: float = Field(ge=0, le=1, description="Illustrative portion protected, from 0 to 1")
    assumed_hedge_rate: float = Field(gt=0, description="Explicit illustrative foreign/INR protected-rate assumption")


class MitigationResponse(ScenarioResponse):
    hedge_ratio: float
    assumed_hedge_rate: float
    hedged_portion: float
    unhedged_portion: float
    protected_cost: float
    unprotected_cost: float
    illustrative_hedged_scenario_cost: float
    illustrative_benefit: float
    disclaimer: str


from typing import Any

class TextExtractRequest(BaseModel):
    text: str = Field(min_length=1, max_length=2000, description="Raw text describing the exposure")

class AIExplanationRequest(BaseModel):
    context: dict[str, Any] = Field(description="The calculated risk data to explain")


class RiskExplanationResponse(BaseModel):
    primary_concern: str
    key_observation: str
    current_status: str
    recommended_action: str

class VolatilityRequest(BaseModel):
    currency: str = Field(min_length=3, max_length=3)
    target_currency: str = Field(min_length=3, max_length=3)
    days: int = Field(gt=0, description="Payment horizon in days")
    amount: float | None = Field(default=None, gt=0, description="Optional exposure amount")

    @field_validator("currency", "target_currency")
    @classmethod
    def normalize_currency(cls, value: str) -> str:
        return value.upper()

class VolatilityResponse(BaseModel):
    currency: str
    target_currency: str
    current_rate: float
    historical_days: int
    payment_horizon_days: int
    trading_days: int
    daily_volatility: float
    annualized_volatility: float
    annualized_volatility_pct: float
    horizon_volatility: float
    upside_scenario_rate: float
    downside_scenario_rate: float
    amount: float | None
    current_liability: float | None
    upside_liability: float | None
    downside_liability: float | None
    potential_additional_cost: float | None
    potential_saving: float | None
    stress_cost_ratio: float | None = None
    recommended_hedge_ratio: float | None = None
    recommendation_reason: str | None = None
    scenario_type: str
    disclaimer: str
