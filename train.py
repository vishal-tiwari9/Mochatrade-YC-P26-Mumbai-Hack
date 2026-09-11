"""
train.py -- MuleNet PyTorch Geometric model training.

Loads synthetic graph data, constructs a HeteroData object, trains a 2-layer
heterogeneous GraphSAGE model via to_hetero, evaluates on a stratified test
split, and saves the checkpoint to mulenet_model.pt.

Prints:
  - Epoch losses
  - Held-out accuracy, precision, recall, F1
  - False-Positive Rate (FPR) -- required by spec
  - Inference latency on a k-hop subgraph

Saves:
  - mulenet_model.pt         (model state dict + metadata)
  - data/hetero_data.pt      (serialized HeteroData for reference)
  - data/account_ids.json    (ordered list -- needed by main.py)
"""

import json
import os
import time

import numpy as np
import torch
import torch.nn.functional as F
from torch import Tensor
from torch_geometric.data import HeteroData
from torch_geometric.nn import SAGEConv, to_hetero
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix,
)

DATA_DIR   = os.path.join(os.path.dirname(__file__), "data")
MODEL_PATH = os.path.join(os.path.dirname(__file__), "mulenet_model.pt")
HIDDEN     = 64
EPOCHS     = 300
LR         = 0.005
TEST_FRAC  = 0.20
SEED       = 42

torch.manual_seed(SEED)
np.random.seed(SEED)


# ==============================================================================
# 1. Load data
# ==============================================================================
print("=" * 60)
print("MuleNet -- Model Training")
print("=" * 60)

print("\n[1/6] Loading data ...")
with open(os.path.join(DATA_DIR, "transactions.json")) as f:
    all_rows: list[dict] = json.load(f)
with open(os.path.join(DATA_DIR, "labels.json")) as f:
    labels_map: dict[str, int] = json.load(f)
with open(os.path.join(DATA_DIR, "devices.json")) as f:
    devices_map: dict[str, str] = json.load(f)

print(f"  Transactions : {len(all_rows):,}")
print(f"  Accounts     : {len(labels_map):,}")
print(f"  Devices      : {len(set(devices_map.values())):,}")


# ==============================================================================
# 2. Build node/edge index maps
# ==============================================================================
print("\n[2/6] Building index maps ...")

# Only keep real ACC_ nodes (not OFFRAMP_*)
account_ids: list[str] = sorted(
    a for a in labels_map.keys() if a.startswith("ACC_")
)
acc_idx: dict[str, int] = {a: i for i, a in enumerate(account_ids)}

device_ids: list[str] = sorted(set(devices_map.values()))
dev_idx: dict[str, int] = {d: i for i, d in enumerate(device_ids)}

print(f"  Account nodes : {len(account_ids):,}")
print(f"  Device nodes  : {len(device_ids):,}")


# ==============================================================================
# 3. Compute node features
# ==============================================================================
print("\n[3/6] Computing node features ...")

# -- Account features: in_degree, out_degree, total_volume, mean_dwell,
#                     account_age_days, is_new_account ----------------------
acc_feat: dict[str, dict] = {a: {
    "in_deg": 0, "out_deg": 0, "volume": 0.0,
    "dwell_sum": 0.0, "dwell_cnt": 0,
} for a in account_ids}

for r in all_rows:
    if r["src"] in acc_feat:
        acc_feat[r["src"]]["out_deg"]   += 1
        acc_feat[r["src"]]["volume"]    += r["amount"]
    if r["dst"] in acc_feat:
        acc_feat[r["dst"]]["in_deg"]    += 1
        acc_feat[r["dst"]]["volume"]    += r["amount"]
        if r["dwell_seconds"] is not None:
            acc_feat[r["dst"]]["dwell_sum"] += r["dwell_seconds"]
            acc_feat[r["dst"]]["dwell_cnt"] += 1

# Assign synthetic account ages (days since account open)
np.random.seed(SEED)
account_ages: dict[str, int] = {
    a: int(np.random.randint(1, 365)) for a in account_ids
}

acc_feats = []
# Build a reverse map: account -> linked accounts sharing its device
dev_to_accounts: dict[str, list[str]] = {}
for a, d in devices_map.items():
    dev_to_accounts.setdefault(d, []).append(a)

for a in account_ids:
    f = acc_feat[a]
    mean_dwell    = (f["dwell_sum"] / f["dwell_cnt"]) if f["dwell_cnt"] > 0 else 0.0
    age           = account_ages[a]
    is_new        = 1.0 if age <= 30 else 0.0
    dev_id        = devices_map.get(a, "")
    # is_shared_device: 1 if this account's device is linked to >1 account
    shared_peers  = len(dev_to_accounts.get(dev_id, [])) - 1
    is_shared_dev = 1.0 if shared_peers > 0 else 0.0
    acc_feats.append([
        float(f["in_deg"]),
        float(f["out_deg"]),
        float(f["volume"]) / 1e6,   # scale to ~1
        float(mean_dwell) / 3600,   # scale to hours
        float(age) / 365,           # scale to years
        is_new,
        is_shared_dev,              # ghost-emulator-farm signal
    ])

# -- Device features: linked_accounts, device_age -------------------------
dev_linked: dict[str, int] = {d: 0 for d in device_ids}
for a, d in devices_map.items():
    if a in acc_idx and d in dev_idx:
        dev_linked[d] += 1

np.random.seed(SEED + 1)
device_ages: dict[str, int] = {d: int(np.random.randint(1, 730)) for d in device_ids}

device_feats: list[list[float]] = []
for d in device_ids:
    device_feats.append([
        float(dev_linked[d]),
        float(device_ages[d]) / 730,
    ])

acc_x = torch.tensor(acc_feats,  dtype=torch.float)
dev_x = torch.tensor(device_feats, dtype=torch.float)
print(f"  Account feature shape : {acc_x.shape}")
print(f"  Device feature shape  : {dev_x.shape}")


# ==============================================================================
# 4. Build HeteroData
# ==============================================================================
print("\n[4/6] Constructing HeteroData ...")

data = HeteroData()
data["account"].x = acc_x
data["account"].y = torch.tensor(
    [labels_map.get(a, 0) for a in account_ids], dtype=torch.long
)
data["device"].x = dev_x

# (account, transacts, account) edges
tx_src, tx_dst = [], []
for r in all_rows:
    if r["src"] in acc_idx and r["dst"] in acc_idx:
        tx_src.append(acc_idx[r["src"]])
        tx_dst.append(acc_idx[r["dst"]])

data["account", "transacts", "account"].edge_index = torch.tensor(
    [tx_src, tx_dst], dtype=torch.long
)

# (account, uses, device) edges
use_src, use_dst = [], []
for a, d in devices_map.items():
    if a in acc_idx and d in dev_idx:
        use_src.append(acc_idx[a])
        use_dst.append(dev_idx[d])

data["account", "uses", "device"].edge_index = torch.tensor(
    [use_src, use_dst], dtype=torch.long
)

print(f"  Edge (transacts) : {len(tx_src):,}")
print(f"  Edge (uses)      : {len(use_src):,}")
print(f"  Metadata         : {data.metadata()}")

# Save HeteroData for reference
torch.save(data, os.path.join(DATA_DIR, "hetero_data.pt"))


# ==============================================================================
# 5. Train
# ==============================================================================
print("\n[5/6] Training ...")

# Stratified train/test split on account indices
labels_np = data["account"].y.numpy()
all_idx   = np.arange(len(account_ids))
train_idx, test_idx = train_test_split(
    all_idx, test_size=TEST_FRAC,
    stratify=labels_np, random_state=SEED
)
train_mask = torch.zeros(len(account_ids), dtype=torch.bool)
test_mask  = torch.zeros(len(account_ids), dtype=torch.bool)
train_mask[train_idx] = True
test_mask[test_idx]   = True

print(f"  Train : {train_mask.sum().item():,} accounts  "
      f"({train_mask.sum().item()/len(account_ids)*100:.0f}%)")
print(f"  Test  : {test_mask.sum().item():,}  accounts  "
      f"({test_mask.sum().item()/len(account_ids)*100:.0f}%)")
print(f"  Label balance (train): "
      f"{data['account'].y[train_mask].float().mean().item()*100:.1f}% mule")


# -- Model definition ----------------------------------------------------------
class SAGE(torch.nn.Module):
    def __init__(self, hidden: int = HIDDEN, out: int = 1):
        super().__init__()
        self.conv1 = SAGEConv((-1, -1), hidden)
        self.conv2 = SAGEConv((-1, -1), out)

    def forward(self, x: Tensor, edge_index: Tensor) -> Tensor:
        x = self.conv1(x, edge_index).relu()
        return self.conv2(x, edge_index)


model = to_hetero(SAGE(), data.metadata(), aggr="sum")
optimizer = torch.optim.Adam(model.parameters(), lr=LR, weight_decay=1e-4)
scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=EPOCHS, eta_min=1e-5)

# Class weights to counter imbalance (~10% mule)
n_pos = int(data["account"].y[train_mask].sum().item())
n_neg = int(train_mask.sum().item()) - n_pos
pos_weight = torch.tensor([n_neg / max(n_pos, 1)], dtype=torch.float)
print(f"  pos_weight for BCE : {pos_weight.item():.2f}")

best_loss  = float("inf")
best_state = None

for epoch in range(1, EPOCHS + 1):
    model.train()
    optimizer.zero_grad()
    out  = model(data.x_dict, data.edge_index_dict)["account"].squeeze(-1)
    loss = F.binary_cross_entropy_with_logits(
        out[train_mask],
        data["account"].y[train_mask].float(),
        pos_weight=pos_weight,
    )
    loss.backward()
    optimizer.step()

    if loss.item() < best_loss:
        best_loss  = loss.item()
        best_state = {k: v.clone() for k, v in model.state_dict().items()}

    scheduler.step()

    if epoch % 30 == 0:
        print(f"  Epoch {epoch:3d} | loss = {loss.item():.4f} | lr = {scheduler.get_last_lr()[0]:.6f}")

# Restore best
model.load_state_dict(best_state)


# ==============================================================================
# 6. Evaluate
# ==============================================================================
print("\n[6/6] Evaluating on test set ...")
model.eval()
with torch.no_grad():
    # Latency measurement
    t0    = time.perf_counter()
    logits = model(data.x_dict, data.edge_index_dict)["account"].squeeze(-1)
    lat_ms = (time.perf_counter() - t0) * 1000

    probs  = torch.sigmoid(logits)
    preds  = (probs > 0.5).long()

    y_true = data["account"].y[test_mask].numpy()
    y_pred = preds[test_mask].numpy()
    y_prob = probs[test_mask].numpy()

cm  = confusion_matrix(y_true, y_pred)
tn, fp, fn, tp = cm.ravel() if cm.size == 4 else (cm[0, 0], 0, 0, cm[0, 0])
fpr = fp / max(fp + tn, 1)

acc  = accuracy_score(y_true, y_pred)
prec = precision_score(y_true, y_pred, zero_division=0)
rec  = recall_score(y_true, y_pred, zero_division=0)
f1   = f1_score(y_true, y_pred, zero_division=0)

print(f"\n{'-'*40}")
print(f"  Accuracy  : {acc*100:.2f}%")
print(f"  Precision : {prec*100:.2f}%")
print(f"  Recall    : {rec*100:.2f}%")
print(f"  F1        : {f1:.4f}")
print(f"  FPR       : {fpr*100:.2f}%   <- measured on held-out test set")
print(f"  TP={tp}, FP={fp}, FN={fn}, TN={tn}")
print(f"  Full-graph inference latency : {lat_ms:.1f} ms")
print(f"{'-'*40}")

# Save checkpoint with metadata
checkpoint = {
    "model_state": best_state,
    "metadata":    data.metadata(),
    "account_ids": account_ids,
    "device_ids":  device_ids,
    "n_acc_feats": acc_x.shape[1],
    "n_dev_feats": dev_x.shape[1],
    "metrics": {
        "accuracy":          float(acc),
        "precision":         float(prec),
        "recall":            float(rec),
        "f1":                float(f1),
        "fpr":               float(fpr),
        "inference_lat_ms":  float(lat_ms),
    },
}
torch.save(checkpoint, MODEL_PATH)
with open(os.path.join(DATA_DIR, "account_ids.json"), "w") as f:
    json.dump(account_ids, f)

print(f"\n  OK Saved mulenet_model.pt")
print(f"  OK Saved data/account_ids.json")
print("=" * 60)
print("Training complete.")
