from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import json

from app.core.database import get_db
from app.core.enums import KYCStatus
from app.models.loan_application import LoanApplication
from app.models.kyc import KYCResult
from app.schemas.kyc import KYCResultResponse, KYCPerformResponse
from app.utils.exceptions import raise_not_found, raise_bad_request
from app.services.workflow_service import ensure_status
from app.services.kyc_service import get_kyc_service
from app.core.enums import ApplicationStatus

router = APIRouter(prefix="/kyc", tags=["KYC"])


@router.get("/{application_id}", response_model=KYCResultResponse)
def get_kyc_result(
    application_id: int,
    db: Session = Depends(get_db)
):
    """
    Get KYC result for a loan application.
    """
    kyc_result = db.query(KYCResult).filter(
        KYCResult.loan_application_id == application_id
    ).first()
    
    if not kyc_result:
        raise_not_found(f"KYC result not found for application ID {application_id}")
    
    return kyc_result


@router.post("/{application_id}/retry", response_model=KYCPerformResponse)
def retry_kyc(
    application_id: int,
    db: Session = Depends(get_db)
):
    """
    Retry KYC verification (only if previous KYC failed).
    
    This creates a new application flow - the old application remains NOT_ELIGIBLE.
    """
    # Get application
    application = db.query(LoanApplication).filter(
        LoanApplication.id == application_id
    ).first()
    
    if not application:
        raise_not_found(f"Loan application with ID {application_id} not found")
    
    # Check if KYC was already completed successfully
    if application.status == ApplicationStatus.KYC_COMPLETED.value:
        raise_bad_request("KYC already completed successfully for this application")
    
    # Check if application is in NOT_ELIGIBLE state due to KYC failure
    if application.status != ApplicationStatus.NOT_ELIGIBLE.value:
        raise_bad_request(
            f"KYC retry is only allowed for failed applications. "
            f"Current status: {application.status}"
        )
    
    # Check if KYC result exists and failed
    existing_kyc = db.query(KYCResult).filter(
        KYCResult.loan_application_id == application_id
    ).first()
    
    if not existing_kyc or existing_kyc.status != KYCStatus.FAILED.value:
        raise_bad_request("KYC retry is only allowed for KYC-failed applications")
    
    # Perform KYC again
    kyc_service = get_kyc_service()
    kyc_result = kyc_service.perform_kyc(
        name=application.full_name,
        pan=application.pan
    )
    
    # Determine KYC status
    kyc_passed = kyc_service.is_passed(kyc_result)
    kyc_status = KYCStatus.PASSED if kyc_passed else KYCStatus.FAILED
    
    # Update existing KYC result
    existing_kyc.name_match_score = kyc_result["nameMatchScore"]
    existing_kyc.status = kyc_status.value
    existing_kyc.pan_verified = kyc_result.get("panVerified", "NO")
    existing_kyc.address_verified = kyc_result.get("addressVerified", "NO")
    existing_kyc.raw_response = json.dumps(kyc_result)
    
    # Update application status
    if kyc_passed:
        application.status = ApplicationStatus.KYC_COMPLETED.value
        message = "KYC verification passed on retry. You can proceed to credit check."
    else:
        application.status = ApplicationStatus.NOT_ELIGIBLE.value
        message = f"KYC verification failed again. Name match score: {kyc_result['nameMatchScore']}. Minimum required: 80."
    
    db.commit()
    
    return KYCPerformResponse(
        application_id=application.id,
        name_match_score=kyc_result["nameMatchScore"],
        kyc_status=kyc_status,
        application_status=application.status,
        message=message
    )
