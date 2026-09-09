"""
FraudNexus Database Connection & Schema Management
Uses SQLite for self-contained, lightning-fast, zero-dependency persistence.
"""

import sqlite3
import os
from pathlib import Path
from typing import Optional

DB_FILE = Path(__file__).resolve().parent.parent.parent / "fraudnexus.db"

def get_connection(db_path: Optional[str] = None) -> sqlite3.Connection:
    target_path = db_path or str(DB_FILE)
    conn = sqlite3.connect(target_path, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db(db_path: Optional[str] = None):
    conn = get_connection(db_path)
    cursor = conn.cursor()

    cursor.executescript("""
    CREATE TABLE IF NOT EXISTS devices (
        device_id TEXT PRIMARY KEY,
        device_fingerprint TEXT NOT NULL,
        os_info TEXT,
        ip_address TEXT,
        is_flagged INTEGER DEFAULT 0,
        first_seen TEXT,
        last_seen TEXT
    );

    CREATE TABLE IF NOT EXISTS phones (
        phone_number TEXT PRIMARY KEY,
        carrier TEXT,
        is_flagged INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS upis (
        upi_id TEXT PRIMARY KEY,
        handle TEXT,
        bank_name TEXT,
        is_flagged INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS beneficiaries (
        beneficiary_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        account_number TEXT,
        ifsc TEXT,
        is_flagged INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS accounts (
        account_id TEXT PRIMARY KEY,
        holder_name TEXT NOT NULL,
        risk_tier TEXT DEFAULT 'LOW',
        is_flagged INTEGER DEFAULT 0,
        phone_number TEXT,
        upi_id TEXT,
        device_id TEXT,
        pan_number TEXT,
        created_at TEXT,
        FOREIGN KEY (phone_number) REFERENCES phones(phone_number),
        FOREIGN KEY (upi_id) REFERENCES upis(upi_id),
        FOREIGN KEY (device_id) REFERENCES devices(device_id)
    );

    CREATE TABLE IF NOT EXISTS transactions (
        transaction_id TEXT PRIMARY KEY,
        account_id TEXT NOT NULL,
        device_id TEXT,
        phone_number TEXT,
        upi_id TEXT,
        beneficiary_id TEXT,
        amount REAL NOT NULL,
        currency TEXT DEFAULT 'INR',
        timestamp TEXT NOT NULL,
        status TEXT DEFAULT 'COMPLETED',
        channel TEXT DEFAULT 'UPI',
        lat REAL,
        lon REAL,
        FOREIGN KEY (account_id) REFERENCES accounts(account_id),
        FOREIGN KEY (device_id) REFERENCES devices(device_id),
        FOREIGN KEY (phone_number) REFERENCES phones(phone_number),
        FOREIGN KEY (upi_id) REFERENCES upis(upi_id),
        FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(beneficiary_id)
    );

    CREATE TABLE IF NOT EXISTS fraud_cases (
        case_id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        status TEXT DEFAULT 'ACTIVE',
        description TEXT,
        created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS case_entity_links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        case_id TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        reason TEXT,
        FOREIGN KEY (case_id) REFERENCES fraud_cases(case_id)
    );

    CREATE TABLE IF NOT EXISTS risk_assessments (
        assessment_id TEXT PRIMARY KEY,
        transaction_id TEXT NOT NULL,
        score INTEGER NOT NULL,
        severity TEXT NOT NULL,
        confidence TEXT NOT NULL,
        calculated_at TEXT NOT NULL,
        raw_json TEXT NOT NULL,
        FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id)
    );

    CREATE TABLE IF NOT EXISTS money_flow_edges (
        edge_id TEXT PRIMARY KEY,
        case_id TEXT,
        from_entity TEXT NOT NULL,
        to_entity TEXT NOT NULL,
        amount REAL NOT NULL,
        timestamp TEXT NOT NULL,
        edge_type TEXT NOT NULL,
        hop_order INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS timeline_events (
        event_id TEXT PRIMARY KEY,
        transaction_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        severity TEXT NOT NULL,
        FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id)
    );

    CREATE TABLE IF NOT EXISTS investigation_sessions (
        investigation_id TEXT PRIMARY KEY,
        root_id TEXT NOT NULL,
        root_type TEXT NOT NULL,
        title TEXT NOT NULL,
        created_at TEXT NOT NULL,
        status TEXT DEFAULT 'OPEN'
    );

    CREATE TABLE IF NOT EXISTS investigation_notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        investigation_id TEXT NOT NULL,
        note_text TEXT NOT NULL,
        author TEXT DEFAULT 'Lead Investigator',
        created_at TEXT NOT NULL,
        FOREIGN KEY (investigation_id) REFERENCES investigation_sessions(investigation_id)
    );

    CREATE TABLE IF NOT EXISTS investigation_findings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        investigation_id TEXT NOT NULL,
        item_type TEXT NOT NULL,
        item_id TEXT NOT NULL,
        label TEXT NOT NULL,
        is_important INTEGER DEFAULT 1,
        reason TEXT,
        added_at TEXT NOT NULL,
        FOREIGN KEY (investigation_id) REFERENCES investigation_sessions(investigation_id)
    );

    CREATE TABLE IF NOT EXISTS investigation_evidence (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        investigation_id TEXT NOT NULL,
        title TEXT NOT NULL,
        details TEXT NOT NULL,
        source TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (investigation_id) REFERENCES investigation_sessions(investigation_id)
    );

    CREATE TABLE IF NOT EXISTS investigation_audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        investigation_id TEXT NOT NULL,
        action_type TEXT NOT NULL,
        entity_id TEXT,
        details TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (investigation_id) REFERENCES investigation_sessions(investigation_id)
    );
    """)

    conn.commit()
    conn.close()
