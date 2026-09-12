from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    groq_api_key: str = ""
    firebase_project_id: str = ""
    firebase_client_email: str = ""
    firebase_private_key: str = ""
    firebase_credentials_file: str = ""
    firebase_storage_bucket: str = ""
    allowed_origins: str = "http://localhost:5173"
    environment: str = "development"
    use_in_memory: bool = True
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    @property
    def origins(self): return [x.strip() for x in self.allowed_origins.split(",") if x.strip()]

@lru_cache
def get_settings(): return Settings()
