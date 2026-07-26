import sys
import os

# Resolve project root (4 levels up from this file:
# catalyst-app/functions/backend/handler.py -> project root)
_this_dir    = os.path.dirname(os.path.abspath(__file__))
_project_root = os.path.abspath(os.path.join(_this_dir, "..", "..", ".."))
_backend_dir  = os.path.join(_project_root, "backend")

# Add both project root and backend to sys.path so all imports resolve
for _p in (_project_root, _backend_dir):
    if _p not in sys.path:
        sys.path.insert(0, _p)

# Set HuggingFace cache to writable /tmp path on Catalyst
os.environ.setdefault("HF_HOME", "/tmp/hf_cache")
os.environ.setdefault("TRANSFORMERS_CACHE", "/tmp/hf_cache")

from main import app  # noqa: E402  (backend/main.py)
