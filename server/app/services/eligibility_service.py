from app.core.enums import EmploymentType


def calculate_eligibility(
    monthly_income: float, 
    employment_type: str,
    loan_amount: float = None,
    credit_score: int = None
) -> dict:
    """
    Calculate loan eligibility based on income and employment type.
    
    Rules:
    - SALARIED: max_emi = income × 0.5
    - SELF_EMPLOYED: max_emi = income × 0.4
    - Interest rate: 12% (0.12) annual
    - Default tenure: 36 months
    
    Args:
        monthly_income: Monthly income of the applicant
        employment_type: Type of employment (SALARIED/SELF_EMPLOYED)
        loan_amount: Requested loan amount (optional)
        credit_score: Credit score (optional, for rate adjustment)
        
    Returns:
        Dictionary containing eligibility details
    """
    # Calculate max EMI based on employment type
    if employment_type == EmploymentType.SALARIED.value or employment_type == EmploymentType.SALARIED:
        emi_multiplier = 0.5
    else:
        emi_multiplier = 0.4
    
    max_emi = monthly_income * emi_multiplier
    
    # Base interest rate (annual)
    base_interest_rate = 0.12
    
    # Adjust interest rate based on credit score (if provided)
    if credit_score:
        if credit_score >= 750:
            interest_rate = base_interest_rate - 0.02  # 10%
        elif credit_score >= 700:
            interest_rate = base_interest_rate - 0.01  # 11%
        elif credit_score >= 650:
            interest_rate = base_interest_rate  # 12%
        else:
            interest_rate = base_interest_rate + 0.02  # 14%
    else:
        interest_rate = base_interest_rate
    
    # Default tenure in months
    tenure_months = 36
    
    # Calculate maximum eligible loan amount using EMI formula
    # EMI = P × r × (1 + r)^n / ((1 + r)^n - 1)
    # Rearranged: P = EMI × ((1 + r)^n - 1) / (r × (1 + r)^n)
    monthly_rate = interest_rate / 12
    n = tenure_months
    
    if monthly_rate > 0:
        eligible_amount = max_emi * ((1 + monthly_rate) ** n - 1) / (monthly_rate * (1 + monthly_rate) ** n)
    else:
        eligible_amount = max_emi * n
    
    eligible_amount = round(eligible_amount, 2)
    
    # Determine if requested loan amount is eligible
    is_eligible = True
    rejection_reasons = []
    
    if loan_amount and loan_amount > eligible_amount:
        is_eligible = False
        rejection_reasons.append(
            f"Requested loan amount ₹{loan_amount:,.2f} exceeds eligible amount ₹{eligible_amount:,.2f}"
        )
    
    # Calculate actual EMI for requested amount
    actual_emi = None
    if loan_amount:
        if monthly_rate > 0:
            actual_emi = loan_amount * monthly_rate * ((1 + monthly_rate) ** n) / (((1 + monthly_rate) ** n) - 1)
        else:
            actual_emi = loan_amount / n
        actual_emi = round(actual_emi, 2)
    
    return {
        "max_emi": round(max_emi, 2),
        "interest_rate": round(interest_rate, 4),
        "interest_rate_percent": round(interest_rate * 100, 2),
        "tenure_months": tenure_months,
        "eligible_amount": eligible_amount,
        "is_eligible": is_eligible,
        "rejection_reasons": "; ".join(rejection_reasons) if rejection_reasons else None,
        "actual_emi": actual_emi,
        "employment_type": employment_type if isinstance(employment_type, str) else employment_type.value
    }


def calculate_emi(principal: float, annual_rate: float, tenure_months: int) -> float:
    """
    Calculate EMI (Equated Monthly Installment).
    
    Formula: EMI = P × r × (1 + r)^n / ((1 + r)^n - 1)
    Where:
    - P = Principal amount
    - r = Monthly interest rate
    - n = Number of months
    
    Args:
        principal: Loan principal amount
        annual_rate: Annual interest rate (e.g., 0.12 for 12%)
        tenure_months: Loan tenure in months
        
    Returns:
        Monthly EMI amount
    """
    monthly_rate = annual_rate / 12
    n = tenure_months
    
    if monthly_rate > 0:
        emi = principal * monthly_rate * ((1 + monthly_rate) ** n) / (((1 + monthly_rate) ** n) - 1)
    else:
        emi = principal / n
    
    return round(emi, 2)


def calculate_total_interest(principal: float, emi: float, tenure_months: int) -> float:
    """
    Calculate total interest payable.
    
    Args:
        principal: Loan principal amount
        emi: Monthly EMI
        tenure_months: Loan tenure in months
        
    Returns:
        Total interest amount
    """
    total_payment = emi * tenure_months
    total_interest = total_payment - principal
    return round(total_interest, 2)


def get_amortization_schedule(principal: float, annual_rate: float, tenure_months: int) -> list:
    """
    Generate loan amortization schedule.
    
    Args:
        principal: Loan principal amount
        annual_rate: Annual interest rate
        tenure_months: Loan tenure in months
        
    Returns:
        List of dictionaries containing monthly breakdown
    """
    monthly_rate = annual_rate / 12
    emi = calculate_emi(principal, annual_rate, tenure_months)
    balance = principal
    schedule = []
    
    for month in range(1, tenure_months + 1):
        interest_component = round(balance * monthly_rate, 2)
        principal_component = round(emi - interest_component, 2)
        balance = round(balance - principal_component, 2)
        
        # Handle floating point precision for last payment
        if month == tenure_months:
            principal_component = round(principal_component + balance, 2)
            balance = 0
        
        schedule.append({
            "month": month,
            "emi": emi,
            "principal": principal_component,
            "interest": interest_component,
            "balance": max(balance, 0)
        })
    
    return schedule
