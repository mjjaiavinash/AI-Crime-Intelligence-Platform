# JWT token creation and verification using python-jose

import uuid
from datetime import datetime, timedelta, timezone
from typing import Any
from jose import JWTError, jwt

from core.config import settings
from core.exceptions import UnauthorizedException

# Revoked tokens set (JTI blacklist)
_revoked_jtis: set[str] = set()


def _make_token(claims: dict[str, Any], ttl: timedelta) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        **claims,
        "iat": now,
        "exp": now + ttl,
        "jti": str(uuid.uuid4()),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def create_access_token(user_id: str, role: str) -> str:
    """Creates a short-lived signed JWT access token."""
    return _make_token(
        {"sub": str(user_id), "role": role, "type": "access"},
        timedelta(minutes=settings.JWT_ACCESS_EXPIRE_MINUTES),
    )


def create_refresh_token(user_id: str) -> str:
    """Creates a long-lived signed JWT refresh token."""
    return _make_token(
        {"sub": str(user_id), "type": "refresh"},
        timedelta(days=settings.JWT_REFRESH_EXPIRE_DAYS),
    )


def decode_token(token: str) -> dict[str, Any]:
    """Decodes and validates a JWT token. Raises UnauthorizedException if invalid or revoked."""
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )
    except JWTError:
        raise UnauthorizedException("Invalid or expired token.")

    if payload.get("jti") in _revoked_jtis:
        raise UnauthorizedException("Token has been revoked. Please log in again.")

    return payload


def revoke_token(token: str) -> None:
    """Blacklists a token by adding its JTI to the revoked set (logout/refresh rotation)."""
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
            options={"verify_exp": False},  # Allow revoking expired tokens
        )
        jti = payload.get("jti")
        if jti:
            _revoked_jtis.add(jti)
    except JWTError:
        pass  # ignore malformed tokens
