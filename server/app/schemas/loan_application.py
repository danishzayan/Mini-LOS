from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import date, datetime
from app.core.enums import ApplicationStatus, EmploymentType


class LoanApplicationBase(BaseModel):
    full_name: str
    mobile: str
    pan: str
    dob: date
    email: Optional[str] = None
    address: Optional[str] = None
    employment_type: EmploymentType = EmploymentType.SALARIED
    monthly_income: float
    loan_amount: float
    loan_purpose: Optional[str] = None


class LoanApplicationCreate(LoanApplicationBase):
    @field_validator('pan')
    @classmethod
    def validate_pan_format(cls, v):
        import re
        pattern = r"^[A-Z]{5}[0-9]{4}[A-Z]{1}$"
        if not re.match(pattern, v.upper()):
            raise ValueError('Invalid PAN format. Expected format: ABCDE1234F')
        return v.upper()

    @field_validator('mobile')
    @classmethod
    def validate_mobile(cls, v):
        import re
        # Remove any spaces or dashes
        cleaned = re.sub(r'[\s\-]', '', v)
        if not re.match(r'^[6-9]\d{9}$', cleaned):
            raise ValueError('Invalid mobile number. Must be 10 digits starting with 6-9')
        return cleaned

    @field_validator('monthly_income')
    @classmethod
    def validate_income(cls, v):
        if v <= 0:
            raise ValueError('Monthly income must be positive')
        return v

    @field_validator('loan_amount')
    @classmethod
    def validate_loan_amount(cls, v):
        if v <= 0:
            raise ValueError('Loan amount must be positive')
        return v


class LoanApplicationUpdate(BaseModel):
    full_name: Optional[str] = None
    mobile: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    employment_type: Optional[EmploymentType] = None
    monthly_income: Optional[float] = None
    loan_amount: Optional[float] = None
    loan_purpose: Optional[str] = None


class LoanApplicationResponse(LoanApplicationBase):
    id: int
    status: ApplicationStatus
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class LoanApplicationDetailResponse(LoanApplicationResponse):
    kyc_result: Optional[dict] = None
    credit_result: Optional[dict] = None
    eligibility_result: Optional[dict] = None

    class Config:
        from_attributes = True
