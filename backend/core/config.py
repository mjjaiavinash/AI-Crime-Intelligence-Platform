import sys
import os

# SQLite3 version override for ChromaDB compatibility under Windows/older Python versions
import sqlite3
sqlite3.sqlite_version_info = (3, 35, 0)
sqlite3.sqlite_version = "3.35.0"

config_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(config_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from functools import lru_cache
from typing import List, Any
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=os.path.join(backend_dir, ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # ── App ──────────────────────────────────────────────────────────────────
    APP_ENV: str = "development"
    APP_NAME: str = "AI Crime Intelligence Platform"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    @field_validator("DEBUG", mode="before")
    @classmethod
    def parse_debug(cls, v: Any) -> bool:
        if isinstance(v, bool):
            return v
        if isinstance(v, str):
            return v.lower() in ("true", "1", "yes")
        return bool(v)

    # ── MySQL ─────────────────────────────────────────────────────────────────
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_NAME: str = "crime_intelligence"
    DB_USER: str = "root"
    DB_PASSWORD: str = ""
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20
    DB_POOL_RECYCLE: int = 3600  # seconds

    @property
    def DATABASE_URL(self) -> str:
        from urllib.parse import quote_plus
        return (
            f"mysql+pymysql://{self.DB_USER}:{quote_plus(self.DB_PASSWORD)}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
            f"?charset=utf8mb4"
        )

    # ── JWT ───────────────────────────────────────────────────────────────────
    JWT_SECRET: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_EXPIRE_MINUTES: int = 60
    JWT_REFRESH_EXPIRE_DAYS: int = 7

    # ── Groq ──────────────────────────────────────────────────────────────────
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.1-8b-instant"

    # ── ChromaDB ──────────────────────────────────────────────────────────────
    CHROMA_PERSIST_DIR: str = "database/chromadb"
    CHROMA_COLLECTION_NAME: str = "crime_documents"

    @property
    def CHROMA_PERSIST_PATH(self) -> str:
        """Absolute path to ChromaDB persist directory."""
        path = self.CHROMA_PERSIST_DIR
        if not os.path.isabs(path):
            path = os.path.abspath(os.path.join(backend_dir, path))
        os.makedirs(path, exist_ok=True)
        return path

    # ── CORS ──────────────────────────────────────────────────────────────────
    ALLOWED_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    # ── Uploads ───────────────────────────────────────────────────────────────
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_MB: int = 20

    @property
    def UPLOAD_PATH(self) -> str:
        """Absolute path to uploads directory."""
        path = self.UPLOAD_DIR
        if not os.path.isabs(path):
            path = os.path.abspath(os.path.join(backend_dir, path))
        os.makedirs(path, exist_ok=True)
        return path


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings: Settings = get_settings()
