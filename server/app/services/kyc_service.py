import random
import json
from abc import ABC, abstractmethod
from app.core.enums import KYCStatus, BusinessRules


class KYCService(ABC):
    """Abstract base class for KYC services"""
    
    @abstractmethod
    def perform_kyc(self, name: str, pan: str = None) -> dict:
        """
        Perform KYC verification.
        
        Args:
            name: The name of the applicant
            pan: The PAN number of the applicant
            
        Returns:
            Dictionary containing KYC results
        """
        pass
    
    @abstractmethod
    def get_kyc_status(self, result: dict) -> KYCStatus:
        """
        Get KYC status from the result.
        
        Args:
            result: The KYC result dictionary
            
        Returns:
            KYCStatus enum value
        """
        pass


class MockKYCService(KYCService):
    """
    Mock KYC Service implementation.
    Simulates KYC verification with deterministic scores based on PAN.
    
    Rules:
    - nameMatchScore < 80 → KYC_FAILED
    - nameMatchScore >= 80 → KYC_PASSED
    
    Uses PAN as seed for consistent results (same PAN = same score).
    Biased towards success (80% chance of passing score).
    """
    
    def __init__(self, min_score: int = 60, max_score: int = 100):
        self.min_score = min_score
        self.max_score = max_score
        self.min_passing_score = BusinessRules.MIN_KYC_SCORE
    
    def _get_score_from_pan(self, pan: str) -> int:
        """
        Generate a deterministic score based on PAN.
        Uses PAN as seed so same PAN always gets same score.
        Biased towards passing scores (80-100) in 80% of cases.
        """
        if not pan:
            return random.randint(self.min_score, self.max_score)
        
        # Use PAN hash as seed for reproducibility
        seed = sum(ord(c) for c in pan.upper())
        rng = random.Random(seed)
        
        # 80% chance of getting a passing score (80-100)
        # 20% chance of getting a failing score (60-79)
        if rng.random() < 0.8:
            return rng.randint(80, 100)  # Passing score
        else:
            return rng.randint(60, 79)   # Failing score
    
    def perform_kyc(self, name: str, pan: str = None) -> dict:
        """
        Perform mock KYC verification.
        
        Args:
            name: The name of the applicant
            pan: The PAN number of the applicant (optional)
            
        Returns:
            Dictionary containing:
            - nameMatchScore: Random score between min_score and max_score
            - status: "PASSED" if score >= 80, "FAILED" otherwise
            - panVerified: "YES" if PAN is provided
            - addressVerified: Random YES/NO
        """
        score = self._get_score_from_pan(pan)
        status = KYCStatus.FAILED if score < self.min_passing_score else KYCStatus.PASSED
        
        result = {
            "nameMatchScore": score,
            "status": status.value,
            "panVerified": "YES" if pan else "NO",
            "addressVerified": random.choice(["YES", "NO"]),
            "verificationTimestamp": self._get_timestamp(),
            "remarks": self._get_remarks(score)
        }
        
        return result
    
    def get_kyc_status(self, result: dict) -> KYCStatus:
        """Get KYC status from result"""
        status_str = result.get("status", "PENDING")
        return KYCStatus(status_str)
    
    def is_passed(self, result: dict) -> bool:
        """Check if KYC passed"""
        return self.get_kyc_status(result) == KYCStatus.PASSED
    
    def _get_timestamp(self) -> str:
        """Get current timestamp"""
        from datetime import datetime
        return datetime.now().isoformat()
    
    def _get_remarks(self, score: int) -> str:
        """Generate remarks based on score"""
        if score >= 90:
            return "Excellent match. All documents verified successfully."
        elif score >= 80:
            return "Good match. Documents verified."
        elif score >= 70:
            return "Partial match. Some discrepancies found."
        else:
            return "Poor match. Verification failed."


# Factory function to get KYC service
def get_kyc_service() -> KYCService:
    """
    Factory function to get the appropriate KYC service.
    Can be extended to return different implementations based on config.
    """
    return MockKYCService()
