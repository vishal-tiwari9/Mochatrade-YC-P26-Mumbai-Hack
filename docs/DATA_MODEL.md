# Data model

## Phase 1 request model

`ExposureInput` is the contract from frontend to the analysis API.

| Field | Type | Rules | Meaning |
|---|---|---|---|
| `amount` | number | greater than 0 | Foreign-currency principal |
| `currency` | string | `USD` only in Phase 1 | Currency of the payable |
| `days_to_payment` | integer | 0–3,650 | Days until settlement |
| `counterparty` | string/null | optional | Supplier name |
| `exposure_type` | string | defaults to `payable` | Business exposure direction |
| `base_rate` | number | greater than 0 | Assumed USD/INR reference rate |

## Analysis response model

The analysis response returns all submitted fields plus:

| Field | Type | Meaning |
|---|---|---|
| `current_inr_exposure` | number | `amount × base_rate` |
| `risk_score` | integer | Deterministic 0–100 prototype score |
| `risk_level` | string | `low`, `medium`, or `high` |

## Upload file model

CSV/XLS/XLSX headers are normalized to lowercase. Required columns are `amount`, `currency`, and `days_to_payment`. Optional columns are `counterparty` and `exposure_type`. Phase 1 reads the first data row and reports total rows processed; it does not yet create a batch of exposures.

## Future persistence model

When storage is introduced, use an `exposures` table for validated source records and a `scenarios` table referencing an exposure. Store numeric currency amounts and rates as decimal types rather than floating-point types. Preserve the assumptions used for each analysis so historical results remain reproducible.
