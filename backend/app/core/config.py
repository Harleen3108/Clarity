import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.5-flash")

    # QDRANT_MODE: "local" = embedded on-disk (no server/Docker needed), "server" = remote URL
    QDRANT_MODE: str = os.getenv("QDRANT_MODE", "local")
    QDRANT_URL: str = os.getenv("QDRANT_URL", "http://localhost:6333")
    QDRANT_PATH: str = os.getenv("QDRANT_PATH", "./qdrant_data")
    QDRANT_COLLECTION: str = "documents"

    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    EMBEDDING_DIM: int = 384

    CHUNK_SIZE: int = 512
    CHUNK_OVERLAP: int = 64

    BM25_TOP_K: int = 20
    DENSE_TOP_K: int = 20
    RRF_K: int = 60
    FINAL_TOP_K: int = 5

    MIN_RETRIEVAL_SCORE: float = 0.0
    MIN_SUPPORTING_CHUNKS: int = 1

    UPLOAD_DIR: str = "/tmp/uploads"

    class Config:
        # Look for .env in the backend dir AND the project root (one level up),
        # so the key is found regardless of where the server is launched from.
        env_file = (".env", "../.env")
        extra = "ignore"


settings = Settings()
