from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
import os

_env_file = ".env.local" if os.path.exists(".env.local") else ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=_env_file, extra="ignore")

    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: Optional[str] = None
    # Supabase Dashboard → Project Settings → API → JWT Secret
    supabase_jwt_secret: str = ""

    redis_url: str = "redis://localhost:6379"
    cors_origins: str = "http://localhost:5173"

    @property
    def cors_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    @property
    def db_key(self) -> str:
        key = self.supabase_service_role_key or ""
        if key.startswith("eyJ"):
            return key
        return self.supabase_anon_key


settings = Settings()
