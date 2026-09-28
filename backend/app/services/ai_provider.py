import os
from pathlib import Path
from typing import Type, TypeVar
from pydantic import BaseModel

# Load .env from project root (works regardless of how uvicorn is invoked)
try:
    from dotenv import load_dotenv
    # Walk up from this file to find the .env at project root
    _root = Path(__file__).resolve().parent
    while _root != _root.parent:
        _env = _root / ".env"
        if _env.exists():
            load_dotenv(_env, override=False)
            break
        _root = _root.parent
except ImportError:
    pass  # python-dotenv not installed; rely on system env vars

try:
    from google import genai
except ImportError:
    genai = None

T = TypeVar("T", bound=BaseModel)

class AIProvider:
    def __init__(self):
        self.model_name = "gemini-3.6-flash"

    def _get_client(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key or not genai:
            return None
        return genai.Client(api_key=api_key)

    def generate_structured(self, prompt: str, schema: Type[T]) -> T:
        client = self._get_client()
        if not client:
            raise ValueError("GEMINI_API_KEY environment variable is missing or google-genai is not installed.")

        # We intentionally avoid response_schema here because google-genai 0.8.0
        # injects unsupported JSON Schema keywords (exclusiveMinimum) for float/int
        # fields. Instead we ask the model to return JSON and parse it ourselves.
        full_prompt = (
            prompt
            + "\n\nRespond ONLY with a valid JSON object matching this schema. No markdown, no explanation:\n"
            + str(schema.model_fields)
        )
        response = client.models.generate_content(
            model=self.model_name,
            contents=full_prompt,
            config=genai.types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )
        text = response.text.strip()
        # Strip accidental markdown fences
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return schema.model_validate_json(text.strip())

    def generate_text(self, prompt: str) -> str:
        client = self._get_client()
        if not client:
             raise ValueError("GEMINI_API_KEY environment variable is missing or google-genai is not installed.")
        
        response = client.models.generate_content(
            model=self.model_name,
            contents=prompt,
        )
        return response.text

# Singleton instance
provider = AIProvider()
