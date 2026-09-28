import json
import math
import statistics
import urllib.request
import urllib.error
from datetime import datetime, timedelta
from fastapi import HTTPException


def fetch_historical_rates(currency: str, target_currency: str, historical_days: int = 90) -> tuple[float, list[float]]:
    """
    Fetches the latest rate and ~90 days of historical reference rates from Frankfurter v2.
    Returns (current_rate, historical_rates_list) sorted chronologically.
    """
    if currency.upper() in ["AED", "SAR", "RUB", "IDR"]:
        raise HTTPException(status_code=400, detail=f"Historical data unavailable for {currency}/{target_currency}")

    end_date = datetime.now()
    start_date = end_date - timedelta(days=historical_days)
    
    start_str = start_date.strftime("%Y-%m-%d")
    end_str = end_date.strftime("%Y-%m-%d")

    # Fetch latest rate
    latest_url = f"https://api.frankfurter.dev/v2/rate/{currency}/{target_currency}"
    # Fetch historical rates
    hist_url = f"https://api.frankfurter.dev/v2/rates?base={currency}&quotes={target_currency}&from={start_str}&to={end_str}"

    try:
        # Latest
        req_latest = urllib.request.Request(latest_url, headers={'User-Agent': 'HedgeMind/1.0'})
        with urllib.request.urlopen(req_latest, timeout=5) as response:
            latest_data = json.loads(response.read().decode())
            current_rate = float(latest_data["rate"])

        # Historical
        req_hist = urllib.request.Request(hist_url, headers={'User-Agent': 'HedgeMind/1.0'})
        with urllib.request.urlopen(req_hist, timeout=5) as response:
            hist_data = json.loads(response.read().decode())
            
            if not isinstance(hist_data, list):
                raise ValueError("Unexpected historical data format")
            
            # Extract valid rates and sort chronologically just in case
            hist_data_sorted = sorted(hist_data, key=lambda x: x.get("date", ""))
            
            historical_rates = []
            for entry in hist_data_sorted:
                rate = entry.get("rate")
                if rate is not None and float(rate) > 0:
                    historical_rates.append(float(rate))
                    
            if len(historical_rates) < 10:
                raise ValueError("Insufficient historical observations")
                
            return current_rate, historical_rates

    except urllib.error.URLError as e:
        raise HTTPException(status_code=502, detail=f"Frankfurter API error: {str(e)}")
    except KeyError as e:
        raise HTTPException(status_code=500, detail=f"Malformed API response, missing key: {str(e)}")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


def calculate_historical_volatility(rates: list[float]) -> float:
    """Calculates the daily historical volatility (sample standard deviation of daily log returns)."""
    if len(rates) < 2:
        raise ValueError("Need at least 2 observations to calculate returns")
        
    log_returns = []
    for i in range(1, len(rates)):
        try:
            r_t = math.log(rates[i] / rates[i-1])
            log_returns.append(r_t)
        except ValueError:
            continue
            
    if len(log_returns) < 2:
        raise ValueError("Insufficient valid log returns for standard deviation")
        
    # Sample standard deviation
    daily_volatility = statistics.stdev(log_returns)
    return daily_volatility


def generate_risk_scenario(currency: str, target_currency: str, payment_days: int, amount: float | None = None) -> dict:
    """Generates the full scenario analysis response object."""
    historical_days = 90
    current_rate, historical_rates = fetch_historical_rates(currency, target_currency, historical_days)
    
    daily_volatility = calculate_historical_volatility(historical_rates)
    
    # Math scaling
    annualized_volatility = daily_volatility * math.sqrt(252)
    annualized_volatility_pct = annualized_volatility * 100
    
    # Horizon volatility
    # Approximate trading days: ~5/7 of calendar days
    trading_days = max(1, int(payment_days * (5.0 / 7.0)))
    horizon_volatility = daily_volatility * math.sqrt(trading_days)
    
    # Stress scenarios
    upside_stress_rate = current_rate * math.exp(horizon_volatility)
    downside_stress_rate = current_rate * math.exp(-horizon_volatility)
    
    response = {
        "currency": currency.upper(),
        "target_currency": target_currency.upper(),
        "current_rate": round(current_rate, 4),
        "historical_days": historical_days,
        "payment_horizon_days": payment_days,
        "trading_days": trading_days,
        "daily_volatility": round(daily_volatility, 6),
        "annualized_volatility": round(annualized_volatility, 4),
        "annualized_volatility_pct": round(annualized_volatility_pct, 2),
        "horizon_volatility": round(horizon_volatility, 4),
        "upside_scenario_rate": round(upside_stress_rate, 4),
        "downside_scenario_rate": round(downside_stress_rate, 4),
        "scenario_type": "historical_volatility_1sigma",
        "disclaimer": "This is a historical-volatility-based stress scenario, not a prediction or guaranteed future exchange rate.",
        "amount": amount,
        "current_liability": None,
        "upside_liability": None,
        "downside_liability": None,
        "potential_additional_cost": None,
        "potential_saving": None,
    }
    
    if amount is not None and amount > 0:
        current_liability = amount * current_rate
        upside_liability = amount * upside_stress_rate
        downside_liability = amount * downside_stress_rate
        
        potential_additional_cost = upside_liability - current_liability
        stress_cost_ratio = potential_additional_cost / current_liability
        
        if stress_cost_ratio < 0.02:
            recommended_hedge_ratio = 0.25
            reason = f"Historical FX volatility indicates a relatively small modeled adverse impact of {stress_cost_ratio*100:.1f}% on the current exposure. HedgeMind recommends a 25% partial hedge."
        elif stress_cost_ratio < 0.05:
            recommended_hedge_ratio = 0.50
            reason = f"Historical FX volatility indicates a moderate modeled adverse impact of {stress_cost_ratio*100:.1f}% on the current exposure. HedgeMind recommends a 50% hedge to balance protection and flexibility."
        else:
            recommended_hedge_ratio = 0.75
            reason = f"Historical FX volatility indicates a significant modeled adverse impact of {stress_cost_ratio*100:.1f}% on the current exposure. HedgeMind recommends a 75% hedge for stronger protection."
        
        response.update({
            "current_liability": round(current_liability, 2),
            "upside_liability": round(upside_liability, 2),
            "downside_liability": round(downside_liability, 2),
            "potential_additional_cost": round(potential_additional_cost, 2),
            "potential_saving": round(current_liability - downside_liability, 2),
            "stress_cost_ratio": round(stress_cost_ratio, 4),
            "recommended_hedge_ratio": recommended_hedge_ratio,
            "recommendation_reason": reason,
        })
        
    return response
