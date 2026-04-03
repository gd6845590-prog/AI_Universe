from pathlib import Path
import sys

# Ensure the repository root is importable for Vercel serverless runtime.
ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend.api.server import app
