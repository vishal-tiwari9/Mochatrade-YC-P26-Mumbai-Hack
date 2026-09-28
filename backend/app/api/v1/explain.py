from fastapi import APIRouter, HTTPException
from app.api.schemas import AIExplanationRequest, RiskExplanationResponse
from app.services.ai_service import explain_risk

router = APIRouter(tags=["ai", "explanation"])

@router.post("/explain", response_model=RiskExplanationResponse)
def explain_risk_endpoint(payload: AIExplanationRequest) -> RiskExplanationResponse:
    print(f"Started generating AI explanation for {len(str(payload.context))} bytes of context...", flush=True)
    try:
        explanation_data = explain_risk(context=payload.context)
        return RiskExplanationResponse(**explanation_data)
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to generate explanation: {str(e)}")
