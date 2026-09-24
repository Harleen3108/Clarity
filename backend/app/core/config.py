from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # LLM
    LLM_PROVIDER: str = "groq"
    LLM_MODEL: str = "qwen/qwen3.8-27b"
    GROQ_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-3.5-flash"

    # Qdrant
    QDRANT_MODE: str = "server"
    QDRANT_URL: str = ""
    QDRANT_API_KEY: str = ""
    QDRANT_PATH: str = "./qdrant_data"
    QDRANT_COLLECTION: str = "documents"

    # Embeddings
    EMBEDDING_MODEL: str = "BAAI/bge-small-en-v1.5"
    EMBEDDING_DIM: int = 384
    FASTEMBED_CACHE_PATH: str = "/tmp/fastembed_cache"

    # Retrieval
    CHUNK_SIZE: int = 512
    CHUNK_OVERLAP: int = 64
    BM25_TOP_K: int = 20
    DENSE_TOP_K: int = 20
    RRF_K: int = 60
    FINAL_TOP_K: int = 5
    MIN_RETRIEVAL_SCORE: float = 0.0
    MIN_SUPPORTING_CHUNKS: int = 1

    # Infra
    UPLOAD_DIR: str = "/tmp/uploads"
    RERANK_ENABLED: bool = False
    ALLOWED_ORIGINS: str = "http://localhost:3000"

    class Config:
        env_file = (".env", "../.env")
        extra = "ignore"


settings = Settings()
