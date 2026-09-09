"""
Multiple Linked Accounts Evaluator (+16 points)
Analyzes multi-hop graph cluster connectivity (shared device, phone, UPI, or beneficiary).
"""

import sqlite3
from typing import Dict, Any, List, Set
from .base import BaseSignalEvaluator
from ..models import SignalResult
from ...config import RiskConfiguration

class MultipleLinkedAccountsEvaluator(BaseSignalEvaluator):
    @property
    def signal_id(self) -> str:
        return "LINKED_ACCOUNTS"

    @property
    def name(self) -> str:
        return "Multiple Linked Accounts"

    def evaluate(self, txn: Dict[str, Any], conn: sqlite3.Connection, config: RiskConfiguration) -> SignalResult:
        account_id = txn.get("account_id")
        device_id = txn.get("device_id")
        phone_number = txn.get("phone_number")
        upi_id = txn.get("upi_id")

        if not account_id:
            return SignalResult(
                signal_id=self.signal_id,
                name=self.name,
                triggered=False,
                contribution=0,
                observed_value=0,
                threshold=config.linked_accounts_threshold,
                unit="linked accounts",
                severity="NONE",
                explanation="Account identifier missing.",
                related_entities=[],
                evidence=[],
                assessable=False,
                unassessable_reason="Account node missing."
            )

        cursor = conn.cursor()
        linked_accounts: Set[str] = set()

        # 1. Accounts sharing the same device
        if device_id:
            cursor.execute("SELECT account_id FROM accounts WHERE device_id = ? AND account_id != ?", (device_id, account_id))
            for r in cursor.fetchall():
                linked_accounts.add(r["account_id"])

        # 2. Accounts sharing the same phone
        if phone_number:
            cursor.execute("SELECT account_id FROM accounts WHERE phone_number = ? AND account_id != ?", (phone_number, account_id))
            for r in cursor.fetchall():
                linked_accounts.add(r["account_id"])

        # 3. Accounts sharing the same UPI handle
        if upi_id:
            cursor.execute("SELECT account_id FROM accounts WHERE upi_id = ? AND account_id != ?", (upi_id, account_id))
            for r in cursor.fetchall():
                linked_accounts.add(r["account_id"])

        observed_count = len(linked_accounts)
        threshold = config.linked_accounts_threshold

        triggered = observed_count > threshold

        evidence = [
            f"Subject Account: {account_id}",
            f"Connected Accounts in Graph: {', '.join(sorted(list(linked_accounts))[:5])}",
            f"Cluster Degree: {observed_count} distinct nodes"
        ]

        if triggered:
            explanation = f"{observed_count} linked accounts identified across shared hardware, phone, and payment coordinates, exceeding the threshold of {threshold}."
            return SignalResult(
                signal_id=self.signal_id,
                name=self.name,
                triggered=True,
                contribution=config.linked_accounts_weight,
                observed_value=observed_count,
                threshold=threshold,
                unit="linked accounts",
                severity="HIGH",
                explanation=explanation,
                related_entities=sorted(list(linked_accounts)),
                evidence=evidence,
                assessable=True
            )
        else:
            explanation = f"{observed_count} linked account(s) detected, within normal operational threshold ({threshold})."
            return SignalResult(
                signal_id=self.signal_id,
                name=self.name,
                triggered=False,
                contribution=0,
                observed_value=observed_count,
                threshold=threshold,
                unit="linked accounts",
                severity="NONE",
                explanation=explanation,
                related_entities=sorted(list(linked_accounts)),
                evidence=evidence,
                assessable=True
            )
