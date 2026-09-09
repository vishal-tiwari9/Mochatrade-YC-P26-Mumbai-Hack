"""
Comprehensive Automated Test Suite for FraudNexus Investigation & Trace Fraud Engine
Implements all 16 test cases specified in Section 41 and the Critical Test in Section 42.
"""

import unittest
import sqlite3
from app.db.connection import get_connection
from app.db.seed_data import seed_database
from app.investigation.engine import InvestigationService
from app.api import handler

class TestFraudNexusInvestigationEngine(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        seed_database()
        cls.service = InvestigationService()
        cls.conn = get_connection()

    @classmethod
    def tearDownClass(cls):
        cls.conn.close()

    def setUp(self):
        # Fresh connection per test
        self.cursor = self.conn.cursor()

    # TEST 1: Transaction relationship discovery
    def test_01_transaction_relationship_discovery(self):
        graph = self.service.discover_network("TRANSACTION", "TXN-48291", max_depth=1, conn=self.conn)
        self.assertEqual(graph.root["id"], "TXN-48291")
        self.assertEqual(graph.root["type"], "TRANSACTION")
        node_ids = {n.id for n in graph.nodes}
        self.assertIn("ACC-104", node_ids)
        self.assertIn("DEV-204", node_ids)
        self.assertIn("merchant-x@upi", node_ids)

    # TEST 2: Account relationship discovery
    def test_02_account_relationship_discovery(self):
        graph = self.service.discover_network("ACCOUNT", "ACC-104", max_depth=1, conn=self.conn)
        self.assertEqual(graph.root["id"], "ACC-104")
        node_ids = {n.id for n in graph.nodes}
        self.assertIn("DEV-204", node_ids)
        self.assertIn("CASE-2026-018", node_ids)

    # TEST 3: Device shared-account discovery
    def test_03_device_shared_account_discovery(self):
        graph = self.service.discover_network("DEVICE", "DEV-204", max_depth=1, conn=self.conn)
        accounts = [n.id for n in graph.nodes if n.type == "ACCOUNT"]
        self.assertGreaterEqual(len(accounts), 6)
        self.assertIn("ACC-104", accounts)
        self.assertIn("ACC-118", accounts)
        self.assertIn("ACC-145", accounts)
        self.assertIn("ACC-167", accounts)
        self.assertIn("ACC-189", accounts)
        self.assertIn("ACC-203", accounts)

    # TEST 4: UPI relationship discovery
    def test_04_upi_relationship_discovery(self):
        graph = self.service.discover_network("UPI", "merchant-x@upi", max_depth=1, conn=self.conn)
        self.assertEqual(graph.root["id"], "merchant-x@upi")
        node_ids = {n.id for n in graph.nodes}
        self.assertIn("ACC-104", node_ids)
        self.assertIn("CASE-2026-018", node_ids)

    # TEST 5: Fraud case relationship discovery
    def test_05_fraud_case_relationship_discovery(self):
        graph = self.service.discover_network("FRAUD_CASE", "CASE-2026-018", max_depth=1, conn=self.conn)
        node_ids = {n.id for n in graph.nodes}
        self.assertIn("ACC-104", node_ids)
        self.assertIn("DEV-204", node_ids)
        self.assertIn("merchant-x@upi", node_ids)

    # TEST 6: BFS traversal & hop distance calculation
    def test_06_bfs_traversal_hop_distance(self):
        graph = self.service.discover_network("TRANSACTION", "TXN-48291", max_depth=3, conn=self.conn)
        root = next(n for n in graph.nodes if n.id == "TXN-48291")
        self.assertEqual(root.hop, 0)
        acc104 = next(n for n in graph.nodes if n.id == "ACC-104")
        self.assertEqual(acc104.hop, 1)
        for n in graph.nodes:
            self.assertTrue(0 <= n.hop <= 3)

    # TEST 7: Maximum depth enforcement (1 to 5)
    def test_07_maximum_depth_enforcement(self):
        g1 = self.service.discover_network("TRANSACTION", "TXN-48291", max_depth=1, conn=self.conn)
        g2 = self.service.discover_network("TRANSACTION", "TXN-48291", max_depth=2, conn=self.conn)
        g3 = self.service.discover_network("TRANSACTION", "TXN-48291", max_depth=3, conn=self.conn)
        self.assertLess(len(g1.nodes), len(g2.nodes))
        self.assertLessEqual(len(g2.nodes), len(g3.nodes))
        self.assertEqual(g1.depth, 1)
        self.assertEqual(g2.depth, 2)
        self.assertEqual(g3.depth, 3)

    # TEST 8: Shortest suspicious path discovery
    def test_08_shortest_suspicious_path(self):
        path = self.service.find_shortest_suspicious_path("TXN-48291", "CASE-2026-018", conn=self.conn)
        self.assertIsNotNone(path)
        self.assertEqual(path["source_id"], "TXN-48291")
        self.assertEqual(path["target_id"], "CASE-2026-018")
        self.assertTrue(path["is_suspicious"])
        self.assertGreaterEqual(path["hop_count"], 2)
        node_ids = [n["id"] for n in path["nodes"]]
        self.assertEqual(node_ids[0], "TXN-48291")
        self.assertEqual(node_ids[-1], "CASE-2026-018")

    # TEST 9: Missing entity handling
    def test_09_missing_entity_handling(self):
        with self.assertRaises(ValueError):
            self.service.discover_network("TRANSACTION", "TXN-NONEXISTENT-999", max_depth=3, conn=self.conn)

    # TEST 10: No suspicious connections (Clean Transaction)
    def test_10_no_suspicious_connections_clean_case(self):
        graph = self.service.discover_network("TRANSACTION", "TXN-10021", max_depth=3, conn=self.conn)
        self.assertEqual(graph.risk_summary["status"], "NO_SIGNIFICANT_SUSPICIOUS_CONNECTIONS")
        self.assertEqual(graph.risk_summary["headline"], "NO SIGNIFICANT SUSPICIOUS CONNECTIONS FOUND")
        self.assertEqual(graph.risk_summary["suspicious_connections_count"], 0)

    # TEST 11: Suspicious relationship classification
    def test_11_suspicious_relationship_classification(self):
        graph = self.service.discover_network("TRANSACTION", "TXN-48291", max_depth=3, conn=self.conn)
        suspicious_edges = [e for e in graph.edges if e.suspiciousness in ("SUSPICIOUS", "HIGH-RISK")]
        self.assertGreater(len(suspicious_edges), 0)
        case_edges = [e for e in graph.edges if e.type == "ASSOCIATED_CASE"]
        for ce in case_edges:
            self.assertEqual(ce.suspiciousness, "HIGH-RISK")

    # TEST 12: Investigation session creation
    def test_12_investigation_session_creation(self):
        session = self.service.get_or_create_session("TXN-48291", "TRANSACTION", conn=self.conn)
        self.assertIn("investigation_id", session)
        self.assertEqual(session["root_id"], "TXN-48291")
        self.assertEqual(session["status"], "OPEN")

    # TEST 13: Adding important entity / finding
    def test_13_adding_important_finding(self):
        session = self.service.get_or_create_session("TXN-48291", "TRANSACTION", conn=self.conn)
        inv_id = session["investigation_id"]
        finding = self.service.add_finding(inv_id, "DEVICE", "DEV-204", "Shared Hardware Fingerprint", "Multi-tenancy lead", conn=self.conn)
        self.assertEqual(finding["item_id"], "DEV-204")
        details = self.service.get_session_details(inv_id, conn=self.conn)
        self.assertTrue(any(f["item_id"] == "DEV-204" for f in details["findings"]))

    # TEST 14: Adding investigator note
    def test_14_adding_investigator_note(self):
        session = self.service.get_or_create_session("TXN-48291", "TRANSACTION", conn=self.conn)
        inv_id = session["investigation_id"]
        note = self.service.add_note(inv_id, "Hardware DEV-204 shared by 6 mule accounts.", author="Lead Inspector", conn=self.conn)
        self.assertIn("id", note)
        details = self.service.get_session_details(inv_id, conn=self.conn)
        self.assertTrue(any("DEV-204 shared by 6" in n["note_text"] for n in details["notes"]))

    # TEST 15: Adding evidence
    def test_15_adding_evidence(self):
        session = self.service.get_or_create_session("TXN-48291", "TRANSACTION", conn=self.conn)
        inv_id = session["investigation_id"]
        ev = self.service.add_evidence(inv_id, "Hardware Multi-Tenancy Match", "6 accounts on DEV-204", "Telemetry Logs", conn=self.conn)
        self.assertEqual(ev["title"], "Hardware Multi-Tenancy Match")
        details = self.service.get_session_details(inv_id, conn=self.conn)
        self.assertTrue(any(e["title"] == "Hardware Multi-Tenancy Match" for e in details["evidence"]))

    # TEST 16: Timeline generation
    def test_16_timeline_generation(self):
        events = self.service.get_investigation_timeline("TXN-48291", conn=self.conn)
        self.assertGreaterEqual(len(events), 8)
        self.assertTrue(all("timestamp" in ev and "title" in ev for ev in events))

    # CRITICAL TEST (Section 42): Dynamic Database Graph Mutation
    def test_17_critical_dynamic_graph_mutation(self):
        # 1. Initial state: DEV-204 has 6 connected accounts
        g_initial = self.service.discover_network("DEVICE", "DEV-204", max_depth=1, conn=self.conn)
        initial_accounts = [n.id for n in g_initial.nodes if n.type == "ACCOUNT"]
        self.assertEqual(len(initial_accounts), 6)
        self.assertIn("ACC-203", initial_accounts)

        # 2. Mutate database: unlink ACC-203 from DEV-204 (reassign to DEV-012)
        self.cursor.execute("UPDATE accounts SET device_id = 'DEV-012' WHERE account_id = 'ACC-203'")
        self.conn.commit()

        # 3. Re-run investigation: graph MUST now discover exactly 5 accounts
        g_mutated = self.service.discover_network("DEVICE", "DEV-204", max_depth=1, conn=self.conn)
        mutated_accounts = [n.id for n in g_mutated.nodes if n.type == "ACCOUNT"]
        self.assertEqual(len(mutated_accounts), 5)
        self.assertNotIn("ACC-203", mutated_accounts)

        # 4. Restore ACC-203 to DEV-204
        self.cursor.execute("UPDATE accounts SET device_id = 'DEV-204' WHERE account_id = 'ACC-203'")
        self.conn.commit()

        # 5. Re-run investigation: graph returns to 6 accounts
        g_restored = self.service.discover_network("DEVICE", "DEV-204", max_depth=1, conn=self.conn)
        restored_accounts = [n.id for n in g_restored.nodes if n.type == "ACCOUNT"]
        self.assertEqual(len(restored_accounts), 6)
        self.assertIn("ACC-203", restored_accounts)

if __name__ == "__main__":
    unittest.main()
