from app.core.enums import ApplicationStatus
from app.utils.exceptions import InvalidWorkflowException


# Define valid state transitions
VALID_TRANSITIONS = {
    ApplicationStatus.DRAFT: [ApplicationStatus.KYC_PENDING],
    ApplicationStatus.KYC_PENDING: [ApplicationStatus.KYC_COMPLETED, ApplicationStatus.NOT_ELIGIBLE],
    ApplicationStatus.KYC_COMPLETED: [ApplicationStatus.CREDIT_CHECK_PENDING],
    ApplicationStatus.CREDIT_CHECK_PENDING: [ApplicationStatus.CREDIT_CHECK_COMPLETED, ApplicationStatus.NOT_ELIGIBLE],
    ApplicationStatus.CREDIT_CHECK_COMPLETED: [ApplicationStatus.ELIGIBLE, ApplicationStatus.NOT_ELIGIBLE],
    ApplicationStatus.ELIGIBLE: [],  # Terminal state
    ApplicationStatus.NOT_ELIGIBLE: [],  # Terminal state
}


def ensure_status(current: str, expected: str | ApplicationStatus) -> None:
    """
    Ensure the current status matches the expected status.
    Raises InvalidWorkflowException if they don't match.
    
    Args:
        current: The current application status
        expected: The expected application status
    """
    # Convert string to enum if needed
    if isinstance(expected, str):
        expected = ApplicationStatus(expected)
    
    if isinstance(current, str):
        current_status = ApplicationStatus(current)
    else:
        current_status = current
    
    if current_status != expected:
        raise InvalidWorkflowException(
            f"Invalid workflow state. Expected '{expected.value}', but current status is '{current_status.value}'"
        )


def ensure_status_in(current: str, expected_statuses: list) -> None:
    """
    Ensure the current status is one of the expected statuses.
    Raises InvalidWorkflowException if not.
    
    Args:
        current: The current application status
        expected_statuses: List of acceptable statuses
    """
    if isinstance(current, str):
        current_status = ApplicationStatus(current)
    else:
        current_status = current
    
    expected_enum_statuses = [
        ApplicationStatus(s) if isinstance(s, str) else s 
        for s in expected_statuses
    ]
    
    if current_status not in expected_enum_statuses:
        expected_values = [s.value for s in expected_enum_statuses]
        raise InvalidWorkflowException(
            f"Invalid workflow state. Expected one of {expected_values}, "
            f"but current status is '{current_status.value}'"
        )


def can_transition(current: str, target: str | ApplicationStatus) -> bool:
    """
    Check if a transition from current status to target status is valid.
    
    Args:
        current: The current application status
        target: The target application status
        
    Returns:
        True if the transition is valid, False otherwise
    """
    if isinstance(current, str):
        current_status = ApplicationStatus(current)
    else:
        current_status = current
    
    if isinstance(target, str):
        target_status = ApplicationStatus(target)
    else:
        target_status = target
    
    valid_targets = VALID_TRANSITIONS.get(current_status, [])
    return target_status in valid_targets


def validate_transition(current: str, target: str | ApplicationStatus) -> None:
    """
    Validate that a transition is allowed, raise exception if not.
    
    Args:
        current: The current application status
        target: The target application status
    """
    if not can_transition(current, target):
        if isinstance(current, str):
            current_status = ApplicationStatus(current)
        else:
            current_status = current
        
        if isinstance(target, str):
            target_status = ApplicationStatus(target)
        else:
            target_status = target
        
        valid_targets = VALID_TRANSITIONS.get(current_status, [])
        valid_values = [s.value for s in valid_targets]
        
        raise InvalidWorkflowException(
            f"Cannot transition from '{current_status.value}' to '{target_status.value}'. "
            f"Valid transitions: {valid_values if valid_values else 'None (terminal state)'}"
        )


def get_next_status(current: str, success: bool = True) -> ApplicationStatus:
    """
    Get the next status based on current status and success/failure.
    
    Args:
        current: The current application status
        success: Whether the current step was successful
        
    Returns:
        The next ApplicationStatus
    """
    status_map = {
        ApplicationStatus.DRAFT: ApplicationStatus.KYC_PENDING,
        ApplicationStatus.KYC_PENDING: ApplicationStatus.KYC_COMPLETED if success else ApplicationStatus.NOT_ELIGIBLE,
        ApplicationStatus.KYC_COMPLETED: ApplicationStatus.CREDIT_CHECK_PENDING,
        ApplicationStatus.CREDIT_CHECK_PENDING: ApplicationStatus.CREDIT_CHECK_COMPLETED if success else ApplicationStatus.NOT_ELIGIBLE,
        ApplicationStatus.CREDIT_CHECK_COMPLETED: ApplicationStatus.ELIGIBLE if success else ApplicationStatus.NOT_ELIGIBLE,
    }
    
    if isinstance(current, str):
        current_status = ApplicationStatus(current)
    else:
        current_status = current
    
    return status_map.get(current_status)


def is_terminal_state(status: str | ApplicationStatus) -> bool:
    """
    Check if the given status is a terminal state.
    
    Args:
        status: The application status to check
        
    Returns:
        True if the status is terminal (ELIGIBLE or NOT_ELIGIBLE)
    """
    if isinstance(status, str):
        status = ApplicationStatus(status)
    
    return status in [ApplicationStatus.ELIGIBLE, ApplicationStatus.NOT_ELIGIBLE]
