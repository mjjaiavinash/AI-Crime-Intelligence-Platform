from typing import Optional
"""
services/auth_service.py
────────────────────────
Business logic for all authentication and user-management operations.
"""

from datetime import datetime, timezone
from sqlalchemy.orm import Session

from models.user import User, UserRole
from schemas.user import (
    UserCreate, UserUpdate, LoginRequest,
    TokenResponse, ChangePasswordRequest,
)
from core.security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token,
    decode_token, revoke_token,
)
from core.config import settings
from core.exceptions import (
    ConflictException, UnauthorizedException,
    NotFoundException, ForbiddenException,
)
from core.logging import get_logger

logger = get_logger(__name__)


# ── Register ──────────────────────────────────────────────────────────────────

def register_user(db: Session, payload: UserCreate) -> User:
    if db.query(User).filter(User.username == payload.username).first():
        raise ConflictException("Username already taken.")
    if db.query(User).filter(User.email == payload.email).first():
        raise ConflictException("Email already registered.")

    user = User(
        username        = payload.username,
        email           = payload.email,
        full_name       = payload.full_name,
        hashed_password = hash_password(payload.password),
        role            = payload.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    logger.info("Registered: %s  role=%s", user.username, user.role)
    return user


# ── Login ─────────────────────────────────────────────────────────────────────

def login_user(db: Session, payload: LoginRequest) -> TokenResponse:
    user = db.query(User).filter(User.username == payload.username).first()

    # Constant-time comparison even on missing user (prevents user enumeration)
    if not user or not verify_password(payload.password, user.hashed_password):
        raise UnauthorizedException("Invalid username or password.")
    if not user.is_active:
        raise UnauthorizedException("Account disabled. Contact your administrator.")

    user.last_login_at = datetime.now(timezone.utc)
    db.commit()

    logger.info("Login: %s  role=%s", user.username, user.role)
    return _token_response(user)


# ── Refresh ───────────────────────────────────────────────────────────────────

def refresh_tokens(db: Session, refresh_token: str) -> TokenResponse:
    payload = decode_token(refresh_token)
    if payload.get("type") != "refresh":
        raise UnauthorizedException("Expected a refresh token.")

    user = db.get(User, int(payload["sub"]))
    if not user:
        raise NotFoundException("User")
    if not user.is_active:
        raise UnauthorizedException("Account disabled.")

    # Rotate: revoke old refresh token (single-use)
    revoke_token(refresh_token)

    logger.info("Token refreshed: %s", user.username)
    return _token_response(user)


# ── Logout ────────────────────────────────────────────────────────────────────

def logout_user(access_token: str, refresh_token: Optional[str] = None) -> None:
    revoke_token(access_token)
    if refresh_token:
        revoke_token(refresh_token)
    logger.info("Logout — tokens revoked.")


# ── Profile ───────────────────────────────────────────────────────────────────

def get_user_by_id(db: Session, user_id: int) -> User:
    user = db.get(User, user_id)
    if not user:
        raise NotFoundException("User")
    return user


def update_profile(db: Session, user_id: int, payload: UserUpdate) -> User:
    user = get_user_by_id(db, user_id)

    if payload.email and payload.email != user.email:
        if db.query(User).filter(User.email == payload.email).first():
            raise ConflictException("Email already registered.")
        user.email = payload.email

    if payload.full_name is not None:
        user.full_name = payload.full_name

    db.commit()
    db.refresh(user)
    return user


def change_password(db: Session, user_id: int, payload: ChangePasswordRequest) -> None:
    user = get_user_by_id(db, user_id)
    if not verify_password(payload.current_password, user.hashed_password):
        raise UnauthorizedException("Current password is incorrect.")
    user.hashed_password = hash_password(payload.new_password)
    db.commit()
    logger.info("Password changed: user_id=%d", user_id)


# ── Admin — user management ───────────────────────────────────────────────────

def list_users(
    db: Session,
    role:      Optional[str]  = None,
    is_active: Optional[bool] = None,
) -> list[User]:
    q = db.query(User)
    if role:
        q = q.filter(User.role == role)
    if is_active is not None:
        q = q.filter(User.is_active == is_active)
    return q.order_by(User.created_at.desc()).all()


def set_user_active(
    db: Session,
    user_id: int,
    active: bool,
    requesting_user_id: int,
) -> User:
    if user_id == requesting_user_id:
        raise ForbiddenException("You cannot change the status of your own account.")
    user = get_user_by_id(db, user_id)
    user.is_active = active
    db.commit()
    db.refresh(user)
    logger.info(
        "User %s %s by admin id=%d",
        user.username, "activated" if active else "deactivated", requesting_user_id,
    )
    return user


def change_user_role(
    db: Session,
    user_id: int,
    new_role: UserRole,
    requesting_user_id: int,
) -> User:
    if user_id == requesting_user_id:
        raise ForbiddenException("You cannot change your own role.")
    user = get_user_by_id(db, user_id)
    old_role   = user.role
    user.role  = new_role
    db.commit()
    db.refresh(user)
    logger.info(
        "Role change: %s  %s → %s  (by admin id=%d)",
        user.username, old_role, new_role, requesting_user_id,
    )
    return user


# ── helper ────────────────────────────────────────────────────────────────────

def _token_response(user: User) -> TokenResponse:
    return TokenResponse(
        access_token  = create_access_token(str(user.id), user.role.value),
        refresh_token = create_refresh_token(str(user.id)),
        expires_in    = settings.JWT_ACCESS_EXPIRE_MINUTES * 60,
    )
