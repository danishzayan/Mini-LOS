from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.core.security import get_current_admin_user
from app.core.enums import ApplicationStatus
from app.models.user import User
from app.models.loan_application import LoanApplication
from app.schemas.loan_application import LoanApplicationResponse

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/loans", response_model=List[LoanApplicationResponse])
def get_all_loans(
    status: Optional[ApplicationStatus] = Query(None, description="Filter by application status"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_admin_user)  # Uncomment to require admin auth
):
    """
    Get all loan applications with optional status filter.
    
    Admin endpoint to view all applications.
    
    Examples:
    - GET /admin/loans - Get all applications
    - GET /admin/loans?status=ELIGIBLE - Get eligible applications
    - GET /admin/loans?status=NOT_ELIGIBLE - Get rejected applications
    - GET /admin/loans?status=DRAFT - Get draft applications
    """
    query = db.query(LoanApplication)
    
    if status:
        query = query.filter(LoanApplication.status == status.value)
    
    # Order by created_at descending (newest first)
    query = query.order_by(LoanApplication.created_at.desc())
    
    applications = query.offset(skip).limit(limit).all()
    
    return applications


@router.get("/loans/stats")
def get_loan_stats(
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_admin_user)  # Uncomment to require admin auth
):
    """
    Get loan application statistics.
    
    Returns count of applications by status.
    """
    stats = {}
    
    for status in ApplicationStatus:
        count = db.query(LoanApplication).filter(
            LoanApplication.status == status.value
        ).count()
        stats[status.value] = count
    
    total = db.query(LoanApplication).count()
    stats["TOTAL"] = total
    
    # Calculate some useful metrics
    eligible_count = stats.get(ApplicationStatus.ELIGIBLE.value, 0)
    not_eligible_count = stats.get(ApplicationStatus.NOT_ELIGIBLE.value, 0)
    completed = eligible_count + not_eligible_count
    
    stats["COMPLETION_RATE"] = round((completed / total * 100), 2) if total > 0 else 0
    stats["APPROVAL_RATE"] = round((eligible_count / completed * 100), 2) if completed > 0 else 0
    
    return stats


@router.get("/loans/{application_id}/history")
def get_application_history(
    application_id: int,
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_admin_user)  # Uncomment to require admin auth
):
    """
    Get full history/details of a loan application including all verification results.
    """
    application = db.query(LoanApplication).filter(
        LoanApplication.id == application_id
    ).first()
    
    if not application:
        from app.utils.exceptions import raise_not_found
        raise_not_found(f"Loan application with ID {application_id} not found")
    
    history = {
        "application": {
            "id": application.id,
            "full_name": application.full_name,
            "mobile": application.mobile,
            "pan": application.pan,
            "dob": application.dob.isoformat() if application.dob else None,
            "employment_type": application.employment_type,
            "monthly_income": application.monthly_income,
            "loan_amount": application.loan_amount,
            "status": application.status,
            "created_at": application.created_at.isoformat() if application.created_at else None,
            "updated_at": application.updated_at.isoformat() if application.updated_at else None
        },
        "kyc": None,
        "credit": None,
        "eligibility": None
    }
    
    if application.kyc_result:
        history["kyc"] = {
            "name_match_score": application.kyc_result.name_match_score,
            "status": application.kyc_result.status,
            "pan_verified": application.kyc_result.pan_verified,
            "address_verified": application.kyc_result.address_verified,
            "created_at": application.kyc_result.created_at.isoformat() if application.kyc_result.created_at else None
        }
    
    if application.credit_result:
        history["credit"] = {
            "credit_score": application.credit_result.credit_score,
            "active_loans": application.credit_result.active_loans,
            "is_approved": application.credit_result.is_approved,
            "rejection_reason": application.credit_result.rejection_reason,
            "created_at": application.credit_result.created_at.isoformat() if application.credit_result.created_at else None
        }
    
    if application.eligibility_result:
        history["eligibility"] = {
            "max_emi": application.eligibility_result.max_emi,
            "interest_rate": application.eligibility_result.interest_rate,
            "tenure_months": application.eligibility_result.tenure_months,
            "eligible_amount": application.eligibility_result.eligible_amount,
            "is_eligible": application.eligibility_result.is_eligible,
            "rejection_reasons": application.eligibility_result.rejection_reasons,
            "created_at": application.eligibility_result.created_at.isoformat() if application.eligibility_result.created_at else None
        }
    
    return history
