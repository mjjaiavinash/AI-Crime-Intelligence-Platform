# FastAPI dependency — extracts and validates JWT from Authorization header

from typing import Any, Optional
from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from auth.jwt.token import decode_token
from core.exceptions import UnauthorizedException, ForbiddenException

_bearer = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer),
) -> dict[str, Any]:
    """
    Validates the Bearer token and returns the decoded JWT payload.
    Raises 401 if the token is missing, invalid, expired, or revoked.
    """
    if not credentials:
        raise UnauthorizedException("Authorization header missing.")
    payload = decode_token(credentials.credentials)
    if payload.get("type") != "access":
        raise UnauthorizedException("Expected an access token.")
    return payload


def require_role(*roles: str):
    """
    Dependency factory — restricts an endpoint to specific roles.
    Usage:
        @router.post("/", dependencies=[Depends(require_role("admin", "supervisor"))])
    """
    def _guard(user: dict = Depends(get_current_user)) -> dict:
        if user.get("role") not in roles:
            raise ForbiddenException(
                f"Access denied. Required: {', '.join(roles)}. "
                f"Your role: {user.get('role', 'unknown')}."
            )
        return user
    return _guard
