import random
import json
from abc import ABC, abstractmethod
from datetime import datetime
from app.core.enums import BusinessRules


class CreditBureauService(ABC):
    """Abstract base class for Credit Bureau services"""
    
    @abstractmethod
    def check_credit(self, pan: str) -> dict:
        """
        Check credit score and history.
        
        Args:
            pan: The PAN number of the applicant
            
        Returns:
            Dictionary containing credit bureau results
        """
        pass
    
    @abstractmethod
    def is_approved(self, result: dict) -> bool:
        """
        Check if credit is approved based on result.
        
        Args:
            result: The credit check result dictionary
            
        Returns:
            True if approved, False otherwise
        """
        pass


class MockCibilService(CreditBureauService):
    """
    Mock CIBIL Service implementation.
    Simulates credit bureau check with deterministic scores based on PAN.
    
    Rules:
    - Credit score < 650 → REJECT
    - Active loans > 5 → REJECT
    
    Uses PAN as seed for consistent results (same PAN = same score).
    Biased towards success (80% chance of passing).
    """
    
    def __init__(
        self, 
        min_credit_score: int = 600, 
        max_credit_score: int = 800,
        min_active_loans: int = 0,
        max_active_loans: int = 7
    ):
        self.min_credit_score = min_credit_score
        self.max_credit_score = max_credit_score
        self.min_active_loans = min_active_loans
        self.max_active_loans = max_active_loans
        self.required_min_score = BusinessRules.MIN_CREDIT_SCORE
        self.max_allowed_loans = BusinessRules.MAX_ACTIVE_LOANS
    
    def _get_credit_data_from_pan(self, pan: str) -> tuple:
        """
        Generate deterministic credit data based on PAN.
        Uses PAN as seed so same PAN always gets same results.
        Biased towards passing values (80% chance).
        
        Returns:
            tuple: (credit_score, active_loans)
        """
        if not pan:
            return (
                random.randint(self.min_credit_score, self.max_credit_score),
                random.randint(self.min_active_loans, self.max_active_loans)
            )
        
        # Use PAN hash as seed for reproducibility
        seed = sum(ord(c) for c in pan.upper())
        rng = random.Random(seed)
        
        # 80% chance of getting passing values
        if rng.random() < 0.8:
            credit_score = rng.randint(650, 800)  # Passing score (>=650)
            active_loans = rng.randint(0, 5)       # Passing loans (<=5)
        else:
            # 20% chance of failure - randomly choose which rule to fail
            if rng.random() < 0.5:
                credit_score = rng.randint(600, 649)  # Failing score
                active_loans = rng.randint(0, 5)       # OK loans
            else:
                credit_score = rng.randint(650, 800)  # OK score
                active_loans = rng.randint(6, 7)       # Failing loans
        
        return (credit_score, active_loans)
    
    def check_credit(self, pan: str) -> dict:
        """
        Perform mock credit check.
        
        Args:
            pan: The PAN number of the applicant
            
        Returns:
            Dictionary containing:
            - credit_score: Random score between 600-800
            - active_loans: Random number between 0-7
            - credit_utilization: Random percentage
            - payment_history_score: Random score
            - enquiry_count: Number of credit enquiries
        """
        credit_score, active_loans = self._get_credit_data_from_pan(pan)
        
        result = {
            "credit_score": credit_score,
            "active_loans": active_loans,
            "credit_utilization": round(random.uniform(0.1, 0.9), 2),
            "payment_history_score": round(random.uniform(0.6, 1.0), 2),
            "enquiry_count": random.randint(0, 5),
            "oldest_account_age_months": random.randint(12, 120),
            "pan": pan,
            "check_timestamp": datetime.now().isoformat()
        }
        
        return result
    
    def is_approved(self, result: dict) -> bool:
        """
        Check if credit is approved based on rules.
        
        Args:
            result: The credit check result dictionary
            
        Returns:
            True if both credit score >= 650 AND active loans <= 5
        """
        credit_score = result.get("credit_score", 0)
        active_loans = result.get("active_loans", 999)
        
        score_ok = credit_score >= self.required_min_score
        loans_ok = active_loans <= self.max_allowed_loans
        
        return score_ok and loans_ok
    
    def get_rejection_reasons(self, result: dict) -> list:
        """
        Get list of rejection reasons if credit is not approved.
        
        Args:
            result: The credit check result dictionary
            
        Returns:
            List of rejection reason strings
        """
        reasons = []
        credit_score = result.get("credit_score", 0)
        active_loans = result.get("active_loans", 999)
        
        if credit_score < self.required_min_score:
            reasons.append(
                f"Credit score {credit_score} is below minimum required score of {self.required_min_score}"
            )
        
        if active_loans > self.max_allowed_loans:
            reasons.append(
                f"Active loans count {active_loans} exceeds maximum allowed of {self.max_allowed_loans}"
            )
        
        return reasons
    
    def get_credit_rating(self, score: int) -> str:
        """
        Get credit rating category based on score.
        
        Args:
            score: The credit score
            
        Returns:
            Rating category string
        """
        if score >= 750:
            return "EXCELLENT"
        elif score >= 700:
            return "GOOD"
        elif score >= 650:
            return "FAIR"
        elif score >= 600:
            return "POOR"
        else:
            return "VERY_POOR"


# Factory function to get Credit Bureau service
def get_credit_bureau_service() -> CreditBureauService:
    """
    Factory function to get the appropriate Credit Bureau service.
    Can be extended to return different implementations based on config.
    """
    return MockCibilService()
