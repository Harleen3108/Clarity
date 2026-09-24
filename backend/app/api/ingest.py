import os
import time
import shutil
from typing import List

from fastapi import APIRouter, UploadFile, File, HTTPException

from app.core.chunker import parse_and_chunk
from app.core.embedder import embed_texts
from app.core.bm25_index import bm25_index
from app.core.qdrant_store import get_client, upsert_chunks, delete_by_document_id, list_documents
from app.core.config import settings
from app.models.schemas import IngestResponse, DocumentListItem, DeleteResponse

router = APIRouter(prefix="/ingest", tags=["ingest"])

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc", ".txt"}


@router.post("/upload", response_model=IngestResponse)
async def upload_document(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"Unsupported file type: {ext}. Allowed: {ALLOWED_EXTENSIONS}")

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    save_path = os.path.join(settings.UPLOAD_DIR, file.filename)

    with open(save_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    try:
        chunks = parse_and_chunk(save_path, file.filename)
    except Exception as e:
        raise HTTPException(500, f"Parsing failed: {e}")

    if not chunks:
        raise HTTPException(422, "No text could be extracted from the document.")

    document_id = chunks[0].document_id

    # Embed in batches
    texts = [c.text for c in chunks]
    embeddings = embed_texts(texts)

    client = get_client()
    upsert_chunks(client, chunks, embeddings)
    bm25_index.add_chunks(chunks)

    return IngestResponse(
        document_id=document_id,
        document_name=file.filename,
        chunks_indexed=len(chunks),
        status="indexed",
    )


@router.get("/documents", response_model=List[DocumentListItem])
def list_all_documents():
    client = get_client()
    return list_documents(client)


@router.delete("/documents/{document_id}", response_model=DeleteResponse)
def delete_document(document_id: str):
    client = get_client()
    delete_by_document_id(client, document_id)
    bm25_index.remove_by_document_id(document_id)
    return DeleteResponse(document_id=document_id, status="deleted")
