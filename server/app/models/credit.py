from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class CreditResult(Base):
    __tablename__ = "credit_results"

    id = Column(Integer, primary_key=True, index=True)
    loan_application_id = Column(Integer, ForeignKey("loan_applications.id"), unique=True, nullable=False)
    
    # Credit Bureau Data
    credit_score = Column(Integer, nullable=False)
    active_loans = Column(Integer, default=0)
    
    # Additional Credit Info
    credit_utilization = Column(Float)
    payment_history_score = Column(Float)
    
    # Decision
    is_approved = Column(Boolean, default=False)
    rejection_reason = Column(String(500))
    
    # Raw Response (JSON as string)
    raw_response = Column(String(2000))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationship
    loan_application = relationship("LoanApplication", back_populates="credit_result")


class EligibilityResult(Base):
    __tablename__ = "eligibility_results"

    id = Column(Integer, primary_key=True, index=True)
    loan_application_id = Column(Integer, ForeignKey("loan_applications.id"), unique=True, nullable=False)
    
    # Eligibility Details
    max_emi = Column(Float, nullable=False)
    interest_rate = Column(Float, nullable=False)
    tenure_months = Column(Integer, nullable=False)
    eligible_amount = Column(Float)
    
    # Decision
    is_eligible = Column(Boolean, default=False)
    rejection_reasons = Column(String(1000))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationship
    loan_application = relationship("LoanApplication", back_populates="eligibility_result")
