#!/bin/bash
set -e

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"

mkdir -p /tmp/chromadb /tmp/uploads /tmp/hf_cache /tmp/logs

export PYTHONPATH="$PROJECT_ROOT:$BACKEND_DIR:$PYTHONPATH"
export HF_HOME="/tmp/hf_cache"
export TRANSFORMERS_CACHE="/tmp/hf_cache"

echo "PROJECT_ROOT=$PROJECT_ROOT"
echo "Starting CrimeIQ backend..."

cd "$PROJECT_ROOT"
exec python -m uvicorn backend.main:app --host 0.0.0.0 --port "${PORT:-8000}"
