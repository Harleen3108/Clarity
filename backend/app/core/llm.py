"""Gemini-backed RAG generation with grounding verification."""
import json
import re
import time
from typing import List, Dict, Tuple

import google.generativeai as genai
from google.api_core import exceptions as gexc

from app.core.config import settings


def _configure():
    genai.configure(api_key=settings.GEMINI_API_KEY)


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
    _configure()

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

    try:
        model = genai.GenerativeModel(
            model_name=settings.GEMINI_MODEL,
            system_instruction=SYSTEM_PROMPT,
        )
        gen_config = genai.types.GenerationConfig(temperature=0.1, max_output_tokens=1024)
        # Free-tier per-minute limits are short-lived; retry a couple of times so a
        # brief spike self-heals instead of surfacing an error during a demo.
        last_err = None
        for attempt in range(3):
            try:
                response = model.generate_content(prompt, generation_config=gen_config)
                raw = response.text.strip()
                break
            except gexc.ResourceExhausted as e:
                last_err = e
                if attempt < 2:
                    time.sleep(8)
                    continue
                raise
        else:
            raise last_err
    except Exception as e:
        return (
            f"The answer service is temporarily unavailable ({type(e).__name__}). Please try again.",
            False,
            0.0,
            [],
        )

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
