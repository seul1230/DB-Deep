from pydantic_settings import BaseSettings
from functools import cached_property
from urllib.parse import quote_plus

class Settings(BaseSettings):
    # Google Firestore
    GOOGLE_APPLICATION_CREDENTIALS: str
    GOOGLE_CLOUD_PROJECT: str

    # MySQL
    MYSQL_USERNAME: str
    MYSQL_PASSWORD: str
    MYSQL_HOST: str
    MYSQL_PORT: int
    MYSQL_DB: str

    @cached_property
    def db_url(self) -> str:
        user = quote_plus(self.MYSQL_USERNAME)
        password = quote_plus(self.MYSQL_PASSWORD)
        host = self.MYSQL_HOST
        port = self.MYSQL_PORT
        db = self.MYSQL_DB
        return f"mysql+pymysql://{user}:{password}@{host}:{port}/{db}"
    # Gemini
    GEMINI_API_KEY: str
    GEMINI_API_BASE: str

    # Pinecone
    PINECONE_API_KEY: str
    PINECONE_ENV: str

    class Config:
        env_file = ".env"

settings = Settings()