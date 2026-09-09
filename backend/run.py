"""
FraudNexus Launcher
Initializes the database, verifies integrity, and launches the server.
"""

import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.db.seed_data import seed_database
from app.server import run_server

if __name__ == "__main__":
    print("[FraudNexus] Verifying and seeding SQLite intelligence database...")
    seed_database()
    print("[FraudNexus] Initialized successfully. Starting API service...")
    run_server(port=8000)
