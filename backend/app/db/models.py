"""
Domain entity models for FraudNexus
"""

from dataclasses import dataclass, asdict
from typing import Optional, List, Dict, Any

@dataclass
class Account:
    account_id: str
    holder_name: str
    risk_tier: str
    is_flagged: bool
    phone_number: Optional[str] = None
    upi_id: Optional[str] = None
    device_id: Optional[str] = None
    pan_number: Optional[str] = None
    created_at: Optional[str] = None

@dataclass
class Device:
    device_id: str
    device_fingerprint: str
    os_info: Optional[str] = None
    ip_address: Optional[str] = None
    is_flagged: bool = False
    first_seen: Optional[str] = None
    last_seen: Optional[str] = None

@dataclass
class Phone:
    phone_number: str
    carrier: Optional[str] = None
    is_flagged: bool = False

@dataclass
class UPI:
    upi_id: str
    handle: Optional[str] = None
    bank_name: Optional[str] = None
    is_flagged: bool = False

@dataclass
class Beneficiary:
    beneficiary_id: str
    name: str
    account_number: Optional[str] = None
    ifsc: Optional[str] = None
    is_flagged: bool = False

@dataclass
class Transaction:
    transaction_id: str
    account_id: str
    amount: float
    timestamp: str
    device_id: Optional[str] = None
    phone_number: Optional[str] = None
    upi_id: Optional[str] = None
    beneficiary_id: Optional[str] = None
    currency: str = "INR"
    status: str = "COMPLETED"
    channel: str = "UPI"
    lat: Optional[float] = None
    lon: Optional[float] = None

@dataclass
class FraudCase:
    case_id: str
    title: str
    status: str
    description: str
    created_at: str
    flagged_entities: Optional[List[Dict[str, str]]] = None

@dataclass
class MoneyFlowEdge:
    edge_id: str
    case_id: str
    from_entity: str
    to_entity: str
    amount: float
    timestamp: str
    edge_type: str
    hop_order: int

@dataclass
class TimelineEvent:
    event_id: str
    transaction_id: str
    timestamp: str
    title: str
    description: str
    category: str
    severity: str

@dataclass
class InvestigationSession:
    investigation_id: str
    root_id: str
    root_type: str
    title: str
    created_at: str
    status: str = "OPEN"

@dataclass
class InvestigationNote:
    id: int
    investigation_id: str
    note_text: str
    author: str
    created_at: str

@dataclass
class InvestigationFinding:
    id: int
    investigation_id: str
    item_type: str
    item_id: str
    label: str
    is_important: bool
    reason: Optional[str]
    added_at: str

@dataclass
class InvestigationEvidence:
    id: int
    investigation_id: str
    title: str
    details: str
    source: str
    timestamp: str

@dataclass
class InvestigationAuditLog:
    id: int
    investigation_id: str
    action_type: str
    entity_id: Optional[str]
    details: str
    timestamp: str
