"""
Abstract base class for all FraudNexus Signal Evaluators.
Ensures uniform contract and clean extensibility.
"""

from abc import ABC, abstractmethod
import sqlite3
from typing import Dict, Any
from ..models import SignalResult
from ...config import RiskConfiguration

class BaseSignalEvaluator(ABC):
    @property
    @abstractmethod
    def signal_id(self) -> str:
        pass

    @property
    @abstractmethod
    def name(self) -> str:
        pass

    @abstractmethod
    def evaluate(self, txn: Dict[str, Any], conn: sqlite3.Connection, config: RiskConfiguration) -> SignalResult:
        """
        Evaluate the transaction against observable database evidence.
        Returns a SignalResult with full explanation and concrete evidence references.
        """
        pass
