"""
FraudNexus Investigation Graph Data Structures
Normalized graph representation for nodes, edges, paths, and graph responses.
"""

from dataclasses import dataclass, field, asdict
from typing import Optional, List, Dict, Any

@dataclass
class InvestigationNode:
    id: str
    type: str  # TRANSACTION, ACCOUNT, DEVICE, UPI, PHONE, BENEFICIARY, FRAUD_CASE
    label: str
    risk: str  # CRITICAL, HIGH, MEDIUM, LOW, UNKNOWN
    metadata: Dict[str, Any] = field(default_factory=dict)
    hop: int = 0
    is_root: bool = False

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

@dataclass
class InvestigationEdge:
    id: str
    source: str
    target: str
    type: str  # INITIATED_BY, USES_DEVICE, REGISTERED_PHONE, USES_UPI, SENDS_TO_BENEFICIARY, SHARED_DEVICE, LINKED_ACCOUNT, ASSOCIATED_CASE, RELATED_TXN
    suspiciousness: str  # NORMAL, SUSPICIOUS, HIGH-RISK
    evidence: str
    timestamp: Optional[str] = None
    supporting_transactions: List[str] = field(default_factory=list)
    risk: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

@dataclass
class InvestigationPath:
    source_id: str
    target_id: str
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    hop_count: int
    description: str
    is_suspicious: bool = True

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

@dataclass
class InvestigationGraph:
    investigation_id: str
    root: Dict[str, Any]
    depth: int
    nodes: List[InvestigationNode]
    edges: List[InvestigationEdge]
    paths: List[InvestigationPath] = field(default_factory=list)
    risk_summary: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "investigation_id": self.investigation_id,
            "root": self.root,
            "depth": self.depth,
            "nodes": [n.to_dict() for n in self.nodes],
            "edges": [e.to_dict() for e in self.edges],
            "paths": [p.to_dict() for p in self.paths],
            "risk_summary": self.risk_summary
        }
