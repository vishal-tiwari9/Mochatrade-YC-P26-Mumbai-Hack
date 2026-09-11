"""
data_gen.py -- MuleNet synthetic transaction graph generator.

Generates ~3,000 accounts with ~90% normal traffic and ~10% planted mule rings
following the exact 4-stage playbook: deposit -> scatter -> gather -> cash-out.
Device IDs are assigned so ~15% of mule accounts within a ring share a device.

Outputs (written to data/):
  transactions.json  -- list of transaction dicts
  labels.json        -- dict mapping account_id -> is_mule (0|1)
  devices.json       -- dict mapping account_id -> device_id
"""

import json
import random
import os
from datetime import datetime, timedelta

import numpy as np

random.seed(42)
np.random.seed(42)

# -- Constants ----------------------------------------------------------------
N_ACCOUNTS     = 3000
N_NORMAL_TX    = 15000
N_RINGS        = 40
START          = datetime(2026, 1, 1)
WINDOW_SECONDS = 60 * 60 * 24 * 90   # 90-day window
DATA_DIR       = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(DATA_DIR, exist_ok=True)


# -- Account pool -------------------------------------------------------------
accounts: list[str] = [f"ACC_{i}" for i in range(N_ACCOUNTS)]


# -- Normal traffic ------------------------------------------------------------
def normal_traffic(accounts: list[str], n_tx: int = N_NORMAL_TX) -> list[dict]:
    """Generate background P2P transactions with lognormal amounts and
    exponential dwell times (legitimate money sits around for hours/days)."""
    rows: list[dict] = []
    for tx_idx in range(n_tx):
        src, dst = random.sample(accounts, 2)
        amount   = float(np.random.lognormal(mean=8, sigma=1.2))
        ts       = START + timedelta(seconds=random.randint(0, WINDOW_SECONDS))
        # Legitimate money sits around for hours/days -- exponential with mean 8h
        dwell    = float(np.random.exponential(scale=3600 * 8))
        rows.append(dict(
            transaction_id = f"TXN_{tx_idx:06d}",
            src            = src,
            dst            = dst,
            amount         = round(amount, 2),
            timestamp      = ts.isoformat() + "Z",
            dwell_seconds  = round(dwell, 2),
            is_mule        = 0,
            hop_index      = 0,
        ))
    return rows


# -- Mule ring -----------------------------------------------------------------
_tx_counter = N_NORMAL_TX   # global counter to keep transaction_id unique

def mule_ring(accounts_pool: list[str], ring_id: int) -> tuple[list[dict], set[str]]:
    """
    Plant one mule ring following the 4-stage playbook:
      1. Source deposit (a large stolen-funds transfer into the source)
      2. Scatter: fans out to 3-6 mule accounts, ΔT ≈ 1-5 s
      3. Gather: 2-4 further hops, ΔT still low (1-8 s) -- core fraud signature
      4. Cash-out: terminal transfer to OFFRAMP_<ring_id>
    Returns the transaction rows and the set of ring account IDs.
    """
    global _tx_counter
    rows: list[dict] = []
    ring_accounts: set[str] = set()

    source  = random.choice(accounts_pool)
    fanout  = random.randint(3, 6)
    mules   = random.sample([a for a in accounts_pool if a != source], fanout)
    stolen  = float(np.random.uniform(20_000, 100_000))
    split   = stolen / fanout
    t0      = START + timedelta(seconds=random.randint(0, WINDOW_SECONDS - 3600))

    ring_accounts.add(source)
    ring_accounts.update(mules)

    # -- Stage 1: deposit into source (one large inbound) ------------------
    sender = f"ACC_{random.randint(0, N_ACCOUNTS - 1)}"
    rows.append(dict(
        transaction_id = f"TXN_{_tx_counter:06d}",
        src            = sender,
        dst            = source,
        amount         = round(stolen, 2),
        timestamp      = (t0 - timedelta(seconds=random.randint(60, 3600))).isoformat() + "Z",
        dwell_seconds  = round(float(np.random.exponential(3600)), 2),
        is_mule        = 1,
        hop_index      = 0,
    ))
    _tx_counter += 1

    # -- Stage 2: scatter -------------------------------------------------
    for i, m in enumerate(mules):
        rows.append(dict(
            transaction_id = f"TXN_{_tx_counter:06d}",
            src            = source,
            dst            = m,
            amount         = round(split, 2),
            timestamp      = (t0 + timedelta(seconds=i)).isoformat() + "Z",
            dwell_seconds  = round(random.uniform(1, 5), 2),
            is_mule        = 1,
            hop_index      = 1,
        ))
        _tx_counter += 1

    # -- Stage 3: gather (2-4 hops) ---------------------------------------
    current = mules[:]
    for hop in range(random.randint(2, 4)):
        nxt: list[str] = random.sample(
            [a for a in accounts_pool if a not in ring_accounts],
            len(current)
        )
        for a, b in zip(current, nxt):
            rows.append(dict(
                transaction_id = f"TXN_{_tx_counter:06d}",
                src            = a,
                dst            = b,
                amount         = round(split * random.uniform(0.9, 1.0), 2),
                timestamp      = (t0 + timedelta(minutes=hop + 1)).isoformat() + "Z",
                dwell_seconds  = round(random.uniform(1, 8), 2),
                is_mule        = 1,
                hop_index      = hop + 2,
            ))
            _tx_counter += 1
        ring_accounts.update(nxt)
        current = nxt

    # -- Stage 4: cash-out -------------------------------------------------
    offramp = f"OFFRAMP_{ring_id}"
    for a in current:
        rows.append(dict(
            transaction_id = f"TXN_{_tx_counter:06d}",
            src            = a,
            dst            = offramp,
            amount         = round(split, 2),
            timestamp      = (t0 + timedelta(minutes=10)).isoformat() + "Z",
            dwell_seconds  = round(random.uniform(1, 10), 2),
            is_mule        = 1,
            hop_index      = 99,   # sentinel for cash-out stage
        ))
        _tx_counter += 1

    return rows, ring_accounts


# -- Device assignment ---------------------------------------------------------
def assign_devices(accounts: list[str], mule_labels: set[str]) -> dict[str, str]:
    """
    Give every account a unique device ID.
    Then, for ~60% of contiguous 6-account slices in the mule list,
    override ~half of those accounts to share a single device fingerprint.
    This plants the 'ghost emulator farm' signal (~15% of mule accounts sharing).
    """
    devices: dict[str, str] = {a: f"DEV_{i}" for i, a in enumerate(accounts)}
    # Add OFFRAMP virtual accounts -- give each a unique device
    for i, a in enumerate(
        set(d for tx_list in [] for d in []) | set()
    ):
        devices.setdefault(a, f"DEV_OFFRAMP_{i}")

    mule_list = list(mule_labels & set(accounts))   # only real ACC_ nodes
    random.shuffle(mule_list)

    shared_count = 0
    total_mules  = len(mule_list)
    for ring_start in range(0, len(mule_list), 6):
        ring_slice = mule_list[ring_start: ring_start + 6]
        if random.random() < 0.60 and len(ring_slice) >= 2:
            shared_dev = f"DEV_SHARED_{ring_start}"
            targets    = random.sample(ring_slice, max(2, len(ring_slice) // 2))
            for a in targets:
                devices[a] = shared_dev
                shared_count += 1

    actual_pct = shared_count / total_mules * 100 if total_mules else 0
    print(f"  Device-sharing: {shared_count}/{total_mules} mule accounts share a device ({actual_pct:.1f}%)")
    return devices


# -- Hero scenario accounts (used by demo/seed-hero) --------------------------
HERO_ACCOUNTS = [
    "ACC_HERO_1", "ACC_HERO_2", "ACC_HERO_3",
    "ACC_HERO_4", "ACC_HERO_5", "ACC_HERO_6",
]
HERO_SOURCE  = "ACC_HERO_SOURCE"
HERO_DEVICE  = "DEV_HERO_SHARED"


def hero_ring_transactions(t0: datetime | None = None) -> list[dict]:
    """
    Canned hero scenario: rapid scatter-gather with shared device.
    Always produces a high-scoring detection for the live pitch.
    t0 defaults to now so timestamps look fresh.
    """
    global _tx_counter
    if t0 is None:
        t0 = datetime.utcnow()
    rows: list[dict] = []

    # Deposit
    rows.append(dict(
        transaction_id = f"TXN_{_tx_counter:06d}",
        src            = "ACC_EXTERNAL",
        dst            = HERO_SOURCE,
        amount         = 75000.0,
        timestamp      = (t0 - timedelta(seconds=120)).isoformat() + "Z",
        dwell_seconds  = 120.0,
        is_mule        = 1,
        hop_index      = 0,
    ))
    _tx_counter += 1

    # Scatter (6 mules, ΔT ≈ 1 s each)
    for i, m in enumerate(HERO_ACCOUNTS):
        rows.append(dict(
            transaction_id = f"TXN_{_tx_counter:06d}",
            src            = HERO_SOURCE,
            dst            = m,
            amount         = round(75000.0 / 6, 2),
            timestamp      = (t0 + timedelta(seconds=i + 1)).isoformat() + "Z",
            dwell_seconds  = round(i + 1.0, 2),
            is_mule        = 1,
            hop_index      = 1,
        ))
        _tx_counter += 1

    # Gather (1 hop)
    for i, m in enumerate(HERO_ACCOUNTS):
        rows.append(dict(
            transaction_id = f"TXN_{_tx_counter:06d}",
            src            = m,
            dst            = f"ACC_GATHER_{i}",
            amount         = round(75000.0 / 6 * 0.98, 2),
            timestamp      = (t0 + timedelta(minutes=2)).isoformat() + "Z",
            dwell_seconds  = round(random.uniform(2, 6), 2),
            is_mule        = 1,
            hop_index      = 2,
        ))
        _tx_counter += 1

    # Cash-out
    for i in range(len(HERO_ACCOUNTS)):
        rows.append(dict(
            transaction_id = f"TXN_{_tx_counter:06d}",
            src            = f"ACC_GATHER_{i}",
            dst            = "OFFRAMP_HERO",
            amount         = round(75000.0 / 6 * 0.97, 2),
            timestamp      = (t0 + timedelta(minutes=10)).isoformat() + "Z",
            dwell_seconds  = round(random.uniform(1, 5), 2),
            is_mule        = 1,
            hop_index      = 99,
        ))
        _tx_counter += 1

    return rows


# -- Main generation pipeline --------------------------------------------------
def generate() -> None:
    print("=" * 60)
    print("MuleNet - Synthetic Data Generator")
    print("=" * 60)

    # 1. Normal traffic
    print(f"\n[1/5] Generating {N_NORMAL_TX:,} normal transactions ...")
    all_rows: list[dict] = normal_traffic(accounts, N_NORMAL_TX)

    # 2. Mule rings
    print(f"[2/5] Planting {N_RINGS} mule rings ...")
    mule_labels: set[str] = set()
    for i in range(N_RINGS):
        rows, ring = mule_ring(accounts, i)
        all_rows  += rows
        mule_labels |= ring

    mule_in_pool = mule_labels & set(accounts)
    print(f"  Mule accounts (in ACC_ pool): {len(mule_in_pool):,} / {N_ACCOUNTS:,} "
          f"({len(mule_in_pool)/N_ACCOUNTS*100:.1f}%)")

    # 3. Device assignment
    print("[3/5] Assigning device fingerprints ...")
    devices: dict[str, str] = assign_devices(accounts, mule_labels)
    # Hero accounts all share a single device
    for a in HERO_ACCOUNTS + [HERO_SOURCE]:
        devices[a] = HERO_DEVICE

    # 4. Label map (all accounts in pool)
    print("[4/5] Building label map ...")
    labels: dict[str, int] = {a: (1 if a in mule_labels else 0) for a in accounts}

    # 5. Persist
    print("[5/5] Saving to data/ ...")
    with open(os.path.join(DATA_DIR, "transactions.json"), "w") as f:
        json.dump(all_rows, f, indent=2)
    with open(os.path.join(DATA_DIR, "labels.json"), "w") as f:
        json.dump(labels, f, indent=2)
    with open(os.path.join(DATA_DIR, "devices.json"), "w") as f:
        json.dump(devices, f, indent=2)

    # Stats
    n_mule_tx = sum(1 for r in all_rows if r["is_mule"] == 1)
    print(f"\n{'-'*40}")
    print(f"  Total transactions : {len(all_rows):,}")
    print(f"  Mule transactions  : {n_mule_tx:,} ({n_mule_tx/len(all_rows)*100:.1f}%)")
    print(f"  Mule accounts      : {len(mule_in_pool):,} ({len(mule_in_pool)/N_ACCOUNTS*100:.1f}%)")
    print(f"  Total devices      : {len(set(devices.values())):,}")
    print(f"\n  data/transactions.json -- {len(all_rows):,} rows")
    print(f"  data/labels.json       -- {len(labels):,} entries")
    print(f"  data/devices.json      -- {len(devices):,} entries")
    print("=" * 60)
    print("Done.")


if __name__ == "__main__":
    generate()
