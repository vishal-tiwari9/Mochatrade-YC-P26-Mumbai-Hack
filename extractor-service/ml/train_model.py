"""
Trains the credit-risk scoring model used by /api/predict-risk.

No real historical loan-outcome data exists for this project (synthetic
hackathon MVP, same as the deterministic rule policy). This script generates
a synthetic-but-plausible labeled dataset instead of inventing one by hand:
features are sampled from realistic distributions, a noisy ground-truth
default-probability function combines them with credit-domain-informed
weights, and labels are drawn (Bernoulli) from that probability — so the
model has to genuinely learn the correlations from noisy data rather than
memorize a hand-written rule. That's disclosed here and in /api/model-info,
not hidden.

The trained model is ONE MORE input metric (mlRiskScore) fed into the
existing deterministic rule engine — it never decides anything on its own.
See PROBLEM_STATEMENT.md: "AI/LLM ... never the sole authority."

Run: python ml/train_model.py
Produces: ml/model.joblib, ml/model_meta.json
"""

import json
import time
from pathlib import Path

import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

import joblib

RANDOM_SEED = 42
N_SAMPLES = 6000

# Order matters — this is the exact feature contract with the Node backend's
# /api/predict-risk caller (underwritingController.js) and with the frontend
# ML console. Keep in sync with FEATURE_DESCRIPTIONS below and with main.py's
# PredictRequest model.
FEATURES = [
    "cibilScore",
    "foir",
    "dpd90Count",
    "bounceCountLast6M",
    "hasWriteOff",
    "obligationRatio",
    "loanToIncomeRatio",
    "assetToLoanRatio",
    "incomeTrendPct",
]

FEATURE_DESCRIPTIONS = {
    "cibilScore": "Bureau credit score (300-900)",
    "foir": "Fixed obligation to income ratio, % (existing obligations + proposed EMI / income)",
    "dpd90Count": "Count of 90+ day past-due delinquencies",
    "bounceCountLast6M": "Bank statement bounce count, last 6 months",
    "hasWriteOff": "Prior loan write-off/settlement on record (0/1)",
    "obligationRatio": "Existing obligations / monthly income, %",
    "loanToIncomeRatio": "Requested amount / annualized income",
    "assetToLoanRatio": "Declared assets / requested amount (0 if not declared)",
    "incomeTrendPct": "YoY income change from ITR, % (0 if unavailable)",
}


def generate_synthetic_dataset(n_samples: int, seed: int):
    rng = np.random.default_rng(seed)

    cibil_score = np.clip(rng.normal(680, 90, n_samples), 300, 900)
    foir = np.clip(rng.normal(38, 20, n_samples), 0, 150)
    dpd90_count = rng.poisson(0.15, n_samples)
    bounce_count = rng.poisson(0.6, n_samples)
    has_writeoff = rng.binomial(1, 0.06, n_samples)
    obligation_ratio = np.clip(rng.normal(18, 12, n_samples), 0, 100)
    loan_to_income = np.clip(rng.gamma(2.0, 0.5, n_samples), 0, 8)
    asset_to_loan = np.clip(rng.exponential(0.4, n_samples), 0, 5)
    income_trend = np.clip(rng.normal(4, 15, n_samples), -60, 100)

    # Credit-domain-informed weights for a noisy ground-truth default logit.
    # These are directionally standard underwriting signals (lower CIBIL,
    # higher FOIR/obligation load, delinquency history, thin asset cover ->
    # higher risk) — not fit to any real portfolio.
    logit = (
        -3.4
        + 0.018 * (700 - cibil_score)
        + 0.035 * foir
        + 1.1 * dpd90_count
        + 0.45 * bounce_count
        + 2.3 * has_writeoff
        + 0.02 * obligation_ratio
        + 0.55 * loan_to_income
        - 0.35 * np.minimum(asset_to_loan, 3)
        - 0.012 * income_trend
        + rng.normal(0, 0.9, n_samples)  # noise: unexplained real-world variance
    )
    default_probability = 1 / (1 + np.exp(-logit))
    labels = rng.binomial(1, default_probability)

    X = np.column_stack(
        [cibil_score, foir, dpd90_count, bounce_count, has_writeoff, obligation_ratio, loan_to_income, asset_to_loan, income_trend]
    )
    return X, labels


def main():
    X, y = generate_synthetic_dataset(N_SAMPLES, RANDOM_SEED)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_SEED, stratify=y
    )

    pipeline = Pipeline(
        [
            ("scaler", StandardScaler()),
            ("model", LogisticRegression(max_iter=1000, random_state=RANDOM_SEED)),
        ]
    )
    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    y_proba = pipeline.predict_proba(X_test)[:, 1]
    accuracy = accuracy_score(y_test, y_pred)
    auc_roc = roc_auc_score(y_test, y_proba)

    coefficients = pipeline.named_steps["model"].coef_[0]
    feature_weights = [
        {"feature": name, "coefficient": round(float(coef), 4), "description": FEATURE_DESCRIPTIONS[name]}
        for name, coef in zip(FEATURES, coefficients)
    ]
    feature_weights.sort(key=lambda f: abs(f["coefficient"]), reverse=True)

    model_dir = Path(__file__).parent
    joblib.dump(pipeline, model_dir / "model.joblib")

    meta = {
        "algorithm": "LogisticRegression (scikit-learn, StandardScaler pipeline)",
        "trainedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "trainingSamples": int(len(X_train)),
        "testSamples": int(len(X_test)),
        "accuracy": round(float(accuracy), 4),
        "aucRoc": round(float(auc_roc), 4),
        "features": FEATURES,
        "featureWeights": feature_weights,
        "dataSource": "Synthetic — no real historical loan outcomes exist for this project. "
        "Features drawn from realistic distributions; labels sampled from a noisy, "
        "credit-domain-informed ground-truth function, not memorized from a fixed rule. "
        "Disclosed for judging transparency; do not present as trained on real defaults.",
        "positiveRate": round(float(y.mean()), 4),
    }
    with open(model_dir / "model_meta.json", "w") as f:
        json.dump(meta, f, indent=2)

    print(f"Trained on {len(X_train)} samples, tested on {len(X_test)}.")
    print(f"Accuracy: {accuracy:.4f}  AUC-ROC: {auc_roc:.4f}")
    print("Top feature weights:")
    for fw in feature_weights[:5]:
        print(f"  {fw['feature']:<20} {fw['coefficient']:+.4f}")
    print(f"\nSaved model to {model_dir / 'model.joblib'}")
    print(f"Saved metadata to {model_dir / 'model_meta.json'}")


if __name__ == "__main__":
    main()
