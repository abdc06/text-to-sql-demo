import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # 1. 앱 운영 및 이력 저장용 DB (SQLite 예시)
    APP_DB_URL: str = "sqlite:///./sql_history.db"
    
    # 2. 분석 대상 비즈니스 DB (PostgreSQL)
    BIZ_DB_URL: str = "postgresql://example:example@localhost:5432/chinook"
    
    # Ollama 설정
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    LLM_MODEL: str = "qwen2.5-coder:7b"
    EMBED_MODEL: str = "nomic-embed-text"

settings = Settings()