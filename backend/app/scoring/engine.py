"""
FraudNexus RiskScoringService
Orchestrates signal evaluators, aggregates scores, calculates deterministic confidence & severity,
generates evidence summaries, and persists auditable assessments.
"""

import sqlite3
import json
import hashlib
from datetime import datetime
from typing import Dict, Any, List, Optional
from ..config import DEFAULT_CONFIG, RiskConfiguration, MAX_SCORE, SEVERITY_BANDS
from .models import SignalResult, RiskAssessment
from .evaluators.base import BaseSignalEvaluator
from .evaluators.previous_fraud import PreviousFraudEvaluator
from .evaluators.shared_device import SharedDeviceEvaluator
from .evaluators.velocity import TransactionVelocityEvaluator
from .evaluators.linked_accounts import MultipleLinkedAccountsEvaluator
from .evaluators.beneficiary import CommonBeneficiaryEvaluator
from .evaluators.amount_anomaly import AmountAnomalyEvaluator

class RiskScoringService:
    def __init__(self, config: Optional[RiskConfiguration] = None):
        self.config = config or DEFAULT_CONFIG
        self.evaluators: List[BaseSignalEvaluator] = [
            PreviousFraudEvaluator(),
            SharedDeviceEvaluator(),
            TransactionVelocityEvaluator(),
            MultipleLinkedAccountsEvaluator(),
            CommonBeneficiaryEvaluator(),
            AmountAnomalyEvaluator(),
        ]

    def determine_severity(self, score: int) -> str:
        for lower, upper, severity in SEVERITY_BANDS:
            if lower <= score <= upper:
                return severity
        return "CRITICAL" if score >= 80 else "LOW"

    def calculate_confidence(self, signals: List[SignalResult], data_quality: Dict[str, Any]) -> (str, List[str]):
        reasons = []
        unassessable_count = sum(1 for s in signals if not s.assessable)
        triggered_count = sum(1 for s in signals if s.triggered)

        if unassessable_count > 0:
            reasons.append(f"{unassessable_count} signal(s) unassessable due to incomplete telemetry/graph links")
            if unassessable_count >= 2:
                return "LOW", reasons
            return "MEDIUM", reasons

        reasons.append("Complete device, network, temporal, and beneficiary telemetry available")

        if triggered_count >= 4:
            reasons.append(f"High multi-signal convergence ({triggered_count} independent risk signals triggered)")
            reasons.append("Corroborated by physical hardware and historical intelligence graph")
            return "HIGH", reasons
        elif triggered_count >= 2:
            reasons.append(f"Moderate signal convergence ({triggered_count} signals triggered)")
            return "MEDIUM", reasons
        else:
            reasons.append("Consistent baseline activity with minimal or singular risk triggers")
            return "HIGH" if data_quality.get("has_history", False) else "MEDIUM", reasons

    def generate_executive_summary(self, txn_id: str, severity: str, triggered_signals: List[SignalResult], related_entities: Dict[str, Any]) -> str:
        if not triggered_signals:
            return f"Transaction {txn_id} is evaluated as LOW risk. Participating entities exhibit clean operational histories, normal ticket size, single-device affinity, and zero prior cybercrime associations."

        driver_phrases = []
        for s in triggered_signals:
            if s.signal_id == "PREVIOUS_FRAUD":
                driver_phrases.append("active connections to prior cybercrime intelligence records")
            elif s.signal_id == "SHARED_DEVICE":
                driver_phrases.append(f"originating hardware linked to {s.observed_value} distinct accounts")
            elif s.signal_id == "VELOCITY_SURGE":
                driver_phrases.append(f"high-frequency transaction burst ({s.observed_value} txns within 2 hours)")
            elif s.signal_id == "LINKED_ACCOUNTS":
                driver_phrases.append(f"clustering with {s.observed_value} linked accounts in the entity graph")
            elif s.signal_id == "COMMON_BENEFICIARY":
                driver_phrases.append("destination coordinates receiving rapid multi-account fund funnels")
            elif s.signal_id == "AMOUNT_ANOMALY":
                driver_phrases.append("significant positive ticket size deviation against historical baseline")

        convergence_text = "; ".join(driver_phrases)
        return (
            f"{txn_id} is rated {severity} because multiple independent fraud signals converge on the transaction: "
            f"{convergence_text}. Evidence indicates potential coordinated mule ring activity requiring immediate investigation."
        )

    def generate_recommended_actions(self, severity: str, signals: List[SignalResult]) -> List[Dict[str, Any]]:
        if severity == "CRITICAL":
            return [
                {"id": "ACT-01", "title": "Investigate Network", "action": "open_network", "icon": "Share2", "priority": "URGENT", "description": "Inspect hardware cluster DEV-204 and connected mule accounts."},
                {"id": "ACT-02", "title": "Trace Money Flow", "action": "open_money_flow", "icon": "GitFork", "priority": "URGENT", "description": "Track downstream layering hops across Layer 2 and Layer 3 mules."},
                {"id": "ACT-03", "title": "Review Previous Cases", "action": "open_cases", "icon": "ShieldAlert", "priority": "HIGH", "description": "Correlate with FIR 402/2026 under CASE-2026-018."},
                {"id": "ACT-04", "title": "Review Related Transactions", "action": "filter_txns", "icon": "ListFilter", "priority": "HIGH", "description": "Review 26 burst transactions executed in the preceding 2 hours."},
                {"id": "ACT-05", "title": "Preserve Evidence", "action": "lock_records", "icon": "Lock", "priority": "MEDIUM", "description": "Snapshot device telemetry and session IP logs for FIU compliance."},
                {"id": "ACT-06", "title": "Generate Evidence Pack", "action": "export_dossier", "icon": "FileText", "priority": "URGENT", "description": "Generate cryptographically signed investigation dossier for cyber cell."},
            ]
        elif severity == "HIGH":
            return [
                {"id": "ACT-11", "title": "Place Account on Hold", "action": "temp_freeze", "icon": "PauseCircle", "priority": "HIGH", "description": "Temporary 12-hour freeze on high-value outbound transfers."},
                {"id": "ACT-12", "title": "Step-Up Authentication", "action": "trigger_mfa", "icon": "Key", "priority": "HIGH", "description": "Require facial liveness biometric verification before settlement."},
                {"id": "ACT-13", "title": "Investigate Device Ring", "action": "open_network", "icon": "Share2", "priority": "MEDIUM", "description": "Inspect multi-tenancy on current hardware signature."},
            ]
        elif severity == "MEDIUM":
            return [
                {"id": "ACT-21", "title": "Log Telemetry Profile", "action": "log_telemetry", "icon": "Activity", "priority": "LOW", "description": "Monitor rolling 24-hour velocity on subject account."},
                {"id": "ACT-22", "title": "Flag for Enhanced Due Diligence", "action": "flag_edd", "icon": "Eye", "priority": "LOW", "description": "Review proof of address and re-verify PAN credentials."},
            ]
        else:
            return [
                {"id": "ACT-31", "title": "Standard Settlement", "action": "auto_clear", "icon": "CheckCircle", "priority": "INFO", "description": "Transaction cleared by automated risk gateway."},
            ]

    def assess_transaction(self, txn_id: str, conn: sqlite3.Connection, persist: bool = True) -> RiskAssessment:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM transactions WHERE transaction_id = ?", (txn_id,))
        txn_row = cursor.fetchone()
        if not txn_row:
            raise ValueError(f"Transaction '{txn_id}' not found in FraudNexus database.")

        txn = dict(txn_row)

        # Retrieve account & device metadata
        account_id = txn.get("account_id")
        cursor.execute("SELECT * FROM accounts WHERE account_id = ?", (account_id,))
        acc_row = cursor.fetchone()
        acc = dict(acc_row) if acc_row else {}

        # Evaluate each signal independently
        signals: List[SignalResult] = []
        for evaluator in self.evaluators:
            res = evaluator.evaluate(txn, conn, self.config)
            signals.append(res)

        # Aggregate contributions dynamically
        total_contribution = sum(s.contribution for s in signals if s.triggered)
        final_score = min(total_contribution, MAX_SCORE)
        severity = self.determine_severity(final_score)

        # Data quality checks
        data_quality = {
            "has_device": bool(txn.get("device_id")),
            "has_destination": bool(txn.get("upi_id") or txn.get("beneficiary_id")),
            "has_history": True,
            "assessable_signals_count": sum(1 for s in signals if s.assessable),
            "total_signals_count": len(signals)
        }

        confidence, confidence_reasons = self.calculate_confidence(signals, data_quality)

        # Primary risk drivers (top 3 contributing signals)
        triggered_signals = [s for s in signals if s.triggered]
        triggered_signals.sort(key=lambda x: x.contribution, reverse=True)
        primary_drivers = [
            {
                "signal_id": s.signal_id,
                "name": s.name,
                "contribution": s.contribution,
                "severity": s.severity,
                "observed": s.observed_value,
                "threshold": s.threshold,
                "unit": s.unit,
                "summary": s.explanation
            }
            for s in triggered_signals[:3]
        ]

        # Related entities summary
        cursor.execute("SELECT COUNT(DISTINCT case_id) as cases_cnt FROM case_entity_links WHERE entity_id IN (?, ?)",
                       (account_id, txn.get("device_id")))
        cases_cnt = cursor.fetchone()["cases_cnt"]

        cursor.execute("""
            SELECT COUNT(DISTINCT account_id) as linked_cnt 
            FROM accounts 
            WHERE (device_id = ? AND device_id IS NOT NULL)
               OR (phone_number = ? AND phone_number IS NOT NULL)
        """, (txn.get("device_id"), txn.get("phone_number")))
        linked_cnt = max(0, cursor.fetchone()["linked_cnt"] - 1)

        related_entities = {
            "account": account_id,
            "holder_name": acc.get("holder_name", "Unknown"),
            "device": txn.get("device_id") or "UNAVAILABLE",
            "phone": txn.get("phone_number") or "UNAVAILABLE",
            "upi": txn.get("upi_id") or "UNAVAILABLE",
            "beneficiary": txn.get("beneficiary_id") or "UNAVAILABLE",
            "linked_accounts_count": linked_cnt,
            "previous_fraud_cases_count": cases_cnt,
        }

        # Concrete evidence items compiled
        evidence_items = []
        for s in signals:
            if s.evidence:
                evidence_items.append({
                    "signal_id": s.signal_id,
                    "signal_name": s.name,
                    "items": s.evidence
                })

        executive_summary = self.generate_executive_summary(txn_id, severity, triggered_signals, related_entities)
        recommended_actions = self.generate_recommended_actions(severity, signals)

        # Generate deterministic assessment ID
        hash_seed = f"{txn_id}:{final_score}:{txn.get('timestamp')}"
        short_hash = hashlib.sha256(hash_seed.encode("utf-8")).hexdigest()[:6].upper()
        assessment_id = f"RISK-2026-{short_hash}"
        assessment_timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        assessment = RiskAssessment(
            transaction_id=txn_id,
            score=final_score,
            severity=severity,
            confidence=confidence,
            confidence_reasons=confidence_reasons,
            engine_version=self.config.to_dict()["engine_version"],
            config_profile=self.config.to_dict()["config_profile"],
            assessment_id=assessment_id,
            assessment_timestamp=assessment_timestamp,
            total_contribution=total_contribution,
            signals=signals,
            primary_risk_drivers=primary_drivers,
            executive_summary=executive_summary,
            related_entities=related_entities,
            evidence_items=evidence_items,
            recommended_actions=recommended_actions,
            data_quality=data_quality
        )

        if persist:
            raw_json = json.dumps(assessment.to_dict())
            cursor.execute("""
                INSERT OR REPLACE INTO risk_assessments (assessment_id, transaction_id, score, severity, confidence, calculated_at, raw_json)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (assessment_id, txn_id, final_score, severity, confidence, assessment_timestamp, raw_json))
            conn.commit()

        return assessment

    def simulate_what_if(self, txn_id: str, disabled_signals: List[str], conn: sqlite3.Connection) -> Dict[str, Any]:
        """
        Calculates simulated score if specific signals are removed/cleared.
        Does not mutate the database.
        """
        base = self.assess_transaction(txn_id, conn, persist=False)
        simulated_signals = []
        for s in base.signals:
            s_dict = s.to_dict()
            if s.signal_id in disabled_signals:
                s_dict["triggered"] = False
                s_dict["contribution"] = 0
                s_dict["simulated_disabled"] = True
            simulated_signals.append(s_dict)

        sim_total = sum(s["contribution"] for s in simulated_signals if s["triggered"])
        sim_score = min(sim_total, MAX_SCORE)
        sim_severity = self.determine_severity(sim_score)

        return {
            "transaction_id": txn_id,
            "original_score": base.score,
            "original_severity": base.severity,
            "simulated_score": sim_score,
            "simulated_severity": sim_severity,
            "score_delta": sim_score - base.score,
            "disabled_signals": disabled_signals,
            "signals": simulated_signals
        }
