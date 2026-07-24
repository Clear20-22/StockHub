"""
Domain-specific exceptions for StockHub business logic.
"""

class DomainException(Exception):
    """Base domain exception."""
    pass

class EntityNotFoundError(DomainException):
    """Raised when an entity is not found in the database."""
    def __init__(self, entity_name: str, entity_id: any):
        self.entity_name = entity_name
        self.entity_id = entity_id
        super().__init__(f"{entity_name} with id/identifier '{entity_id}' was not found.")

class DuplicateEntityError(DomainException):
    """Raised when trying to create an entity that already exists."""
    def __init__(self, entity_name: str, field_name: str, value: str):
        self.entity_name = entity_name
        self.field_name = field_name
        self.value = value
        super().__init__(f"{entity_name} with {field_name} '{value}' already exists.")

class InsufficientCapacityError(DomainException):
    """Raised when a branch does not have enough capacity for goods storage."""
    def __init__(self, branch_name: str, requested: float, available: float):
        self.branch_name = branch_name
        self.requested = requested
        self.available = available
        super().__init__(f"Branch '{branch_name}' has insufficient capacity. Requested: {requested}, Available: {available}.")

class UnauthorizedOperationError(DomainException):
    """Raised when an operation violates role authorization policies."""
    def __init__(self, message: str = "Unauthorized operation for current user role."):
        super().__init__(message)
