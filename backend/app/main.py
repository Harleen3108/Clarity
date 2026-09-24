import os
import asyncio

os.environ.setdefault("OMP_NUM_THREADS", "1")
os.environ.setdefault("TOKENIZERS_PARALLELISM", "false")

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.api.ingest import router as ingest_router
from app.api.query import router as query_router

_ALLOWED_ORIGINS = [o.strip() for o in settings.ALLOWED_ORIGINS.split(",") if o.strip()]

app = FastAPI(title="Hybrid RAG Engine", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    origin = request.headers.get("origin", "")
    cors_origin = origin if origin in _ALLOWED_ORIGINS else (_ALLOWED_ORIGINS[0] if _ALLOWED_ORIGINS else "*")
    return JSONResponse(
        status_code=500,
        content={"detail": f"{type(exc).__name__}: {exc}"},
        headers={"Access-Control-Allow-Origin": cors_origin},
    )


app.include_router(ingest_router)
app.include_router(query_router)


def _rebuild_bm25_sync():
    from app.core.qdrant_store import get_client, fetch_all_chunks
    from app.core.bm25_index import bm25_index
    try:
        chunks = fetch_all_chunks(get_client())
        if chunks:
            bm25_index.add_chunks(chunks)
        print(f"[startup] BM25 rebuilt: {len(chunks)} chunks")
    except Exception as e:
        print(f"[startup] BM25 rebuild skipped: {type(e).__name__}: {e}")


@app.on_event("startup")
async def startup():
    loop = asyncio.get_event_loop()
    loop.run_in_executor(None, _rebuild_bm25_sync)


@app.get("/health")
def health():
    from app.core.bm25_index import bm25_index
    from app.core.embedder import model_loaded

    qdrant_status = "error"
    try:
        from app.core.qdrant_store import get_client
        get_client().get_collections()
        qdrant_status = "ok"
    except Exception:
        pass

    return {
        "status": "ok",
        "models_loaded": model_loaded(),
        "qdrant": qdrant_status,
        "bm25_chunks": bm25_index.total_chunks,
    }
