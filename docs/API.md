# API contract

## Conventions

All endpoints return JSON. Validation failures return HTTP `422` with a `detail` field; unexpected server errors return a safe HTTP `500` JSON response without internal details. Monetary outputs are rounded to two decimal places and rate percentages to four. The current prototype supports USD payables only and is intentionally stateless.

## `GET /health`

Returns `200` and `{"status":"ok"}` when the API is reachable.

## `POST /api/upload`

Parses a CSV, XLS, or XLSX file. Send a multipart `file` field and an optional numeric query parameter `base_rate` (default: `87`). Headers are case-normalized. The first row must contain `amount`, `currency`, and `days_to_payment`; `counterparty` and `exposure_type` are optional.

Response (`200`):

```json
{"filename":"demo_data.csv","rows_processed":1,"exposure":{"amount":50000,"currency":"USD","days_to_payment":45,"counterparty":"ABC Electronics","exposure_type":"payable","base_rate":87}}
```

## `POST /api/analyze`

Request (`application/json`):

```json
{"amount":50000,"currency":"USD","days_to_payment":45,"counterparty":"ABC Electronics","exposure_type":"payable","base_rate":87}
```

Response (`200`) contains submitted fields and `current_inr_exposure`, `risk_score`, and `risk_level`:

```json
{"amount":50000,"currency":"USD","days_to_payment":45,"counterparty":"ABC Electronics","exposure_type":"payable","base_rate":87,"current_inr_exposure":4350000,"risk_score":36,"risk_level":"medium"}
```

The detailed runnable requests and failure example are in [API_EXAMPLES.md](API_EXAMPLES.md).

## `POST /api/simulate`

Runs one deterministic, unhedged USD/INR scenario. It accepts the same fields as `/api/analyze` plus a positive `scenario_rate`; this is an assumed input, not a forecast or live market quote.

```json
{"amount":50000,"currency":"USD","days_to_payment":45,"base_rate":87,"scenario_rate":93}
```

Response (`200`) includes analysis fields plus scenario metrics:

```json
{"current_inr_exposure":4350000,"scenario_rate":93,"unhedged_scenario_cost":4650000,"additional_unhedged_cost":300000,"rate_change":6,"rate_change_percent":6.896551724}
```

## `POST /api/mitigate`

Compares an unhedged scenario with a simplified illustrative partial hedge. In addition to `/api/simulate` fields, send `hedge_ratio` from `0` to `1` and a positive `assumed_hedge_rate` (`Rh`, the assumed protected rate). The response separates `protected_cost` and `unprotected_cost`; only the latter uses the scenario rate. It always includes a prominent disclaimer: `Rh` is not live or executable derivative pricing.

```json
{"amount":50000,"currency":"USD","days_to_payment":45,"base_rate":87,"scenario_rate":93,"hedge_ratio":0.5,"assumed_hedge_rate":87}
```

```json
{"hedged_portion":25000,"unhedged_portion":25000,"protected_cost":2175000,"unprotected_cost":2325000,"unhedged_scenario_cost":4650000,"illustrative_hedged_scenario_cost":4500000,"illustrative_benefit":150000,"disclaimer":"Illustrative scenario model. The assumed protected rate is not a live derivative quote or execution price."}
```
