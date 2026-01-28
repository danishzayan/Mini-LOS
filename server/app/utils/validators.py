import re
from datetime import date
from app.core.enums import BusinessRules


def validate_pan(pan: str) -> bool:
    """
    Validate PAN (Permanent Account Number) format.
    Format: ABCDE1234F (5 letters, 4 digits, 1 letter)
    """
    pattern = r"^[A-Z]{5}[0-9]{4}[A-Z]{1}$"
    return bool(re.match(pattern, pan.upper()))


def validate_mobile(mobile: str) -> bool:
    """
    Validate Indian mobile number format.
    Must be 10 digits starting with 6, 7, 8, or 9
    """
    cleaned = re.sub(r'[\s\-]', '', mobile)
    pattern = r"^[6-9]\d{9}$"
    return bool(re.match(pattern, cleaned))


def calculate_age(dob: date) -> int:
    """
    Calculate age from date of birth.
    """
    today = date.today()
    age = today.year - dob.year
    # Adjust if birthday hasn't occurred yet this year
    if (today.month, today.day) < (dob.month, dob.day):
        age -= 1
    return age


def validate_age(dob: date, min_age: int = None) -> bool:
    """
    Validate if a person meets the minimum age requirement.
    """
    if min_age is None:
        min_age = BusinessRules.MIN_AGE
    age = calculate_age(dob)
    return age >= min_age


def validate_loan_amount(loan_amount: float, monthly_income: float, multiplier: float = None) -> bool:
    """
    Validate loan amount against income.
    Loan amount should not exceed (monthly_income * multiplier)
    """
    if multiplier is None:
        multiplier = BusinessRules.MAX_LOAN_MULTIPLIER
    max_allowed = monthly_income * multiplier
    return loan_amount <= max_allowed


def get_max_loan_amount(monthly_income: float, multiplier: float = None) -> float:
    """
    Calculate maximum allowed loan amount based on income.
    """
    if multiplier is None:
        multiplier = BusinessRules.MAX_LOAN_MULTIPLIER
    return monthly_income * multiplier


def validate_email(email: str) -> bool:
    """
    Validate email format.
    """
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return bool(re.match(pattern, email))


def format_currency(amount: float) -> str:
    """
    Format amount as Indian currency.
    """
    return f"₹{amount:,.2f}"


def validate_application_data(
    pan: str,
    dob: date,
    loan_amount: float,
    monthly_income: float
) -> dict:
    """
    Validate all application data and return validation results.
    Returns a dictionary with validation status and any errors.
    """
    errors = []
    
    # Validate PAN
    if not validate_pan(pan):
        errors.append("Invalid PAN format. Expected format: ABCDE1234F")
    
    # Validate Age
    if not validate_age(dob):
        age = calculate_age(dob)
        errors.append(f"Applicant must be at least {BusinessRules.MIN_AGE} years old. Current age: {age}")
    
    # Validate Loan Amount
    if not validate_loan_amount(loan_amount, monthly_income):
        max_allowed = get_max_loan_amount(monthly_income)
        errors.append(
            f"Loan amount exceeds maximum allowed. "
            f"Max allowed: {format_currency(max_allowed)} (20x monthly income)"
        )
    
    return {
        "is_valid": len(errors) == 0,
        "errors": errors
    }
