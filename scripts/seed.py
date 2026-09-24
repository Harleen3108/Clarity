#!/usr/bin/env python3
"""Index local document files into Qdrant Cloud.

Usage (run from project root):
    cd backend
    python ../scripts/seed.py ../sample_docs/

Reads QDRANT_URL, QDRANT_API_KEY, and other settings from .env (project root)
or backend/.env — whichever exists first.
"""
import sys
import os
from pathlib import Path

# Load .env before importing app modules
from dotenv import load_dotenv  # pip install python-dotenv if missing

root = Path(__file__).parent.parent
load_dotenv(root / ".env")
load_dotenv(root / "backend" / ".env")

# Put backend on the path so `from app...` imports work
sys.path.insert(0, str(root / "backend"))

from app.core.config import settings  # noqa: E402
from app.core.qdrant_store import get_client, ensure_collection, upsert_chunks  # noqa: E402
from app.core.embedder import embed_texts  # noqa: E402
from app.core.chunker import parse_and_chunk  # noqa: E402

SUPPORTED = {".pdf", ".docx", ".doc", ".txt"}


def seed(docs_path: str) -> None:
    if not settings.QDRANT_URL:
        print("ERROR: QDRANT_URL is not set. Check your .env file.")
        sys.exit(1)

    print(f"Connecting to Qdrant at {settings.QDRANT_URL} ...")
    client = get_client()
    ensure_collection(client)
    print(f"Collection '{settings.QDRANT_COLLECTION}' ready.")

    docs_dir = Path(docs_path)
    if not docs_dir.is_dir():
        print(f"ERROR: {docs_dir} is not a directory.")
        sys.exit(1)

    files = [f for f in docs_dir.iterdir() if f.suffix.lower() in SUPPORTED]
    if not files:
        print(f"No supported files ({', '.join(SUPPORTED)}) found in {docs_dir}")
        return

    total_chunks = 0
    for f in sorted(files):
        print(f"\n→ {f.name}")
        try:
            chunks = parse_and_chunk(str(f), f.name)
            if not chunks:
                print("  No text extracted — skipped.")
                continue
            texts = [c.text for c in chunks]
            print(f"  Embedding {len(chunks)} chunks …")
            embeddings = embed_texts(texts)
            upsert_chunks(client, chunks, embeddings)
            total_chunks += len(chunks)
            print(f"  ✓ {len(chunks)} chunks indexed")
        except Exception as e:
            print(f"  ERROR: {e}")

    print(f"\nDone. {total_chunks} chunks indexed across {len(files)} file(s).")


if __name__ == "__main__":
    path = sys.argv[1] if len(sys.argv) > 1 else "sample_docs"
    seed(path)
