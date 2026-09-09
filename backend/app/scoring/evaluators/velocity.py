"""
Transaction Velocity Evaluator (+18 points)
Analyzes transaction frequency over a configurable rolling time window (e.g. 2 hours).
"""

import sqlite3
from datetime import datetime, timedelta
from typing import Dict, Any, List
from .base import BaseSignalEvaluator
from ..models import SignalResult
from ...config import RiskConfiguration

class TransactionVelocityEvaluator(BaseSignalEvaluator):
    @property
    def signal_id(self) -> str:
        return "VELOCITY_SURGE"

    @property
    def name(self) -> str:
        return "Transaction Velocity"

    def evaluate(self, txn: Dict[str, Any], conn: sqlite3.Connection, config: RiskConfiguration) -> SignalResult:
        account_id = txn.get("account_id")
        txn_time_str = txn.get("timestamp")

        if not account_id or not txn_time_str:
            return SignalResult(
                signal_id=self.signal_id,
                name=self.name,
                triggered=False,
                contribution=0,
                observed_value=0,
                threshold=config.velocity_threshold_txns,
                unit="txns / 2h",
                severity="NONE",
                explanation="Transaction timestamp or account ID missing.",
                related_entities=[],
                evidence=[],
                assessable=False,
                unassessable_reason="Account temporal history incomplete."
            )

        cursor = conn.cursor()
        
        # Parse timestamp
        try:
            current_time = datetime.strptime(txn_time_str, "%Y-%m-%d %H:%M:%S")
        except ValueError:
            # Fallback ISO format
            current_time = datetime.fromisoformat(txn_time_str.replace("Z", "+00:00"))

        window_start = (current_time - timedelta(hours=config.velocity_window_hours)).strftime("%Y-%m-%d %H:%M:%S")
        current_time_str = current_time.strftime("%Y-%m-%d %H:%M:%S")

        cursor.execute("""
            SELECT transaction_id, amount, timestamp, upi_id 
            FROM transactions 
            WHERE account_id = ? 
              AND timestamp >= ? 
              AND timestamp <= ?
            ORDER BY timestamp DESC
        """, (account_id, window_start, current_time_str))

        recent_txns = cursor.fetchall()
        observed_count = len(recent_txns)
        threshold = config.velocity_threshold_txns

        triggered = observed_count > threshold

        evidence = [
            f"Observed Transactions: {observed_count}",
            f"Window: Last {config.velocity_window_hours} hours ({window_start} to {current_time_str})",
            f"Configured Threshold: {threshold} txns"
        ]
        if recent_txns:
            evidence.append(f"Most Recent Burst Txn ID: {recent_txns[0]['transaction_id']}")

        if triggered:
            explanation = f"{observed_count} transactions were recorded within {config.velocity_window_hours} hours, significantly exceeding the configured activity threshold of {threshold}."
            return SignalResult(
                signal_id=self.signal_id,
                name=self.name,
                triggered=True,
                contribution=config.velocity_weight,
                observed_value=observed_count,
                threshold=threshold,
                unit="txns / 2h",
                severity="CRITICAL" if observed_count >= 25 else "HIGH",
                explanation=explanation,
                related_entities=[account_id],
                evidence=evidence,
                assessable=True
            )
        else:
            explanation = f"{observed_count} transaction(s) recorded within {config.velocity_window_hours} hours, within normal velocity threshold ({threshold})."
            return SignalResult(
                signal_id=self.signal_id,
                name=self.name,
                triggered=False,
                contribution=0,
                observed_value=observed_count,
                threshold=threshold,
                unit="txns / 2h",
                severity="NONE",
                explanation=explanation,
                related_entities=[account_id],
                evidence=evidence,
                assessable=True
            )
