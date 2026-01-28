from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.core.enums import KYCStatus


class KYCResultBase(BaseModel):
    name_match_score: float
    status: KYCStatus
    pan_verified: Optional[str] = "NO"
    address_verified: Optional[str] = "NO"


class KYCResultCreate(KYCResultBase):
    loan_application_id: int
    raw_response: Optional[str] = None


class KYCResultResponse(KYCResultBase):
    id: int
    loan_application_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class KYCPerformRequest(BaseModel):
    """Request body for performing KYC (optional additional data)"""
    force_recheck: Optional[bool] = False


class KYCPerformResponse(BaseModel):
    """Response after KYC is performed"""
    application_id: int
    name_match_score: float
    kyc_status: KYCStatus
    application_status: str
    message: str
