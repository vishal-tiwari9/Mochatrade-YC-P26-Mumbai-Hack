import re

import pdfplumber
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from ml.risk_model import risk_model

app = FastAPI(title="NBFC PDF Extractor Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Every field starts as None ("not found") — we never invent a financial
# value. Underwriting integrity depends on the caller (the Node backend)
# being able to tell "extracted" apart from "assumed", so it can correctly
# route to INSUFFICIENT_DATA when critical fields are missing.
FIELDS = ["panNumber", "monthlyIncome", "cibilScore", "bounceCountLast6M", "avgMonthlyBalance"]

PAN_PATTERN = re.compile(r"[A-Z]{5}[0-9]{4}[A-Z]{1}")
MONTHLY_INCOME_PATTERN = re.compile(
    r"(?:monthly\s*income|net\s*monthly\s*income)\D{0,10}([\d,]+)", re.IGNORECASE
)
CIBIL_PATTERN = re.compile(r"(?:cibil|credit\s*score)\D{0,10}(\d{3})", re.IGNORECASE)
BOUNCE_PATTERN = re.compile(r"bounce[s]?\D{0,10}(\d+)", re.IGNORECASE)
AVG_BALANCE_PATTERN = re.compile(
    r"(?:average\s*balance|avg\.?\s*balance)\D{0,10}([\d,]+)", re.IGNORECASE
)


def to_number(raw: str):
    try:
        return float(raw.replace(",", ""))
    except (ValueError, AttributeError):
        return None


def extract_fields(text: str, tables: list):
    extracted = dict.fromkeys(FIELDS, None)

    pan_match = PAN_PATTERN.search(text)
    if pan_match:
        extracted["panNumber"] = pan_match.group(0)

    income_match = MONTHLY_INCOME_PATTERN.search(text)
    if income_match:
        extracted["monthlyIncome"] = to_number(income_match.group(1))

    cibil_match = CIBIL_PATTERN.search(text)
    if cibil_match:
        extracted["cibilScore"] = int(cibil_match.group(1))

    bounce_match = BOUNCE_PATTERN.search(text)
    if bounce_match:
        extracted["bounceCountLast6M"] = int(bounce_match.group(1))

    balance_match = AVG_BALANCE_PATTERN.search(text)
    if balance_match:
        extracted["avgMonthlyBalance"] = to_number(balance_match.group(1))

    missing_fields = [field for field, value in extracted.items() if value is None]

    return {
        "extractedData": extracted,
        "missingFields": missing_fields,
        "tablesFound": len(tables),
    }


@app.get("/health")
def health():
    return {"status": "healthy", "service": "Python PDF Extractor", "mlModelReady": risk_model.is_ready}


class PredictRiskRequest(BaseModel):
    cibilScore: float = Field(..., ge=300, le=900)
    foir: float = Field(..., ge=0)
    dpd90Count: float = Field(0, ge=0)
    bounceCountLast6M: float = Field(0, ge=0)
    hasWriteOff: bool = False
    obligationRatio: float = Field(0, ge=0)
    loanToIncomeRatio: float = Field(0, ge=0)
    assetToLoanRatio: float = Field(0, ge=0)
    incomeTrendPct: float = 0


@app.get("/api/model-info")
def model_info():
    """
    Metadata for the Admin ML console: algorithm, accuracy/AUC, feature
    weights, and — importantly — an explicit statement that this was trained
    on synthetic data, not real loan outcomes. Never hide that from judges.
    """
    if not risk_model.is_ready:
        return JSONResponse(
            status_code=503,
            content={"ready": False, "error": "Model not trained yet. Run: python ml/train_model.py"},
        )
    return {"ready": True, **risk_model.meta}


@app.post("/api/predict-risk")
def predict_risk(payload: PredictRiskRequest):
    """
    Returns an advisory default-risk score (mlRiskScore) with per-feature
    explanations. This is ONE MORE metric the deterministic rule engine can
    reference — it is never the sole authority for a credit decision.
    """
    if not risk_model.is_ready:
        return JSONResponse(
            status_code=503,
            content={"error": "Model not trained yet. Run: python ml/train_model.py"},
        )

    features = payload.model_dump()
    features["hasWriteOff"] = 1.0 if features["hasWriteOff"] else 0.0

    try:
        result = risk_model.predict(features)
    except Exception as err:
        return JSONResponse(status_code=500, content={"error": f"Prediction failed: {err}"})

    return result


@app.post("/api/extract-pdf")
async def extract_pdf(file: UploadFile | None = File(default=None)):
    # FastAPI's own "field required" 422 is fine, but a blank/omitted upload
    # (e.g. a form submitted with no file selected) reaches us as None or an
    # empty filename — handle both with a clean, safe error response instead
    # of a stack trace.
    if file is None or not file.filename:
        return JSONResponse(
            status_code=400,
            content={"success": False, "error": "No PDF file was submitted."},
        )

    if not file.filename.lower().endswith(".pdf"):
        return JSONResponse(
            status_code=400,
            content={"success": False, "error": "Only PDF files are supported."},
        )

    text_chunks = []
    tables = []

    try:
        with pdfplumber.open(file.file) as pdf:
            if len(pdf.pages) == 0:
                raise ValueError("PDF has no pages")
            for page in pdf.pages:
                page_text = page.extract_text() or ""
                text_chunks.append(page_text)
                tables.extend(page.extract_tables() or [])
    except Exception:
        # Never leak parser internals/stack traces — same "safe error
        # responses" principle applied on the Node side.
        return JSONResponse(
            status_code=400,
            content={"success": False, "error": "Could not read this PDF — it may be corrupted, empty, or password-protected."},
        )

    full_text = "\n".join(text_chunks)
    result = extract_fields(full_text, tables)

    return {
        "success": True,
        "fileName": file.filename,
        **result,
    }
