from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CreditResultBase(BaseModel):
    credit_score: int
    active_loans: int
    credit_utilization: Optional[float] = None
    payment_history_score: Optional[float] = None


class CreditResultCreate(CreditResultBase):
    loan_application_id: int
    is_approved: bool
    rejection_reason: Optional[str] = None
    raw_response: Optional[str] = None


class CreditResultResponse(CreditResultBase):
    id: int
    loan_application_id: int
    is_approved: bool
    rejection_reason: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class CreditCheckRequest(BaseModel):
    """Request body for credit check (optional additional data)"""
    force_recheck: Optional[bool] = False


class CreditCheckResponse(BaseModel):
    """Response after credit check is performed"""
    application_id: int
    credit_score: int
    active_loans: int
    is_approved: bool
    rejection_reason: Optional[str] = None
    application_status: str
    message: str


class EligibilityResultBase(BaseModel):
    max_emi: float
    interest_rate: float
    tenure_months: int
    eligible_amount: Optional[float] = None


class EligibilityResultCreate(EligibilityResultBase):
    loan_application_id: int
    is_eligible: bool
    rejection_reasons: Optional[str] = None


class EligibilityResultResponse(EligibilityResultBase):
    id: int
    loan_application_id: int
    is_eligible: bool
    rejection_reasons: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class EligibilityResponse(BaseModel):
    """Response after eligibility is calculated"""
    application_id: int
    max_emi: float
    interest_rate: float
    tenure_months: int
    eligible_amount: float
    is_eligible: bool
    rejection_reasons: Optional[str] = None
    application_status: str
    message: str
