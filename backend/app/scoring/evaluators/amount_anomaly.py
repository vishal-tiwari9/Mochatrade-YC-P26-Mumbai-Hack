"""
Amount Anomaly Evaluator (+5 points)
Compares transaction ticket size against the historical spending distribution of the subject account.
"""

import sqlite3
from typing import Dict, Any, List
from .base import BaseSignalEvaluator
from ..models import SignalResult
from ...config import RiskConfiguration

class AmountAnomalyEvaluator(BaseSignalEvaluator):
    @property
    def signal_id(self) -> str:
        return "AMOUNT_ANOMALY"

    @property
    def name(self) -> str:
        return "Amount Anomaly"

    def evaluate(self, txn: Dict[str, Any], conn: sqlite3.Connection, config: RiskConfiguration) -> SignalResult:
        account_id = txn.get("account_id")
        current_amount = float(txn.get("amount", 0.0))
        txn_id = txn.get("transaction_id")

        if not account_id or current_amount <= 0:
            return SignalResult(
                signal_id=self.signal_id,
                name=self.name,
                triggered=False,
                contribution=0,
                observed_value=0,
                threshold=0,
                unit="INR",
                severity="NONE",
                explanation="Valid amount or account identifier missing.",
                related_entities=[],
                evidence=[],
                assessable=False,
                unassessable_reason="Transaction financial payload missing."
            )

        cursor = conn.cursor()

        # Query historical baseline transactions for this account excluding the current transaction
        cursor.execute("""
            SELECT amount 
            FROM transactions 
            WHERE account_id = ? AND transaction_id != ?
            ORDER BY timestamp DESC
        """, (account_id, txn_id))

        history = [r["amount"] for r in cursor.fetchall()]

        if not history:
            return SignalResult(
                signal_id=self.signal_id,
                name=self.name,
                triggered=False,
                contribution=0,
                observed_value=current_amount,
                threshold=0,
                unit="INR",
                severity="NONE",
                explanation=f"New account without historical baseline. Current ticket size Rs. {current_amount:,.2f} recorded.",
                related_entities=[account_id],
                evidence=[f"Current Amount: Rs. {current_amount:,.2f}", "History: No prior transactions"],
                assessable=True
            )

        min_hist = min(history)
        max_hist = max(history)
        avg_hist = sum(history) / len(history)

        threshold_amount = avg_hist * config.amount_anomaly_multiplier
        triggered = current_amount > threshold_amount and current_amount > max_hist

        ratio = current_amount / avg_hist if avg_hist > 0 else 1.0

        evidence = [
            f"Current Amount: Rs. {current_amount:,.2f}",
            f"Historical Mean: Rs. {avg_hist:,.2f}",
            f"Observed Historical Range: Rs. {min_hist:,.2f} - Rs. {max_hist:,.2f}",
            f"Multiplier Threshold: {config.amount_anomaly_multiplier}x (Rs. {threshold_amount:,.2f})",
            f"Observed Deviation: {ratio:.2f}x historical average"
        ]

        if triggered:
            explanation = f"Transaction amount of Rs. {current_amount:,.2f} is anomalous relative to observed historical behavior (typical range: Rs. {min_hist:,.2f} - Rs. {max_hist:,.2f}, avg: Rs. {avg_hist:,.2f}, deviation: {ratio:.1f}x)."
            return SignalResult(
                signal_id=self.signal_id,
                name=self.name,
                triggered=True,
                contribution=config.amount_anomaly_weight,
                observed_value=f"Rs. {current_amount:,.0f} ({ratio:.1f}x avg)",
                threshold=f"Rs. {threshold_amount:,.0f} ({config.amount_anomaly_multiplier}x)",
                unit="INR",
                severity="MEDIUM",
                explanation=explanation,
                related_entities=[account_id],
                evidence=evidence,
                assessable=True
            )
        else:
            explanation = f"Transaction amount of Rs. {current_amount:,.2f} is consistent with account's historical spending range (Rs. {min_hist:,.2f} - Rs. {max_hist:,.2f})."
            return SignalResult(
                signal_id=self.signal_id,
                name=self.name,
                triggered=False,
                contribution=0,
                observed_value=f"Rs. {current_amount:,.0f}",
                threshold=f"Rs. {threshold_amount:,.0f}",
                unit="INR",
                severity="NONE",
                explanation=explanation,
                related_entities=[account_id],
                evidence=evidence,
                assessable=True
            )
