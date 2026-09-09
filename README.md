# FraudNexus — Judge-Grade Explainable Fraud Risk Intelligence Engine

> **"This isn't just an AI-generated fraud score. This system shows me the evidence behind the score and lets me investigate the evidence."**

FraudNexus is a financial intelligence and fraud detection platform built for cybercrime analysts, financial intelligence units (FIUs), and banking security teams.

At the heart of FraudNexus is the **Explainable Fraud Risk Engine**, a configurable, multi-signal intelligence engine that calculates dynamic, evidence-backed risk assessments from observable entity relationships and telemetry.

---

## 1. Product Vision

FraudNexus implements the complete investigation pipeline:

$$\text{DETECT} \longrightarrow \text{SCORE} \longrightarrow \text{EXPLAIN} \longrightarrow \text{CONNECT} \longrightarrow \text{INVESTIGATE} \longrightarrow \text{TRACE} \longrightarrow \text{PREDICT} \longrightarrow \text{ACT}$$

It answers four immediate investigative questions:
1. **WHAT?** Which transaction and entities are suspicious? (`TXN-48291`, `ACC-104`, `DEV-204`)
2. **HOW MUCH?** How severe is the risk? (**94 / 100 — CRITICAL**)
3. **WHY?** Which observable fraud signals caused the score, with concrete evidence?
4. **WHAT NEXT?** What should an investigator inspect or do next? (Network graph, Money flow trace, Evidence pack)

---

## 2. Dynamic Scoring Model (Zero Hardcoding)

Every score point is computed in real-time from observable database records across 6 independent evaluators. Initial maximum score ceiling: **100**.

| Signal ID | Evaluator Name | Max Weight | Configured Threshold | Observed in Seed Case (`TXN-48291`) | Contribution |
| :--- | :--- | :---: | :--- | :--- | :---: |
| `PREVIOUS_FRAUD` | Previous Fraud Connection | **+25** | $\ge 1$ connected entity in police/FIR registry | `ACC-104`, `DEV-204`, `merchant-x@upi` in `CASE-2026-018` | **+25** |
| `SHARED_DEVICE` | Shared Device Multi-Tenancy | **+20** | $> 3$ accounts per device | `DEV-204` bound to 6 accounts (`ACC-104, 118, 145, 167, 189, 203`) | **+20** |
| `VELOCITY_SURGE` | Transaction Velocity Surge | **+18** | $> 15$ txns in 2-hour window | 27 transactions recorded in rolling 2h window | **+18** |
| `LINKED_ACCOUNTS` | Coordinated Mule Network | **+16** | $> 2$ multi-hop linked accounts | 5 accounts clustered via shared hardware and payment coordinates | **+16** |
| `COMMON_BENEFICIARY` | Beneficiary / UPI Funnel | **+10** | Same UPI receiving from $\ge 3$ accounts | `merchant-x@upi` active across 31 txns from 5 accounts | **+10** |
| `AMOUNT_ANOMALY` | Transaction Amount Anomaly | **+5** | Amount $> 2.5\times$ historical average | Ticket size ₹48,500 ($13.1\times$ historical baseline average ₹3,704) | **+5** |
| **TOTAL** | **Converging Risk Score** | **100** | **Dynamic Evidence Sum** | **Sum of all triggered signals** | **94 / 100 (CRITICAL)** |

### Severity Scale
- `0–29`: **LOW**
- `30–59`: **MEDIUM**
- `60–79`: **HIGH**
- `80–100`: **CRITICAL**

### Deterministic Confidence Calculation
- **HIGH**: Complete device, network, temporal, and beneficiary telemetry available with multi-signal convergence ($\ge 4$ independent signals).
- **MEDIUM**: Singular or partial signal convergence, or minor missing telemetry.
- **LOW**: Incomplete telemetry or unassessable core features. Missing data is handled honestly with `assessable: false` and `"NOT ASSESSABLE"`.

---

## 3. Architecture

```
Frontend (React/Modern Cybersec UI)
       │
       ▼  HTTP REST (Port 8000)
API Gateway (backend/app/server.py & handler.py)
       │
       ▼
RiskScoringService (backend/app/scoring/engine.py)
       │
       ├── PreviousFraudEvaluator      (+25)
       ├── SharedDeviceEvaluator       (+20)
       ├── TransactionVelocityEvaluator(+18)
       ├── MultipleLinkedAccountsEvaluator (+16)
       ├── CommonBeneficiaryEvaluator  (+10)
       └── AmountAnomalyEvaluator      (+5)
       │
       ▼
Authoritative SQLite Database (fraudnexus.db)
```

---

## 4. Production API Endpoints

- `GET /api/risk-score/{transaction_id}` — Consolidated assessment (score, severity, confidence, signals, drivers, executive summary, related entities, recommended actions, data quality)
- `GET /api/risk-score/{transaction_id}/signals` — Granular breakdown of each evaluated signal
- `GET /api/risk-score/{transaction_id}/entities` — Contributing entity cards (Account, Hardware, UPI, Beneficiary, FIR Cases)
- `GET /api/risk-score/{transaction_id}/timeline` — Chronological investigation trail (18:01 to 18:47)
- `POST /api/risk-score/{transaction_id}/recalculate` — Authoritative recalculation from database
- `POST /api/risk-score/{transaction_id}/what-if` — Non-destructive hypothesis simulation
- `GET /api/investigate/network/{transaction_id}` — Graph nodes and edges for network view
- `GET /api/investigate/money-flow/{transaction_id}` — Multi-hop fund dispersal pipeline
- `POST /api/investigate/evidence-pack/{transaction_id}` — Cryptographically sealed investigation dossier with SHA-256 evidence hash
- `GET /api/demo/cases` — Benchmark scenario catalog
- `POST /api/demo/tweak` — Live database mutation endpoint (proves real dynamic calculation to judges)
- `POST /api/demo/reset` — Restores database to pristine benchmark state

---

## 5. How to Run

### Quick Start (Single Command)
```bash
python run.py
```
Open **http://localhost:8000** in your browser.

Or on Windows:
```cmd
start-demo.bat
```

### Running Automated Tests
Run the complete 14-test automated test suite:
```bash
cd backend
python -m unittest app.tests.test_scoring_engine
```
All 14 tests pass with 100% success in $< 0.15$ seconds.

---

## 6. Judge Presentation Script (60–120 Seconds)

1. **The Hook (0–15s)**:
   > "Most fraud dashboards show an AI score like '94% fraud' without evidence. FraudNexus is an explainable intelligence engine built for financial crime investigators. Let's inspect transaction `TXN-48291`."

2. **The Score & Drivers (15–40s)**:
   > "Our engine calculates **94 / 100 — CRITICAL** with **HIGH Confidence**. Look at 'WHY THIS SCORE?': It immediately highlights the top 3 drivers:
   > 1. Active previous fraud link (+25)
   > 2. Device `DEV-204` bound to 6 accounts (+20)
   > 3. 2-hour velocity burst of 27 transactions (+18)."

3. **The Evidence & Graph (40–70s)**:
   > "Clicking into 'Shared Device' expands the exact telemetry: fingerprint `fp_mumbai_mule_8a7c2b`, observed IP, and the 6 linked accounts.
   > Now click **View in Network**: You see `DEV-204` as the hardware epicenter linking Vikram Sethi (`ACC-104`) to 5 other mule accounts and police case `CASE-2026-018`."

4. **Money Flow & Evidence Pack (70–95s)**:
   > "Click **Trace Money Flow**: Notice how the ₹48,500 stolen from victim Vandana Iyer gets layered through Vikram Sethi into Rajesh Gupta (₹32,000) and Karan Malhotra (₹21,000) before reaching the cash-out Hawala agent.
   > Click **Evidence Dossier**: The system generates a FIPS 180-4 SHA-256 sealed report ready for law enforcement submission."

5. **The Climax: Proof of Real Calculation (95–120s)**:
   > "Is this score hardcoded? Absolutely not.
   > In the 'What-If Sandbox', let's click **'Unlink 4 Accounts from DEV-204'**.
   > Watch the score instantly recalculate from **94 to 74 (HIGH)** as the shared device signal turns off!
   > Now let's click **'Clear FIR Record'** — the score drops to **49 (MEDIUM)**!
   > FraudNexus proves that every point is genuinely derived from real evidence."

---

## 7. Known Limitations & Technical Honesty

- **Prototype Rule Weights**: Currently uses taskforce-calibrated expert weights and thresholds. In production, these weights can be periodically re-calibrated via logistic regression or gradient-boosted trees against labeled historical fraud cases.
- **Data Privacy**: PAN and phone numbers in the demo scenario are synthetic mock records compliant with data protection standards.
- **Deterministic Confidence**: Confidence is calculated via rule-based telemetry completeness and signal convergence rather than opaque ML uncertainty intervals, ensuring 100% auditability for court admissibility.
