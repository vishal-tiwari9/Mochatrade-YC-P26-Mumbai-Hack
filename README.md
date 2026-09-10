# FraudNexus: Feature 4 — Coordinated Fraud Cluster Detection Module

Production-oriented module for detecting coordinated fraud syndicates across heterogeneous banking and digital payment infrastructure.

## Core Architectural Principle
$$\text{TRANSACTION} \longrightarrow \text{ENTITY} \longrightarrow \text{RELATIONSHIP} \longrightarrow \text{NETWORK} \longrightarrow \text{FRAUD CLUSTER}$$

The system moves beyond isolated suspicious transaction scoring to detect coordinated mule networks, shared device rings, and circular layering patterns.

---

## 7-Layer Real-Data-Ready Architecture

```
[ Data Source ] (Demo JSON / CBS ISO 20022 / UPI Switch / CSV / Webhook)
       ↓
[ Data Adapter Layer ] (IDataAdapter: DemoDataAdapter + Bank/Payment/CSV/Webhook placeholders)
       ↓
[ Normalized Data Schema ] (Standardized transaction, entity, incident, and relationship models)
       ↓
[ Entity Resolution ] (Canonical entity IDs: ACCOUNT:ACC..., UPI:..., DEVICE:DEV..., etc.)
       ↓
[ Heterogeneous Fraud Graph ] (Nodes: 10 types; Edges: 11 types with confidence & metadata)
       ↓
[ Cluster Detection Engine ] (Community traversal + weighted 0-100 scoring model)
       ↓
[ REST API Layer ] (Express + TypeScript: /api/fraud-clusters/*, /api/transactions/ingest)
       ↓
[ Cyber-Defense Investigation UI ] (React + TypeScript + Tailwind CSS + Cytoscape.js)
```

---

## Key Features

1. **Target Demo Syndicate `FNX-CL-2841`**:
   - **Risk Score**: 94 / 100 (**CRITICAL**)
   - **17 Accounts**, **11 UPI IDs**, **5 Devices**, **4 Phones**
   - **142 Transactions**, **₹2,84,000 Total Exposure**
   - **+467% Network Growth**
   - **7 Explainable Indicators** (Shared Device, Shared Phone, Fraud Association, Common Beneficiary, Transaction Velocity, Rapid Growth, Money Movement Anomalies)

2. **Interactive Cytoscape.js Graph Visualization**:
   - Node styling per entity type (Accounts: blue circle, Devices: slate hexagon, Phones: purple round-rect, UPIs: teal diamond, Incidents: red star).
   - Node selection Entity Inspector drawer.
   - Shortest Path Finder between any two entities.
   - Suspicious infrastructure link highlighting.

3. **Autonomous Network Discovery Animation**:
   - 10-step investigation sequence showing how an initial suspicious transaction unravels an entire syndicate network.

4. **Live Transaction Ingestion Pipeline**:
   - Real-time 8-step pipeline (`Ingest` &rarr; `Normalize` &rarr; `Resolve Entities` &rarr; `Add Relationships` &rarr; `Update Graph` &rarr; `Recalculate Clusters` &rarr; `Update Risk` &rarr; `Identify Connected Entities`).

5. **Standardized Integration Contract (Section 20)**:
   - Clean JSON output contract for consumption by other FraudNexus modules.

---

## Setup & Running Locally

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation
```bash
# Install root dependencies
npm install

# Install server dependencies
npm --prefix server install

# Install client dependencies
npm --prefix client install
```

### Running Both Backend and Frontend Concurrently
```bash
npm run dev
```

- **Frontend Investigation Dashboard**: [http://localhost:5173/](http://localhost:5173/)
- **Backend API**: [http://localhost:5001/api/fraud-clusters](http://localhost:5001/api/fraud-clusters)

### Running Automated Test Suite
```bash
npm test
```
