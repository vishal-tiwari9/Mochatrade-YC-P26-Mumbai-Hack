# HedgeMind

Phase 1 is a working FX-risk vertical slice: CSV/XLSX → FastAPI → deterministic risk engine → React analysis result.

## Run locally

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements-dev.txt
uvicorn backend.main:app --reload
```

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Upload [demo_data.csv](data/sample/demo_data.csv), or select **Use demo data**. The Phase 1 demo uses a USD 50,000 payable due in 45 days at ₹87/USD, resulting in a current ₹4,350,000 exposure.
