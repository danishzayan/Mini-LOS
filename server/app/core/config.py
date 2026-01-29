from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Application (loaded from .env)
    APP_NAME: str
    APP_VERSION: str
    DEBUG: bool
    
    # Database (loaded from .env)
    DATABASE_URL: str
    
    # JWT Settings (loaded from .env)
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    
    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
