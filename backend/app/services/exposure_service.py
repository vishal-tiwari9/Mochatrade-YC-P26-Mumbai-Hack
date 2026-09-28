from risk_engine import FXExposure, calculate_fx_analysis

def analyze_exposure(*, amount: float, currency: str, days_to_payment: int, base_rate: float, counterparty: str | None = None, exposure_type: str = "payable"):
    """Application-service boundary for deterministic FX analysis."""
    return calculate_fx_analysis(FXExposure(amount, currency, days_to_payment, counterparty, exposure_type), base_rate)
