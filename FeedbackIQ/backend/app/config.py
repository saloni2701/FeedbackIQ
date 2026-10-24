from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg2://feedbackiq:feedbackiq@localhost:5432/feedbackiq"
    cors_origins: str = "http://localhost:5173"

    sentiment_backend: str = "vader"  # vader | transformers
    sentiment_model: str = "cardiffnlp/twitter-roberta-base-sentiment-latest"
    embedding_backend: str = "tfidf"  # tfidf | sentence-transformers
    embedding_model: str = "all-MiniLM-L6-v2"
    cluster_distance_threshold: float = 0.6
    min_bertopic_docs: int = 50

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
