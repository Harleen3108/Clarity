from pydantic import BaseModel, Field
from typing import Optional, List


class ChunkSchema(BaseModel):
    document_id: str
    document_name: str
    chunk_id: str
    text: str
    page: Optional[int] = None
    section: Optional[str] = None
    metadata: dict = Field(default_factory=dict)


class IngestResponse(BaseModel):
    document_id: str
    document_name: str
    chunks_indexed: int
    status: str


class Citation(BaseModel):
    document: str
    document_id: str
    chunk_id: str
    page: Optional[int] = None
    section: Optional[str] = None
    text: str
    rrf_score: float
    dense_score: Optional[float] = None
    bm25_score: Optional[float] = None
    rrf_rank: int


class QueryRequest(BaseModel):
    query: str
    top_k: int = 5
    filters: Optional[dict] = None


class QueryResponse(BaseModel):
    answer: str
    grounded: bool
    confidence: float
    citations: List[Citation]
    retrieval_trace: dict
    latency_ms: dict
    llm_provider: str = "unknown"


class DocumentListItem(BaseModel):
    document_id: str
    document_name: str
    chunks_count: int


class DeleteResponse(BaseModel):
    document_id: str
    status: str
