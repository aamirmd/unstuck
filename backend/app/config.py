from pydantic_settings import BaseSettings
from pydantic import SecretStr


class Settings(BaseSettings):
    APP_NAME: str = "Unstuck API"
    DEBUG: bool = True
    ALLOWED_HOSTS: list[str]
    ALLOWED_ORIGINS: list[str]
    ENVIRONMENT: str
    DATA_DIR: str = "data"

    # Secret keys
    HF_API_TOKEN: SecretStr
    MODEL: SecretStr

    class Config:
        env_file = ".env"


settings = Settings()
