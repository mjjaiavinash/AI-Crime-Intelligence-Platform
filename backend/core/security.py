"""
core/security.py
────────────────
JWT creation, decoding, revocation and FastAPI dependency helpers.
"""

from auth.utils.password import hash_password, verify_password
from auth.jwt.token import (
    create_access_token,
    create_refresh_token,
    decode_token,
    revoke_token,
)
from auth.middleware.require_auth import get_current_user, require_role
