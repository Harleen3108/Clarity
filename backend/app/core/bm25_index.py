"""In-memory BM25 index using rank_bm25. Persists across requests via module-level singleton."""
import threading
from typing import List, Dict, Tuple, Optional
from rank_bm25 import BM25Okapi
from app.models.schemas import ChunkSchema


class BM25Index:
    def __init__(self):
        self._lock = threading.Lock()
        self._chunks: List[ChunkSchema] = []
        self._tokenized: List[List[str]] = []
        self._bm25: Optional[BM25Okapi] = None

    def _tokenize(self, text: str) -> List[str]:
        return text.lower().split()

    def add_chunks(self, chunks: List[ChunkSchema]):
        with self._lock:
            self._chunks.extend(chunks)
            self._tokenized.extend([self._tokenize(c.text) for c in chunks])
            if self._tokenized:
                self._bm25 = BM25Okapi(self._tokenized)

    def remove_by_document_id(self, document_id: str):
        with self._lock:
            pairs = [
                (c, t) for c, t in zip(self._chunks, self._tokenized)
                if c.document_id != document_id
            ]
            if pairs:
                self._chunks, self._tokenized = map(list, zip(*pairs))
            else:
                self._chunks, self._tokenized = [], []
            self._bm25 = BM25Okapi(self._tokenized) if self._tokenized else None

    def search(self, query: str, top_k: int = 20) -> List[Tuple[ChunkSchema, float]]:
        with self._lock:
            if not self._bm25 or not self._chunks:
                return []
            tokenized_query = self._tokenize(query)
            scores = self._bm25.get_scores(tokenized_query)
            ranked = sorted(enumerate(scores), key=lambda x: x[1], reverse=True)[:top_k]
            return [(self._chunks[i], float(score)) for i, score in ranked if score > 0]

    def get_all_document_ids(self) -> List[str]:
        with self._lock:
            return list({c.document_id for c in self._chunks})

    def chunk_count_for_document(self, document_id: str) -> int:
        with self._lock:
            return sum(1 for c in self._chunks if c.document_id == document_id)

    @property
    def total_chunks(self) -> int:
        with self._lock:
            return len(self._chunks)


# Global singleton shared across requests
bm25_index = BM25Index()
