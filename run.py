"""
FraudNexus Root Application Launcher
"""

import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.db.seed_data import seed_database
from app.server import run_server

if __name__ == "__main__":
    print("[FraudNexus] Initializing FraudNexus Intelligence Platform...")
    seed_database()
    run_server(port=8000)
