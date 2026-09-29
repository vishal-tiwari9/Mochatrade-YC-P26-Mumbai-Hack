def calculate_risk_score(amount: float, days_to_payment: int, base_rate: float) -> int:
    """Return a transparent, deterministic 0–100 prototype risk score.

    INR exposure contributes up to 60 points and payment horizon up to 40.
    The business scale is intentionally fixed at ₹10,000,000 for this demo.
    """
    inr_exposure = amount * base_rate
    size_points = min(60, round((inr_exposure / 10_000_000) * 60))
    timing_points = min(40, round((days_to_payment / 180) * 40))
    return min(100, size_points + timing_points)


def risk_level(score: int) -> str:
    if score >= 70:
        return "high"
    if score >= 35:
        return "medium"
    return "low"
