from fastapi import APIRouter, File, HTTPException, Query, UploadFile

from app.api.schemas import ExposureInput, UploadResponse
from app.services.upload_service import parse_exposure_file
from app.services.rate_service import get_live_inr_rate

router = APIRouter(tags=["upload"])


@router.post("/upload", response_model=UploadResponse)
async def upload_exposure(file: UploadFile = File(...)) -> UploadResponse:
    try:
        parsed_list, row_count = parse_exposure_file(file.filename or "", await file.read())
        exposures = []
        for p in parsed_list:
            live_rate = get_live_inr_rate(p["currency"])
            exposures.append(ExposureInput(**p, base_rate=live_rate))
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    return UploadResponse(filename=file.filename or "upload", rows_processed=row_count, exposures=exposures)
