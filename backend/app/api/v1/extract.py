from fastapi import APIRouter, HTTPException
from app.api.schemas import TextExtractRequest, ExposureInput
from app.services.ai_service import extract_exposure

router = APIRouter(tags=["ai", "extraction"])

@router.post("/extract", response_model=ExposureInput)
def extract_exposure_endpoint(payload: TextExtractRequest) -> ExposureInput:
    """Takes natural language text and automatically extracts the exposure details, fetching the live base rate internally."""
    try:
        result = extract_exposure(text=payload.text)
        return result
    except ValueError as e:
        # e.g., missing API key or genai not installed
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to extract exposure from text: {str(e)}")
