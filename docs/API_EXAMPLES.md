# API examples

Examples assume the backend is running on `localhost:8000`.

## Analyze a USD payable

```bash
curl -X POST http://localhost:8000/api/analyze \
  -H 'Content-Type: application/json' \
  -d '{"amount":50000,"currency":"USD","days_to_payment":45,"counterparty":"ABC Electronics","exposure_type":"payable","base_rate":87}'
```

```json
{
  "amount": 50000,
  "currency": "USD",
  "days_to_payment": 45,
  "counterparty": "ABC Electronics",
  "exposure_type": "payable",
  "base_rate": 87,
  "current_inr_exposure": 4350000,
  "risk_score": 36,
  "risk_level": "medium"
}
```

## Upload a file

```bash
curl -X POST 'http://localhost:8000/api/upload?base_rate=87' \
  -F 'file=@data/sample/demo_data.csv'
```

```json
{
  "filename": "demo_data.csv",
  "rows_processed": 1,
  "exposure": {
    "amount": 50000,
    "currency": "USD",
    "days_to_payment": 45,
    "counterparty": "ABC Electronics",
    "exposure_type": "payable",
    "base_rate": 87
  }
}
```

## Simulate a USD/INR movement

```bash
curl -X POST http://localhost:8000/api/simulate \
  -H 'Content-Type: application/json' \
  -d '{"amount":50000,"currency":"USD","days_to_payment":45,"base_rate":87,"scenario_rate":93}'
```

The USD 50,000 payable rises from ₹4,350,000 to ₹4,650,000 at the assumed ₹93/USD scenario rate: an additional unhedged cost of ₹300,000.

## Compare an illustrative partial hedge

```bash
curl -X POST http://localhost:8000/api/mitigate \
  -H 'Content-Type: application/json' \
  -d '{"amount":50000,"currency":"USD","days_to_payment":45,"base_rate":87,"scenario_rate":93,"hedge_ratio":0.5,"assumed_hedge_rate":87}'
```

With 50% protected at the assumed protected rate of ₹87/USD, the illustrative scenario cost is ₹4,500,000 compared with ₹4,650,000 unhedged, an illustrative benefit of ₹150,000. This is an illustrative scenario model, not a live derivative quote or execution price.
```

## Validation error

Unsupported currencies are rejected in the current prototype:

```json
{"detail":"only USD exposures are supported in this prototype"}
```
