"""
FraudNexus Configuration Module
Centralized constants, weights, thresholds, and versioning.
"""

from dataclasses import dataclass
from typing import Dict, Any

ENGINE_VERSION = "1.0.0"
CONFIG_PROFILE = "Mumbai Financial Crimes Taskforce v1"

# Maximum theoretical score ceiling
MAX_SCORE = 100

# Severity Bands (Section 9)
SEVERITY_BANDS = [
    (0, 29, "LOW"),
    (30, 59, "MEDIUM"),
    (60, 79, "HIGH"),
    (80, 100, "CRITICAL"),
]

# Configurable Signal Weights and Thresholds (Section 4)
@dataclass(frozen=True)
class RiskConfiguration:
    # A. Previous Fraud Connection
    previous_fraud_weight: int = 25
    
    # B. Shared Device
    shared_device_weight: int = 20
    shared_device_threshold_accounts: int = 3
    
    # C. Transaction Velocity
    velocity_weight: int = 18
    velocity_threshold_txns: int = 15
    velocity_window_hours: int = 2
    
    # D. Multiple Linked Accounts
    linked_accounts_weight: int = 16
    linked_accounts_threshold: int = 2
    
    # E. Common Beneficiary / UPI
    beneficiary_weight: int = 10
    beneficiary_threshold_accounts: int = 3
    
    # F. Amount Anomaly
    amount_anomaly_weight: int = 5
    amount_anomaly_multiplier: float = 2.5
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "engine_version": ENGINE_VERSION,
            "config_profile": CONFIG_PROFILE,
            "max_score": MAX_SCORE,
            "weights": {
                "PREVIOUS_FRAUD": self.previous_fraud_weight,
                "SHARED_DEVICE": self.shared_device_weight,
                "VELOCITY_SURGE": self.velocity_weight,
                "LINKED_ACCOUNTS": self.linked_accounts_weight,
                "COMMON_BENEFICIARY": self.beneficiary_weight,
                "AMOUNT_ANOMALY": self.amount_anomaly_weight,
            },
            "thresholds": {
                "shared_device_accounts": self.shared_device_threshold_accounts,
                "velocity_txns_in_2h": self.velocity_threshold_txns,
                "linked_accounts": self.linked_accounts_threshold,
                "beneficiary_shared_accounts": self.beneficiary_threshold_accounts,
                "amount_anomaly_multiplier": self.amount_anomaly_multiplier,
            }
        }

DEFAULT_CONFIG = RiskConfiguration()
