from fastapi import HTTPException, status


class AppException(HTTPException):
    """Base application exception — maps to an HTTP status code."""
    def __init__(self, detail: str, status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR):
        super().__init__(status_code=status_code, detail=detail)


class NotFoundException(AppException):
    def __init__(self, resource: str = "Resource"):
        super().__init__(f"{resource} not found.", status.HTTP_404_NOT_FOUND)


class UnauthorizedException(AppException):
    def __init__(self, detail: str = "Not authenticated."):
        super().__init__(detail, status.HTTP_401_UNAUTHORIZED)


class ForbiddenException(AppException):
    def __init__(self, detail: str = "Insufficient permissions."):
        super().__init__(detail, status.HTTP_403_FORBIDDEN)


class ConflictException(AppException):
    def __init__(self, detail: str = "Resource already exists."):
        super().__init__(detail, status.HTTP_409_CONFLICT)


class BadRequestException(AppException):
    def __init__(self, detail: str = "Bad request."):
        super().__init__(detail, status.HTTP_400_BAD_REQUEST)


class ServiceUnavailableException(AppException):
    def __init__(self, service: str = "External service"):
        super().__init__(f"{service} is currently unavailable.", status.HTTP_503_SERVICE_UNAVAILABLE)
