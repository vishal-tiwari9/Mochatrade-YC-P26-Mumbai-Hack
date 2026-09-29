# Local setup

## Prerequisites

- Python 3.11+ (the application uses modern FastAPI/Pydantic APIs)
- Node.js 20+

## Backend

From the repository root:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements-dev.txt
uvicorn backend.main:app --reload
```

The API runs on `http://localhost:8000`; interactive API docs are at `http://localhost:8000/docs`.

Run tests from the repository root:

```bash
python -m pytest risk_engine/tests backend/tests -q
```

## Frontend

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

The Vite app runs on `http://localhost:5173` and calls `http://localhost:8000` by default. Set `VITE_API_URL` to override the API origin.

The backend CORS allowlist is set with comma-separated `FRONTEND_ORIGINS`; the default permits both `localhost:5173` and `127.0.0.1:5173`.

Run frontend tests and a production build with:

```bash
npm test
npm run build
```

## Demo

Use the UI’s **Use demo data** action or upload `data/sample/demo_data.csv`. Its expected exposure is USD 50,000 × ₹87 = ₹4,350,000.
