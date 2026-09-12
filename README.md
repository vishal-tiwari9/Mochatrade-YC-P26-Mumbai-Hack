# NBFC Smart Credit Underwriting & Configurable BRE Engine

An end-to-end FinTech credit decisioning platform with a **Configurable Business Rule Engine (BRE)**, **Machine Learning Risk Assessment (XGBoost/LightGBM)**, **Cryptographically Chained Audit Trails (SHA-256)**, **Role-Based Access Control (RBAC)**, and **Interactive Policy Simulator**.

---

## Key Features

- **Dynamic & Versioned Business Rule Engine (BRE)**: Define, update, and toggle credit rules at runtime without modifying code.
- **Strict Decision Hierarchy**:
  > `HARD_REJECT` &nbsp;>&nbsp; `INSUFFICIENT_DATA` &nbsp;>&nbsp; `EXCEPTION_L2` &nbsp;>&nbsp; `EXCEPTION_L1` &nbsp;>&nbsp; `APPROVED`
- **Multi-Tier Exception Approvals**: Workflow for L1 (Manager) and L2 (Credit Head) deviation approvals with immutable audit logs.
- **Tamper-Evident SHA-256 Audit Trail**: Hash-chained records track every rule evaluation, status change, and user action.
- **ML Credit Risk Assessment**: Machine learning microservice evaluating default probability, risk tiering, and credit scoring.
- **Loan Simulator & Live Policy Sandbox**: Test applications in real-time against current active credit policies.
- **Security & RBAC**: JWT authentication, bcrypt password hashing, data masking for PII (PAN, Account numbers, Mobile), and role-level authorization (`ADMIN`, `L2_APPROVER`, `L1_APPROVER`, `RM`).

---

## Architecture

| Component | Technology | Default Port |
| :--- | :--- | :--- |
| **Frontend** | React, TypeScript, Vite, Tailwind CSS, Lucide Icons | `http://localhost:5173` |
| **Backend Core** | Node.js, Express, MongoDB (Mongoose), JWT | `http://localhost:5001` |
| **ML & Extractor Service** | Python, FastAPI, Scikit-Learn, Joblib, Uvicorn | `http://localhost:8001` |
| **Database** | MongoDB Atlas / Local MongoDB | `27017` / Atlas URI |

---

## Getting Started

### 1. Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- MongoDB instance (local or MongoDB Atlas)

### 2. Environment Variables Configuration

#### Backend (`backend/.env`)
```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/nbfc_underwriting_db
JWT_SECRET=your_super_secret_jwt_key_12345
EXTRACTOR_SERVICE_URL=http://localhost:8001
CORS_ORIGIN=http://localhost:5173
```

#### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5001/api
VITE_EXTRACTOR_URL=http://localhost:8001
```

---

### 3. Installation & Running

#### Quick Start (Windows)
Run the root startup batch script:
```cmd
start-dev.bat
```

#### Manual Start

**Backend**:
```bash
cd backend
npm install
npm run seed     # Seeds demo users (admin, credit_head, manager, rm) and default credit rules
npm run dev
```

**Extractor / ML Service**:
```bash
cd extractor-service
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/Mac:
# source .venv/bin/activate
pip install -r requirements.txt
python main.py
```

**Frontend**:
```bash
cd frontend
npm install
npm run dev
```

---

## Demo Credentials (from Seed)

| Role | Username | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` | Full Rule Config, Simulator, All Apps, Audit Trail |
| **Credit Head (L2)** | `credit_head` | `head123` | L2 Exception Approvals, All Applications, Risk Model |
| **Manager (L1)** | `manager` | `manager123` | L1 Exception Approvals, Queue Management |
| **Relationship Manager** | `rm_user` | `rm123` | Application Ingestion & Assigned Applications |

---

## License
MIT License
