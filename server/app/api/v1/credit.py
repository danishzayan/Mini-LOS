from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.loan_application import LoanApplication
from app.models.credit import CreditResult, EligibilityResult
from app.schemas.credit import CreditResultResponse, EligibilityResultResponse
from app.utils.exceptions import raise_not_found

router = APIRouter(prefix="/credit", tags=["Credit"])


@router.get("/{application_id}", response_model=CreditResultResponse)
def get_credit_result(
    application_id: int,
    db: Session = Depends(get_db)
):
    """
    Get credit check result for a loan application.
    """
    credit_result = db.query(CreditResult).filter(
        CreditResult.loan_application_id == application_id
    ).first()
    
    if not credit_result:
        raise_not_found(f"Credit result not found for application ID {application_id}")
    
    return credit_result


@router.get("/{application_id}/eligibility", response_model=EligibilityResultResponse)
def get_eligibility_result(
    application_id: int,
    db: Session = Depends(get_db)
):
    """
    Get eligibility result for a loan application.
    """
    eligibility_result = db.query(EligibilityResult).filter(
        EligibilityResult.loan_application_id == application_id
    ).first()
    
    if not eligibility_result:
        raise_not_found(f"Eligibility result not found for application ID {application_id}")
    
    return eligibility_result
