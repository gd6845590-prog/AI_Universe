import os
import sys
from pathlib import Path

# Ensure the repository root is importable for Vercel serverless runtime.
ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend.api.server import app as backend_app


def _normalize_vercel_scope(scope: dict) -> dict:
    """
    Vercel mounts `api/index.py` at `/api`, so the ASGI path that reaches this
    file no longer includes that prefix. Our FastAPI app already defines its
    routes under `/api`, so we add the prefix back before dispatching.
    """
    if scope.get("type") not in {"http", "websocket"}:
        return scope

    path = scope.get("path", "")
    if not path.startswith("/"):
        path = f"/{path}"

    if path.startswith("/api"):
        return scope

    normalized_scope = dict(scope)
    normalized_scope["path"] = f"/api{path}"

    raw_path = normalized_scope.get("raw_path")
    if raw_path and not raw_path.startswith(b"/api"):
        normalized_scope["raw_path"] = b"/api" + raw_path

    return normalized_scope


async def app(scope, receive, send):
    if os.environ.get("VERCEL") or os.environ.get("VERCEL_ENV"):
        scope = _normalize_vercel_scope(scope)
    await backend_app(scope, receive, send)
