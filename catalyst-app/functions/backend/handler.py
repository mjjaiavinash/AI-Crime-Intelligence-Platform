import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from main import app

# Catalyst Advanced I/O uses the ASGI app directly
# The entry point in catalyst.json is "main.app"
