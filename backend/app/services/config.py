# app/services/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    # ---- Database ----
    DB_HOST: str = "db"
    DB_PORT: int = 5432
    DB_USER: str = "postgres"
    DB_PASS: str = "postgres"
    DB_NAME: str = "skillsetu"

    # ---- Auth / JWT ----
    SECRET_KEY: str = "change-me"
    ALGORITHM: str = "HS256"

    # ---- LLM / Ollama ----
    OLLAMA_ENDPOINT: str = "http://host.docker.internal:11434"

settings = Settings()
