# HedgeMind — Optimized Project Structure

```
hedgemind/
│
├── .github/
│   └── workflows/
│       ├── backend-tests.yml
│       ├── frontend-tests.yml
│       └── lint-check.yml
│
├── docs/
│   ├── PRODUCT.md                 # Problem, solution, scope
│   ├── ARCHITECTURE.md            # System design, data flow
│   ├── API.md                     # Endpoint contracts & schemas
│   ├── DATA_MODEL.md              # Database schema & structures
│   ├── RISK_ENGINE.md             # ⭐ Formulas, assumptions, scoring
│   ├── DESIGN.md                  # Visual/UX system
│   ├── AGENTS.md                  # Rules for contributors & AI agents
│   ├── DECISIONS.md               # Important decisions & rationale
│   ├── ROADMAP.md                 # Future features
│   ├── SETUP.md                   # Local dev environment
│   └── API_EXAMPLES.md            # Request/response examples
│
├── frontend/
│   ├── package.json               # React/Vite dependencies
│   ├── vite.config.js             # Vite build config
│   ├── tailwind.config.js          # Tailwind CSS config
│   ├── postcss.config.js           # PostCSS config
│   ├── .eslintrc.json              # Linting rules
│   ├── .prettierrc                 # Code formatting
│   ├── index.html                  # Entry point
│   ├── public/
│   │   ├── favicon.ico
│   │   └── logo.svg
│   ├── src/
│   │   ├── main.jsx                # App entry
│   │   ├── App.jsx                 # Root component
│   │   ├── index.css               # Global styles
│   │   ├── api/
│   │   │   ├── client.js           # Axios/fetch config
│   │   │   ├── exposures.js        # Exposure endpoints
│   │   │   ├── scenarios.js        # Scenario endpoints
│   │   │   └── explanations.js     # AI explanation endpoints
│   │   ├── components/
│   │   │   ├── Dashboard.jsx       # Overview dashboard
│   │   │   ├── UploadData.jsx      # File upload & demo data
│   │   │   ├── RiskAnalysis.jsx    # Exposure detection & analysis
│   │   │   ├── ScenarioSimulator.jsx  # ⭐ Hero screen: rate control, charts
│   │   │   ├── MitigationPanel.jsx    # Hedge ratio & comparison
│   │   │   ├── AIExplanation.jsx      # AI-generated summary
│   │   │   ├── Chart/
│   │   │   │   └── ImpactChart.jsx    # Recharts visualization
│   │   │   ├── Forms/
│   │   │   │   └── RateInput.jsx
│   │   │   └── Common/
│   │   │       ├── Header.jsx
│   │   │       ├── Footer.jsx
│   │   │       ├── Loading.jsx
│   │   │       └── ErrorBoundary.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── AnalysisPage.jsx
│   │   │   ├── NotFoundPage.jsx
│   │   │   └── ErrorPage.jsx
│   │   ├── hooks/
│   │   │   ├── useExposure.js      # Exposure data fetching
│   │   │   ├── useScenario.js      # Scenario simulation
│   │   │   └── useExplanation.js   # AI explanation
│   │   ├── context/
│   │   │   └── AppContext.jsx      # Global state (if needed)
│   │   ├── utils/
│   │   │   ├── formatters.js       # Currency, number formatting
│   │   │   ├── validators.js       # Input validation
│   │   │   └── constants.js        # App constants
│   │   └── styles/
│   │       ├── variables.css       # CSS variables
│   │       └── themes.css          # Color themes
│   └── __tests__/
│       ├── components/
│       ├── hooks/
│       ├── utils/
│       └── integration/
│
├── backend/
│   ├── requirements.txt             # Python dependencies
│   ├── requirements-dev.txt         # Dev dependencies (pytest, black)
│   ├── .env.example                 # Environment variable template
│   ├── pyproject.toml               # Python project config
│   ├── main.py                      # FastAPI app entry
│   ├── config.py                    # Configuration management
│   ├── app/
│   │   ├── __init__.py
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── routes.py            # Main API routes
│   │   │   ├── v1/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── upload.py        # POST /api/upload
│   │   │   │   ├── extract.py       # POST /api/extract (AI)
│   │   │   │   ├── analyze.py       # POST /api/analyze
│   │   │   │   ├── simulate.py      # POST /api/simulate
│   │   │   │   └── dashboard.py     # GET /api/dashboard
│   │   │   └── schemas.py           # Pydantic schemas (request/response)
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── exceptions.py        # Custom exceptions
│   │   │   ├── logging.py           # Logging setup
│   │   │   └── security.py          # Auth/validation
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── exposure.py          # Exposure SQLAlchemy model
│   │   │   ├── scenario.py          # Scenario model
│   │   │   └── base.py              # Base model class
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── exposure_service.py  # Exposure logic
│   │   │   ├── upload_service.py    # Excel/CSV parsing
│   │   │   ├── ai_service.py        # LLM interaction (Ollama/fallback)
│   │   │   └── notification_service.py  # Alerts/logging
│   │   ├── db/
│   │   │   ├── __init__.py
│   │   │   ├── database.py          # Database connection
│   │   │   ├── session.py           # Session management
│   │   │   └── migrations/          # Alembic migrations (if using)
│   │   └── middleware/
│   │       ├── __init__.py
│   │       ├── error_handler.py     # Error handling
│   │       └── logging_middleware.py
│   └── tests/
│       ├── __init__.py
│       ├── conftest.py              # Pytest fixtures
│       ├── test_api/
│       │   ├── test_upload.py
│       │   ├── test_extract.py
│       │   ├── test_analyze.py
│       │   └── test_simulate.py
│       ├── test_services/
│       │   ├── test_exposure_service.py
│       │   ├── test_upload_service.py
│       │   └── test_ai_service.py
│       └── test_risk_engine/
│           └── test_calculations.py
│
├── risk_engine/
│   ├── __init__.py
│   ├── fx_engine.py                # ⭐ Core FX calculations
│   ├── scoring.py                  # Risk scoring logic
│   ├── models.py                   # Data structures (dataclasses)
│   ├── validators.py               # Input validation
│   ├── constants.py                # Hedge assumptions, defaults
│   └── tests/
│       ├── test_fx_calculations.py
│       ├── test_scoring.py
│       └── test_edge_cases.py
│
├── data/
│   ├── sample/
│   │   ├── demo_data.csv            # Demo dataset
│   │   └── sample_exposure.xlsx     # Sample Excel file
│   ├── migrations/                  # Database migrations
│   └── seeds/                       # Initial data scripts
│
├── scripts/
│   ├── setup_db.py                  # Initialize database
│   ├── seed_demo.py                 # Load demo data
│   ├── run_local_llm.sh             # Start Ollama/local LLM
│   └── build_frontend.sh            # Production build
│
├── docker/
│   ├── Dockerfile.backend           # Backend container
│   ├── Dockerfile.frontend          # Frontend container
│   ├── docker-compose.yml           # Multi-container setup
│   └── .dockerignore
│
├── .gitignore                       # Git exclusions
├── .env.example                     # Environment template
├── README.md                        # Quick start guide
├── LICENSE                          # Project license
│
└── CONTRIBUTING.md                  # Contribution guidelines

```

---

## Key Organization Principles

### 1. **Clear Separation of Concerns**
- **Frontend**: Pure UI, state management, API communication
- **Backend**: Business logic, validation, database, API exposure
- **Risk Engine**: Isolated calculation logic (testable, reusable)
- **Docs**: Single source of truth for architecture and decisions

### 2. **Risk Engine Independence** ⭐
```
risk_engine/ should be:
- Testable without FastAPI
- Importable by both backend and frontend (via API)
- Formula-driven, not AI-driven
- Well-documented with RISK_ENGINE.md
```

### 3. **API Contract First**
- `API.md` defines all endpoints before coding
- `schemas.py` in backend enforces contracts
- Frontend `api/` folder mirrors backend structure

### 4. **Documentation as Code**
Each `.md` file is a living document, updated when:
- Formulas change → update `RISK_ENGINE.md`
- API endpoint added → update `API.md`
- Architecture decision made → update `DECISIONS.md`

### 5. **Testing Strategy**
```
Frontend:      components, hooks, utils, integration tests
Backend:       unit tests per service, API integration tests
Risk Engine:   deterministic calculation tests (critical!)
```

### 6. **Configuration & Environment**
- `.env.example` shows all required variables
- `config.py` centralizes backend config
- `vite.config.js` handles frontend build
- No hardcoded credentials or secrets

---

## Critical Files

| File | Owned By | Purpose |
|------|----------|---------|
| `RISK_ENGINE.md` | Risk/Data Member | Formulas, assumptions, hedge rate, scoring |
| `AGENTS.md` | Product/Lead | Rules for multi-agent collaboration |
| `API.md` | Technical Lead | Contract between frontend & backend |
| `risk_engine/fx_engine.py` | Risk/Data Member | Deterministic calculations only |
| `ScenarioSimulator.jsx` | Frontend Member | Hero screen, live interaction |

---

## Quick Start for Team

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements-dev.txt
python scripts/setup_db.py
python main.py
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Risk Engine Testing (Critical!)
```bash
cd backend
pytest risk_engine/tests/ -v --cov=risk_engine
```

---

## Why This Structure?

✅ **Scales with features**: New risk types (credit, commodity, interest rate) go in `risk_engine/` without touching core  
✅ **AI-agnostic**: Replace Ollama with cloud API by changing only `services/ai_service.py`  
✅ **Clear ownership**: Each member knows their domain  
✅ **Fast iteration**: Parallel work on frontend, backend, risk calculations  
✅ **Hackathon-ready**: Can deliver a demo with `data/sample/demo_data.csv` even without AI  
✅ **Production-capable**: Docker, tests, migrations, and env config ready to scale  

---

## Suggested First 48 Hours

1. **Hour 1–4**: Create repo structure, populate docs (PRODUCT.md, API.md, RISK_ENGINE.md)
2. **Hour 5–12**: Backend vertical slice (upload CSV → FX calculation → API response)
3. **Hour 13–24**: Frontend vertical slice (upload → dashboard → result display)
4. **Hour 25–36**: Hero simulator (rate control → live chart update)
5. **Hour 37–48**: Mitigation + AI explanation + polish

This structure supports that flow without rework.
