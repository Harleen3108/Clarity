from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.ingest import router as ingest_router
from app.api.query import router as query_router

app = FastAPI(title="Hybrid RAG Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    # Starlette's default 500 is generated outside the CORS middleware and so
    # lacks CORS headers, which the browser misreports as a CORS error. Add the
    # header manually so the real error reaches the client.
    return JSONResponse(
        status_code=500,
        content={"detail": f"{type(exc).__name__}: {exc}"},
        headers={"Access-Control-Allow-Origin": "*"},
    )

app.include_router(ingest_router)
app.include_router(query_router)


@app.on_event("startup")
def rebuild_bm25_index():
    """BM25 lives in memory and does not survive a restart, while Qdrant persists
    to disk. Rebuild BM25 from Qdrant on startup so the two indexes never desync."""
    from app.core.qdrant_store import get_client, fetch_all_chunks
    from app.core.bm25_index import bm25_index
    try:
        chunks = fetch_all_chunks(get_client())
        if chunks:
            bm25_index.add_chunks(chunks)
        print(f"[startup] Rebuilt BM25 index from Qdrant: {len(chunks)} chunks")
    except Exception as e:
        print(f"[startup] BM25 rebuild skipped: {type(e).__name__}: {e}")


@app.get("/health")
def health():
    from app.core.bm25_index import bm25_index
    return {"status": "ok", "bm25_chunks": bm25_index.total_chunks}
