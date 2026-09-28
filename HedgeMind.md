HedgeMind
Prototype Development Specification — v2
Single source of truth for the hackathon development team. This version intentionally keeps the current prototype
focused on one polished FX-risk workflow while making the architecture extensible.
1. Problem
Businesses have financial exposure embedded in normal operations: supplier payments, receivables, imported goods,
financing and other commitments. The challenge is connecting this operational data to the potential financial impact of
market movements. Some organizations have dedicated treasury/risk teams and sophisticated tools; many others do not.
HedgeMind makes this analysis easier to access and understand without limiting the product to a particular business
size.
2. What is HedgeMind?
HedgeMind is a business risk intelligence platform with an AI layer. Its core job is to take business information,
identify meaningful exposures, quantify their potential impact, let users explore scenarios, and help them understand
possible mitigation approaches.
Core loop: UNDERSTAND → QUANTIFY → SIMULATE → MITIGATE.
AI enables language understanding and explanation; it is not the source of financial calculations.
3. Current Prototype Scope
For the hackathon, we implement one polished end-to-end use case: FX risk. The user provides business data
containing a foreign-currency payable. HedgeMind detects the exposure, calculates its INR impact, lets the user test
USD/INR scenarios, compares an unhedged position with a simplified illustrative partial hedge, and explains the result.
Other risk types are future extensibility, not current implementation requirements.
4. Example User Story
An Indian business must pay a US supplier $50,000 in 45 days. Assume USD/INR is ■87. Current exposure = $50,000 ×
■87 = ■43.5L. If the rate reaches ■93, the unhedged cost becomes ■46.5L, a potential additional cost of ■3L.
HedgeMind makes this exposure visible and demonstrates how partial protection can reduce sensitivity to the movement.
5. User Journey
1. Provide data: Upload Excel/CSV or choose Use Demo Data.
2. Detect exposure: identify amount, currency, timing, counterparty and exposure type.
3. Analyze: calculate current INR exposure and deterministic risk score.
4. Simulate: change USD/INR and update impact/graph.
5. Mitigate: choose hedge percentage and compare an illustrative hedged outcome.
6. Explain: AI summarizes the already-calculated result in plain language.
6. Screens
Dashboard: overall risk, exposure and alerts.
Upload: Excel/CSV plus Use Demo Data.
Risk Analysis: detected USD liability, timing, rate and INR exposure.
Scenario Simulator: rate control, dynamic cost, additional cost and chart. This is the hero screen.
Mitigation: hedge-ratio control and transparent comparison.
AI Explanation: concise explanation of exposure and scenario.
7. FX Risk Engine — Formulas
Let E = foreign-currency exposure, R0 = base USD/INR rate, R1 = scenario rate, H = hedge ratio (0–1), and Rh =
explicitly assumed hedge rate.
Current INR exposure: E × R0
Unhedged scenario cost: E × R1
Additional unhedged cost: E × (R1 − R0)
Hedged portion: E × H
Unhedged portion: E × (1 − H)
Illustrative hedged scenario cost: (E × H × Rh) + (E × (1 − H) × R1)
Illustrative benefit: (E × R1) − Hedged Scenario Cost
8. Hedge Assumption
Do not pretend to have a real executable derivative price unless we have reliable market data. For the prototype, Rh
must be an explicit configurable assumption, documented in RISK_ENGINE.md. For example, Rh may equal the
base rate for the demo. The UI should make clear that this is an illustrative model, not real derivative pricing.
9. Risk Score
Use a simple deterministic prototype score. It may combine exposure size relative to a chosen business scale, time to
payment and scenario sensitivity. The exact formula must be documented and tested. The LLM never generates the
score. It may explain the calculated score.
10. AI Layer
AI has two genuine jobs: (1) extract structured exposure from messy language and (2) explain calculated results.
Example: “We need to pay ABC Electronics $50,000 in 45 days.” → currency=USD, amount=50000,
days_to_payment=45, type=payable, exposure_type=FX.
AI must not invent exchange rates, losses, hedge prices or numerical outputs. Those come from deterministic
code.
11. Free AI Implementation
Preferred prototype approach: run a small local LLM through a local runtime such as Ollama. Flow: Text → Local LLM →
structured JSON → validation → risk engine. This avoids API costs and internet dependence, but model quality depends
on the machine.
Critical fallback: keep a Use Demo Data path and/or deterministic parser for the fixed demo input. The core FX demo
must work even if the LLM is unavailable. A free cloud API tier can be an optional fallback, but should not be the only
dependency because free tiers may have rate limits or outages.
12. AI Output Validation
Validate every AI result before passing it to the risk engine: amount must be numeric/positive, currency supported,
payment horizon reasonable, required fields present, and exposure type recognized. Invalid output should trigger an error
or fallback—not silently enter calculations.
13. Tech Stack
Frontend: React + Vite; Styling: Tailwind CSS; Charts: Recharts; Backend: Python + FastAPI; Data: Pandas;
Numerical engine: NumPy; AI: local LLM with optional cloud fallback; Database: SQLite for speed, PostgreSQL if
already available without slowing development. Avoid adding technology just for appearance.
14. Architecture
React Frontend → FastAPI Backend → Data Processing (Pandas) + Risk Engine (Python/NumPy) + AI Service +
Database.
Frontend visualizes. Backend owns application logic. Risk engine owns calculations. AI understands/explains. Database
persists data.
15. API Contract
Initial endpoints: POST /api/upload — process Excel/CSV; POST /api/extract — text to structured exposure; POST
/api/analyze — calculate exposure/risk; POST /api/simulate — run scenario; GET /api/dashboard — dashboard
summary. Agree request/response schemas before dependent frontend/backend work.
16. Repository & MD Files
AGENTS.md ■ — rules for every human/AI contributor.
PRODUCT.md — problem, solution, user journey, current scope.
DESIGN.md — visual/UX system.
ARCHITECTURE.md — components and data flow.
API.md — endpoint contracts.
DATA_MODEL.md — data/schema.
RISK_ENGINE.md ■ — formulas, assumptions, scoring and simulations.
ROADMAP.md — future ideas only.
DECISIONS.md — important decisions and reasons.
17. Suggested Repository
hedgemind/
■■■ AGENTS.md
■■■ README.md
■■■ docs/
■ ■■■ PRODUCT.md
■ ■■■ DESIGN.md
■ ■■■ ARCHITECTURE.md
■ ■■■ API.md
■ ■■■ DATA_MODEL.md
■ ■■■ RISK_ENGINE.md
■ ■■■ ROADMAP.md
■ ■■■ DECISIONS.md
■■■ frontend/
■■■ backend/
■■■ risk_engine/
■■■ data/sample/
■■■ tests/
18. Team Roles — Suggestive
Member 1 — Technical Lead / Backend: primary focus on FastAPI, architecture, APIs, database and difficult integration
problems.
Member 2 — Risk/Data: Pandas, Excel/CSV processing, NumPy, FX calculations, scenario engine and scoring.
Member 3 — Frontend/QA: React UI, dashboard, simulator interface, responsive design and testing.
You — Product/AI/Integration: product direction, AI layer, UX, integration, demo and pitch.
Roles are suggestive, not restrictive. Any member may work outside their primary area on their own branch. Do not
disrupt another person's work; communicate before major cross-cutting merges.
19. Git / Multi-Agent Rules
Every contributor or AI agent should normally use a separate branch. Before coding: read AGENTS.md, read relevant
docs, inspect existing code and understand contracts. After coding: test, keep commits focused, update docs when
formulas/contracts/architecture change, and merge only after checking conflicts. Do not rewrite unrelated code merely to
match personal preferences.
20. Development Milestones
1 — Vertical slice: Excel → Pandas → FX calculation → API → React result.
2 — Hero simulator: scenario rate → calculation → live chart/metrics.
3 — Mitigation: hedge ratio + explicit hedge-rate assumption → comparison.
4 — AI: text → structured exposure → validation → risk engine → explanation.
5 — Polish: UX, responsiveness, loading/errors, stability and demo.
21. Explicitly Out of Scope
No real-money trading, direct MochaTrade execution integration, complete trading platform, real derivative pricing,
guaranteed financial advice, full WhatsApp integration, complex authentication unless required, multiple fully developed
risk modules, or advanced market forecasting. These can be future roadmap items.
22. Definition of Done
A judge can provide/select business data, see a USD exposure detected, understand the current INR exposure, change
the USD/INR scenario, immediately see financial impact change, select a hedge percentage and understand the
illustrative mitigation effect, and read a concise AI explanation.
23. Core Product Principle
UNDERSTAND → QUANTIFY → SIMULATE → MITIGATE
If a feature does not materially improve one of these steps, defer it until the core prototype is stable.