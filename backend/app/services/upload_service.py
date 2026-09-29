from io import BytesIO
import math
from typing import Any

import pandas as pd


REQUIRED_COLUMNS = {"amount", "currency", "days_to_payment"}


def _required_number(value: Any, field: str) -> float:
    if pd.isna(value):
        raise ValueError(f"{field} is required")
    normalized = str(value).strip().replace(",", "").replace("₹", "").replace("$", "")
    try:
        number = float(normalized)
    except (TypeError, ValueError) as error:
        raise ValueError(f"{field} must be a valid number") from error
    if not math.isfinite(number):
        raise ValueError(f"{field} must be a finite number")
    return number


def _whole_number(value: Any, field: str) -> int:
    number = _required_number(value, field)
    if not number.is_integer():
        raise ValueError(f"{field} must be a whole number")
    return int(number)


def parse_exposure_file(filename: str, content: bytes) -> tuple[dict[str, Any], int]:
    """Read the first row of a CSV/XLSX into the Phase 1 exposure contract."""
    is_csv = filename.lower().endswith(".csv")
    is_excel = filename.lower().endswith((".xlsx", ".xls"))
    if not (is_csv or is_excel):
        raise ValueError("upload a CSV or Excel file")
    try:
        if is_csv:
            frame = pd.read_csv(BytesIO(content))
        else:
            frame = pd.read_excel(BytesIO(content))
    except pd.errors.EmptyDataError as error:
        raise ValueError("the uploaded file has no data rows") from error
    except (OSError, ValueError, pd.errors.ParserError) as error:
        raise ValueError("could not read the uploaded file") from error
    frame.columns = [str(column).strip().lower() for column in frame.columns]
    missing = REQUIRED_COLUMNS - set(frame.columns)
    if missing:
        raise ValueError(f"missing required columns: {', '.join(sorted(missing))}")
    if frame.empty:
        raise ValueError("the uploaded file has no data rows")
    exposures = []
    for _, row in frame.iterrows():
        try:
            ex = {
                "amount": abs(_required_number(row["amount"], "amount")),
                "currency": str(row["currency"]).strip(),
                "days_to_payment": _whole_number(row["days_to_payment"], "days_to_payment"),
                "counterparty": None if pd.isna(row.get("counterparty")) else str(row.get("counterparty")),
                "exposure_type": str(row.get("exposure_type", "payable")),
            }
            exposures.append(ex)
        except ValueError:
            pass # skip invalid rows for now, or we could handle them
            
    if not exposures:
        raise ValueError("no valid data rows found in the uploaded file")

    return exposures, len(frame)
