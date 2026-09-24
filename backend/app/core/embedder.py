import os
from functools import lru_cache
from typing import List

from fastembed import TextEmbedding

from app.core.config import settings

os.environ.setdefault("OMP_NUM_THREADS", "1")
os.environ.setdefault("TOKENIZERS_PARALLELISM", "false")


@lru_cache(maxsize=1)
def _get_model() -> TextEmbedding:
    return TextEmbedding(
        model_name=settings.EMBEDDING_MODEL,
        cache_dir=settings.FASTEMBED_CACHE_PATH,
        threads=1,
    )


def model_loaded() -> bool:
    return _get_model.cache_info().currsize > 0


def embed_texts(texts: List[str]) -> List[List[float]]:
    model = _get_model()
    return [e.tolist() for e in model.embed(texts)]


def embed_query(query: str) -> List[float]:
    return embed_texts([query])[0]
