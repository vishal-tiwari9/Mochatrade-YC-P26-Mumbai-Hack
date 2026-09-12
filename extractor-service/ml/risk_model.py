"""Loads the trained risk model and serves scored predictions with
per-feature contributions, so the score is explainable rather than a
black-box number. See train_model.py for how it was trained.
"""

import json
from pathlib import Path

import numpy as np

MODEL_DIR = Path(__file__).parent
MODEL_PATH = MODEL_DIR / "model.joblib"
META_PATH = MODEL_DIR / "model_meta.json"


def _risk_grade(score: float) -> str:
    if score >= 0.65:
        return "CRITICAL"
    if score >= 0.4:
        return "HIGH"
    if score >= 0.2:
        return "MEDIUM"
    return "LOW"


class RiskModel:
    def __init__(self):
        self.pipeline = None
        self.meta = None
        self._load()

    def _load(self):
        if not MODEL_PATH.exists() or not META_PATH.exists():
            return
        import joblib

        self.pipeline = joblib.load(MODEL_PATH)
        with open(META_PATH) as f:
            self.meta = json.load(f)

    @property
    def is_ready(self) -> bool:
        return self.pipeline is not None and self.meta is not None

    def predict(self, features: dict) -> dict:
        if not self.is_ready:
            raise RuntimeError("Model not trained yet — run ml/train_model.py")

        feature_order = self.meta["features"]
        x = np.array([[features[name] for name in feature_order]])

        score = float(self.pipeline.predict_proba(x)[0][1])

        # Per-feature contribution = standardized value * learned coefficient,
        # so this reflects what actually drove *this* prediction, not just
        # the model's global weights.
        scaler = self.pipeline.named_steps["scaler"]
        model = self.pipeline.named_steps["model"]
        standardized = scaler.transform(x)[0]
        contributions = standardized * model.coef_[0]

        top_factors = sorted(
            (
                {
                    "feature": name,
                    "value": features[name],
                    "contribution": round(float(contrib), 4),
                    "direction": "increases_risk" if contrib > 0 else "decreases_risk",
                }
                for name, contrib in zip(feature_order, contributions)
            ),
            key=lambda f: abs(f["contribution"]),
            reverse=True,
        )

        return {
            "riskScore": round(score, 4),
            "riskGrade": _risk_grade(score),
            "topFactors": top_factors[:5],
            "modelVersion": self.meta["trainedAt"],
        }


risk_model = RiskModel()
