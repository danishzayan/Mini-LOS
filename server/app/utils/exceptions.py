from fastapi import HTTPException, status


class LOSException(Exception):
    """Base exception for Mini-LOS application"""
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class InvalidWorkflowException(LOSException):
    """Exception raised when workflow state transition is invalid"""
    def __init__(self, message: str):
        super().__init__(message, status_code=400)


class ValidationException(LOSException):
    """Exception raised when validation fails"""
    def __init__(self, message: str):
        super().__init__(message, status_code=422)


class NotFoundException(LOSException):
    """Exception raised when a resource is not found"""
    def __init__(self, message: str):
        super().__init__(message, status_code=404)


class KYCFailedException(LOSException):
    """Exception raised when KYC verification fails"""
    def __init__(self, message: str):
        super().__init__(message, status_code=400)


class CreditCheckFailedException(LOSException):
    """Exception raised when credit check fails"""
    def __init__(self, message: str):
        super().__init__(message, status_code=400)


class EligibilityException(LOSException):
    """Exception raised when eligibility check fails"""
    def __init__(self, message: str):
        super().__init__(message, status_code=400)


class AuthenticationException(LOSException):
    """Exception raised for authentication errors"""
    def __init__(self, message: str = "Could not validate credentials"):
        super().__init__(message, status_code=401)


class AuthorizationException(LOSException):
    """Exception raised for authorization errors"""
    def __init__(self, message: str = "Not enough permissions"):
        super().__init__(message, status_code=403)


# HTTP Exception helpers
def raise_not_found(detail: str = "Resource not found"):
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


def raise_bad_request(detail: str):
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


def raise_unauthorized(detail: str = "Could not validate credentials"):
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


def raise_forbidden(detail: str = "Not enough permissions"):
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


def raise_validation_error(detail: str):
    raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=detail)
