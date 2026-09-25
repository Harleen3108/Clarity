import uuid
import hashlib
from typing import List, Dict, Tuple, Optional

from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams,
    PointStruct,
    Filter,
    FieldCondition,
    MatchValue,
    FilterSelector,
    ScoredPoint,
    PayloadSchemaType,
)

from app.core.config import settings
from app.models.schemas import ChunkSchema


def _chunk_id_to_uuid(chunk_id: str) -> str:
    return str(uuid.UUID(bytes=hashlib.md5(chunk_id.encode()).digest()))


_client_singleton: Optional[QdrantClient] = None


def get_client() -> QdrantClient:
    global _client_singleton
    if _client_singleton is None:
        if settings.QDRANT_MODE == "local":
            _client_singleton = QdrantClient(path=settings.QDRANT_PATH)
        else:
            if not settings.QDRANT_URL:
                raise RuntimeError(
                    "QDRANT_URL must be set when QDRANT_MODE=server. "
                    "Add it to your .env file."
                )
            kwargs: dict = {"url": settings.QDRANT_URL}
            if settings.QDRANT_API_KEY:
                kwargs["api_key"] = settings.QDRANT_API_KEY
            _client_singleton = QdrantClient(**kwargs)
    return _client_singleton


def ensure_collection(client: QdrantClient):
    existing = [c.name for c in client.get_collections().collections]
    if settings.QDRANT_COLLECTION not in existing:
        client.create_collection(
            collection_name=settings.QDRANT_COLLECTION,
            vectors_config=VectorParams(
                size=settings.EMBEDDING_DIM,
                distance=Distance.COSINE,
            ),
        )
    # Qdrant Cloud (and any non-local mode) requires a payload index before a
    # field can be used in a filter, e.g. delete-by-document_id. Safe to call
    # repeatedly: Qdrant no-ops if the index already exists.
    try:
        client.create_payload_index(
            collection_name=settings.QDRANT_COLLECTION,
            field_name="document_id",
            field_schema=PayloadSchemaType.KEYWORD,
        )
    except Exception:
        pass


def upsert_chunks(client: QdrantClient, chunks: List[ChunkSchema], embeddings: List[List[float]]):
    ensure_collection(client)
    points = []
    for chunk, vector in zip(chunks, embeddings):
        point_id = _chunk_id_to_uuid(chunk.chunk_id)
        payload = {
            "document_id": chunk.document_id,
            "document_name": chunk.document_name,
            "chunk_id": chunk.chunk_id,
            "text": chunk.text,
            "page": chunk.page,
            "section": chunk.section,
            **chunk.metadata,
        }
        points.append(PointStruct(id=point_id, vector=vector, payload=payload))

    for i in range(0, len(points), 100):
        client.upsert(collection_name=settings.QDRANT_COLLECTION, points=points[i:i+100])


def dense_search(
    client: QdrantClient,
    query_vector: List[float],
    top_k: int = 20,
    filters: Optional[dict] = None,
) -> List[Tuple[dict, float]]:
    qdrant_filter = None
    if filters:
        conditions = [
            FieldCondition(key=k, match=MatchValue(value=v))
            for k, v in filters.items()
        ]
        qdrant_filter = Filter(must=conditions)

    results: List[ScoredPoint] = client.search(
        collection_name=settings.QDRANT_COLLECTION,
        query_vector=query_vector,
        limit=top_k,
        query_filter=qdrant_filter,
        with_payload=True,
    )
    return [(r.payload, r.score) for r in results]


def delete_by_document_id(client: QdrantClient, document_id: str):
    ensure_collection(client)
    client.delete(
        collection_name=settings.QDRANT_COLLECTION,
        points_selector=FilterSelector(
            filter=Filter(
                must=[FieldCondition(key="document_id", match=MatchValue(value=document_id))]
            )
        ),
    )


def list_documents(client: QdrantClient) -> List[Dict]:
    ensure_collection(client)
    docs: Dict[str, Dict] = {}
    offset = None
    while True:
        result, next_offset = client.scroll(
            collection_name=settings.QDRANT_COLLECTION,
            limit=250,
            offset=offset,
            with_payload=True,
            with_vectors=False,
        )
        for point in result:
            p = point.payload
            did = p.get("document_id", "")
            if did not in docs:
                docs[did] = {"document_id": did, "document_name": p.get("document_name", ""), "chunks_count": 0}
            docs[did]["chunks_count"] += 1
        if next_offset is None:
            break
        offset = next_offset
    return list(docs.values())


def fetch_all_chunks(client: QdrantClient) -> List[ChunkSchema]:
    ensure_collection(client)
    chunks: List[ChunkSchema] = []
    offset = None
    while True:
        result, next_offset = client.scroll(
            collection_name=settings.QDRANT_COLLECTION,
            limit=250,
            offset=offset,
            with_payload=True,
            with_vectors=False,
        )
        for point in result:
            p = point.payload or {}
            chunks.append(ChunkSchema(
                document_id=p.get("document_id", ""),
                document_name=p.get("document_name", ""),
                chunk_id=p.get("chunk_id", str(point.id)),
                text=p.get("text", ""),
                page=p.get("page"),
                section=p.get("section"),
                metadata={},
            ))
        if next_offset is None:
            break
        offset = next_offset
    return chunks
