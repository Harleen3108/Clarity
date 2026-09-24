import re
import hashlib
import uuid
from typing import List, Optional
from pathlib import Path

import pymupdf  # fitz
from docx import Document as DocxDocument

from app.core.config import settings
from app.models.schemas import ChunkSchema


def _hash_to_uuid(s: str) -> str:
    return str(uuid.UUID(bytes=hashlib.md5(s.encode()).digest()))


def _split_text(text: str, size: int, overlap: int) -> List[str]:
    words = text.split()
    chunks, start = [], 0
    while start < len(words):
        end = start + size
        chunks.append(" ".join(words[start:end]))
        start += size - overlap
    return [c for c in chunks if c.strip()]


def _extract_pdf(path: str) -> List[dict]:
    """Returns list of {text, page, section}."""
    doc = pymupdf.open(path)
    pages = []
    current_section = "Document"
    for page_num, page in enumerate(doc, 1):
        blocks = page.get_text("dict")["blocks"]
        page_text_parts = []
        for block in blocks:
            if block.get("type") != 0:
                continue
            for line in block.get("lines", []):
                for span in line.get("spans", []):
                    text = span["text"].strip()
                    if not text:
                        continue
                    # Heuristic: large bold text = heading/section
                    if span.get("flags", 0) & 16 and span.get("size", 0) > 13:
                        current_section = text[:100]
                    page_text_parts.append(text)
        pages.append({
            "text": " ".join(page_text_parts),
            "page": page_num,
            "section": current_section,
        })
    doc.close()
    return pages


def _extract_docx(path: str) -> List[dict]:
    doc = DocxDocument(path)
    pages, current_section, current_text = [], "Document", []
    for para in doc.paragraphs:
        text = para.text.strip()
        if not text:
            continue
        if para.style.name.startswith("Heading"):
            if current_text:
                pages.append({"text": " ".join(current_text), "page": None, "section": current_section})
                current_text = []
            current_section = text[:100]
        else:
            current_text.append(text)
    if current_text:
        pages.append({"text": " ".join(current_text), "page": None, "section": current_section})
    return pages


def _extract_txt(path: str) -> List[dict]:
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        text = f.read()
    return [{"text": text, "page": None, "section": "Document"}]


def parse_and_chunk(
    file_path: str,
    document_name: str,
    document_id: Optional[str] = None,
) -> List[ChunkSchema]:
    if document_id is None:
        document_id = _hash_to_uuid(document_name)

    ext = Path(file_path).suffix.lower()
    if ext == ".pdf":
        sections = _extract_pdf(file_path)
    elif ext in (".docx", ".doc"):
        sections = _extract_docx(file_path)
    else:
        sections = _extract_txt(file_path)

    chunks: List[ChunkSchema] = []
    chunk_index = 0
    for sec in sections:
        raw_chunks = _split_text(sec["text"], settings.CHUNK_SIZE, settings.CHUNK_OVERLAP)
        for raw in raw_chunks:
            if len(raw.split()) < 10:
                continue
            chunk_id = _hash_to_uuid(f"{document_id}_{chunk_index}")
            chunks.append(ChunkSchema(
                document_id=document_id,
                document_name=document_name,
                chunk_id=chunk_id,
                text=raw,
                page=sec.get("page"),
                section=sec.get("section"),
                metadata={
                    "char_count": len(raw),
                    "word_count": len(raw.split()),
                },
            ))
            chunk_index += 1
    return chunks
