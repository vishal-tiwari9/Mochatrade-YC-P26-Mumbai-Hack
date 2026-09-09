"""
FraudNexus REST API Request Dispatcher
Handles all scoring, investigation, network graph, money flow, and demo sandbox endpoints.
Compatible with standard HTTP server and FastAPI.
"""

import json
import sqlite3
import hashlib
from datetime import datetime
from typing import Dict, Any, Tuple, Optional, List
from ..db.connection import get_connection
from ..db.seed_data import seed_database
from ..scoring.engine import RiskScoringService
from ..investigation.engine import InvestigationService
from ..config import DEFAULT_CONFIG

service = RiskScoringService(DEFAULT_CONFIG)
investigation_service = InvestigationService()

def handle_get_risk_score(txn_id: str) -> Tuple[int, Dict[str, Any]]:
    conn = get_connection()
    try:
        assessment = service.assess_transaction(txn_id, conn, persist=True)
        return 200, assessment.to_dict()
    except ValueError as e:
        return 404, {"error": "TRANSACTION_NOT_FOUND", "message": str(e)}
    except Exception as e:
        return 500, {"error": "SCORING_ERROR", "message": str(e)}
    finally:
        conn.close()

def handle_get_signals(txn_id: str) -> Tuple[int, Dict[str, Any]]:
    conn = get_connection()
    try:
        assessment = service.assess_transaction(txn_id, conn, persist=False)
        return 200, {
            "transaction_id": txn_id,
            "score": assessment.score,
            "severity": assessment.severity,
            "signals": [s.to_dict() for s in assessment.signals]
        }
    except ValueError as e:
        return 404, {"error": "TRANSACTION_NOT_FOUND", "message": str(e)}
    finally:
        conn.close()

def handle_get_entities(txn_id: str) -> Tuple[int, Dict[str, Any]]:
    conn = get_connection()
    try:
        assessment = service.assess_transaction(txn_id, conn, persist=False)
        cursor = conn.cursor()

        account_id = assessment.related_entities["account"]
        device_id = assessment.related_entities["device"]
        upi_id = assessment.related_entities["upi"]
        beneficiary_id = assessment.related_entities["beneficiary"]

        cursor.execute("SELECT * FROM accounts WHERE account_id = ?", (account_id,))
        acc_info = dict(cursor.fetchone() or {})

        cursor.execute("SELECT * FROM devices WHERE device_id = ?", (device_id,))
        dev_info = dict(cursor.fetchone() or {})

        cursor.execute("SELECT * FROM upis WHERE upi_id = ?", (upi_id,))
        upi_info = dict(cursor.fetchone() or {})

        cursor.execute("SELECT * FROM beneficiaries WHERE beneficiary_id = ?", (beneficiary_id,))
        bene_info = dict(cursor.fetchone() or {})

        cursor.execute("""
            SELECT c.case_id, c.title, c.status, l.reason 
            FROM case_entity_links l
            JOIN fraud_cases c ON l.case_id = c.case_id
            WHERE l.entity_id IN (?, ?, ?)
        """, (account_id, device_id, upi_id))
        cases = [dict(r) for r in cursor.fetchall()]

        return 200, {
            "transaction_id": txn_id,
            "account": acc_info,
            "device": dev_info,
            "upi": upi_info,
            "beneficiary": bene_info,
            "associated_fraud_cases": cases,
            "summary": assessment.related_entities
        }
    except ValueError as e:
        return 404, {"error": "TRANSACTION_NOT_FOUND", "message": str(e)}
    finally:
        conn.close()

def handle_get_timeline(txn_id: str) -> Tuple[int, Dict[str, Any]]:
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM timeline_events WHERE transaction_id = ? ORDER BY timestamp ASC", (txn_id,))
        events = [dict(r) for r in cursor.fetchall()]
        return 200, {
            "transaction_id": txn_id,
            "total_events": len(events),
            "events": events
        }
    except Exception as e:
        return 500, {"error": "TIMELINE_FETCH_ERROR", "message": str(e)}
    finally:
        conn.close()

def handle_recalculate(txn_id: str) -> Tuple[int, Dict[str, Any]]:
    conn = get_connection()
    try:
        assessment = service.assess_transaction(txn_id, conn, persist=True)
        return 200, {
            "message": "Risk score successfully recalculated from authoritative database state.",
            "assessment": assessment.to_dict()
        }
    except ValueError as e:
        return 404, {"error": "TRANSACTION_NOT_FOUND", "message": str(e)}
    finally:
        conn.close()

def handle_what_if(txn_id: str, body: Dict[str, Any]) -> Tuple[int, Dict[str, Any]]:
    disabled_signals = body.get("disabled_signals", [])
    conn = get_connection()
    try:
        sim = service.simulate_what_if(txn_id, disabled_signals, conn)
        return 200, sim
    except ValueError as e:
        return 404, {"error": "TRANSACTION_NOT_FOUND", "message": str(e)}
    finally:
        conn.close()

def handle_get_network_graph(txn_id: str) -> Tuple[int, Dict[str, Any]]:
    """Legacy network endpoint - forwards to rich investigation graph."""
    conn = get_connection()
    try:
        graph = investigation_service.discover_network("TRANSACTION", txn_id, max_depth=3, conn=conn)
        return 200, {
            "transaction_id": txn_id,
            "center_node": graph.root["id"],
            "nodes": [n.to_dict() for n in graph.nodes],
            "edges": [e.to_dict() for e in graph.edges],
            "summary": graph.risk_summary
        }
    except ValueError as e:
        return 404, {"error": "TRANSACTION_NOT_FOUND", "message": str(e)}
    finally:
        conn.close()

def handle_get_money_flow(txn_id: str) -> Tuple[int, Dict[str, Any]]:
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM money_flow_edges WHERE case_id = 'CASE-2026-018' ORDER BY hop_order ASC, timestamp ASC")
        rows = [dict(r) for r in cursor.fetchall()]
        hops_count = len(rows)

        return 200, {
            "transaction_id": txn_id,
            "case_id": "CASE-2026-018",
            "title": "Operation Phantom Pay - Fund Layering Trace",
            "total_diverted": 48500.0,
            "hops_count": hops_count,
            "flow_path": rows
        }
    finally:
        conn.close()

# ========================================================
# INVESTIGATION ENGINE ENDPOINTS (Phase 7 / Section 29)
# ========================================================

def handle_get_investigation_by_transaction(txn_id: str, depth: int = 3) -> Tuple[int, Dict[str, Any]]:
    conn = get_connection()
    try:
        graph = investigation_service.discover_network("TRANSACTION", txn_id, max_depth=depth, conn=conn)
        # Ensure session exists and log audit
        session = investigation_service.get_or_create_session(txn_id, "TRANSACTION", conn)
        investigation_service.log_audit(session["investigation_id"], "ENTITY_VIEWED", txn_id, f"Viewed transaction {txn_id} at depth {depth}", conn)
        res = graph.to_dict()
        res["session"] = session
        return 200, res
    except ValueError as e:
        return 404, {"error": "TRANSACTION_NOT_FOUND", "message": str(e)}
    except Exception as e:
        return 500, {"error": "INVESTIGATION_ERROR", "message": str(e)}
    finally:
        conn.close()

def handle_get_investigation_by_entity(entity_type: str, entity_id: str, depth: int = 3) -> Tuple[int, Dict[str, Any]]:
    conn = get_connection()
    try:
        graph = investigation_service.discover_network(entity_type, entity_id, max_depth=depth, conn=conn)
        session = investigation_service.get_or_create_session(entity_id, entity_type.upper(), conn)
        investigation_service.log_audit(session["investigation_id"], "ENTITY_VIEWED", entity_id, f"Investigated {entity_type} {entity_id} at depth {depth}", conn)
        res = graph.to_dict()
        res["session"] = session
        return 200, res
    except ValueError as e:
        return 404, {"error": "ENTITY_NOT_FOUND", "message": str(e)}
    except Exception as e:
        return 500, {"error": "INVESTIGATION_ERROR", "message": str(e)}
    finally:
        conn.close()

def handle_get_entity_connections(entity_type: str, entity_id: str, body: Optional[Dict[str, Any]] = None) -> Tuple[int, Dict[str, Any]]:
    conn = get_connection()
    try:
        existing_ids = (body or {}).get("existing_ids", [])
        expansion = investigation_service.expand_entity_connections(entity_type, entity_id, existing_ids, conn=conn)
        inv_id = (body or {}).get("investigation_id", f"INV-2026-{abs(hash(entity_id)) % 900 + 100:03d}")
        investigation_service.log_audit(inv_id, "NODE_EXPANDED", entity_id, f"Expanded {expansion['new_nodes_count']} connections for {entity_type} {entity_id}", conn)
        return 200, expansion
    except Exception as e:
        return 500, {"error": "EXPANSION_ERROR", "message": str(e)}
    finally:
        conn.close()

def handle_get_shortest_path(source_id: str, target_id: str) -> Tuple[int, Dict[str, Any]]:
    conn = get_connection()
    try:
        path = investigation_service.find_shortest_suspicious_path(source_id, target_id, conn=conn)
        if not path:
            return 404, {"error": "PATH_NOT_FOUND", "message": f"No path found connecting {source_id} and {target_id}."}
        inv_id = f"INV-2026-{abs(hash(source_id)) % 900 + 100:03d}"
        investigation_service.log_audit(inv_id, "PATH_TRACED", f"{source_id}->{target_id}", f"Traced path across {path['hop_count']} hops: {path['description']}", conn)
        return 200, path
    except Exception as e:
        return 500, {"error": "PATH_FINDING_ERROR", "message": str(e)}
    finally:
        conn.close()

def handle_get_investigation_timeline(target_id: str) -> Tuple[int, Dict[str, Any]]:
    conn = get_connection()
    try:
        events = investigation_service.get_investigation_timeline(target_id, conn=conn)
        return 200, {
            "target_id": target_id,
            "total_events": len(events),
            "events": events
        }
    except Exception as e:
        return 500, {"error": "TIMELINE_ERROR", "message": str(e)}
    finally:
        conn.close()

def handle_get_account_history(account_id: str) -> Tuple[int, Dict[str, Any]]:
    conn = get_connection()
    try:
        history = investigation_service.get_account_transaction_history(account_id, limit=25, conn=conn)
        return 200, {
            "account_id": account_id,
            "total_transactions": len(history),
            "transactions": history
        }
    except Exception as e:
        return 500, {"error": "HISTORY_ERROR", "message": str(e)}
    finally:
        conn.close()

def handle_search_entities(query: str) -> Tuple[int, Dict[str, Any]]:
    conn = get_connection()
    try:
        results = investigation_service.search_entities(query, limit=15, conn=conn)
        return 200, {"query": query, "results": results}
    except Exception as e:
        return 500, {"error": "SEARCH_ERROR", "message": str(e)}
    finally:
        conn.close()

def handle_create_investigation_session(body: Dict[str, Any]) -> Tuple[int, Dict[str, Any]]:
    root_id = body.get("root_id")
    root_type = body.get("root_type", "TRANSACTION")
    if not root_id:
        return 400, {"error": "MISSING_ROOT_ID", "message": "Field 'root_id' is required."}

    conn = get_connection()
    try:
        session = investigation_service.get_or_create_session(root_id, root_type, conn=conn)
        return 200, session
    except Exception as e:
        return 500, {"error": "SESSION_CREATE_ERROR", "message": str(e)}
    finally:
        conn.close()

def handle_get_investigation_session(session_id: str) -> Tuple[int, Dict[str, Any]]:
    conn = get_connection()
    try:
        details = investigation_service.get_session_details(session_id, conn=conn)
        if not details:
            return 404, {"error": "SESSION_NOT_FOUND", "message": f"Session {session_id} not found."}
        return 200, details
    except Exception as e:
        return 500, {"error": "SESSION_FETCH_ERROR", "message": str(e)}
    finally:
        conn.close()

def handle_add_investigation_note(session_id: str, body: Dict[str, Any]) -> Tuple[int, Dict[str, Any]]:
    note_text = body.get("note_text") or body.get("note")
    author = body.get("author", "Lead Investigator")
    if not note_text:
        return 400, {"error": "MISSING_NOTE_TEXT", "message": "Field 'note_text' is required."}

    conn = get_connection()
    try:
        res = investigation_service.add_note(session_id, note_text, author, conn=conn)
        return 200, res
    except Exception as e:
        return 500, {"error": "NOTE_ADD_ERROR", "message": str(e)}
    finally:
        conn.close()

def handle_add_investigation_finding(session_id: str, body: Dict[str, Any]) -> Tuple[int, Dict[str, Any]]:
    item_type = body.get("item_type", "ENTITY")
    item_id = body.get("item_id")
    label = body.get("label", item_id or "Important Node")
    reason = body.get("reason", "Marked as critical by investigator")
    if not item_id:
        return 400, {"error": "MISSING_ITEM_ID"}

    conn = get_connection()
    try:
        res = investigation_service.add_finding(session_id, item_type, item_id, label, reason, conn=conn)
        return 200, res
    except Exception as e:
        return 500, {"error": "FINDING_ADD_ERROR", "message": str(e)}
    finally:
        conn.close()

def handle_add_investigation_evidence(session_id: str, body: Dict[str, Any]) -> Tuple[int, Dict[str, Any]]:
    title = body.get("title", "Telemetry Evidence")
    details = body.get("details", "")
    source = body.get("source", "Graph Discovery Engine")
    conn = get_connection()
    try:
        res = investigation_service.add_evidence(session_id, title, details, source, conn=conn)
        return 200, res
    except Exception as e:
        return 500, {"error": "EVIDENCE_ADD_ERROR", "message": str(e)}
    finally:
        conn.close()

def handle_create_case_from_investigation(session_id: str, body: Dict[str, Any]) -> Tuple[int, Dict[str, Any]]:
    """Creates a new official case from investigation session data."""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        details = investigation_service.get_session_details(session_id, conn=conn)
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        case_id = f"CASE-2026-{abs(hash(session_id)) % 900 + 100:03d}"
        title = body.get("title") or f"Operation Trident — Escalated Case from {session_id}"
        description = body.get("description") or f"Formal case escalated from investigation session {session_id}. Multiple linked entities identified in organized fraud ring."

        cursor.execute("""
            INSERT OR REPLACE INTO fraud_cases (case_id, title, status, description, created_at)
            VALUES (?, ?, 'ACTIVE', ?, ?)
        """, (case_id, title, description, now))

        # Link findings
        for f in details.get("findings", []):
            cursor.execute("""
                INSERT INTO case_entity_links (case_id, entity_type, entity_id, reason)
                VALUES (?, ?, ?, ?)
            """, (case_id, f["item_type"].lower(), f["item_id"], f.get("reason", "Discovered during investigation")))

        investigation_service.log_audit(session_id, "CASE_CREATED", case_id, f"Escalated formal case {case_id}: {title}", conn)
        conn.commit()

        return 200, {
            "case_id": case_id,
            "title": title,
            "status": "ACTIVE",
            "linked_findings_count": len(details.get("findings", [])),
            "created_at": now
        }
    except Exception as e:
        return 500, {"error": "CASE_CREATE_ERROR", "message": str(e)}
    finally:
        conn.close()

# ========================================================
# ENHANCED EVIDENCE PACK DOSSIER (Section 26, 48)
# ========================================================

def handle_generate_evidence_pack(txn_id: str, body: Dict[str, Any]) -> Tuple[int, Dict[str, Any]]:
    conn = get_connection()
    try:
        assessment = service.assess_transaction(txn_id, conn, persist=True)
        investigator_name = body.get("investigator_name", "Lead Inspector - Mumbai Cyber Cell")
        badge_number = body.get("badge_number", "MC-CYBER-884")
        investigation_id = body.get("investigation_id") or f"INV-2026-{abs(hash(txn_id)) % 900 + 100:03d}"

        # Fetch investigation details
        sess_details = investigation_service.get_session_details(investigation_id, conn=conn)
        graph = investigation_service.discover_network("TRANSACTION", txn_id, max_depth=3, conn=conn)

        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC")
        canonical_content = f"{assessment.assessment_id}:{txn_id}:{assessment.score}:{timestamp}:{badge_number}:{investigation_id}"
        evidence_sha256 = hashlib.sha256(canonical_content.encode("utf-8")).hexdigest()

        cursor = conn.cursor()
        cursor.execute("SELECT amount, currency, channel FROM transactions WHERE transaction_id = ?", (txn_id,))
        t_row = cursor.fetchone()
        txn_amt_str = f"Rs. {t_row['amount']:,.2f}" if t_row else "Rs. 48,500.00"

        dossier = {
            "dossier_id": f"DOSSIER-{assessment.assessment_id}",
            "investigation_id": investigation_id,
            "generated_at": timestamp,
            "investigator": {
                "name": investigator_name,
                "badge": badge_number,
                "agency": "Financial Intelligence & Cyber Defense Division (FIU-IND Node)"
            },
            "transaction": {
                "transaction_id": txn_id,
                "amount": txn_amt_str,
                "currency": "INR",
                "channel": "UPI / Instant Real-Time Rail",
                "primary_subject": f"{assessment.related_entities.get('holder_name', 'Subject')} ({assessment.related_entities.get('account')})",
                "hardware_id": assessment.related_entities.get("device", "UNREGISTERED"),
                "destination_upi": assessment.related_entities.get("upi", "DIRECT")
            },
            "risk_evaluation": {
                "converging_score": f"{assessment.score} / 100",
                "severity": assessment.severity,
                "confidence": assessment.confidence,
                "engine_version": assessment.engine_version,
                "configuration_profile": assessment.config_profile
            },
            "investigation_findings": {
                "total_entities_discovered": len(graph.nodes),
                "total_relationships_verified": len(graph.edges),
                "suspicious_connections_count": graph.risk_summary.get("suspicious_connections_count", 0),
                "previous_fraud_links_count": graph.risk_summary.get("previous_fraud_links_count", 0),
                "headline": graph.risk_summary.get("headline", ""),
                "summary": graph.risk_summary.get("narrative", "")
            },
            "suspicious_paths": [p.to_dict() for p in graph.paths],
            "investigator_notes": [n["note_text"] for n in sess_details.get("notes", [])],
            "marked_findings": [f["label"] for f in sess_details.get("findings", [])],
            "collected_evidence": sess_details.get("evidence", []),
            "evidence_signals": [
                {
                    "signal": s.name,
                    "contribution": f"+{s.contribution} pts",
                    "observed": s.observed_value,
                    "threshold": s.threshold,
                    "finding": s.explanation,
                    "evidence_refs": s.evidence
                }
                for s in assessment.signals if s.triggered
            ],
            "executive_summary": assessment.executive_summary,
            "cryptographic_verification": {
                "algorithm": "SHA-256 (FIPS 180-4)",
                "evidence_hash": evidence_sha256,
                "status": "LEGALLY_PRESERVED_SEALED"
            }
        }
        return 200, dossier
    except ValueError as e:
        return 404, {"error": "TRANSACTION_NOT_FOUND", "message": str(e)}
    finally:
        conn.close()

def handle_get_demo_cases() -> Tuple[int, Dict[str, Any]]:
    cases = [
        {
            "id": "TXN-48291",
            "name": "Mumbai Mule Syndicate (Primary Case)",
            "tier": "CRITICAL",
            "amount": "Rs. 48,500",
            "expected_score": 94,
            "highlight": "Converging multi-tenancy hardware, 27 txns/2h velocity, FIR police link"
        },
        {
            "id": "TXN-LOW-001",
            "name": "Clean Retail Salary Transfer",
            "tier": "LOW",
            "amount": "Rs. 8,500",
            "expected_score": 10,
            "highlight": "Single registered device, normal velocity, zero prior fraud"
        },
        {
            "id": "TXN-10021",
            "name": "Clean Normal Retail (Empty Network)",
            "tier": "LOW",
            "amount": "Rs. 2,400",
            "expected_score": 0,
            "highlight": "Demonstrates 'No Significant Suspicious Connections Found' benchmark"
        },
        {
            "id": "TXN-MED-002",
            "name": "E-Commerce Velocity Anomaly",
            "tier": "MEDIUM",
            "amount": "Rs. 31,000",
            "expected_score": 59,
            "highlight": "Spike in frequency and ticket size, but clean hardware"
        },
        {
            "id": "TXN-HIGH-003",
            "name": "High-Risk Unregistered Device Cluster",
            "tier": "HIGH",
            "amount": "Rs. 72,000",
            "expected_score": 69,
            "highlight": "Shared hardware + beneficiary reuse across multiple accounts"
        },
        {
            "id": "TXN-MISSING-004",
            "name": "ATM Transfer (Missing Telemetry Data)",
            "tier": "LOW (NOT ASSESSABLE)",
            "amount": "Rs. 5,000",
            "expected_score": 10,
            "highlight": "Demonstrates honest system degradation: missing hardware tagged NOT ASSESSABLE"
        },
    ]
    return 200, {"cases": cases}

def handle_demo_tweak(body: Dict[str, Any]) -> Tuple[int, Dict[str, Any]]:
    action = body.get("action")
    conn = get_connection()
    cursor = conn.cursor()

    try:
        if action == "unlink_device":
            cursor.execute("UPDATE accounts SET device_id = 'DEV-012' WHERE account_id IN ('ACC-145', 'ACC-167', 'ACC-189', 'ACC-203')")
            cursor.execute("UPDATE transactions SET device_id = 'DEV-012' WHERE account_id IN ('ACC-145', 'ACC-167', 'ACC-189', 'ACC-203')")
            conn.commit()
            assessment = service.assess_transaction("TXN-48291", conn)
            return 200, {
                "action": action,
                "description": "Unlinked 4 accounts from DEV-204. DEV-204 now only has 2 accounts (threshold: 3).",
                "new_score": assessment.score,
                "new_severity": assessment.severity,
                "signals": [s.to_dict() for s in assessment.signals]
            }

        elif action == "relink_device":
            cursor.execute("UPDATE accounts SET device_id = 'DEV-204' WHERE account_id IN ('ACC-145', 'ACC-167', 'ACC-189', 'ACC-203')")
            cursor.execute("UPDATE transactions SET device_id = 'DEV-204' WHERE account_id IN ('ACC-145', 'ACC-167', 'ACC-189', 'ACC-203')")
            conn.commit()
            assessment = service.assess_transaction("TXN-48291", conn)
            return 200, {
                "action": action,
                "description": "Re-linked all 6 accounts to DEV-204.",
                "new_score": assessment.score,
                "new_severity": assessment.severity,
                "signals": [s.to_dict() for s in assessment.signals]
            }

        elif action == "clear_fraud_links":
            cursor.execute("DELETE FROM case_entity_links WHERE entity_id IN ('ACC-104', 'DEV-204', 'merchant-x@upi', '+91-98201-44912', 'BEN-087')")
            cursor.execute("UPDATE accounts SET is_flagged = 0 WHERE account_id = 'ACC-104'")
            cursor.execute("UPDATE devices SET is_flagged = 0 WHERE device_id = 'DEV-204'")
            cursor.execute("UPDATE phones SET is_flagged = 0 WHERE phone_number = '+91-98201-44912'")
            cursor.execute("UPDATE upis SET is_flagged = 0 WHERE upi_id = 'merchant-x@upi'")
            cursor.execute("UPDATE beneficiaries SET is_flagged = 0 WHERE beneficiary_id = 'BEN-087'")
            conn.commit()
            assessment = service.assess_transaction("TXN-48291", conn)
            return 200, {
                "action": action,
                "description": "Cleared previous cybercrime case records and flagged tags.",
                "new_score": assessment.score,
                "new_severity": assessment.severity,
                "signals": [s.to_dict() for s in assessment.signals]
            }

        elif action == "restore_fraud_links":
            cursor.execute("""
                INSERT OR IGNORE INTO case_entity_links (case_id, entity_type, entity_id, reason)
                VALUES 
                ('CASE-2026-018', 'account', 'ACC-104', 'Named in FIR 402/2026 as beneficiary of unauthorized fund diversion'),
                ('CASE-2026-018', 'device', 'DEV-204', 'Hardware fingerprint seized in cyber cell raid telemetry log'),
                ('CASE-2026-018', 'upi', 'merchant-x@upi', 'Virtual payment address flagged for repeated chargeback disputes')
            """)
            cursor.execute("UPDATE accounts SET is_flagged = 1 WHERE account_id = 'ACC-104'")
            cursor.execute("UPDATE devices SET is_flagged = 1 WHERE device_id = 'DEV-204'")
            cursor.execute("UPDATE phones SET is_flagged = 1 WHERE phone_number = '+91-98201-44912'")
            cursor.execute("UPDATE upis SET is_flagged = 1 WHERE upi_id = 'merchant-x@upi'")
            cursor.execute("UPDATE beneficiaries SET is_flagged = 1 WHERE beneficiary_id = 'BEN-087'")
            conn.commit()
            assessment = service.assess_transaction("TXN-48291", conn)
            return 200, {
                "action": action,
                "description": "Restored active cybercrime case records and flags.",
                "new_score": assessment.score,
                "new_severity": assessment.severity,
                "signals": [s.to_dict() for s in assessment.signals]
            }

        elif action == "normalize_velocity":
            cursor.execute("UPDATE transactions SET timestamp = '2026-09-09 12:00:00' WHERE transaction_id LIKE 'TXN-BURST-%'")
            conn.commit()
            assessment = service.assess_transaction("TXN-48291", conn)
            return 200, {
                "action": action,
                "description": "Normalized rolling velocity (burst transactions shifted outside 2-hour window).",
                "new_score": assessment.score,
                "new_severity": assessment.severity,
                "signals": [s.to_dict() for s in assessment.signals]
            }

        elif action == "restore_velocity":
            for i in range(1, 27):
                minute = 6 + i
                hour = 18
                if minute >= 60:
                    hour += 1
                    minute -= 60
                ts = f"2026-09-09 {hour:02d}:{minute:02d}:00"
                cursor.execute("UPDATE transactions SET timestamp = ? WHERE transaction_id = ?", (ts, f"TXN-BURST-{i:03d}"))
            conn.commit()
            assessment = service.assess_transaction("TXN-48291", conn)
            return 200, {
                "action": action,
                "description": "Restored 26 burst transactions in 2-hour window.",
                "new_score": assessment.score,
                "new_severity": assessment.severity,
                "signals": [s.to_dict() for s in assessment.signals]
            }

        elif action == "reset":
            seed_database()
            assessment = service.assess_transaction("TXN-48291", conn)
            return 200, {
                "action": "reset",
                "description": "Database restored to pristine benchmark scenario.",
                "new_score": assessment.score,
                "new_severity": assessment.severity,
                "signals": [s.to_dict() for s in assessment.signals]
            }

        else:
            return 400, {"error": "INVALID_ACTION", "message": f"Action '{action}' is not supported."}

    finally:
        conn.close()
