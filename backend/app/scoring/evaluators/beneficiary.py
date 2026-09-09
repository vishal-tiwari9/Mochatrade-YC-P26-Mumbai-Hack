"""
Common Beneficiary / UPI Multi-Account Convergence Evaluator (+10 points)
Detects whether a beneficiary account or UPI VPA is receiving rapid fund transfers from multiple distinct accounts.
"""

import sqlite3
from typing import Dict, Any, List
from .base import BaseSignalEvaluator
from ..models import SignalResult
from ...config import RiskConfiguration

class CommonBeneficiaryEvaluator(BaseSignalEvaluator):
    @property
    def signal_id(self) -> str:
        return "COMMON_BENEFICIARY"

    @property
    def name(self) -> str:
        return "Common Beneficiary / UPI"

    def evaluate(self, txn: Dict[str, Any], conn: sqlite3.Connection, config: RiskConfiguration) -> SignalResult:
        upi_id = txn.get("upi_id")
        beneficiary_id = txn.get("beneficiary_id")

        if not upi_id and not beneficiary_id:
            return SignalResult(
                signal_id=self.signal_id,
                name=self.name,
                triggered=False,
                contribution=0,
                observed_value=0,
                threshold=config.beneficiary_threshold_accounts,
                unit="paying accounts",
                severity="NONE",
                explanation="Destination beneficiary / UPI coordinate missing.",
                related_entities=[],
                evidence=[],
                assessable=False,
                unassessable_reason="Payment destination endpoint missing."
            )

        cursor = conn.cursor()

        # Query distinct accounts sending funds to this UPI or Beneficiary
        cursor.execute("""
            SELECT account_id, COUNT(transaction_id) as txn_count, SUM(amount) as total_vol
            FROM transactions
            WHERE (upi_id = ? AND ? IS NOT NULL)
               OR (beneficiary_id = ? AND ? IS NOT NULL)
            GROUP BY account_id
        """, (upi_id, upi_id, beneficiary_id, beneficiary_id))

        account_rows = cursor.fetchall()
        observed_paying_accounts = len(account_rows)
        
        # Total transaction count for this beneficiary/UPI
        cursor.execute("""
            SELECT COUNT(*) as total_txns, SUM(amount) as total_inflow
            FROM transactions
            WHERE (upi_id = ? AND ? IS NOT NULL)
               OR (beneficiary_id = ? AND ? IS NOT NULL)
        """, (upi_id, upi_id, beneficiary_id, beneficiary_id))
        stats = cursor.fetchone()
        total_txns = stats["total_txns"] if stats else 0
        total_inflow = stats["total_inflow"] if stats and stats["total_inflow"] else 0.0

        threshold = config.beneficiary_threshold_accounts
        triggered = observed_paying_accounts >= threshold

        target_label = upi_id or beneficiary_id
        evidence = [
            f"Destination Coordinate: {target_label}",
            f"Distinct Sending Accounts: {observed_paying_accounts}",
            f"Total Transactions to Endpoint: {total_txns}",
            f"Cumulative Volume: Rs. {total_inflow:,.2f}"
        ]

        if triggered:
            explanation = f"UPI / Beneficiary {target_label} appears across {total_txns} transactions involving {observed_paying_accounts} distinct accounts, exceeding threshold of {threshold}."
            return SignalResult(
                signal_id=self.signal_id,
                name=self.name,
                triggered=True,
                contribution=config.beneficiary_weight,
                observed_value=observed_paying_accounts,
                threshold=threshold,
                unit="paying accounts",
                severity="HIGH" if observed_paying_accounts >= 4 else "MEDIUM",
                explanation=explanation,
                related_entities=[r["account_id"] for r in account_rows],
                evidence=evidence,
                assessable=True
            )
        else:
            explanation = f"Beneficiary / UPI {target_label} has received funds from {observed_paying_accounts} account(s), within normal limits ({threshold})."
            return SignalResult(
                signal_id=self.signal_id,
                name=self.name,
                triggered=False,
                contribution=0,
                observed_value=observed_paying_accounts,
                threshold=threshold,
                unit="paying accounts",
                severity="NONE",
                explanation=explanation,
                related_entities=[r["account_id"] for r in account_rows],
                evidence=evidence,
                assessable=True
            )
