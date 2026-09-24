"""Reciprocal Rank Fusion — merges dense and BM25 ranked lists."""
from typing import List, Tuple, Dict
from app.core.config import settings


def reciprocal_rank_fusion(
    dense_results: List[Tuple[dict, float]],
    bm25_results: List[Tuple[object, float]],
    k: int = None,
) -> List[Dict]:
    """
    dense_results: [(payload_dict, cosine_score), ...]
    bm25_results:  [(ChunkSchema, bm25_score), ...]
    Returns merged list sorted by RRF score descending, each item annotated with scores.
    """
    if k is None:
        k = settings.RRF_K

    rrf_scores: Dict[str, float] = {}
    chunk_data: Dict[str, dict] = {}

    for rank, (payload, score) in enumerate(dense_results, start=1):
        cid = payload["chunk_id"]
        rrf_scores[cid] = rrf_scores.get(cid, 0.0) + 1.0 / (k + rank)
        chunk_data[cid] = {**payload, "dense_score": score, "bm25_score": 0.0}

    for rank, (chunk, score) in enumerate(bm25_results, start=1):
        cid = chunk.chunk_id
        rrf_scores[cid] = rrf_scores.get(cid, 0.0) + 1.0 / (k + rank)
        if cid in chunk_data:
            chunk_data[cid]["bm25_score"] = score
        else:
            chunk_data[cid] = {
                "document_id": chunk.document_id,
                "document_name": chunk.document_name,
                "chunk_id": cid,
                "text": chunk.text,
                "page": chunk.page,
                "section": chunk.section,
                "dense_score": 0.0,
                "bm25_score": score,
            }

    sorted_ids = sorted(rrf_scores, key=lambda x: rrf_scores[x], reverse=True)
    fused = []
    for final_rank, cid in enumerate(sorted_ids, start=1):
        item = dict(chunk_data[cid])
        item["rrf_score"] = rrf_scores[cid]
        item["rrf_rank"] = final_rank
        fused.append(item)

    return fused
