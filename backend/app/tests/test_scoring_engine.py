"""
Automated Test Suite for FraudNexus Explainable Fraud Risk Engine
Implements all 14 test cases strictly specified in Section 34.
"""

import unittest
import sqlite3
from app.db.connection import get_connection
from app.db.seed_data import seed_database
from app.scoring.engine import RiskScoringService
from app.config import RiskConfiguration, MAX_SCORE

class TestFraudNexusScoringEngine(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Seed test database in pristine state
        seed_database()
        cls.service = RiskScoringService()
        cls.conn = get_connection()

    @classmethod
    def tearDownClass(cls):
        cls.conn.close()

    def setUp(self):
        # Always run against clean connection
        self.cursor = self.conn.cursor()

    # TEST 1: Low-risk transaction
    def test_01_low_risk_transaction(self):
        assessment = self.service.assess_transaction("TXN-LOW-001", self.conn, persist=False)
        self.assertEqual(assessment.severity, "LOW")
        self.assertLessEqual(assessment.score, 29)

    # TEST 2: Medium-risk transaction
    def test_02_medium_risk_transaction(self):
        assessment = self.service.assess_transaction("TXN-MED-002", self.conn, persist=False)
        self.assertEqual(assessment.severity, "MEDIUM")
        self.assertTrue(30 <= assessment.score <= 59)

    # TEST 3: High-risk transaction
    def test_03_high_risk_transaction(self):
        assessment = self.service.assess_transaction("TXN-HIGH-003", self.conn, persist=False)
        self.assertEqual(assessment.severity, "HIGH")
        self.assertTrue(60 <= assessment.score <= 79)

    # TEST 4: Critical transaction
    def test_04_critical_transaction(self):
        assessment = self.service.assess_transaction("TXN-48291", self.conn, persist=False)
        self.assertEqual(assessment.severity, "CRITICAL")
        self.assertGreaterEqual(assessment.score, 80)
        self.assertEqual(assessment.score, 94)

    # TEST 5: Shared device detection
    def test_05_shared_device_detection(self):
        assessment = self.service.assess_transaction("TXN-48291", self.conn, persist=False)
        shared_dev = next((s for s in assessment.signals if s.signal_id == "SHARED_DEVICE"), None)
        self.assertIsNotNone(shared_dev)
        self.assertTrue(shared_dev.triggered)
        self.assertEqual(shared_dev.contribution, 20)
        self.assertGreater(shared_dev.observed_value, 3)
        self.assertIn("DEV-204", shared_dev.explanation)

    # TEST 6: Previous fraud relationship
    def test_06_previous_fraud_relationship(self):
        assessment = self.service.assess_transaction("TXN-48291", self.conn, persist=False)
        prev_fraud = next((s for s in assessment.signals if s.signal_id == "PREVIOUS_FRAUD"), None)
        self.assertIsNotNone(prev_fraud)
        self.assertTrue(prev_fraud.triggered)
        self.assertEqual(prev_fraud.contribution, 25)
        self.assertIn("CASE-2026-018", prev_fraud.explanation)

    # TEST 7: Transaction velocity
    def test_07_transaction_velocity(self):
        assessment = self.service.assess_transaction("TXN-48291", self.conn, persist=False)
        velocity = next((s for s in assessment.signals if s.signal_id == "VELOCITY_SURGE"), None)
        self.assertIsNotNone(velocity)
        self.assertTrue(velocity.triggered)
        self.assertEqual(velocity.contribution, 18)
        self.assertGreaterEqual(velocity.observed_value, 27)

    # TEST 8: Multiple linked accounts
    def test_08_multiple_linked_accounts(self):
        assessment = self.service.assess_transaction("TXN-48291", self.conn, persist=False)
        linked = next((s for s in assessment.signals if s.signal_id == "LINKED_ACCOUNTS"), None)
        self.assertIsNotNone(linked)
        self.assertTrue(linked.triggered)
        self.assertEqual(linked.contribution, 16)
        self.assertGreaterEqual(linked.observed_value, 5)

    # TEST 9: Beneficiary reuse
    def test_09_beneficiary_reuse(self):
        assessment = self.service.assess_transaction("TXN-48291", self.conn, persist=False)
        bene = next((s for s in assessment.signals if s.signal_id == "COMMON_BENEFICIARY"), None)
        self.assertIsNotNone(bene)
        self.assertTrue(bene.triggered)
        self.assertEqual(bene.contribution, 10)
        self.assertGreaterEqual(bene.observed_value, 5)

    # TEST 10: Amount anomaly
    def test_10_amount_anomaly(self):
        assessment = self.service.assess_transaction("TXN-48291", self.conn, persist=False)
        anomaly = next((s for s in assessment.signals if s.signal_id == "AMOUNT_ANOMALY"), None)
        self.assertIsNotNone(anomaly)
        self.assertTrue(anomaly.triggered)
        self.assertEqual(anomaly.contribution, 5)

    # TEST 11: Missing device data handled honestly
    def test_11_missing_device_data(self):
        assessment = self.service.assess_transaction("TXN-MISSING-004", self.conn, persist=False)
        shared_dev = next((s for s in assessment.signals if s.signal_id == "SHARED_DEVICE"), None)
        self.assertIsNotNone(shared_dev)
        self.assertFalse(shared_dev.assessable)
        self.assertEqual(shared_dev.contribution, 0)
        self.assertIn("Device relationship data unavailable", shared_dev.unassessable_reason)
        # Confidence should degrade due to missing telemetry
        self.assertEqual(assessment.confidence, "MEDIUM")

    # TEST 12: Score never exceeds 100
    def test_12_score_never_exceeds_100(self):
        # Create an extreme config where weights sum to 250
        extreme_config = RiskConfiguration(
            previous_fraud_weight=50,
            shared_device_weight=50,
            velocity_weight=50,
            linked_accounts_weight=50,
            beneficiary_weight=50,
            amount_anomaly_weight=50
        )
        extreme_service = RiskScoringService(extreme_config)
        assessment = extreme_service.assess_transaction("TXN-48291", self.conn, persist=False)
        self.assertGreater(assessment.total_contribution, 100)
        self.assertEqual(assessment.score, 100)

    # TEST 13: Signal contributions sum equals calculated score
    def test_13_contributions_match_score(self):
        assessment = self.service.assess_transaction("TXN-48291", self.conn, persist=False)
        sum_contrib = sum(s.contribution for s in assessment.signals if s.triggered)
        self.assertEqual(sum_contrib, assessment.total_contribution)
        self.assertEqual(min(sum_contrib, MAX_SCORE), assessment.score)

    # TEST 14: Changing evidence changes the score dynamically!
    def test_14_changing_evidence_changes_score(self):
        # 1. Base assessment is 94
        base_assessment = self.service.assess_transaction("TXN-48291", self.conn, persist=False)
        self.assertEqual(base_assessment.score, 94)

        # 2. Modify database: Unlink accounts from DEV-204 so only 2 accounts remain (below threshold 3)
        self.cursor.execute("UPDATE accounts SET device_id = 'DEV-012' WHERE account_id IN ('ACC-145', 'ACC-167', 'ACC-189', 'ACC-203')")
        self.cursor.execute("UPDATE transactions SET device_id = 'DEV-012' WHERE account_id IN ('ACC-145', 'ACC-167', 'ACC-189', 'ACC-203')")
        self.conn.commit()

        recalculated_1 = self.service.assess_transaction("TXN-48291", self.conn, persist=False)
        # Shared device should no longer trigger (-20 points), score should drop to 74
        self.assertEqual(recalculated_1.score, 74)
        shared_dev = next(s for s in recalculated_1.signals if s.signal_id == "SHARED_DEVICE")
        self.assertFalse(shared_dev.triggered)

        # 3. Modify database: Remove all previous fraud links and flags
        self.cursor.execute("DELETE FROM case_entity_links")
        self.cursor.execute("UPDATE accounts SET is_flagged = 0")
        self.cursor.execute("UPDATE devices SET is_flagged = 0")
        self.cursor.execute("UPDATE phones SET is_flagged = 0")
        self.cursor.execute("UPDATE upis SET is_flagged = 0")
        self.cursor.execute("UPDATE beneficiaries SET is_flagged = 0")
        self.conn.commit()

        recalculated_2 = self.service.assess_transaction("TXN-48291", self.conn, persist=False)
        # Previous fraud should no longer trigger (-25 points), score should drop to 49 (MEDIUM)
        self.assertEqual(recalculated_2.score, 49)
        self.assertEqual(recalculated_2.severity, "MEDIUM")

        # 4. Restore pristine seed state for safety
        seed_database()

if __name__ == "__main__":
    unittest.main()
