"""
Shared Device Multi-Tenancy Evaluator (+20 points)
Detects whether a physical hardware identifier is associated with multiple accounts.
"""

import sqlite3
from typing import Dict, Any, List
from .base import BaseSignalEvaluator
from ..models import SignalResult
from ...config import RiskConfiguration

class SharedDeviceEvaluator(BaseSignalEvaluator):
    @property
    def signal_id(self) -> str:
        return "SHARED_DEVICE"

    @property
    def name(self) -> str:
        return "Shared Device"

    def evaluate(self, txn: Dict[str, Any], conn: sqlite3.Connection, config: RiskConfiguration) -> SignalResult:
        device_id = txn.get("device_id")

        if not device_id:
            return SignalResult(
                signal_id=self.signal_id,
                name=self.name,
                triggered=False,
                contribution=0,
                observed_value=0,
                threshold=config.shared_device_threshold_accounts,
                unit="accounts",
                severity="NONE",
                explanation="Device telemetry data unavailable for this channel or transaction.",
                related_entities=[],
                evidence=[],
                assessable=False,
                unassessable_reason="Device relationship data unavailable."
            )

        cursor = conn.cursor()

        # Fetch device hardware info
        cursor.execute("SELECT * FROM devices WHERE device_id = ?", (device_id,))
        dev_row = cursor.fetchone()
        fingerprint = dev_row["device_fingerprint"] if dev_row else "Unknown"
        ip_addr = dev_row["ip_address"] if dev_row else "Unknown"

        # Count how many distinct accounts are associated with this device
        cursor.execute("""
            SELECT DISTINCT account_id 
            FROM accounts 
            WHERE device_id = ?
            UNION
            SELECT DISTINCT account_id 
            FROM transactions 
            WHERE device_id = ?
        """, (device_id, device_id))
        
        linked_accounts = [r["account_id"] for r in cursor.fetchall()]
        observed_count = len(linked_accounts)
        threshold = config.shared_device_threshold_accounts

        triggered = observed_count > threshold

        evidence = [
            f"Device ID: {device_id}",
            f"Fingerprint: {fingerprint}",
            f"Observed Subnet: {ip_addr}",
            f"Linked Accounts Count: {observed_count}"
        ]

        if triggered:
            explanation = f"Device {device_id} is associated with {observed_count} accounts, exceeding the configured threshold of {threshold}."
            return SignalResult(
                signal_id=self.signal_id,
                name=self.name,
                triggered=True,
                contribution=config.shared_device_weight,
                observed_value=observed_count,
                threshold=threshold,
                unit="accounts",
                severity="CRITICAL" if observed_count >= 5 else "HIGH",
                explanation=explanation,
                related_entities=linked_accounts,
                evidence=evidence,
                assessable=True
            )
        else:
            explanation = f"Device {device_id} is linked to {observed_count} account(s), within normal threshold ({threshold})."
            return SignalResult(
                signal_id=self.signal_id,
                name=self.name,
                triggered=False,
                contribution=0,
                observed_value=observed_count,
                threshold=threshold,
                unit="accounts",
                severity="NONE",
                explanation=explanation,
                related_entities=linked_accounts,
                evidence=evidence,
                assessable=True
            )
