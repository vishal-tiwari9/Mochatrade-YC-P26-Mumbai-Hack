# Risk engine

## Principles

The engine is deterministic, formula-driven, and independent from FastAPI, UI, database, and AI code. AI may produce candidate structured inputs or a prose explanation, but it must never provide a rate, loss, hedge price, score, or other numerical calculation.

## Phase 1 formula

For foreign-currency exposure `E` and supplied base USD/INR rate `R0`:

```text
Current INR exposure = E × R0
```

For USD 50,000 at ₹87/USD, this equals ₹4,350,000.

## Validation

- Amount must be greater than zero.
- Currency must be USD in the current prototype.
- Payment horizon must be an integer from 0 to 3,650 days.
- Rate must be greater than zero.

## Prototype risk score

The score is a transparent 0–100 indicator, not financial advice or a predictive model.

```text
inr_exposure = E × R0
size_points = min(60, round((inr_exposure / 10,000,000) × 60))
timing_points = min(40, round((days_to_payment / 180) × 40))
score = min(100, size_points + timing_points)
```

The fixed ₹10,000,000 business scale is a prototype assumption. Risk levels are low (0–34), medium (35–69), and high (70–100).

## Phase 2 — unhedged scenario formulas

For a scenario rate `R1`:

```text
Unhedged scenario cost = E × R1
Additional unhedged cost = E × (R1 − R0)
Rate change = R1 − R0
Rate change percentage = ((R1 − R0) / R0) × 100
```

`R1` is a user-supplied scenario assumption. It is neither a forecast nor a live market quote.

## Phase 3 — illustrative mitigation formulas

For hedge ratio `H` (0–1), assumed protected rate `Rh`, and scenario rate `R1`:

```text
Protected amount = E × H
Unprotected amount = E × (1 − H)
Protected cost = Protected amount × Rh
Unprotected cost = Unprotected amount × R1
Illustrative hedged scenario cost = Protected cost + Unprotected cost
Illustrative benefit = (E × R1) − hedged scenario cost
```

The scenario rate is never used for the protected portion. At a 100% hedge, the illustrative hedged cost is therefore unchanged when the scenario rate changes. At 0%, it equals the unhedged scenario cost.

`Rh` is an explicit configurable illustrative assumption, potentially equal to `R0` for the demo. It is not a live or executable derivative price.

The API returns this disclaimer with every mitigation response: **Illustrative scenario model. The assumed protected rate is not a live derivative quote or execution price.**
