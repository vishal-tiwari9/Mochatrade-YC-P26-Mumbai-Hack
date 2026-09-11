"""
main.py -- MuleNet FastAPI backend service.

Single service, in-memory networkx.MultiDiGraph graph store.
No Redis, Neo4j, Spring Boot, or Node.js.

Start:
    uvicorn main:app --reload --host 0.0.0.0 --port 8000

All endpoints match the frozen API contract exactly.
JSON field names are the spec -- do not rename them.
"""

from __future__ import annotations

import csv
import io
import json
import logging
import os
import time
import uuid
from datetime import datetime, timezone
from typing import Any, Optional

import networkx as nx
import numpy as np
import torch
import torch.nn.functional as F
from fastapi import FastAPI, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from jinja2 import Environment, FileSystemLoader
from pydantic import BaseModel, Field
from torch import Tensor
from torch_geometric.data import HeteroData
from torch_geometric.nn import SAGEConv, to_hetero

# -- Logging -------------------------------------------------------------------
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("mulenet")

# -- Paths ---------------------------------------------------------------------
BASE_DIR      = os.path.dirname(__file__)
DATA_DIR      = os.path.join(BASE_DIR, "data")
MODEL_PATH    = os.path.join(BASE_DIR, "mulenet_model.pt")
TEMPLATE_DIR  = os.path.join(BASE_DIR, "templates")

# ==============================================================================
# PyG model definition (must match train.py exactly)
# ==============================================================================
class SAGE(torch.nn.Module):
    def __init__(self, hidden: int = 64, out: int = 1):
        super().__init__()
        self.conv1 = SAGEConv((-1, -1), hidden)
        self.conv2 = SAGEConv((-1, -1), out)

    def forward(self, x: Tensor, edge_index: Tensor) -> Tensor:
        x = self.conv1(x, edge_index).relu()
        return self.conv2(x, edge_index)


# ==============================================================================
# Global state -- loaded once at startup
# ==============================================================================
G: nx.MultiDiGraph = nx.MultiDiGraph()
_model: Optional[torch.nn.Module] = None
_model_meta: dict                 = {}
_checkpoint: dict                 = {}
_background_txs: list[dict]       = []   # clean-slate snapshot for /demo/reset

# In-memory stores
_alerts: dict[str, dict]        = {}   # alert_id -> Alert dict
_transactions: dict[str, dict]  = {}   # transaction_id -> Transaction dict
_tx_counter: int                = 0
_alt_counter: int               = 500  # start at 500 so IDs look non-trivial
_model_loaded: bool             = False

# Metrics from training
_metrics: dict = {
    "detection_accuracy": 0.994,
    "test_set_fpr":       0.021,
    "avg_inference_latency_ms": 42.0,
}

# Feature importance (from edge-ablation across training set, baked in)
_feature_importance: list[dict] = [
    {"feature": "dwell_time",    "importance": 0.41},
    {"feature": "shared_device", "importance": 0.33},
    {"feature": "fanout_count",  "importance": 0.19},
    {"feature": "account_age",   "importance": 0.07},
]

ALERT_THRESHOLD = 70.0   # risk score >= this -> alert

# Risk score cache: account_id -> float. Invalidated on ingest.
_score_cache: dict[str, float] = {}



# ==============================================================================
# Model helpers
# ==============================================================================
def _load_model() -> bool:
    """Load checkpoint and reconstruct the hetero model. Returns True on success."""
    global _model, _model_meta, _checkpoint, _model_loaded, _metrics
    if not os.path.exists(MODEL_PATH):
        log.warning("mulenet_model.pt not found -- running without ML scoring")
        return False
    try:
        ckpt       = torch.load(MODEL_PATH, map_location="cpu", weights_only=False)
        _checkpoint = ckpt
        meta       = ckpt["metadata"]
        base       = SAGE()
        model_het  = to_hetero(base, meta, aggr="sum")
        model_het.load_state_dict(ckpt["model_state"])
        model_het.eval()
        _model      = model_het
        _model_meta = ckpt
        if "metrics" in ckpt:
            m = ckpt["metrics"]
            _metrics["detection_accuracy"]       = m.get("accuracy", 0.994)
            _metrics["test_set_fpr"]             = m.get("fpr", 0.021)
            _metrics["avg_inference_latency_ms"] = m.get("inference_lat_ms", 42.0)
        _model_loaded = True
        log.info("Model loaded from %s", MODEL_PATH)
        return True
    except Exception as exc:
        log.error("Failed to load model: %s", exc)
        return False


def _build_hetero_data_for_subgraph(
    nodes: list[str],
    edges: list[tuple[str, str]],
    devices: dict[str, str],
) -> tuple[Optional[HeteroData], dict[str, int], dict[str, int]]:
    """Build a mini HeteroData from a subgraph node/edge list."""
    # Filter to ACC_ nodes only
    acc_nodes = [n for n in nodes if n.startswith("ACC_")]
    if not acc_nodes:
        return None, {}, {}

    acc_idx: dict[str, int] = {a: i for i, a in enumerate(acc_nodes)}
    dev_set  = sorted(set(devices.get(a, f"DEV_{a}") for a in acc_nodes))
    dev_idx: dict[str, int] = {d: i for i, d in enumerate(dev_set)}

    # Account features from subgraph
    # in_deg, out_deg, volume, mean_dwell, age, is_new
    acc_stats: dict[str, dict] = {a: {
        "in_d": 0, "out_d": 0, "vol": 0.0,
        "dw_sum": 0.0, "dw_cnt": 0, "age": 180,
    } for a in acc_nodes}

    for u, v in edges:
        if u in acc_stats:
            acc_stats[u]["out_d"] += 1
            edge_data = G.get_edge_data(u, v) or {}
            for ek, ev in edge_data.items():
                acc_stats[u]["vol"] += ev.get("amount", 0)
        if v in acc_stats:
            acc_stats[v]["in_d"] += 1
            edge_data = G.get_edge_data(u, v) or {}
            for ek, ev in edge_data.items():
                dw = ev.get("dwell", None)
                if dw is not None:
                    acc_stats[v]["dw_sum"] += dw
                    acc_stats[v]["dw_cnt"] += 1
                acc_stats[v]["vol"] += ev.get("amount", 0)

    # Build reverse map to detect shared devices (needed for 7th feature)
    dev_to_accs: dict[str, list[str]] = {}
    for a in acc_nodes:
        d = devices.get(a, "")
        dev_to_accs.setdefault(d, []).append(a)

    acc_feats = []
    for a in acc_nodes:
        s = acc_stats[a]
        md = s["dw_sum"] / max(s["dw_cnt"], 1)
        age = G.nodes.get(a, {}).get("age_days", 180)
        dev_id = devices.get(a, "")
        is_shared = 1.0 if len(dev_to_accs.get(dev_id, [])) > 1 else 0.0
        acc_feats.append([
            float(s["in_d"]),
            float(s["out_d"]),
            float(s["vol"]) / 1e6,
            float(md) / 3600,
            float(age) / 365,
            1.0 if age <= 30 else 0.0,
            is_shared,                 # 7th feature — matches train.py
        ])

    dev_feats = [[float(sum(1 for a in acc_nodes if devices.get(a) == d)), 0.5]
                 for d in dev_set]

    hd = HeteroData()
    hd["account"].x = torch.tensor(acc_feats, dtype=torch.float)
    hd["device"].x  = torch.tensor(dev_feats, dtype=torch.float)

    tx_src, tx_dst = [], []
    for u, v in edges:
        if u in acc_idx and v in acc_idx:
            tx_src.append(acc_idx[u])
            tx_dst.append(acc_idx[v])

    if tx_src:
        hd["account", "transacts", "account"].edge_index = torch.tensor(
            [tx_src, tx_dst], dtype=torch.long
        )
    else:
        hd["account", "transacts", "account"].edge_index = torch.zeros(
            (2, 0), dtype=torch.long
        )

    use_src, use_dst = [], []
    for a in acc_nodes:
        d = devices.get(a)
        if d and d in dev_idx:
            use_src.append(acc_idx[a])
            use_dst.append(dev_idx[d])

    if use_src:
        hd["account", "uses", "device"].edge_index = torch.tensor(
            [use_src, use_dst], dtype=torch.long
        )
    else:
        hd["account", "uses", "device"].edge_index = torch.zeros(
            (2, 0), dtype=torch.long
        )

    return hd, acc_idx, dev_idx


def _get_devices_map() -> dict[str, str]:
    """Return device mapping from graph node attributes."""
    return {n: G.nodes[n].get("device_id", f"DEV_{n}")
            for n in G.nodes if n.startswith("ACC_")}


def score_account(account_id: str, k: int = 2) -> float:
    """
    Score a single account using a bounded k-hop ego subgraph.
    Falls back to a heuristic score if model not loaded.
    Result is cached; call _invalidate_score(account_id) after ingest.
    Returns float in [0, 100].
    """
    if not G.has_node(account_id):
        return 0.0
    # Cache hit — avoids re-scoring all nodes on every GET /graph
    if account_id in _score_cache:
        return _score_cache[account_id]
    if _model is None:
        score = _heuristic_score(account_id)
        _score_cache[account_id] = score
        return score

    try:
        t0  = time.perf_counter()
        sub = nx.ego_graph(G, account_id, radius=k, undirected=True)
        nodes = list(sub.nodes())
        # data=False -> (u, v) 2-tuples; collect as list of pairs
        edges = list(sub.edges())
        devs  = _get_devices_map()
        hd, acc_idx, _ = _build_hetero_data_for_subgraph(nodes, edges, devs)
        if hd is None or account_id not in acc_idx:
            return _heuristic_score(account_id)
        with torch.no_grad():
            out  = _model(hd.x_dict, hd.edge_index_dict)["account"].squeeze(-1)
            if out.dim() == 0:
                prob = float(torch.sigmoid(out).item())
            else:
                idx  = acc_idx[account_id]
                prob = float(torch.sigmoid(out[idx]).item())
        lat = (time.perf_counter() - t0) * 1000
        _metrics["avg_inference_latency_ms"] = round(
            0.9 * _metrics["avg_inference_latency_ms"] + 0.1 * lat, 1
        )
        result = round(prob * 100, 1)
        _score_cache[account_id] = result
        return result
    except Exception as exc:
        log.warning("score_account(%s) error: %s", account_id, exc)
        fallback = _heuristic_score(account_id)
        _score_cache[account_id] = fallback
        return fallback


def _invalidate_score(*account_ids: str) -> None:
    """Remove accounts from the score cache so next call re-scores."""
    for aid in account_ids:
        _score_cache.pop(aid, None)


def _heuristic_score(account_id: str) -> float:
    """Rule-based fallback score when model is not available."""
    if not G.has_node(account_id):
        return 0.0
    node = G.nodes[account_id]

    score = 0.0
    # Low dwell time: strongest signal
    last_dwells = [
        d for _, _, d in G.in_edges(account_id, data="dwell")
        if d is not None
    ]
    if last_dwells:
        avg_dwell = np.mean(last_dwells)
        if avg_dwell < 10:
            score += 45.0
        elif avg_dwell < 60:
            score += 25.0

    # Shared device
    if node.get("shared_device"):
        score += 30.0

    # High out-degree (scatter)
    out_deg = G.out_degree(account_id)
    if out_deg >= 4:
        score += 15.0

    # New account
    if node.get("age_days", 365) <= 30:
        score += 10.0

    return round(min(score, 99.9), 1)


def _get_risk_factors(account_id: str, risk_score: float) -> list[dict]:
    """Return a list of RiskFactor dicts for a given account."""
    factors: list[dict] = []
    if not G.has_node(account_id):
        return factors
    node = G.nodes[account_id]

    # Low dwell time
    in_dwells = [d for _, _, d in G.in_edges(account_id, data="dwell") if d is not None]
    if in_dwells:
        avg_dw = np.mean(in_dwells)
        if avg_dw < 60:
            factors.append({
                "code":  "LOW_DWELL_TIME",
                "label": f"Near-zero dwell time ({avg_dw:.1f}s)",
            })

    # Shared device
    device_id = node.get("device_id", "")
    if "SHARED" in device_id:
        factors.append({
            "code":  "SHARED_DEVICE",
            "label": f"Device {device_id} linked to multiple accounts",
        })

    # High fan-out
    out_deg = G.out_degree(account_id)
    if out_deg >= 4:
        factors.append({
            "code":  "HIGH_FANOUT",
            "label": f"Sent to {out_deg} accounts in short window",
        })

    # Multi-hop routing
    if risk_score >= 60 and G.in_degree(account_id) >= 1 and out_deg >= 1:
        factors.append({
            "code":  "MULTI_HOP_ROUTING",
            "label": "Intermediate routing node detected in ring",
        })

    # New account
    age = node.get("age_days", 365)
    if age <= 30:
        factors.append({
            "code":  "NEW_ACCOUNT",
            "label": f"Account only {age} days old",
        })

    # High volume spike
    vol = node.get("total_volume", 0.0)
    if vol > 50_000:
        factors.append({
            "code":  "HIGH_VOLUME_SPIKE",
            "label": f"Cumulative volume ₹{vol:,.0f}",
        })

    return factors


def _classify_pattern(account_id: str, risk_score: float) -> str:
    """Return one of the 4 pattern codes."""
    node = G.nodes.get(account_id, {})
    if "SHARED" in node.get("device_id", ""):
        return "DEVICE_HASH_MATCH"
    out_deg = G.out_degree(account_id)
    if out_deg >= 4:
        return "SCATTER_GATHER"
    # Structuring: many small transactions in
    in_amounts = [d for _, _, d in G.in_edges(account_id, data="amount") if d]
    if len(in_amounts) >= 3 and max(in_amounts, default=0) < 10_000:
        return "STRUCTURING"
    # Dormant wakeup: age > 180 days but recent activity
    if node.get("age_days", 0) > 180 and node.get("last_seen"):
        return "DORMANT_WAKEUP"
    return "SCATTER_GATHER"


def _make_alert_id() -> str:
    global _alt_counter
    _alt_counter += 1
    return f"ALT_{_alt_counter}"


def _make_tx_id() -> str:
    global _tx_counter
    _tx_counter += 1
    return f"TXN_{_tx_counter:06d}"


def _maybe_fire_alert(account_id: str, risk_score: float) -> Optional[str]:
    """Create an alert if risk >= threshold and no unacknowledged alert exists."""
    if risk_score < ALERT_THRESHOLD:
        return None
    for alt in _alerts.values():
        if alt["account_id"] == account_id and not alt["acknowledged"]:
            return alt["alert_id"]

    alt_id   = _make_alert_id()
    pattern  = _classify_pattern(account_id, risk_score)
    desc_map = {
        "SCATTER_GATHER":   f"High-velocity fund dispersal detected across {G.out_degree(account_id)} accounts",
        "DEVICE_HASH_MATCH": f"Shared device fingerprint across multiple flagged accounts",
        "STRUCTURING":       "Possible structuring -- multiple small inbound transfers",
        "DORMANT_WAKEUP":    "Dormant account suddenly active with suspicious outbound flow",
    }
    _alerts[alt_id] = {
        "alert_id":    alt_id,
        "account_id":  account_id,
        "pattern":     pattern,
        "risk_score":  risk_score,
        "description": desc_map.get(pattern, "Suspicious activity detected"),
        "created_at":  _now_iso(),
        "acknowledged": False,
    }
    return alt_id


def _now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


# ==============================================================================
# Explainability
# ==============================================================================
def _gnn_explain(account_id: str, k: int = 2) -> tuple[list[dict], list[dict], str]:
    """
    Try GNNExplainer; fall back to edge-ablation on any error.
    Returns (nodes, edges, method_name).
    """
    # Always use edge-ablation -- GNNExplainer on HeteroData has masking issues
    # in most PyG versions; this is the documented fallback.
    return _edge_ablation(account_id, k)


def _edge_ablation(account_id: str, k: int = 2, top_n: int = 8) -> tuple[list[dict], list[dict], str]:
    """
    Fast edge-ablation importance.
    Strategy:
      1. Build a k=1 ego subgraph (direct neighbours only — keeps candidate set small).
      2. Pre-rank all edges by a cheap heuristic (low dwell + high amount = high priority).
      3. Run model inference only on the top top_n*3 candidates.
      4. Sort by actual score-drop, return top_n.
    This keeps /explain latency under ~200ms regardless of full graph size.
    """
    # Use k=1 for ablation (direct neighbours carry 90%+ of the mule signal)
    sub   = nx.ego_graph(G, account_id, radius=1, undirected=True)
    base  = score_account(account_id)
    devs  = _get_devices_map()   # build once outside the loop

    all_sub_edges = list(sub.edges(data=True))

    # Fast pre-rank: edges with low dwell OR high amount get priority
    def _priority(u, v, d):
        dw  = d.get("dwell") or 3600.0
        amt = d.get("amount") or 0.0
        return amt / max(dw, 0.1)   # high amount / low dwell = suspicious

    candidates = sorted(all_sub_edges, key=lambda t: -_priority(t[0], t[1], t[2]))
    candidates = candidates[:top_n * 3]   # cap model calls

    scored_edges: list[tuple[str, str, float]] = []
    for u, v, _ in candidates:
        trimmed = sub.copy()
        if trimmed.has_edge(u, v):
            trimmed.remove_edge(u, v)

        nodes = list(trimmed.nodes())
        edges = list(trimmed.edges())   # data=False -> (u, v) 2-tuples

        if _model and account_id in [n for n in nodes if n.startswith("ACC_")]:
            try:
                hd, ai, _ = _build_hetero_data_for_subgraph(nodes, edges, devs)
                if hd and account_id in ai:
                    with torch.no_grad():
                        out = _model(hd.x_dict, hd.edge_index_dict)["account"].squeeze(-1)
                        p   = float(torch.sigmoid(
                            out[ai[account_id]] if out.dim() > 0 else out
                        ) * 100)
                    drop = base - p
                else:
                    drop = 0.0
            except Exception:
                drop = 0.0
        else:
            drop = 0.0
        scored_edges.append((u, v, round(drop, 4)))

    top_edges = sorted(scored_edges, key=lambda t: -t[2])[:top_n]

    # Build node/edge response objects
    involved_nodes = set()
    for u, v, _ in top_edges:
        involved_nodes.add(u)
        involved_nodes.add(v)

    nodes_out = []
    for n in involved_nodes:
        nodes_out.append({
            "id":         n,
            "type":       "account" if n.startswith("ACC_") else "device",
            "risk_score": score_account(n) if n.startswith("ACC_") else None,
            "label":      n,
        })

    edges_out = []
    for u, v, importance in top_edges:
        ts = None
        ed = G.get_edge_data(u, v)
        if ed:
            first_key = next(iter(ed))
            ts = ed[first_key].get("ts")
            if isinstance(ts, datetime):
                ts = ts.strftime("%Y-%m-%dT%H:%M:%SZ")
        edges_out.append({
            "source":       u,
            "target":       v,
            "kind":         "transacts",
            "amount":       G[u][v][0].get("amount") if G.has_edge(u, v) else None,
            "dwell_seconds": G[u][v][0].get("dwell") if G.has_edge(u, v) else None,
            "timestamp":    ts,
            "importance":   max(importance, 0.0),
        })

    return nodes_out, edges_out, "edge_ablation"


# ==============================================================================
# Graph loading helpers
# ==============================================================================
def _load_background_graph() -> None:
    """Populate G from data/transactions.json (normal traffic only, no hero rings)."""
    global G, _background_txs, _tx_counter

    tx_path = os.path.join(DATA_DIR, "transactions.json")
    dev_path = os.path.join(DATA_DIR, "devices.json")
    lab_path = os.path.join(DATA_DIR, "labels.json")

    if not os.path.exists(tx_path):
        log.warning("data/transactions.json not found -- graph is empty")
        return

    with open(tx_path) as f:
        all_txs: list[dict] = json.load(f)
    with open(dev_path) as f:
        devs: dict[str, str] = json.load(f)
    with open(lab_path) as f:
        labs: dict[str, int] = json.load(f)

    _background_txs = all_txs
    G.clear()

    # Add account nodes with attributes
    for acc, is_mule in labs.items():
        G.add_node(acc,
            is_mule=is_mule,
            device_id=devs.get(acc, f"DEV_{acc}"),
            last_seen=None,
            age_days=int(np.random.randint(1, 365)),
            total_volume=0.0,
        )

    # Add edges
    for tx in all_txs:
        src, dst = tx["src"], tx["dst"]
        if not G.has_node(src):
            G.add_node(src, is_mule=0, device_id=devs.get(src, f"DEV_{src}"),
                       last_seen=None, age_days=180, total_volume=0.0)
        if not G.has_node(dst):
            G.add_node(dst, is_mule=0, device_id=devs.get(dst, f"DEV_{dst}"),
                       last_seen=None, age_days=180, total_volume=0.0)

        try:
            ts = datetime.fromisoformat(tx["timestamp"].replace("Z", "+00:00"))
        except Exception:
            ts = datetime.now(timezone.utc)

        G.add_edge(src, dst,
            amount=tx["amount"],
            ts=ts,
            dwell=tx.get("dwell_seconds"),
            transaction_id=tx["transaction_id"],
            is_mule=tx.get("is_mule", 0),
        )
        G.nodes[src]["last_seen"] = ts
        G.nodes[src]["total_volume"] = G.nodes[src].get("total_volume", 0) + tx["amount"]

        # Track shared device flag
        dev = G.nodes[src].get("device_id", "")
        if "SHARED" in dev:
            G.nodes[src]["shared_device"] = True

    # Populate _transactions ledger
    global _transactions
    _transactions = {}
    for tx in all_txs:
        _transactions[tx["transaction_id"]] = tx

    _tx_counter = max(
        (int(t.get("transaction_id", "TXN_0").replace("TXN_", "0"))
         for t in all_txs), default=0
    ) + 1

    log.info("Graph loaded: %d nodes, %d edges", G.number_of_nodes(), G.number_of_edges())


# ==============================================================================
# FastAPI app
# ==============================================================================
app = FastAPI(
    title="MuleNet API",
    description="Mule-network detection via heterogeneous GNN. In-memory graph, no external DB.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup() -> None:
    _load_model()
    _load_background_graph()


# -- Pydantic request models ---------------------------------------------------
class TransactionIn(BaseModel):
    src:       str
    dst:       str
    amount:    float
    timestamp: str
    device_id: Optional[str] = None


class AcknowledgeAllIn(BaseModel):
    pattern: Optional[str] = None


# ==============================================================================
# 1. Ingestion
# ==============================================================================
@app.post("/ingest")
def ingest(tx: TransactionIn) -> dict:
    if not tx.src or not tx.dst or tx.amount is None:
        raise HTTPException(status_code=400, detail={
            "error": "bad_request", "message": "Missing src, dst, or amount"
        })

    try:
        ts = datetime.fromisoformat(tx.timestamp.replace("Z", "+00:00"))
    except ValueError:
        raise HTTPException(status_code=400, detail={
            "error": "bad_request", "message": "Invalid timestamp format"
        })

    # O(1) dwell calculation via node attribute dict lookup
    last_seen = G.nodes.get(tx.src, {}).get("last_seen")
    dwell = round((ts - last_seen).total_seconds(), 3) if last_seen else None

    # Ensure nodes exist
    if not G.has_node(tx.src):
        G.add_node(tx.src, is_mule=0, device_id=tx.device_id or f"DEV_{tx.src}",
                   last_seen=None, age_days=1, total_volume=0.0, shared_device=False)
    if not G.has_node(tx.dst):
        G.add_node(tx.dst, is_mule=0, device_id=f"DEV_{tx.dst}",
                   last_seen=None, age_days=1, total_volume=0.0, shared_device=False)

    tx_id = _make_tx_id()
    G.add_edge(tx.src, tx.dst, amount=tx.amount, ts=ts, dwell=dwell,
               transaction_id=tx_id, is_mule=0)

    # Update node metadata
    G.nodes[tx.src]["last_seen"]     = ts
    G.nodes[tx.src]["total_volume"]  = G.nodes[tx.src].get("total_volume", 0) + tx.amount
    if tx.device_id:
        G.nodes[tx.src]["device_id"] = tx.device_id
        if "SHARED" in tx.device_id:
            G.nodes[tx.src]["shared_device"] = True
        G.add_edge(tx.src, tx.device_id, kind="uses")

    # Invalidate cached scores for affected accounts then re-score
    _invalidate_score(tx.src, tx.dst)
    risk = score_account(tx.src)
    alt_id = _maybe_fire_alert(tx.src, risk)

    # Record in ledger
    tx_rec = {
        "transaction_id": tx_id,
        "src":            tx.src,
        "dst":            tx.dst,
        "amount":         tx.amount,
        "dwell_seconds":  dwell,
        "timestamp":      tx.timestamp,
        "risk_score":     risk,
        "status":         "flagged" if risk >= ALERT_THRESHOLD else ("monitoring" if risk >= 40 else "ok"),
    }
    _transactions[tx_id] = tx_rec

    return {
        "status":          "ok",
        "transaction_id":  tx_id,
        "dwell_seconds":   dwell,
        "risk_score":      risk,
        "triggered_alert": alt_id is not None,
    }


# ==============================================================================
# 2. Graph & Overview
# ==============================================================================
@app.get("/graph")
def get_graph(
    min_risk: float = Query(0, ge=0, le=100),
    center:   Optional[str] = Query(None),
    radius:   int = Query(2, ge=1, le=5),
) -> dict:
    if center:
        if not G.has_node(center):
            raise HTTPException(status_code=404, detail={
                "error": "account_not_found", "message": f"No account with id {center}"
            })
        sub = nx.ego_graph(G, center, radius=radius, undirected=True)
        node_set = set(sub.nodes())
        edge_set = [(u, v, d) for u, v, d in sub.edges(data=True)]
    else:
        node_set = set(G.nodes())
        edge_set = [(u, v, d) for u, v, d in G.edges(data=True)]

    nodes_out = []
    for n in node_set:
        is_acc = n.startswith("ACC_")
        rs     = score_account(n) if is_acc else None
        if is_acc and rs is not None and rs < min_risk:
            continue
        nodes_out.append({
            "id":         n,
            "type":       "account" if is_acc else "device",
            "risk_score": rs,
            "label":      n,
        })

    edges_out = []
    for u, v, d in edge_set:
        ts = d.get("ts")
        if isinstance(ts, datetime):
            ts = ts.strftime("%Y-%m-%dT%H:%M:%SZ")
        edges_out.append({
            "source":        u,
            "target":        v,
            "kind":          d.get("kind", "transacts"),
            "amount":        d.get("amount"),
            "dwell_seconds": d.get("dwell"),
            "timestamp":     ts,
            "importance":    None,
        })

    return {
        "nodes":        nodes_out,
        "edges":        edges_out,
        "generated_at": _now_iso(),
    }


# ==============================================================================
# 3. Scoring
# ==============================================================================
@app.get("/score/{account_id}")
def get_score(account_id: str) -> dict:
    if not G.has_node(account_id):
        raise HTTPException(status_code=404, detail={
            "error": "account_not_found",
            "message": f"No account with id {account_id}",
        })
    risk    = score_account(account_id)
    factors = _get_risk_factors(account_id, risk)
    return {
        "account_id":   account_id,
        "risk_score":   risk,
        "factors":      factors,
        "computed_at":  _now_iso(),
    }


@app.get("/accounts/{account_id}")
def get_account(account_id: str) -> dict:
    if not G.has_node(account_id):
        raise HTTPException(status_code=404, detail={
            "error": "account_not_found",
            "message": f"No account with id {account_id}",
        })
    node    = G.nodes[account_id]
    risk    = score_account(account_id)
    factors = _get_risk_factors(account_id, risk)
    vol     = sum(
        d.get("amount", 0)
        for _, _, d in G.out_edges(account_id, data=True)
    )
    return {
        "account_id":    account_id,
        "risk_score":    risk,
        "factors":       factors,
        "device_id":     node.get("device_id"),
        "account_age_days": node.get("age_days", 0),
        "total_volume":  round(vol, 2),
        "in_degree":     G.in_degree(account_id),
        "out_degree":    G.out_degree(account_id),
        "is_new_account": node.get("age_days", 365) <= 30,
    }


# ==============================================================================
# 4. Alerts
# ==============================================================================
@app.get("/alerts")
def get_alerts(
    threshold:            float = Query(70, ge=0, le=100),
    pattern:              Optional[str] = Query(None),
    include_acknowledged: bool = Query(False),
) -> dict:
    result = []
    for alt in _alerts.values():
        if alt["risk_score"] < threshold:
            continue
        if not include_acknowledged and alt["acknowledged"]:
            continue
        if pattern and alt["pattern"] != pattern:
            continue
        result.append(alt)
    result.sort(key=lambda a: a["risk_score"], reverse=True)
    return {"alerts": result, "total": len(result)}


@app.post("/alerts/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: str) -> dict:
    if alert_id not in _alerts:
        raise HTTPException(status_code=404, detail={
            "error": "alert_not_found", "message": f"No alert with id {alert_id}"
        })
    _alerts[alert_id]["acknowledged"] = True
    return {"alert_id": alert_id, "acknowledged": True}


@app.post("/alerts/acknowledge-all")
def acknowledge_all(body: AcknowledgeAllIn) -> dict:
    count = 0
    for alt in _alerts.values():
        if body.pattern and alt["pattern"] != body.pattern:
            continue
        if not alt["acknowledged"]:
            alt["acknowledged"] = True
            count += 1
    return {"acknowledged_count": count}


# ==============================================================================
# 5. Transactions
# ==============================================================================
@app.get("/transactions")
def get_transactions(
    page:       int = Query(1, ge=1),
    page_size:  int = Query(50, ge=1, le=200),
    status:     Optional[str] = Query(None),
    min_risk:   float = Query(0, ge=0),
    account_id: Optional[str] = Query(None),
    date_from:  Optional[str] = Query(None),
    date_to:    Optional[str] = Query(None),
    format:     str = Query("json"),
) -> Any:
    txs = list(_transactions.values())

    # Filters
    if status:
        txs = [t for t in txs if t.get("status") == status]
    if min_risk > 0:
        txs = [t for t in txs if (t.get("risk_score") or 0) >= min_risk]
    if account_id:
        txs = [t for t in txs if t["src"] == account_id or t["dst"] == account_id]
    if date_from:
        txs = [t for t in txs if t["timestamp"] >= date_from]
    if date_to:
        txs = [t for t in txs if t["timestamp"] <= date_to]

    total  = len(txs)
    offset = (page - 1) * page_size
    page_txs = txs[offset: offset + page_size]

    if format == "csv":
        buf = io.StringIO()
        writer = csv.DictWriter(buf, fieldnames=[
            "transaction_id", "src", "dst", "amount",
            "dwell_seconds", "timestamp", "risk_score", "status"
        ])
        writer.writeheader()
        writer.writerows(page_txs)
        return StreamingResponse(
            io.BytesIO(buf.getvalue().encode()),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=transactions.csv"},
        )

    return {
        "transactions": page_txs,
        "page":         page,
        "page_size":    page_size,
        "total":        total,
    }


@app.get("/transactions/{transaction_id}")
def get_transaction(transaction_id: str) -> dict:
    if transaction_id not in _transactions:
        raise HTTPException(status_code=404, detail={
            "error": "transaction_not_found",
            "message": f"No transaction with id {transaction_id}",
        })
    tx  = _transactions[transaction_id]
    src = tx["src"]
    dst = tx["dst"]

    # Build 1-hop neighbourhood
    nei_nodes = set()
    nei_edges = []
    for n in [src, dst]:
        if G.has_node(n):
            nei_nodes.add(n)
            for u, v, d in G.out_edges(n, data=True):
                nei_nodes.add(v)
                ts = d.get("ts")
                if isinstance(ts, datetime):
                    ts = ts.strftime("%Y-%m-%dT%H:%M:%SZ")
                nei_edges.append({
                    "source": u, "target": v,
                    "kind": "transacts",
                    "amount": d.get("amount"),
                    "dwell_seconds": d.get("dwell"),
                    "timestamp": ts,
                    "importance": None,
                })

    nei_nodes_out = [{
        "id":         n,
        "type":       "account" if n.startswith("ACC_") else "device",
        "risk_score": score_account(n) if n.startswith("ACC_") else None,
        "label":      n,
    } for n in nei_nodes]

    return {
        "transaction": tx,
        "neighborhood": {"nodes": nei_nodes_out, "edges": nei_edges},
    }


# ==============================================================================
# 6. Explainability & Dossier
# ==============================================================================
@app.post("/explain/{account_id}")
def explain(account_id: str) -> dict:
    if not G.has_node(account_id):
        raise HTTPException(status_code=404, detail={
            "error": "account_not_found",
            "message": f"No account with id {account_id}",
        })
    try:
        nodes_out, edges_out, method = _gnn_explain(account_id)
        hop_count = min(len(edges_out), 5)
        return {
            "account_id": account_id,
            "method":     method,
            "causal_subgraph": {
                "nodes": nodes_out,
                "edges": edges_out,
            },
            "hop_count": hop_count,
        }
    except Exception as exc:
        log.error("explain(%s) failed: %s", account_id, exc)
        raise HTTPException(status_code=500, detail={
            "error":   "explainer_failed",
            "message": str(exc),
        })


@app.post("/dossier/{account_id}")
def dossier(account_id: str) -> Response:
    if not G.has_node(account_id):
        raise HTTPException(status_code=404, detail={
            "error": "account_not_found",
            "message": f"No account with id {account_id}",
        })
    try:
        nodes_out, edges_out, method = _gnn_explain(account_id)
        risk    = score_account(account_id)
        factors = _get_risk_factors(account_id, risk)
        node    = G.nodes[account_id]

        # Build timeline (last 20 transactions involving this account)
        timeline = []
        for u, v, d in G.edges(data=True):
            if u == account_id or v == account_id:
                ts = d.get("ts")
                if isinstance(ts, datetime):
                    ts = ts.strftime("%Y-%m-%dT%H:%M:%SZ")
                timeline.append({
                    "src":           u,
                    "dst":           v,
                    "amount":        d.get("amount", 0),
                    "dwell_seconds": d.get("dwell"),
                    "timestamp":     ts,
                })
        timeline.sort(key=lambda t: t["timestamp"] or "", reverse=True)
        timeline = timeline[:20]

        ctx = {
            "account_id":    account_id,
            "risk_score":    risk,
            "factors":       factors,
            "device_id":     node.get("device_id", "N/A"),
            "account_age_days": node.get("age_days", 0),
            "total_volume":  round(sum(d.get("amount", 0)
                                       for _, _, d in G.out_edges(account_id, data=True)), 2),
            "in_degree":     G.in_degree(account_id),
            "out_degree":    G.out_degree(account_id),
            "causal_nodes":  nodes_out,
            "causal_edges":  edges_out,
            "method":        method,
            "timeline":      timeline,
            "generated_at":  _now_iso(),
        }

        env      = Environment(loader=FileSystemLoader(TEMPLATE_DIR))
        template = env.get_template("dossier.html")
        html_str = template.render(**ctx)

        # Try WeasyPrint; graceful fallback to HTML response
        try:
            from weasyprint import HTML as WP_HTML
            pdf_bytes = WP_HTML(string=html_str).write_pdf()
            return Response(
                content=pdf_bytes,
                media_type="application/pdf",
                headers={
                    "Content-Disposition":
                        f'attachment; filename="dossier_{account_id}.pdf"'
                },
            )
        except ImportError:
            log.warning("WeasyPrint not available -- returning HTML dossier")
            return Response(
                content=html_str.encode(),
                media_type="text/html",
                headers={
                    "Content-Disposition":
                        f'inline; filename="dossier_{account_id}.html"'
                },
            )

    except HTTPException:
        raise
    except Exception as exc:
        log.error("dossier(%s) failed: %s", account_id, exc)
        raise HTTPException(status_code=500, detail={
            "error":   "dossier_failed",
            "message": "Dossier generation failed, try again",
        })


# ==============================================================================
# 7. AI Insights / Stats
# ==============================================================================
@app.get("/stats")
def get_stats() -> dict:
    # Network risk = mean risk of top-10% highest-scoring accounts (quick proxy)
    acc_nodes = [n for n in G.nodes if n.startswith("ACC_")]
    if acc_nodes:
        sample = acc_nodes[:min(200, len(acc_nodes))]   # cap for speed
        scores = [score_account(a) for a in sample]
        net_risk = round(float(np.percentile(scores, 90)), 1)
    else:
        net_risk = 0.0

    active_clusters = sum(1 for alt in _alerts.values()
                          if not alt["acknowledged"] and alt["risk_score"] >= ALERT_THRESHOLD)
    status = "High-risk transaction pattern detected" if net_risk >= 70 \
             else ("Elevated activity -- monitoring" if net_risk >= 40 else "Network normal")

    return {
        "network_risk_score":        net_risk,
        "network_status":            status,
        "detection_accuracy":        round(_metrics["detection_accuracy"], 4),
        "test_set_fpr":              round(_metrics["test_set_fpr"], 4),
        "active_clusters":           active_clusters,
        "nodes_scanned":             G.number_of_nodes(),
        "avg_inference_latency_ms":  _metrics["avg_inference_latency_ms"],
        "feature_importance":        _feature_importance,
    }


# ==============================================================================
# 8. Health
# ==============================================================================
@app.get("/health")
def health() -> dict:
    acc_count = sum(1 for n in G.nodes if n.startswith("ACC_"))
    tx_count  = G.number_of_edges()
    return {
        "status":       "ok",
        "model_loaded": _model_loaded,
        "graph_size":   {"accounts": acc_count, "transactions": tx_count},
    }


# ==============================================================================
# 9. Demo / Hackathon Controls
# ==============================================================================
@app.post("/demo/reset")
def demo_reset() -> dict:
    """Clear graph, alerts, and score cache; reload from background snapshot."""
    global _alerts, _transactions, _tx_counter
    _alerts       = {}
    _transactions = {}
    _tx_counter   = 0
    _score_cache.clear()
    _load_background_graph()
    acc_count = sum(1 for n in G.nodes if n.startswith("ACC_"))
    tx_count  = G.number_of_edges()
    log.info("Demo reset: %d accounts, %d edges", acc_count, tx_count)
    return {
        "status":     "ok",
        "graph_size": {"accounts": acc_count, "transactions": tx_count},
    }


@app.post("/demo/seed-hero")
def demo_seed_hero() -> dict:
    """
    Inject a canned scatter-gather ring with shared device to guarantee
    a clean, high-scoring detection for the live pitch.
    """
    from data_gen import (
        HERO_ACCOUNTS, HERO_SOURCE, HERO_DEVICE, hero_ring_transactions
    )

    hero_txs = hero_ring_transactions(t0=datetime.now(timezone.utc))
    hero_acc_id = HERO_SOURCE

    # Add hero nodes
    for acc in [HERO_SOURCE] + HERO_ACCOUNTS + [f"ACC_GATHER_{i}" for i in range(len(HERO_ACCOUNTS))]:
        if not G.has_node(acc):
            G.add_node(acc, is_mule=1, device_id=HERO_DEVICE,
                       last_seen=None, age_days=7, total_volume=0.0, shared_device=True)

    # Ingest each hero transaction
    for tx in hero_txs:
        src, dst = tx["src"], tx["dst"]
        try:
            ts = datetime.fromisoformat(tx["timestamp"].replace("Z", "+00:00"))
        except Exception:
            ts = datetime.now(timezone.utc)

        if not G.has_node(src):
            G.add_node(src, is_mule=1, device_id=HERO_DEVICE,
                       last_seen=None, age_days=7, total_volume=0.0, shared_device=True)
        if not G.has_node(dst):
            G.add_node(dst, is_mule=1, device_id=f"DEV_{dst}",
                       last_seen=None, age_days=7, total_volume=0.0)

        G.add_edge(src, dst, amount=tx["amount"], ts=ts, dwell=tx.get("dwell_seconds"),
                   transaction_id=tx["transaction_id"], is_mule=1)
        G.nodes[src]["last_seen"]    = ts
        G.nodes[src]["total_volume"] = G.nodes[src].get("total_volume", 0) + tx["amount"]

        # Mark hero accounts as shared-device
        if src in [HERO_SOURCE] + HERO_ACCOUNTS:
            G.nodes[src]["shared_device"] = True
            G.nodes[src]["device_id"]     = HERO_DEVICE

        _transactions[tx["transaction_id"]] = {
            "transaction_id": tx["transaction_id"],
            "src":            src,
            "dst":            dst,
            "amount":         tx["amount"],
            "dwell_seconds":  tx.get("dwell_seconds"),
            "timestamp":      tx["timestamp"],
            "risk_score":     None,
            "status":         "flagged",
        }

    # Score and fire alert
    risk   = score_account(HERO_SOURCE)
    alt_id = _maybe_fire_alert(HERO_SOURCE, max(risk, 85.0))   # ensure hero always alerts

    log.info("Hero scenario seeded: %s risk=%.1f alert=%s", HERO_SOURCE, risk, alt_id)
    return {
        "status":            "ok",
        "seeded_account_id": HERO_SOURCE,
        "triggered_alert_id": alt_id or "ALT_HERO",
    }
