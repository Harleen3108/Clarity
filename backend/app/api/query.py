import time
from fastapi import APIRouter, HTTPException

from app.core.embedder import embed_query
from app.core.bm25_index import bm25_index
from app.core.qdrant_store import get_client, dense_search
from app.core.rrf import reciprocal_rank_fusion
from app.core.llm import generate_answer
from app.core.config import settings
from app.models.schemas import QueryRequest, QueryResponse, Citation

router = APIRouter(prefix="/query", tags=["query"])


@router.post("", response_model=QueryResponse)
def query_documents(req: QueryRequest):
    latency = {}
    t0 = time.time()

    # --- Dense retrieval ---
    t1 = time.time()
    query_vec = embed_query(req.query)
    latency["embedding_ms"] = round((time.time() - t1) * 1000, 1)

    t2 = time.time()
    dense_results = dense_search(get_client(), query_vec, top_k=settings.DENSE_TOP_K, filters=req.filters)
    latency["dense_ms"] = round((time.time() - t2) * 1000, 1)

    # --- BM25 retrieval ---
    t3 = time.time()
    bm25_results = bm25_index.search(req.query, top_k=settings.BM25_TOP_K)
    latency["bm25_ms"] = round((time.time() - t3) * 1000, 1)

    # --- RRF fusion ---
    t4 = time.time()
    fused = reciprocal_rank_fusion(dense_results, bm25_results)
    top_chunks = fused[: req.top_k]
    latency["rrf_ms"] = round((time.time() - t4) * 1000, 1)

    # --- Hallucination guard: check we have evidence ---
    if len(top_chunks) < settings.MIN_SUPPORTING_CHUNKS:
        return QueryResponse(
            answer="I couldn't find sufficient evidence in the indexed documents to answer this question.",
            grounded=False,
            confidence=0.0,
            citations=[],
            retrieval_trace=_build_trace(dense_results, bm25_results, fused, top_chunks),
            latency_ms={**latency, "llm_ms": 0, "total_ms": round((time.time() - t0) * 1000, 1)},
        )

    # --- LLM generation ---
    t5 = time.time()
    answer, grounded, confidence, raw_citations = generate_answer(req.query, top_chunks)
    latency["llm_ms"] = round((time.time() - t5) * 1000, 1)
    latency["total_ms"] = round((time.time() - t0) * 1000, 1)

    # Build Citation objects from fused chunks (LLM may return subset)
    cited_ids = {c["chunk_id"] for c in raw_citations}
    citations = []
    for chunk in top_chunks:
        cid = chunk["chunk_id"]
        citations.append(Citation(
            document=chunk["document_name"],
            document_id=chunk["document_id"],
            chunk_id=cid,
            page=chunk.get("page"),
            section=chunk.get("section"),
            text=chunk["text"][:300],
            rrf_score=round(chunk["rrf_score"], 5),
            dense_score=round(chunk.get("dense_score", 0.0), 4),
            bm25_score=round(chunk.get("bm25_score", 0.0), 4),
            rrf_rank=chunk["rrf_rank"],
        ))

    return QueryResponse(
        answer=answer,
        grounded=grounded,
        confidence=confidence,
        citations=citations,
        retrieval_trace=_build_trace(dense_results, bm25_results, fused, top_chunks),
        latency_ms=latency,
    )


def _build_trace(dense, bm25, fused, top):
    return {
        "dense_count": len(dense),
        "bm25_count": len(bm25),
        "fused_count": len(fused),
        "top_k_used": len(top),
        "top_chunks": [
            {
                "chunk_id": c["chunk_id"],
                "document": c["document_name"],
                "page": c.get("page"),
                "section": c.get("section"),
                "dense_score": round(c.get("dense_score", 0.0), 4),
                "bm25_score": round(c.get("bm25_score", 0.0), 4),
                "rrf_score": round(c["rrf_score"], 5),
                "rrf_rank": c["rrf_rank"],
                "text_preview": c["text"][:150],
            }
            for c in top
        ],
    }
