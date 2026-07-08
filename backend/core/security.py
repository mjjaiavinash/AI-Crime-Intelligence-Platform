"""
core/security.py
────────────────
JWT creation, decoding, revocation and FastAPI dependency helpers.
Delegates to the root-level auth package to centralize authentication logic.
"""

import sys
from pathlib import Path

# Add project root to sys.path to resolve 'auth' import
project_root = str(Path(__file__).resolve().parent.parent.parent)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# Import from unified root-level auth package
from auth.utils.password import hash_password, verify_password
from auth.jwt.token import (
    create_access_token,
    create_refresh_token,
    decode_token,
    revoke_token,
)
from auth.middleware.require_auth import get_current_user, require_role
