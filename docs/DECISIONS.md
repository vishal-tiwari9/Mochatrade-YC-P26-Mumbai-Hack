# Decisions

## D-001: Start with one FX-payable workflow

**Status:** accepted

The prototype supports a USD payable for an Indian business before expanding to receivables or other risk types. This creates a polished, testable end-to-end demo rather than a broad but shallow platform.

## D-002: Keep financial calculations deterministic and isolated

**Status:** accepted

`risk_engine/` has no FastAPI, UI, database, or AI dependency. This makes formulas testable and prevents language-model output from becoming a numerical source of truth.

## D-003: Use an explicit supplied base rate

**Status:** accepted

Phase 1 receives `base_rate` as an explicit assumption and does not fetch market data. This avoids presenting stale or unavailable data as a live quote and keeps the demo reproducible.

## D-004: Analyze the first uploaded row in Phase 1

**Status:** accepted

The upload contract accepts a normal tabular file but returns its first valid data row. Batch exposure processing is deferred until the vertical slice is stable.

## D-005: Use a transparent prototype risk score

**Status:** accepted

The score combines exposure size (relative to a fixed ₹10 million scale) and payment horizon. It is documented and tested; it is not a credit model, forecast, or recommendation.
