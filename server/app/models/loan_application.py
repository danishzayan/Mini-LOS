from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
from app.core.enums import ApplicationStatus, EmploymentType


class LoanApplication(Base):
    __tablename__ = "loan_applications"

    id = Column(Integer, primary_key=True, index=True)
    
    # User who created the application (foreign key to users table)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    
    # Personal Information
    full_name = Column(String(100), nullable=False)
    mobile = Column(String(15), nullable=False)
    pan = Column(String(10), nullable=False, index=True)
    dob = Column(Date, nullable=False)
    email = Column(String(100))
    address = Column(String(500))
    
    # Employment & Financial
    employment_type = Column(String(20), default=EmploymentType.SALARIED)
    monthly_income = Column(Float, nullable=False)
    
    # Loan Details
    loan_amount = Column(Float, nullable=False)
    loan_purpose = Column(String(200))
    
    # Application Status
    status = Column(String(50), default=ApplicationStatus.DRAFT, index=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="loan_applications")
    kyc_result = relationship("KYCResult", back_populates="loan_application", uselist=False)
    credit_result = relationship("CreditResult", back_populates="loan_application", uselist=False)
    eligibility_result = relationship("EligibilityResult", back_populates="loan_application", uselist=False)
