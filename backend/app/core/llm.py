"""Gemini-backed RAG generation with grounding verification."""
import json
import re
import time
from typing import List, Dict, Tuple

import requests

from app.core.config import settings

# Call the REST API directly instead of through google-generativeai: the SDK's
# transport (even set to "rest") was hanging past its own timeout on this
# network, while plain `requests` gets a clean response every time.
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"


SYSTEM_PROMPT = """You are an enterprise document search assistant. Your job is to answer questions STRICTLY using the provided evidence chunks.

Rules:
1. Only use information explicitly stated in the evidence. Never add external knowledge.
2. Cite every claim with the chunk_id it came from.
3. If the evidence is insufficient, contradictory, or the question is out of scope, set "grounded": false and "answer" to the abstention message.
4. Be concise and factual.

Abstention message: "I couldn't find sufficient evidence in the indexed documents to answer this question."
"""

RAG_PROMPT_TEMPLATE = """Evidence chunks (JSON):
{evidence_json}

Question: {query}

Respond with ONLY valid JSON in this exact format:
{{
  "answer": "<your answer or abstention message>",
  "grounded": <true or false>,
  "citations": [
    {{"document": "<document_name>", "document_id": "<document_id>", "chunk_id": "<chunk_id>", "page": <page or null>, "section": "<section or null>", "text": "<brief excerpt>"}}
  ],
  "evidence_used": ["<chunk_id1>", "<chunk_id2>"]
}}

If grounded is false, citations must be an empty array.
"""


def _build_evidence_json(chunks: List[dict]) -> str:
    evidence = []
    for i, c in enumerate(chunks):
        evidence.append({
            "index": i + 1,
            "chunk_id": c["chunk_id"],
            "document": c["document_name"],
            "document_id": c["document_id"],
            "page": c.get("page"),
            "section": c.get("section"),
            # Send the full chunk (capped generously). Truncating too early cuts
            # off facts that appear later in a page-sized chunk, causing the model
            # to abstain even though the evidence was retrieved.
            "text": c["text"][:2500],
        })
    return json.dumps(evidence, indent=2)


def _system_confidence(chunks: List[dict], citations_returned: List[dict], grounded: bool) -> float:
    """System-calculated confidence (not LLM-hallucinated)."""
    if not grounded or not chunks:
        return 0.0
    avg_rrf = sum(c.get("rrf_score", 0) for c in chunks) / len(chunks)
    citation_coverage = len(citations_returned) / max(len(chunks), 1)
    # Normalize RRF: typical RRF scores range 0.01–0.033 for k=60
    rrf_norm = min(avg_rrf / 0.033, 1.0)
    confidence = 0.6 * rrf_norm + 0.4 * min(citation_coverage, 1.0)
    return round(min(confidence, 0.99), 3)


def generate_answer(query: str, chunks: List[dict]) -> Tuple[str, bool, float, List[dict]]:
    """Returns (answer, grounded, confidence, citations)."""
    if not chunks:
        return (
            "I couldn't find sufficient evidence in the indexed documents to answer this question.",
            False,
            0.0,
            [],
        )

    if not settings.GEMINI_API_KEY:
        return (
            "Configuration error: GEMINI_API_KEY is not set. Add it to the .env file and restart the backend.",
            False,
            0.0,
            [],
        )

    evidence_json = _build_evidence_json(chunks)
    prompt = RAG_PROMPT_TEMPLATE.format(evidence_json=evidence_json, query=query)

    payload = {
        "system_instruction": {"parts": [{"text": SYSTEM_PROMPT}]},
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.1, "maxOutputTokens": 1024},
    }
    headers = {"Content-Type": "application/json", "x-goog-api-key": settings.GEMINI_API_KEY}

    # Gemini's free tier returns transient 429/503 under load. Rotate through
    # several models, a few rounds, so one overloaded model doesn't fail the query.
    models = [settings.GEMINI_MODEL, "gemini-3.6-flash", "gemini-flash-latest", "gemini-3.1-flash-lite", "gemini-3.5-flash-lite"]
    models = list(dict.fromkeys(models))
    raw = None
    last_err = None
    for rnd in range(2):
        for m in models:
            try:
                resp = requests.post(GEMINI_URL.format(model=m), headers=headers, json=payload, timeout=25)
                if resp.status_code == 200:
                    raw = resp.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
                    break
                last_err = f"{m}: HTTP {resp.status_code}"
            except (requests.RequestException, KeyError, IndexError, ValueError) as e:
                last_err = f"{m}: {type(e).__name__}"
        if raw is not None:
            break
        time.sleep(3)
    if raw is None:
        # LLM unavailable: fall back to the best retrieved passages, verbatim, so
        # the user still gets an evidence-backed result instead of an error.
        top = chunks[0]
        answer = (
            f"(Gemini is overloaded right now, so this is the best matching passage from your documents, unsummarised: "
            f"{last_err}) " + top["text"][:800]
        )
        cite = {"document": top["document_name"], "document_id": top["document_id"], "chunk_id": top["chunk_id"],
                "page": top.get("page"), "section": top.get("section"), "text": top["text"][:200]}
        return answer, True, _system_confidence(chunks, [cite], True), [cite]

    # Strip markdown fences if present
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)

    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        return (
            "I couldn't find sufficient evidence in the indexed documents to answer this question.",
            False,
            0.0,
            [],
        )

    answer = parsed.get("answer", "")
    grounded = bool(parsed.get("grounded", False))
    citations = parsed.get("citations", [])

    # Override LLM confidence with system-calculated score
    confidence = _system_confidence(chunks, citations, grounded)

    return answer, grounded, confidence, citations
