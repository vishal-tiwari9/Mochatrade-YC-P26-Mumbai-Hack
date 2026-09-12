# Smart Credit Underwriting & Configurable BRE for NBFC

## Problem

An NBFC receives a loan application containing multiple financial documents and data points. The credit team needs a consistent way to evaluate repayment capacity, credit risk, loan eligibility, pricing, and exceptions. The system should automatically approve strong applications, hard-reject clearly risky ones, and route borderline applications to authorized exception approval.

This is a synthetic credit policy for a 24-hour hackathon MVP — not a reproduction of any real NBFC's policy. The core requirement: **business rules must be changeable without modifying the core decision-making code.**

## Flow

```
Loan Application
  -> Data Ingestion
  -> Data Validation & Normalization
  -> Derived Financial Metrics
  -> Configurable Rule Engine
  -> Risk Evaluation
  -> Decision Hierarchy (APPROVED / HARD_REJECT / EXCEPTION_L1 / EXCEPTION_L2 / INSUFFICIENT_DATA)
  -> Loan Eligibility + Pricing
  -> Explainability
  -> Audit Trail
  -> Exception Approval Workflow
```

## Input data

- **Applicant/master data**: name, age, employment/business type, vintage, requested amount, tenure, declared income, existing obligations.
- **Bureau/CIBIL-like data**: score, active loans, enquiries, overdue amount, DPD history, write-off/settlement/default indicators.
- **Bank statement data**: monthly credits, average balance, EMI debits, bounce count, cash-flow volatility, large obligations.
- **ITR/income data**: last two financial years, income trend, stability.
- **Assets**: mutual funds, equities, other declared financial assets.
- **Optional alternate data**: employment stability, business vintage, utility/payment behaviour, synthetic behavioural indicators.

## Rule engine

Rules are stored centrally (database), never hardcoded in decision logic. Each rule has: code, name, category, metric, operator, threshold, action, reason code, version, active flag. Categories: `HARD_REJECT`, `EXCEPTION_L1`, `EXCEPTION_L2`, `PRICING`.

## Decision hierarchy & conflict resolution

```
HARD_REJECT > INSUFFICIENT_DATA > EXCEPTION_L2 > EXCEPTION_L1 > APPROVED
```

A pricing rule can never override a hard-reject rule. Multiple L1 deviations can escalate to L2.

## Exception workflow

`EXCEPTION_REQUIRED -> L1 queue -> approve/reject/escalate -> L2 queue (if escalated) -> final decision`. Every action records approver, role, timestamp, comment, previous and new decision.

## Audit trail

Every application status change, rule trigger, rule version, exception action, and configuration change is persisted with actor and timestamp. Audit records are cryptographically chained (SHA-256, `hash`/`prevHash`) for tamper-evidence.

## Security & RBAC

Roles: `RM`, `L1_APPROVER` (Manager), `L2_APPROVER` (Credit Head), `ADMIN`. Backend enforces both role-based and data-level authorization (an RM only sees their own assigned applicants) — never relies on hiding UI elements. Passwords hashed (bcrypt), secrets via `.env`, sensitive identifiers (PAN, account numbers, mobile, email) masked in responses/logs.

## Demo scenarios

1. Strong applicant -> straight-through approval.
2. Serious delinquency/write-off -> hard reject even with strong income.
3. Borderline CIBIL, strong cash flow/assets -> L1 exception.
4. Multiple deviations / high loan amount -> L2 exception.
5. Change a threshold live (e.g. CIBIL minimum) and re-run the same application to prove configurability without a code change.

## Architecture (this build)

- **Core Orchestrator & BRE**: Node.js / Express / Mongoose — port 5000.
- **Document & PDF Extractor microservice**: Python / FastAPI / pdfplumber — port 8000.
- **Frontend**: React / Vite / Tailwind CSS / lucide-react / axios — port 5173.
- **Database**: MongoDB (Atlas or local fallback `mongodb://127.0.0.1:27017/nbfc_underwriting_db`).

AI/LLM use, if any, is confined to document extraction and explanation text — never the sole authority for approve/reject decisions; the deterministic rule engine is.
