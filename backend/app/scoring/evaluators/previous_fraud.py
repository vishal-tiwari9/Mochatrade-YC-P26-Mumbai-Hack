"""
Previous Fraud Connection Evaluator (+25 points)
Detects associations with previously flagged fraud cases, accounts, UPI IDs, devices, or beneficiaries.
"""

import sqlite3
from typing import Dict, Any, List
from .base import BaseSignalEvaluator
from ..models import SignalResult
from ...config import RiskConfiguration

class PreviousFraudEvaluator(BaseSignalEvaluator):
    @property
    def signal_id(self) -> str:
        return "PREVIOUS_FRAUD"

    @property
    def name(self) -> str:
        return "Previous Fraud Connection"

    def evaluate(self, txn: Dict[str, Any], conn: sqlite3.Connection, config: RiskConfiguration) -> SignalResult:
        account_id = txn.get("account_id")
        device_id = txn.get("device_id")
        phone_number = txn.get("phone_number")
        upi_id = txn.get("upi_id")
        beneficiary_id = txn.get("beneficiary_id")

        cursor = conn.cursor()
        
        flagged_entities: List[str] = []
        evidence_items: List[str] = []
        matched_cases: List[str] = []

        # Check entity links to formal police / intelligence cases
        query = """
            SELECT c.case_id, c.title, l.entity_type, l.entity_id, l.reason
            FROM case_entity_links l
            JOIN fraud_cases c ON l.case_id = c.case_id
            WHERE (l.entity_id = ? AND l.entity_type = 'account')
               OR (l.entity_id = ? AND l.entity_type = 'device')
               OR (l.entity_id = ? AND l.entity_type = 'phone')
               OR (l.entity_id = ? AND l.entity_type = 'upi')
               OR (l.entity_id = ? AND l.entity_type = 'beneficiary')
        """
        cursor.execute(query, (account_id, device_id, phone_number, upi_id, beneficiary_id))
        rows = cursor.fetchall()
        for r in rows:
            ent = f"{r['entity_id']} ({r['entity_type']})"
            if ent not in flagged_entities:
                flagged_entities.append(ent)
            if r["case_id"] not in matched_cases:
                matched_cases.append(r["case_id"])
            evidence_items.append(f"{r['case_id']}: {r['reason']}")

        # Also check direct flag status on account / device / phone / upi
        checks = [
            ("accounts", "account_id", account_id, "Account flagged in internal registry"),
            ("devices", "device_id", device_id, "Device hardware flagged for fraud"),
            ("phones", "phone_number", phone_number, "SIM MSISDN flagged in telecommunication watch-list"),
            ("upis", "upi_id", upi_id, "VPA flagged for chargeback disputes"),
            ("beneficiaries", "beneficiary_id", beneficiary_id, "Beneficiary account flagged for suspicious payouts")
        ]
        for table, col, val, reason in checks:
            if val:
                cursor.execute(f"SELECT is_flagged FROM {table} WHERE {col} = ?", (val,))
                res = cursor.fetchone()
                if res and res["is_flagged"]:
                    tag = f"{val} ({col})"
                    if tag not in flagged_entities:
                        flagged_entities.append(tag)
                    evidence_items.append(f"{val}: {reason}")

        observed_count = len(flagged_entities)
        triggered = observed_count > 0

        if triggered:
            cases_str = ", ".join(matched_cases) if matched_cases else "prior flagged records"
            explanation = f"{observed_count} connected entities ({', '.join(flagged_entities[:3])}) have active prior fraud associations linked to {cases_str}."
            return SignalResult(
                signal_id=self.signal_id,
                name=self.name,
                triggered=True,
                contribution=config.previous_fraud_weight,
                observed_value=observed_count,
                threshold=1,
                unit="flagged associations",
                severity="CRITICAL" if observed_count >= 2 else "HIGH",
                explanation=explanation,
                related_entities=flagged_entities,
                evidence=evidence_items,
                assessable=True
            )
        else:
            return SignalResult(
                signal_id=self.signal_id,
                name=self.name,
                triggered=False,
                contribution=0,
                observed_value=0,
                threshold=1,
                unit="flagged associations",
                severity="NONE",
                explanation="No prior fraud associations or flagged cases found for the participating entities.",
                related_entities=[],
                evidence=[],
                assessable=True
            )
