from enum import Enum


# Business Rules Constants
class BusinessRules:
    MIN_AGE: int = 21
    MAX_LOAN_MULTIPLIER: float = 20.0
    MIN_CREDIT_SCORE: int = 650
    MAX_ACTIVE_LOANS: int = 5
    MIN_KYC_SCORE: int = 80


class ApplicationStatus(str, Enum):
    DRAFT = "DRAFT"
    KYC_PENDING = "KYC_PENDING"
    KYC_COMPLETED = "KYC_COMPLETED"
    CREDIT_CHECK_PENDING = "CREDIT_CHECK_PENDING"
    CREDIT_CHECK_COMPLETED = "CREDIT_CHECK_COMPLETED"
    ELIGIBLE = "ELIGIBLE"
    NOT_ELIGIBLE = "NOT_ELIGIBLE"


class EmploymentType(str, Enum):
    SALARIED = "SALARIED"
    SELF_EMPLOYED = "SELF_EMPLOYED"


class KYCStatus(str, Enum):
    PENDING = "PENDING"
    PASSED = "PASSED"
    FAILED = "FAILED"
