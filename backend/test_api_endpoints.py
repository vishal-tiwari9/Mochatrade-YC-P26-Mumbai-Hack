"""
API Endpoint Verification Script
Tests all REST API endpoints directly without needing a live network socket.
"""

from app.api import handler
from app.db.seed_data import seed_database

def test_endpoints():
    seed_database()
    print("Testing API Handlers...")

    # 1. GET /api/risk-score/TXN-48291
    code, res = handler.handle_get_risk_score("TXN-48291")
    assert code == 200, f"Expected 200, got {code}"
    assert res["score"] == 94, f"Expected 94, got {res['score']}"
    assert res["severity"] == "CRITICAL"
    assert res["confidence"] == "HIGH"
    print("[OK] GET /api/risk-score/TXN-48291 -> Score 94, CRITICAL, HIGH")

    # 2. GET /api/risk-score/TXN-48291/signals
    code, res = handler.handle_get_signals("TXN-48291")
    assert code == 200
    assert len(res["signals"]) == 6
    print(f"[OK] GET /api/risk-score/TXN-48291/signals -> {len(res['signals'])} signals returned")

    # 3. GET /api/risk-score/TXN-48291/entities
    code, res = handler.handle_get_entities("TXN-48291")
    assert code == 200
    assert res["account"]["account_id"] == "ACC-104"
    assert res["device"]["device_id"] == "DEV-204"
    print("[OK] GET /api/risk-score/TXN-48291/entities -> Entities and case correlations verified")

    # 4. GET /api/risk-score/TXN-48291/timeline
    code, res = handler.handle_get_timeline("TXN-48291")
    assert code == 200
    assert res["total_events"] >= 8
    print(f"[OK] GET /api/risk-score/TXN-48291/timeline -> {res['total_events']} timeline events returned")

    # 5. POST /api/risk-score/TXN-48291/recalculate
    code, res = handler.handle_recalculate("TXN-48291")
    assert code == 200
    assert res["assessment"]["score"] == 94
    print("[OK] POST /api/risk-score/TXN-48291/recalculate -> Engine recalculated 94")

    # 6. POST /api/risk-score/TXN-48291/what-if
    code, res = handler.handle_what_if("TXN-48291", {"disabled_signals": ["SHARED_DEVICE"]})
    assert code == 200
    assert res["simulated_score"] == 74
    print(f"[OK] POST /api/risk-score/TXN-48291/what-if (without SHARED_DEVICE) -> Score simulated: {res['simulated_score']}")

    # 7. GET /api/investigate/network/TXN-48291
    code, res = handler.handle_get_network_graph("TXN-48291")
    assert code == 200
    assert len(res["nodes"]) >= 8
    print(f"[OK] GET /api/investigate/network/TXN-48291 -> {len(res['nodes'])} graph nodes, {len(res['edges'])} edges")

    # 8. GET /api/investigate/money-flow/TXN-48291
    code, res = handler.handle_get_money_flow("TXN-48291")
    assert code == 200
    assert res["hops_count"] == 5
    print(f"[OK] GET /api/investigate/money-flow/TXN-48291 -> {res['hops_count']} hops from Victim to Cash Out")

    # 9. POST /api/investigate/evidence-pack/TXN-48291
    code, res = handler.handle_generate_evidence_pack("TXN-48291", {"badge_number": "JUDGE-SPECIAL-01"})
    assert code == 200
    assert "SHA-256" in res["cryptographic_verification"]["algorithm"]
    assert "investigation_findings" in res
    print(f"[OK] POST /api/investigate/evidence-pack/TXN-48291 -> Sealed Dossier {res['dossier_id']}")

    # 10. GET /api/demo/cases
    code, res = handler.handle_get_demo_cases()
    assert code == 200
    assert len(res["cases"]) >= 5
    print(f"[OK] GET /api/demo/cases -> {len(res['cases'])} benchmark demo scenarios available")

    # 11. Investigation Endpoints
    # 11a. GET /api/investigation/transaction/TXN-48291
    code, res = handler.handle_get_investigation_by_transaction("TXN-48291", depth=3)
    assert code == 200
    assert len(res["nodes"]) >= 15
    assert len(res["edges"]) >= 20
    assert res["risk_summary"]["status"] == "SUSPICIOUS_NETWORK_DETECTED"
    inv_id = res["session"]["investigation_id"]
    print(f"[OK] GET /api/investigation/transaction/TXN-48291 -> {len(res['nodes'])} nodes, {len(res['edges'])} edges, Session: {inv_id}")

    # 11b. GET /api/investigation/entity/DEVICE/DEV-204
    code, res = handler.handle_get_investigation_by_entity("DEVICE", "DEV-204", depth=1)
    assert code == 200
    acc_nodes = [n for n in res["nodes"] if n["type"] == "ACCOUNT"]
    assert len(acc_nodes) >= 6
    print(f"[OK] GET /api/investigation/entity/DEVICE/DEV-204 -> {len(acc_nodes)} accounts discovered on hardware")

    # 11c. GET /api/investigation/path?source=TXN-48291&target=CASE-2026-018
    code, res = handler.handle_get_shortest_path("TXN-48291", "CASE-2026-018")
    assert code == 200
    assert res["source_id"] == "TXN-48291"
    assert res["target_id"] == "CASE-2026-018"
    assert res["is_suspicious"] is True
    desc_safe = res['description'].encode('ascii', 'replace').decode()
    print(f"[OK] GET /api/investigation/path -> Suspicious path traced: {desc_safe}")

    # 11d. Dynamic Node Expansion
    code, res = handler.handle_get_entity_connections("ACCOUNT", "ACC-104", {"existing_ids": ["ACC-104"]})
    assert code == 200
    assert res["new_nodes_count"] > 0
    print(f"[OK] Dynamic Expansion -> {res['new_nodes_count']} new neighbors discovered for ACC-104")

    # 11e. Account History & Search
    code, res = handler.handle_get_account_history("ACC-104")
    assert code == 200
    assert res["total_transactions"] > 0
    print(f"[OK] GET /api/investigation/account/ACC-104/history -> {res['total_transactions']} transactions retrieved")

    code, res = handler.handle_search_entities("DEV-204")
    assert code == 200
    assert len(res["results"]) > 0
    print(f"[OK] GET /api/investigation/search?q=DEV-204 -> {len(res['results'])} matches found")

    # 11f. Notes, Findings, Evidence, and Case Creation
    code, note_res = handler.handle_add_investigation_note(inv_id, {"note_text": "DEV-204 shared by 6 accounts."})
    assert code == 200
    print(f"[OK] POST /api/investigation/{inv_id}/note -> Note saved")

    code, find_res = handler.handle_add_investigation_finding(inv_id, {"item_type": "DEVICE", "item_id": "DEV-204", "label": "Shared Device DEV-204"})
    assert code == 200
    print(f"[OK] POST /api/investigation/{inv_id}/important -> Finding saved")

    code, ev_res = handler.handle_add_investigation_evidence(inv_id, {"title": "Biometric hardware match", "details": "Observed 6 accounts on DEV-204", "source": "Device Table"})
    assert code == 200
    print(f"[OK] POST /api/investigation/{inv_id}/evidence -> Evidence registered")

    code, case_res = handler.handle_create_case_from_investigation(inv_id, {"title": "Operation Mumbai Phantom Pay"})
    assert code == 200
    assert "CASE-2026-" in case_res["case_id"]
    print(f"[OK] POST /api/investigation/{inv_id}/create-case -> Case {case_res['case_id']} created")

    # 12. POST /api/demo/tweak (unlink_device)
    code, res = handler.handle_demo_tweak({"action": "unlink_device"})
    assert code == 200
    assert res["new_score"] == 74
    print("[OK] POST /api/demo/tweak (unlink_device) -> Live DB mutation changed score 94 -> 74!")

    # Reset
    handler.handle_demo_tweak({"action": "reset"})
    print("[OK] Database restored to benchmark state.")
    print("\nALL API ENDPOINTS FUNCTIONAL AND VERIFIED 100%!")

if __name__ == "__main__":
    test_endpoints()
