from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
from app.core.enums import KYCStatus


class KYCResult(Base):
    __tablename__ = "kyc_results"

    id = Column(Integer, primary_key=True, index=True)
    loan_application_id = Column(Integer, ForeignKey("loan_applications.id"), unique=True, nullable=False)
    
    # KYC Details
    name_match_score = Column(Float, nullable=False)
    status = Column(String(20), default=KYCStatus.PENDING)
    
    # Additional KYC Info (can be extended)
    pan_verified = Column(String(10), default="NO")
    address_verified = Column(String(10), default="NO")
    
    # Response Data (JSON stored as string for simplicity)
    raw_response = Column(String(2000))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationship
    loan_application = relationship("LoanApplication", back_populates="kyc_result")
