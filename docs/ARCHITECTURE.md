# Architecture

## System boundaries

```text
React / Vite UI
      │ HTTP
      ▼
FastAPI API ───► upload service (Pandas)
      │
      ▼
risk_engine (pure Python, deterministic)
```

The frontend is responsible for interaction and presentation. The backend validates requests, parses files, and exposes the API. `risk_engine/` owns FX mathematics and can be tested without FastAPI, Pandas, a database, or an LLM.

## Phase 1 data flow

1. A user loads demo data or chooses a CSV/XLSX file.
2. `POST /api/upload` parses the file, normalizes headers, and returns the first exposure record for review.
3. The frontend sends that record to `POST /api/analyze`.
4. The API constructs an `FXExposure` and delegates to `risk_engine.calculate_fx_analysis`.
5. The API returns the current INR exposure and deterministic risk score.
6. The React UI displays the result.

No calculation depends on UI state or AI output. An eventual extraction service must validate its structured output against the same API/risk-engine contract before it reaches calculations.

## Persistence

Phase 1 is stateless and does not persist uploads or analyses. SQLite is the preferred prototype store when saved exposures/scenarios are introduced; PostgreSQL remains an option if already available.

## Extension points

- `/api/simulate` will use the same engine with a scenario rate.
- `/api/extract` will translate text into validated structured data.
- A scenario model and exposure persistence can be added without making the engine depend on the database.
