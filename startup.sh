#!/bin/bash
set -e

# Project root is where this script lives
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"

# Ensure writable tmp directories exist
mkdir -p /tmp/chromadb /tmp/uploads /tmp/hf_cache

# Set Python path so all packages (backend, ai, auth, ml) resolve
export PYTHONPATH="$PROJECT_ROOT:$BACKEND_DIR:$PYTHONPATH"

# HuggingFace model cache
export HF_HOME="/tmp/hf_cache"
export TRANSFORMERS_CACHE="/tmp/hf_cache"

echo "Starting CrimeIQ backend..."
echo "PYTHONPATH=$PYTHONPATH"

cd "$BACKEND_DIR"
exec uvicorn main:app --host 0.0.0.0 --port 8000 --workers 2
