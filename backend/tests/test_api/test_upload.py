from io import BytesIO
import pandas as pd
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch

from backend.main import app

client = TestClient(app)

# We will apply a patch to all tests that hit /upload
pytestmark = pytest.mark.usefixtures("mock_get_live_inr_rate")

@pytest.fixture
def mock_get_live_inr_rate():
    with patch("app.api.v1.upload.get_live_inr_rate") as mock:
        mock.return_value = 88.5
        yield mock

def test_upload_parses_csv_and_normalizes_headers():
    response = client.post(
        "/api/upload",
        files={"file": ("exposure.csv", b" Amount , Currency , Days_To_Payment , Counterparty\n50000,usd,45,ABC Electronics\n", "text/csv")},
    )

    assert response.status_code == 200
    assert response.json() == {
        "filename": "exposure.csv",
        "rows_processed": 1,
        "exposure": {"amount": 50000, "currency": "USD", "days_to_payment": 45, "counterparty": "ABC Electronics", "exposure_type": "payable", "base_rate": 88.5},
    }


def test_upload_parses_xlsx():
    content = BytesIO()
    pd.DataFrame([{"amount": 1250, "currency": "USD", "days_to_payment": 14}]).to_excel(content, index=False)

    response = client.post("/api/upload", files={"file": ("exposure.xlsx", content.getvalue(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")})

    assert response.status_code == 200
    assert response.json()["exposure"]["amount"] == 1250
    assert response.json()["exposure"]["base_rate"] == 88.5


def test_upload_rejects_missing_required_columns():
    response = client.post("/api/upload", files={"file": ("exposure.csv", b"amount,currency\n50,USD\n", "text/csv")})

    assert response.status_code == 422
    assert response.json()["detail"] == "missing required columns: days_to_payment"


def test_upload_rejects_empty_and_unsupported_files():
    empty = client.post("/api/upload", files={"file": ("empty.csv", b"", "text/csv")})
    unsupported = client.post("/api/upload", files={"file": ("exposure.txt", b"anything", "text/plain")})

    assert empty.status_code == 422
    assert empty.json()["detail"] == "the uploaded file has no data rows"
    assert unsupported.status_code == 422
    assert unsupported.json()["detail"] == "upload a CSV or Excel file"


def test_upload_accepts_formatted_amount_and_float_excel_day_count():
    response = client.post(
        "/api/upload",
        files={"file": ("exposure.csv", b'amount,currency,days_to_payment\n"$50,000",USD,45.0\n', "text/csv")},
    )

    assert response.status_code == 200
    assert response.json()["exposure"]["amount"] == 50_000
    assert response.json()["exposure"]["days_to_payment"] == 45


@pytest.mark.parametrize(
    ("contents", "expected_detail"),
    [
        (b"amount,currency,days_to_payment\n,USD,45\n", "amount is required"),
        (b"amount,currency,days_to_payment\nnot-money,USD,45\n", "amount must be a valid number"),
        (b"amount,currency,days_to_payment\n50000,USD,45.5\n", "days_to_payment must be a whole number"),
    ],
)
def test_upload_returns_422_for_malformed_numeric_cells(contents, expected_detail):
    response = client.post("/api/upload", files={"file": ("exposure.csv", contents, "text/csv")})

    assert response.status_code == 422
    assert response.json()["detail"] == expected_detail
