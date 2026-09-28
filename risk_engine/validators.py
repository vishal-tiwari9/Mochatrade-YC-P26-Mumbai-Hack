import math


SUPPORTED_CURRENCIES = {
    "USD", "EUR", "GBP", "AED", "CNY", 
    "SGD", "SAR", "RUB", "AUD", "JPY", 
    "KRW", "HKD", "CHF", "CAD", "IDR"
}


def validate_exposure(amount: float, currency: str, days_to_payment: int) -> None:
    if not math.isfinite(amount) or amount <= 0:
        raise ValueError("amount must be greater than zero")
    if currency.upper() not in SUPPORTED_CURRENCIES:
        raise ValueError(f"Currency {currency} is not supported. Supported: {', '.join(sorted(SUPPORTED_CURRENCIES))}")
    if not 0 <= days_to_payment <= 3650:
        raise ValueError("days_to_payment must be between 0 and 3650")


def validate_rate(rate: float) -> None:
    if not math.isfinite(rate) or rate <= 0:
        raise ValueError("USD/INR rate must be greater than zero")


def validate_hedge_ratio(hedge_ratio: float) -> None:
    if not math.isfinite(hedge_ratio) or not 0 <= hedge_ratio <= 1:
        raise ValueError("hedge_ratio must be between 0 and 1")
