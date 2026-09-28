import json
import urllib.request
import urllib.error


def get_live_inr_rate(foreign_currency: str) -> float:
    """
    Fetches the live exchange rate for foreign_currency to INR.
    Uses Frankfurter API. Includes hardcoded fallbacks for currencies not supported by Frankfurter.
    """
    currency = foreign_currency.upper()
    
    # Frankfurter does not support AED, SAR, RUB, IDR directly. 
    # For a hackathon, we can use static fallbacks for these or derive from USD.
    fallbacks = {
        "AED": 22.87,  # Pegged
        "SAR": 22.40,  # Pegged
        "RUB": 0.93,
        "IDR": 0.0055,
    }
    
    if currency in fallbacks:
        return fallbacks[currency]
        
    url = f"https://api.frankfurter.app/latest?from={currency}&to=INR"
    
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'HedgeMind/1.0'})
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode())
            return float(data["rates"]["INR"])
    except (urllib.error.URLError, KeyError, ValueError):
        # Fallback to a sensible default if the API is down or currency not found
        if currency == "USD":
            return 84.0
        elif currency == "EUR":
            return 92.5
        elif currency == "GBP":
            return 110.0
        return 80.0  # Generic fallback to prevent crashing the demo
