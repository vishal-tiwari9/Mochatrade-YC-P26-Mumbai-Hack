import sys
import os
from pathlib import Path

# Keep the test suite deterministic and offline even when a developer has
# configured a real Groq key for local lecture processing.
os.environ["GROQ_API_KEY"] = ""
os.environ["USE_IN_MEMORY"] = "true"
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
