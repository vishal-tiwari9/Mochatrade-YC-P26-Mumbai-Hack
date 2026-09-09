"""
Pydantic / Dataclass models for Risk Scoring, Signals, and Audit contracts.
Strictly follows Section 6 and Section 8 specifications.
"""

from dataclasses import dataclass, field, asdict
from typing import List, Dict, Any, Optional

@dataclass
class SignalResult:
    signal_id: str
    name: str
    triggered: bool
    contribution: int
    observed_value: Any
    threshold: Any
    unit: str
    severity: str  # NONE, LOW, MEDIUM, HIGH, CRITICAL
    explanation: str
    related_entities: List[str] = field(default_factory=list)
    evidence: List[str] = field(default_factory=list)
    assessable: bool = True
    unassessable_reason: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

@dataclass
class RiskAssessment:
    transaction_id: str
    score: int
    severity: str  # LOW, MEDIUM, HIGH, CRITICAL
    confidence: str  # LOW, MEDIUM, HIGH
    confidence_reasons: List[str]
    engine_version: str
    config_profile: str
    assessment_id: str
    assessment_timestamp: str
    total_contribution: int
    signals: List[SignalResult]
    primary_risk_drivers: List[Dict[str, Any]]
    executive_summary: str
    related_entities: Dict[str, Any]
    evidence_items: List[Dict[str, Any]]
    recommended_actions: List[Dict[str, Any]]
    data_quality: Dict[str, Any]

    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        data["signals"] = [s.to_dict() if isinstance(s, SignalResult) else s for s in self.signals]
        return data
