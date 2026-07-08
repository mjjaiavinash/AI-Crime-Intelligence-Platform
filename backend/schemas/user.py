from datetime import datetime
from typing import Optional
from pydantic import EmailStr, field_validator
from models.user import UserRole
from schemas.base import APIBase


# ── Request Schemas ───────────────────────────────────────────────────────────

class UserCreate(APIBase):
    username:  str
    email:     EmailStr
    password:  str
    full_name: Optional[str] = None
    role:      UserRole = UserRole.investigator

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        v = v.strip().lower()
        if len(v) < 3:
            raise ValueError("Username must be at least 3 characters.")
        if not v.replace("_", "").replace("-", "").isalnum():
            raise ValueError("Username may only contain letters, digits, hyphens, underscores.")
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters.")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit.")
        return v


class LoginRequest(APIBase):
    username: str
    password: str


class RefreshRequest(APIBase):
    refresh_token: str


class ChangePasswordRequest(APIBase):
    current_password: str
    new_password:     str

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters.")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit.")
        return v


class UserUpdate(APIBase):
    full_name: Optional[str]      = None
    email:     Optional[EmailStr] = None


class RoleUpdateRequest(APIBase):
    role: UserRole


# ── Response Schemas ──────────────────────────────────────────────────────────

class UserRead(APIBase):
    id:            int
    username:      str
    email:         str
    full_name:     Optional[str]
    role:          UserRole
    is_active:     bool
    last_login_at: Optional[datetime]
    created_at:    datetime


class TokenResponse(APIBase):
    access_token:  str
    refresh_token: str
    token_type:    str = "bearer"
    expires_in:    int          # seconds until access token expires
