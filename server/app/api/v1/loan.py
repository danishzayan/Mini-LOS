from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
import json

from app.core.database import get_db
from app.core.enums import ApplicationStatus, KYCStatus
from app.core.security import get_current_active_user
from app.models.user import User
from app.models.loan_application import LoanApplication
from app.models.kyc import KYCResult
from app.models.credit import CreditResult, EligibilityResult
from app.schemas.loan_application import (
    LoanApplicationCreate,
    LoanApplicationResponse,
    LoanApplicationDetailResponse,
    LoanApplicationUpdate
)
from app.schemas.kyc import KYCPerformResponse
from app.schemas.credit import CreditCheckResponse, EligibilityResponse
from app.utils.validators import validate_application_data, calculate_age
from app.utils.exceptions import raise_bad_request, raise_not_found
from app.services.workflow_service import ensure_status, validate_transition
from app.services.kyc_service import get_kyc_service
from app.services.credit_bureau_service import get_credit_bureau_service
from app.services.eligibility_service import calculate_eligibility

router = APIRouter(prefix="/loan", tags=["Loan Application"])

# Maximum active loans per user
MAX_ACTIVE_LOANS_PER_USER = 5


@router.get("/stats/total")
def get_total_applications_count(
    db: Session = Depends(get_db)
):
    """
    Get total count of all loan applications (public endpoint for homepage stats).
    """
    total = db.query(LoanApplication).count()
    return {"total": total}


@router.get("/my-loans", response_model=list[LoanApplicationResponse])
def get_my_loans(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all loan applications for the current logged-in user.
    """
    loans = db.query(LoanApplication).filter(
        LoanApplication.user_id == current_user.id
    ).order_by(LoanApplication.created_at.desc()).all()
    
    return loans


@router.post("/create", response_model=LoanApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_loan_application(
    application: LoanApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new loan application (Customer Onboarding).
    
    Requires authentication. User can only apply with their registered email.
    Maximum 5 active loans per user.
    
    Validates:
    - PAN format (ABCDE1234F)
    - Age >= 21
    - Loan amount <= 20 × monthly income
    - Max 5 active loans per user
    """
    # Count ALL applications for this user (regardless of status)
    total_loans_count = db.query(LoanApplication).filter(
        LoanApplication.user_id == current_user.id
    ).count()

    if total_loans_count >= MAX_ACTIVE_LOANS_PER_USER:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum can fill 5 applications for the loan"
        )
    
    # Validate application data
    validation_result = validate_application_data(
        pan=application.pan,
        dob=application.dob,
        loan_amount=application.loan_amount,
        monthly_income=application.monthly_income
    )
    
    if not validation_result["is_valid"]:
        raise_bad_request("; ".join(validation_result["errors"]))
    
    # Check for existing application with same PAN (for this user)
    active_statuses = [
        ApplicationStatus.DRAFT.value,
        ApplicationStatus.KYC_PENDING.value,
        ApplicationStatus.KYC_COMPLETED.value,
        ApplicationStatus.CREDIT_CHECK_PENDING.value,
        ApplicationStatus.CREDIT_CHECK_COMPLETED.value
    ]
    existing = db.query(LoanApplication).filter(
        LoanApplication.user_id == current_user.id,
        LoanApplication.pan == application.pan,
        LoanApplication.status.in_(active_statuses)
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"An active application already exists for this PAN. Application ID: {existing.id}"
        )
    
    # Create application - use user's email automatically
    db_application = LoanApplication(
        user_id=current_user.id,
        full_name=application.full_name,
        mobile=application.mobile,
        pan=application.pan,
        dob=application.dob,
        email=current_user.email,  # Always use the logged-in user's email
        address=application.address,
        employment_type=application.employment_type.value,
        monthly_income=application.monthly_income,
        loan_amount=application.loan_amount,
        loan_purpose=application.loan_purpose,
        status=ApplicationStatus.DRAFT.value
    )
    
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    
    return db_application


@router.get("/{application_id}", response_model=LoanApplicationDetailResponse)
def get_loan_application(
    application_id: int,
    db: Session = Depends(get_db)
):
    """
    Get loan application details by ID (Track Status).
    
    Returns full application details including KYC, Credit, and Eligibility results.
    """
    application = db.query(LoanApplication).filter(
        LoanApplication.id == application_id
    ).first()
    
    if not application:
        raise_not_found(f"Loan application with ID {application_id} not found")
    
    # Build response with related data
    response = LoanApplicationDetailResponse(
        id=application.id,
        full_name=application.full_name,
        mobile=application.mobile,
        pan=application.pan,
        dob=application.dob,
        email=application.email,
        address=application.address,
        employment_type=application.employment_type,
        monthly_income=application.monthly_income,
        loan_amount=application.loan_amount,
        loan_purpose=application.loan_purpose,
        status=application.status,
        created_at=application.created_at,
        updated_at=application.updated_at,
        kyc_result=None,
        credit_result=None,
        eligibility_result=None
    )
    
    # Add KYC result if exists
    if application.kyc_result:
        response.kyc_result = {
            "name_match_score": application.kyc_result.name_match_score,
            "status": application.kyc_result.status,
            "pan_verified": application.kyc_result.pan_verified,
            "address_verified": application.kyc_result.address_verified,
            "created_at": application.kyc_result.created_at.isoformat() if application.kyc_result.created_at else None
        }
    
    # Add Credit result if exists
    if application.credit_result:
        response.credit_result = {
            "credit_score": application.credit_result.credit_score,
            "active_loans": application.credit_result.active_loans,
            "is_approved": application.credit_result.is_approved,
            "rejection_reason": application.credit_result.rejection_reason,
            "created_at": application.credit_result.created_at.isoformat() if application.credit_result.created_at else None
        }
    
    # Add Eligibility result if exists
    if application.eligibility_result:
        response.eligibility_result = {
            "max_emi": application.eligibility_result.max_emi,
            "interest_rate": application.eligibility_result.interest_rate,
            "tenure_months": application.eligibility_result.tenure_months,
            "eligible_amount": application.eligibility_result.eligible_amount,
            "is_eligible": application.eligibility_result.is_eligible,
            "rejection_reasons": application.eligibility_result.rejection_reasons,
            "created_at": application.eligibility_result.created_at.isoformat() if application.eligibility_result.created_at else None
        }
    
    return response


@router.post("/{application_id}/kyc", response_model=KYCPerformResponse)
def perform_kyc(
    application_id: int,
    db: Session = Depends(get_db)
):
    """
    Perform KYC verification for a loan application.
    
    Workflow: DRAFT → KYC_PENDING → KYC_COMPLETED (or NOT_ELIGIBLE)
    
    Rules:
    - nameMatchScore < 80 → KYC_FAILED → NOT_ELIGIBLE
    - nameMatchScore >= 80 → KYC_PASSED → KYC_COMPLETED
    """
    # Get application
    application = db.query(LoanApplication).filter(
        LoanApplication.id == application_id
    ).first()
    
    if not application:
        raise_not_found(f"Loan application with ID {application_id} not found")
    
    # Validate workflow state (must be DRAFT)
    ensure_status(application.status, ApplicationStatus.DRAFT)
    
    # Update status to KYC_PENDING
    application.status = ApplicationStatus.KYC_PENDING.value
    db.commit()
    
    # Perform KYC
    kyc_service = get_kyc_service()
    kyc_result = kyc_service.perform_kyc(
        name=application.full_name,
        pan=application.pan
    )
    
    # Determine KYC status
    kyc_passed = kyc_service.is_passed(kyc_result)
    kyc_status = KYCStatus.PASSED if kyc_passed else KYCStatus.FAILED
    
    # Store KYC result
    db_kyc = KYCResult(
        loan_application_id=application.id,
        name_match_score=kyc_result["nameMatchScore"],
        status=kyc_status.value,
        pan_verified=kyc_result.get("panVerified", "NO"),
        address_verified=kyc_result.get("addressVerified", "NO"),
        raw_response=json.dumps(kyc_result)
    )
    db.add(db_kyc)
    
    # Update application status based on KYC result
    if kyc_passed:
        application.status = ApplicationStatus.KYC_COMPLETED.value
        message = "KYC verification passed. You can proceed to credit check."
    else:
        application.status = ApplicationStatus.NOT_ELIGIBLE.value
        message = f"KYC verification failed. Name match score: {kyc_result['nameMatchScore']}. Minimum required: 80."
    
    db.commit()
    
    return KYCPerformResponse(
        application_id=application.id,
        name_match_score=kyc_result["nameMatchScore"],
        kyc_status=kyc_status,
        application_status=application.status,
        message=message
    )


@router.post("/{application_id}/credit-check", response_model=CreditCheckResponse)
def perform_credit_check(
    application_id: int,
    db: Session = Depends(get_db)
):
    """
    Perform credit bureau check for a loan application.
    
    Workflow: KYC_COMPLETED → CREDIT_CHECK_PENDING → CREDIT_CHECK_COMPLETED (or NOT_ELIGIBLE)
    
    Rules:
    - Credit score < 650 → REJECT
    - Active loans > 5 → REJECT
    """
    # Get application
    application = db.query(LoanApplication).filter(
        LoanApplication.id == application_id
    ).first()
    
    if not application:
        raise_not_found(f"Loan application with ID {application_id} not found")
    
    # Validate workflow state (must be KYC_COMPLETED)
    ensure_status(application.status, ApplicationStatus.KYC_COMPLETED)
    
    # Update status to CREDIT_CHECK_PENDING
    application.status = ApplicationStatus.CREDIT_CHECK_PENDING.value
    db.commit()
    
    # Perform credit check
    credit_service = get_credit_bureau_service()
    credit_result = credit_service.check_credit(pan=application.pan)
    
    # Determine if approved
    is_approved = credit_service.is_approved(credit_result)
    rejection_reasons = credit_service.get_rejection_reasons(credit_result) if not is_approved else []
    
    # Store credit result
    db_credit = CreditResult(
        loan_application_id=application.id,
        credit_score=credit_result["credit_score"],
        active_loans=credit_result["active_loans"],
        credit_utilization=credit_result.get("credit_utilization"),
        payment_history_score=credit_result.get("payment_history_score"),
        is_approved=is_approved,
        rejection_reason="; ".join(rejection_reasons) if rejection_reasons else None,
        raw_response=json.dumps(credit_result)
    )
    db.add(db_credit)
    
    # Update application status based on credit check result
    if is_approved:
        application.status = ApplicationStatus.CREDIT_CHECK_COMPLETED.value
        message = "Credit check passed. Calculating eligibility..."
        
        # Automatically calculate eligibility
        eligibility = calculate_eligibility(
            monthly_income=application.monthly_income,
            employment_type=application.employment_type,
            loan_amount=application.loan_amount,
            credit_score=credit_result["credit_score"]
        )
        
        # Store eligibility result
        db_eligibility = EligibilityResult(
            loan_application_id=application.id,
            max_emi=eligibility["max_emi"],
            interest_rate=eligibility["interest_rate"],
            tenure_months=eligibility["tenure_months"],
            eligible_amount=eligibility["eligible_amount"],
            is_eligible=eligibility["is_eligible"],
            rejection_reasons=eligibility["rejection_reasons"]
        )
        db.add(db_eligibility)
        
        # Update final status
        if eligibility["is_eligible"]:
            application.status = ApplicationStatus.ELIGIBLE.value
            message = f"Congratulations! You are eligible for a loan up to ₹{eligibility['eligible_amount']:,.2f}"
        else:
            application.status = ApplicationStatus.NOT_ELIGIBLE.value
            message = f"Not eligible: {eligibility['rejection_reasons']}"
    else:
        application.status = ApplicationStatus.NOT_ELIGIBLE.value
        message = f"Credit check failed: {'; '.join(rejection_reasons)}"
    
    db.commit()
    
    return CreditCheckResponse(
        application_id=application.id,
        credit_score=credit_result["credit_score"],
        active_loans=credit_result["active_loans"],
        is_approved=is_approved,
        rejection_reason="; ".join(rejection_reasons) if rejection_reasons else None,
        application_status=application.status,
        message=message
    )


@router.put("/{application_id}", response_model=LoanApplicationResponse)
def update_loan_application(
    application_id: int,
    update_data: LoanApplicationUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a loan application (only allowed in DRAFT status).
    """
    application = db.query(LoanApplication).filter(
        LoanApplication.id == application_id
    ).first()
    
    if not application:
        raise_not_found(f"Loan application with ID {application_id} not found")
    
    # Only allow updates in DRAFT status
    ensure_status(application.status, ApplicationStatus.DRAFT)
    
    # Update fields
    update_dict = update_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        if value is not None:
            if field == "employment_type":
                setattr(application, field, value.value)
            else:
                setattr(application, field, value)
    
    # Re-validate if income or loan amount changed
    if "loan_amount" in update_dict or "monthly_income" in update_dict:
        validation_result = validate_application_data(
            pan=application.pan,
            dob=application.dob,
            loan_amount=application.loan_amount,
            monthly_income=application.monthly_income
        )
        
        if not validation_result["is_valid"]:
            raise_bad_request("; ".join(validation_result["errors"]))
    
    db.commit()
    db.refresh(application)
    
    return application
