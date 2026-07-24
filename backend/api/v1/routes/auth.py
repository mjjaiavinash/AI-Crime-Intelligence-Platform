"""
api/v1/routes/auth.py
─────────────────────
All authentication and user-management endpoints.

Public  (no token needed):
  POST /auth/register
  POST /auth/login
  POST /auth/refresh

Authenticated (any valid role):
  POST   /auth/logout
  GET    /auth/me
  PATCH  /auth/me
  POST   /auth/me/change-password

Admin only:
  GET    /auth/users
  GET    /auth/users/{id}
  PATCH  /auth/users/{id}/activate
  PATCH  /auth/users/{id}/deactivate
  PATCH  /auth/users/{id}/role

Admin + Supervisor:
  GET    /auth/users/{id}   (supervisor can view)
"""

from typing import Optional

from fastapi import APIRouter, Depends, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from core.database import get_db
from core.security import get_current_user, require_role
from models.user import UserRole
from schemas.user import (
    UserCreate, UserRead, UserUpdate, RoleUpdateRequest,
    LoginRequest, TokenResponse, RefreshRequest,
    ChangePasswordRequest,
)
from services import auth_service

router  = APIRouter()
_bearer = HTTPBearer(auto_error=False)


# ═══════════════════════════════════════════════════════════════════════════════
# PUBLIC ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════════

@router.post(
    "/register",
    response_model=UserRead,
    status_code=201,
    summary="Register a new user",
    tags=["Auth"],
)
def register(
    payload:      UserCreate,
    db:           Session = Depends(get_db),
    credentials:  HTTPAuthorizationCredentials = Depends(_bearer),
):
    """
    Create a new account.
    - Anyone can register as **investigator** or **crime_analyst**.
    - Creating **admin** or **supervisor** accounts requires an existing admin token.

    Password rules:
    - Minimum 8 characters
    - At least one uppercase letter
    - At least one digit
    """
    privileged_roles = {UserRole.admin, UserRole.supervisor}
    if payload.role in privileged_roles:
        from core.security import decode_token
        from core.exceptions import UnauthorizedException, ForbiddenException
        if not credentials:
            raise UnauthorizedException("Authentication required to create privileged accounts.")
        token_data = decode_token(credentials.credentials)
        if token_data.get("role") != "admin":
            raise ForbiddenException("Only admins can create admin or supervisor accounts.")
    return auth_service.register_user(db, payload)


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login — get access + refresh tokens",
    tags=["Auth"],
)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate with **username** and **password**.

    Returns:
    - `access_token`  — short-lived (default 60 min), send in `Authorization: Bearer <token>`
    - `refresh_token` — long-lived (default 7 days), use `/auth/refresh` to rotate
    - `expires_in`    — seconds until access token expires
    """
    return auth_service.login_user(db, payload)


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Rotate tokens using a refresh token",
    tags=["Auth"],
)
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)):
    """
    Exchange a valid **refresh token** for a new access + refresh token pair.
    The old refresh token is **revoked** immediately (single-use rotation).
    """
    return auth_service.refresh_tokens(db, payload.refresh_token)


# ═══════════════════════════════════════════════════════════════════════════════
# AUTHENTICATED ENDPOINTS  (any valid role)
# ═══════════════════════════════════════════════════════════════════════════════

@router.post(
    "/logout",
    status_code=204,
    summary="Logout — revoke tokens",
    tags=["Auth"],
)
def logout(
    payload:     RefreshRequest,
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
    _:           dict = Depends(get_current_user),
):
    """
    Revokes both the current **access token** and the supplied **refresh token**.
    The client must delete locally stored tokens after calling this endpoint.
    """
    auth_service.logout_user(
        credentials.credentials if credentials else "",
        payload.refresh_token,
    )


@router.get(
    "/me",
    response_model=UserRead,
    summary="Get my profile",
    tags=["Auth"],
)
def get_me(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns the profile of the currently authenticated user."""
    return auth_service.get_user_by_id(db, int(current_user["sub"]))


@router.patch(
    "/me",
    response_model=UserRead,
    summary="Update my profile",
    tags=["Auth"],
)
def update_me(
    payload:      UserUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update `full_name` and/or `email` for the current user."""
    return auth_service.update_profile(db, int(current_user["sub"]), payload)


@router.post(
    "/me/change-password",
    status_code=204,
    summary="Change my password",
    tags=["Auth"],
)
def change_password(
    payload:      ChangePasswordRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Change password. Requires the current password for verification."""
    auth_service.change_password(db, int(current_user["sub"]), payload)


# ═══════════════════════════════════════════════════════════════════════════════
# ADMIN / SUPERVISOR ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════════

@router.get(
    "/users",
    response_model=list[UserRead],
    summary="[Admin] List all users",
    tags=["User Management"],
    dependencies=[Depends(require_role("admin"))],
)
def list_users(
    role:      Optional[str]  = Query(None, description="Filter by role: admin | supervisor | investigator | crime_analyst"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    db: Session = Depends(get_db),
):
    """Returns all registered users. Supports optional filtering by role and status."""
    return auth_service.list_users(db, role=role, is_active=is_active)


@router.get(
    "/users/{user_id}",
    response_model=UserRead,
    summary="[Admin/Supervisor] Get user by ID",
    tags=["User Management"],
    dependencies=[Depends(require_role("admin", "supervisor"))],
)
def get_user(user_id: int, db: Session = Depends(get_db)):
    return auth_service.get_user_by_id(db, user_id)


@router.patch(
    "/users/{user_id}/activate",
    response_model=UserRead,
    summary="[Admin] Activate a user account",
    tags=["User Management"],
    dependencies=[Depends(require_role("admin"))],
)
def activate_user(
    user_id:      int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return auth_service.set_user_active(db, user_id, True, int(current_user["sub"]))


@router.patch(
    "/users/{user_id}/deactivate",
    response_model=UserRead,
    summary="[Admin] Deactivate a user account",
    tags=["User Management"],
    dependencies=[Depends(require_role("admin"))],
)
def deactivate_user(
    user_id:      int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return auth_service.set_user_active(db, user_id, False, int(current_user["sub"]))


@router.patch(
    "/users/{user_id}/role",
    response_model=UserRead,
    summary="[Admin] Change a user's role",
    tags=["User Management"],
)
def change_role(
    user_id:      int,
    payload:      RoleUpdateRequest,
    current_user: dict = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    """
    Assign a new role to any user.

    Available roles: `admin` | `supervisor` | `investigator` | `crime_analyst`
    """
    return auth_service.change_user_role(
        db, user_id, payload.role, int(current_user["sub"])
    )
