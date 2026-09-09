"""
Seed data module for FraudNexus
Creates realistic, high-fidelity Mumbai mule syndicate and baseline benchmark transactions.
"""

import sqlite3
from typing import Optional
from .connection import get_connection, init_db

def seed_database(db_path: Optional[str] = None):
    init_db(db_path)
    conn = get_connection(db_path)
    cursor = conn.cursor()

    # Clear existing demo data to ensure a clean, reproducible state
    cursor.executescript("""
        DELETE FROM case_entity_links;
        DELETE FROM fraud_cases;
        DELETE FROM timeline_events;
        DELETE FROM money_flow_edges;
        DELETE FROM risk_assessments;
        DELETE FROM transactions;
        DELETE FROM accounts;
        DELETE FROM beneficiaries;
        DELETE FROM upis;
        DELETE FROM phones;
        DELETE FROM devices;
    """)

    # 1. Devices
    devices = [
        # DEV-204: Used by the Mumbai mule syndicate across 6 accounts
        ("DEV-204", "fp_mumbai_mule_8a7c2b", "Android 14 / SM-A546B", "103.142.24.18", 1, "2026-08-10 04:12:00", "2026-09-09 18:47:00"),
        ("DEV-012", "fp_clean_user_9918aa", "iOS 18.2 / iPhone 15", "49.36.120.44", 0, "2026-01-15 10:00:00", "2026-09-09 14:20:00"),
        ("DEV-045", "fp_device_r_mehta_55", "Windows 11 / Chrome 128", "152.58.18.204", 0, "2026-05-12 08:30:00", "2026-09-09 16:15:00"),
        ("DEV-078", "fp_syndicate_laptop_77", "Ubuntu 24.04 / Firefox", "103.190.11.5", 0, "2026-07-20 11:00:00", "2026-09-09 17:50:00"),
        ("DEV-VIC-01", "fp_victim_device_22", "iOS 17.5 / iPhone 14", "122.161.45.10", 0, "2024-01-01 09:00:00", "2026-09-09 18:40:00"),
        ("DEV-10021", "fp_clean_phone_10021", "iOS 17.5 / iPhone 13", "49.36.110.12", 0, "2026-03-10 10:00:00", "2026-09-09 11:30:00"),
    ]
    cursor.executemany("INSERT INTO devices VALUES (?, ?, ?, ?, ?, ?, ?)", devices)

    # 2. Phones
    phones = [
        ("+91-98201-44912", "Jio Mumbai", 1),
        ("+91-98201-88301", "Airtel Mumbai", 1),
        ("+91-98201-77210", "Vi Maharashtra", 0),
        ("+91-98201-66441", "Jio Mumbai", 0),
        ("+91-98201-55322", "Airtel Maharashtra", 0),
        ("+91-98201-99884", "Vi Mumbai", 1),
        ("+91-98111-23456", "Airtel Delhi", 0),
        ("+91-98333-65432", "Jio Mumbai", 0),
        ("+91-98777-11223", "Vi Gujarat", 0),
        ("+91-99200-11223", "Airtel Mumbai", 0),
        ("+91-98201-00021", "Jio Mumbai", 0),
    ]
    cursor.executemany("INSERT INTO phones VALUES (?, ?, ?)", phones)

    # 3. UPIs
    upis = [
        # merchant-x@upi: Central laundering funnel
        ("merchant-x@upi", "merchant-x", "ICICI Bank Mumbai", 1),
        ("vikram.sethi@okhdfcbank", "vikram.sethi", "HDFC Bank", 1),
        ("quickpay.mule@axis", "quickpay.mule", "Axis Bank", 1),
        ("pooja.sharma@paytm", "pooja.sharma", "Paytm Payments Bank", 0),
        ("rohan.m@icici", "rohan.m", "ICICI Bank", 0),
        ("sameer.k@ybl", "sameer.k", "Yes Bank", 0),
        ("vandana@okaxis", "vandana", "Axis Bank", 0),
        ("ramesh.v@okhdfcbank", "ramesh.v", "HDFC Bank", 0),
    ]
    cursor.executemany("INSERT INTO upis VALUES (?, ?, ?, ?)", upis)

    # 4. Beneficiaries
    beneficiaries = [
        ("BEN-087", "Apex Digital Solutions / Cyber Shell", "91802003881290", "ICIC0001044", 1),
        ("BEN-012", "Tata Power Mumbai Utility", "00241040001889", "SBIN0000300", 0),
        ("BEN-045", "Chroma Electronics Andheri", "50100288194411", "HDFC0000060", 0),
        ("BEN-078", "FastCash P2P Settlement Hub", "11048899220011", "UTIB0000122", 0),
        ("BEN-LOCAL-09", "Local Grocery Store Dadar", "990011223344", "HDFC0000128", 0),
    ]
    cursor.executemany("INSERT INTO beneficiaries VALUES (?, ?, ?, ?, ?)", beneficiaries)

    # 5. Accounts
    accounts = [
        # Syndicate Accounts connected to DEV-204 (6 accounts)
        ("ACC-104", "Vikram Sethi (Primary Mule)", "CRITICAL", 1, "+91-98201-44912", "merchant-x@upi", "DEV-204", "ABCPS1041K", "2026-06-15 11:20:00"),
        ("ACC-118", "Rajesh Gupta (Layer 2 Mule)", "HIGH", 1, "+91-98201-88301", "merchant-x@upi", "DEV-204", "BRRPG1182M", "2026-06-18 14:10:00"),
        ("ACC-145", "Karan Malhotra (Layer 3 Mule)", "HIGH", 1, "+91-98201-77210", "quickpay.mule@axis", "DEV-204", "CKKM1453P", "2026-07-01 09:30:00"),
        ("ACC-167", "Deepak Verma (P2P Exchanger)", "HIGH", 0, "+91-98201-66441", "merchant-x@upi", "DEV-204", "DJDV1674R", "2026-07-12 16:45:00"),
        ("ACC-189", "Sunil Joshi (Buffer Mule)", "HIGH", 0, "+91-98201-55322", "merchant-x@upi", "DEV-204", "EKSJ1895T", "2026-08-02 12:00:00"),
        ("ACC-203", "Anil Patil (Cash-Out Agent)", "CRITICAL", 1, "+91-98201-99884", "merchant-x@upi", "DEV-204", "FLAP2036V", "2026-08-20 17:15:00"),

        # Baseline Accounts
        ("ACC-012", "Pooja Sharma (Legitimate Retail)", "LOW", 0, "+91-98111-23456", "pooja.sharma@paytm", "DEV-012", "GPPS0127X", "2025-03-10 10:00:00"),
        ("ACC-045", "Rohan Mehta (Moderate Retail)", "MEDIUM", 0, "+91-98333-65432", "rohan.m@icici", "DEV-045", "HQRM0458Z", "2025-11-22 15:40:00"),
        ("ACC-078", "Sameer Khan (High Velocity)", "HIGH", 0, "+91-98777-11223", "sameer.k@ybl", "DEV-078", "JRSK0789B", "2026-04-05 13:25:00"),
        ("ACC-099", "ATM Cash Transfer (Unregistered)", "LOW", 0, None, None, None, None, "2026-09-01 00:00:00"),
        ("ACC-VIC-901", "Vandana Iyer (Victim Account)", "LOW", 0, "+91-99200-11223", "vandana@okaxis", "DEV-VIC-01", "KPAI9012W", "2024-01-01 09:00:00"),
        ("ACC-10021", "Ramesh Verma (Retail User)", "LOW", 0, "+91-98201-00021", "ramesh.v@okhdfcbank", "DEV-10021", "ABCDE1234F", "2025-06-01 10:00:00"),
    ]
    cursor.executemany("INSERT INTO accounts VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", accounts)

    # 6. Fraud Cases
    cases = [
        ("CASE-2026-018", "Operation Phantom Pay - Mumbai Central UPI Mule Ring", "ACTIVE",
         "Multi-layered syndicate exploiting dormant bank accounts and unified device hardware for illicit UPI fund funnelling across Mumbai & Thane.",
         "2026-08-15 10:00:00")
    ]
    cursor.executemany("INSERT INTO fraud_cases VALUES (?, ?, ?, ?, ?)", cases)

    # Links connecting entities to the previous fraud case
    case_links = [
        ("CASE-2026-018", "account", "ACC-104", "Named in FIR 402/2026 as beneficiary of unauthorized fund diversion"),
        ("CASE-2026-018", "device", "DEV-204", "Hardware fingerprint seized in cyber cell raid telemetry log"),
        ("CASE-2026-018", "upi", "merchant-x@upi", "Virtual payment address flagged for repeated chargeback disputes"),
    ]
    cursor.executemany("INSERT INTO case_entity_links (case_id, entity_type, entity_id, reason) VALUES (?, ?, ?, ?)", case_links)

    # 7. Historical Transactions for ACC-104 (Velocity: 26 preceding txns within last 2h)
    # Target transaction timestamp: 2026-09-09 18:42:00
    base_time = "2026-09-09"
    burst_txns = []
    
    # 26 micro/rapid transactions between 18:06 and 18:40 to create realistic 27-transaction velocity in 2h
    for i in range(1, 27):
        minute = 6 + i
        hour = 18
        if minute >= 60:
            hour += 1
            minute -= 60
        ts = f"{base_time} {hour:02d}:{minute:02d}:00"
        amt = 1500.0 + (i * 120.0)
        burst_txns.append(
            (f"TXN-BURST-{i:03d}", "ACC-104", "DEV-204", "+91-98201-44912", "merchant-x@upi", "BEN-087", amt, "INR", ts, "COMPLETED", "UPI", 18.9750, 72.8258)
        )
    cursor.executemany("INSERT INTO transactions VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", burst_txns)

    # Historical older transactions for ACC-104 establishing normal baseline (₹2,000–₹15,000, avg ~₹6,800)
    normal_history = [
        ("TXN-HIST-001", "ACC-104", "DEV-204", "+91-98201-44912", "vikram.sethi@okhdfcbank", "BEN-012", 4200.0, "INR", "2026-08-01 11:00:00", "COMPLETED", "UPI", 18.9750, 72.8258),
        ("TXN-HIST-002", "ACC-104", "DEV-204", "+91-98201-44912", "vikram.sethi@okhdfcbank", "BEN-045", 8500.0, "INR", "2026-08-12 15:30:00", "COMPLETED", "UPI", 18.9750, 72.8258),
        ("TXN-HIST-003", "ACC-104", "DEV-204", "+91-98201-44912", "vikram.sethi@okhdfcbank", "BEN-012", 6100.0, "INR", "2026-08-25 19:10:00", "COMPLETED", "UPI", 18.9750, 72.8258),
        ("TXN-HIST-004", "ACC-104", "DEV-204", "+91-98201-44912", "vikram.sethi@okhdfcbank", "BEN-045", 11200.0, "INR", "2026-09-02 14:00:00", "COMPLETED", "UPI", 18.9750, 72.8258),
    ]
    cursor.executemany("INSERT INTO transactions VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", normal_history)

    # Multi-account transactions targeting merchant-x@upi across the syndicate (Section 4.E & Section 15)
    syndicate_funnel_txns = [
        ("TXN-MULE-118", "ACC-118", "DEV-204", "+91-98201-88301", "merchant-x@upi", "BEN-087", 22000.0, "INR", "2026-09-09 17:30:00", "COMPLETED", "UPI", 18.9750, 72.8258),
        ("TXN-MULE-145", "ACC-145", "DEV-204", "+91-98201-77210", "merchant-x@upi", "BEN-087", 18500.0, "INR", "2026-09-09 17:45:00", "COMPLETED", "UPI", 18.9750, 72.8258),
        ("TXN-MULE-167", "ACC-167", "DEV-204", "+91-98201-66441", "merchant-x@upi", "BEN-087", 34000.0, "INR", "2026-09-09 18:00:00", "COMPLETED", "UPI", 18.9750, 72.8258),
        ("TXN-MULE-189", "ACC-189", "DEV-204", "+91-98201-55322", "merchant-x@upi", "BEN-087", 27000.0, "INR", "2026-09-09 18:15:00", "COMPLETED", "UPI", 18.9750, 72.8258),
    ]
    cursor.executemany("INSERT INTO transactions VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", syndicate_funnel_txns)

    # Burst transactions for ACC-045 (Medium Risk benchmark: 17 txns in 2h window -> +18 velocity, +20 shared device with 4 accounts, +5 amount anomaly -> 43 MEDIUM)
    # Extra accounts linked to DEV-045 to reach 4 accounts (> 3 threshold)
    extra_dev045_accounts = [
        ("ACC-045-B", "Sub-Account 45B", "LOW", 0, None, None, "DEV-045", None, "2026-01-01 00:00:00"),
        ("ACC-045-C", "Sub-Account 45C", "LOW", 0, None, None, "DEV-045", None, "2026-01-01 00:00:00"),
        ("ACC-045-D", "Sub-Account 45D", "LOW", 0, None, None, "DEV-045", None, "2026-01-01 00:00:00"),
    ]
    cursor.executemany("INSERT INTO accounts (account_id, holder_name, risk_tier, is_flagged, phone_number, upi_id, device_id, pan_number, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", extra_dev045_accounts)

    med_burst = []
    for i in range(1, 18):
        med_burst.append(
            (f"TXN-MED-BURST-{i:02d}", "ACC-045", "DEV-045", "+91-98333-65432", "rohan.m@icici", "BEN-045", 2500.0, "INR", f"2026-09-09 15:{i+10:02d}:00", "COMPLETED", "UPI", 19.1136, 72.8697)
        )
    cursor.executemany("INSERT INTO transactions VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", med_burst)

    # Burst & High Risk setup for ACC-078 (High Risk benchmark: +25 prev fraud, +20 shared device, +18 velocity, +5 amount -> 68 HIGH)
    extra_dev078_accounts = [
        ("ACC-078-B", "Sub-Account 78B", "HIGH", 1, None, None, "DEV-078", None, "2026-01-01 00:00:00"),
        ("ACC-078-C", "Sub-Account 78C", "HIGH", 0, None, None, "DEV-078", None, "2026-01-01 00:00:00"),
        ("ACC-078-D", "Sub-Account 78D", "HIGH", 0, None, None, "DEV-078", None, "2026-01-01 00:00:00"),
    ]
    cursor.executemany("INSERT INTO accounts (account_id, holder_name, risk_tier, is_flagged, phone_number, upi_id, device_id, pan_number, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", extra_dev078_accounts)

    high_burst = []
    for i in range(1, 18):
        high_burst.append(
            (f"TXN-HIGH-BURST-{i:02d}", "ACC-078", "DEV-078", "+91-98777-11223", "sameer.k@ybl", "BEN-078", 4000.0, "INR", f"2026-09-09 16:{i+10:02d}:00", "COMPLETED", "UPI", 19.2183, 72.9781)
        )
    high_burst.append(
        ("TXN-HIGH-BURST-18", "ACC-078-B", "DEV-078", None, "sameer.k@ybl", "BEN-078", 8000.0, "INR", "2026-09-09 16:30:00", "COMPLETED", "UPI", 19.2183, 72.9781)
    )
    high_burst.append(
        ("TXN-HIGH-BURST-19", "ACC-078-C", "DEV-078", None, "sameer.k@ybl", "BEN-078", 9500.0, "INR", "2026-09-09 16:35:00", "COMPLETED", "UPI", 19.2183, 72.9781)
    )
    cursor.executemany("INSERT INTO transactions VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", high_burst)

    # Key Demo Transactions
    key_transactions = [
        # PRIMARY SUSPICIOUS TRANSACTION: TXN-48291
        ("TXN-48291", "ACC-104", "DEV-204", "+91-98201-44912", "merchant-x@upi", "BEN-087", 48500.0, "INR", "2026-09-09 18:42:00", "COMPLETED", "UPI", 18.9750, 72.8258),
        
        # Benchmark LOW-risk transaction
        ("TXN-LOW-001", "ACC-012", "DEV-012", "+91-98111-23456", "pooja.sharma@paytm", "BEN-012", 8500.0, "INR", "2026-09-09 14:15:00", "COMPLETED", "UPI", 19.0760, 72.8777),
        
        # Benchmark MEDIUM-risk transaction
        ("TXN-MED-002", "ACC-045", "DEV-045", "+91-98333-65432", "rohan.m@icici", "BEN-045", 31000.0, "INR", "2026-09-09 16:10:00", "COMPLETED", "UPI", 19.1136, 72.8697),

        # Benchmark HIGH-risk transaction
        ("TXN-HIGH-003", "ACC-078", "DEV-078", "+91-98777-11223", "sameer.k@ybl", "BEN-078", 72000.0, "INR", "2026-09-09 17:48:00", "COMPLETED", "UPI", 19.2183, 72.9781),

        # Benchmark MISSING-DATA transaction (no device telemetry)
        ("TXN-MISSING-004", "ACC-099", None, None, None, "BEN-012", 5000.0, "INR", "2026-09-09 12:00:00", "COMPLETED", "IMPS", None, None),

        # Benchmark EMPTY / CLEAN transaction (Section 36: No Significant Suspicious Connections Found)
        ("TXN-10021", "ACC-10021", "DEV-10021", "+91-98201-00021", "ramesh.v@okhdfcbank", "BEN-LOCAL-09", 2400.0, "INR", "2026-09-09 11:30:00", "COMPLETED", "UPI", 19.0178, 72.8478),
    ]
    cursor.executemany("INSERT INTO transactions VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", key_transactions)

    # Historical transactions for control accounts
    control_history = [
        ("TXN-HIST-012A", "ACC-012", "DEV-012", "+91-98111-23456", "pooja.sharma@paytm", "BEN-012", 7900.0, "INR", "2026-08-10 10:00:00", "COMPLETED", "UPI", 19.0760, 72.8777),
        ("TXN-HIST-012B", "ACC-012", "DEV-012", "+91-98111-23456", "pooja.sharma@paytm", "BEN-012", 9100.0, "INR", "2026-08-28 11:30:00", "COMPLETED", "UPI", 19.0760, 72.8777),
        ("TXN-HIST-045A", "ACC-045", "DEV-045", "+91-98333-65432", "rohan.m@icici", "BEN-045", 28000.0, "INR", "2026-08-15 14:00:00", "COMPLETED", "UPI", 19.1136, 72.8697),
        ("TXN-HIST-078A", "ACC-078", "DEV-078", "+91-98777-11223", "sameer.k@ybl", "BEN-078", 65000.0, "INR", "2026-08-20 16:00:00", "COMPLETED", "UPI", 19.2183, 72.9781),
    ]
    cursor.executemany("INSERT INTO transactions VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", control_history)

    # 8. Money Flow Edges (Directed graph for fund laundering trace)
    money_flow = [
        ("MFE-01", "CASE-2026-018", "Vandana Iyer (Victim)", "ACC-104 (Vikram Sethi)", 48500.0, "2026-09-09 18:42:00", "INITIAL_EXFILTRATION", 1),
        ("MFE-02", "CASE-2026-018", "ACC-104 (Vikram Sethi)", "ACC-118 (Rajesh Gupta)", 32000.0, "2026-09-09 18:44:15", "LAYER_2_DISPERSAL", 2),
        ("MFE-03", "CASE-2026-018", "ACC-104 (Vikram Sethi)", "ACC-167 (Deepak Verma)", 14500.0, "2026-09-09 18:45:00", "P2P_SPLIT", 2),
        ("MFE-04", "CASE-2026-018", "ACC-118 (Rajesh Gupta)", "ACC-145 (Karan Malhotra)", 21000.0, "2026-09-09 18:46:10", "LAYER_3_HOP", 3),
        ("MFE-05", "CASE-2026-018", "ACC-145 (Karan Malhotra)", "ACC-203 (Anil Patil)", 19500.0, "2026-09-09 18:47:00", "CASH_OUT_HAWALA", 4),
    ]
    cursor.executemany("INSERT INTO money_flow_edges VALUES (?, ?, ?, ?, ?, ?, ?, ?)", money_flow)

    # 9. Investigation Timeline Events for TXN-48291
    timeline = [
        ("TLE-01", "TXN-48291", "2026-09-09 18:01:00", "Account Activity Initiated", "Rapid session login detected from unflagged proxy subnet (103.142.24.18)", "AUTHENTICATION", "INFO"),
        ("TLE-02", "TXN-48291", "2026-09-09 18:05:00", "Device Binding Detected", "Device DEV-204 established active biometric token session with ACC-104", "DEVICE", "WARNING"),
        ("TLE-03", "TXN-48291", "2026-09-09 18:17:00", "High-Frequency Micro-Transfers", "Rapid series of 26 transactions initiated across 28 minutes to test account limits", "VELOCITY", "HIGH"),
        ("TLE-04", "TXN-48291", "2026-09-09 18:42:00", "High-Value Transfer Triggered", "Transaction TXN-48291 (Rs. 48,500) initiated targeting merchant-x@upi", "TRANSACTION", "CRITICAL"),
        ("TLE-05", "TXN-48291", "2026-09-09 18:43:00", "Velocity Threshold Exceeded", "27 transactions recorded in 2h window (configured limit: 15)", "RULES_ENGINE", "CRITICAL"),
        ("TLE-06", "TXN-48291", "2026-09-09 18:45:00", "Hardware Multi-Tenancy Confirmed", "DEV-204 hardware signature matched across 6 distinct active accounts", "GRAPH_INTELLIGENCE", "CRITICAL"),
        ("TLE-07", "TXN-48291", "2026-09-09 18:46:00", "Prior Cybercrime Dossier Matched", "ACC-104 & DEV-204 mapped to active police case CASE-2026-018", "LAW_ENFORCEMENT", "CRITICAL"),
        ("TLE-08", "TXN-48291", "2026-09-09 18:47:00", "Risk Escalated to CRITICAL", "Score evaluated at 94/100 by Explainable Risk Engine. Immediate action advised.", "RISK_ENGINE", "CRITICAL"),
    ]
    cursor.executemany("INSERT INTO timeline_events VALUES (?, ?, ?, ?, ?, ?, ?)", timeline)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    seed_database()
    print("FraudNexus database successfully initialized and seeded with Mumbai fraud scenario.")
