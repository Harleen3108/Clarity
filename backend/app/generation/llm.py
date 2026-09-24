"""Unified LLM generation: Groq (primary) → Gemini (fallback)."""
import json
import re
import time
from typing import List, Tuple

import requests

from app.core.config import settings

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

GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
GEMINI_MODELS = ["gemini-3.5-flash", "gemini-3.6-flash", "gemini-flash-latest", "gemini-3.5-flash-lite"]


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
            "text": c["text"][:2500],
        })
    return json.dumps(evidence, indent=2)


def _system_confidence(chunks: List[dict], citations_returned: List[dict], grounded: bool) -> float:
    if not grounded or not chunks:
        return 0.0
    avg_rrf = sum(c.get("rrf_score", 0) for c in chunks) / len(chunks)
    citation_coverage = len(citations_returned) / max(len(chunks), 1)
    rrf_norm = min(avg_rrf / 0.033, 1.0)
    confidence = 0.6 * rrf_norm + 0.4 * min(citation_coverage, 1.0)
    return round(min(confidence, 0.99), 3)


def _parse_llm_output(raw: str) -> dict | None:
    raw = re.sub(r"^```(?:json)?\s*", "", raw.strip())
    raw = re.sub(r"\s*```$", "", raw)
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return None


def _call_groq(messages: list, temperature: float = 0.1) -> str | None:
    try:
        from openai import OpenAI
        client = OpenAI(
            api_key=settings.GROQ_API_KEY,
            base_url="https://api.groq.com/openai/v1",
        )
        resp = client.chat.completions.create(
            model=settings.LLM_MODEL,
            messages=messages,
            temperature=temperature,
            max_tokens=1024,
            timeout=30,
        )
        return resp.choices[0].message.content
    except Exception as e:
        status = getattr(getattr(e, "response", None), "status_code", None)
        if status in (429, 500, 503):
            time.sleep(2)
            try:
                from openai import OpenAI
                client = OpenAI(
                    api_key=settings.GROQ_API_KEY,
                    base_url="https://api.groq.com/openai/v1",
                )
                resp = client.chat.completions.create(
                    model=settings.LLM_MODEL,
                    messages=messages,
                    temperature=temperature,
                    max_tokens=1024,
                    timeout=30,
                )
                return resp.choices[0].message.content
            except Exception:
                pass
        return None


def _call_gemini(prompt: str, temperature: float = 0.1) -> str | None:
    if not settings.GEMINI_API_KEY:
        return None
    payload = {
        "system_instruction": {"parts": [{"text": SYSTEM_PROMPT}]},
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": temperature, "maxOutputTokens": 1024},
    }
    headers = {"Content-Type": "application/json", "x-goog-api-key": settings.GEMINI_API_KEY}
    models = list(dict.fromkeys([settings.GEMINI_MODEL] + GEMINI_MODELS))
    for attempt in range(2):
        for model in models:
            try:
                resp = requests.post(
                    GEMINI_URL.format(model=model),
                    headers=headers,
                    json=payload,
                    timeout=30,
                )
                if resp.status_code == 200:
                    return resp.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
                if resp.status_code not in (429, 500, 503):
                    break
            except (requests.RequestException, KeyError, IndexError):
                pass
        if attempt == 0:
            time.sleep(2)
    return None


def generate_answer(
    query: str, chunks: List[dict]
) -> Tuple[str, bool, float, List[dict], str]:
    """Returns (answer, grounded, confidence, citations, llm_provider)."""
    if not chunks:
        return (
            "I couldn't find sufficient evidence in the indexed documents to answer this question.",
            False, 0.0, [], "none",
        )

    evidence_json = _build_evidence_json(chunks)
    prompt = RAG_PROMPT_TEMPLATE.format(evidence_json=evidence_json, query=query)
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": prompt},
    ]

    primary = settings.LLM_PROVIDER.lower()
    raw: str | None = None
    provider_used = "none"

    if primary == "groq" and settings.GROQ_API_KEY:
        raw = _call_groq(messages, temperature=0.1)
        if raw:
            provider_used = "groq"
        elif settings.GEMINI_API_KEY:
            raw = _call_gemini(prompt, temperature=0.1)
            if raw:
                provider_used = "gemini-fallback"
    else:
        raw = _call_gemini(prompt, temperature=0.1)
        if raw:
            provider_used = "gemini"
        elif settings.GROQ_API_KEY:
            raw = _call_groq(messages, temperature=0.1)
            if raw:
                provider_used = "groq-fallback"

    if raw is None:
        top = chunks[0]
        cite = {
            "document": top["document_name"],
            "document_id": top["document_id"],
            "chunk_id": top["chunk_id"],
            "page": top.get("page"),
            "section": top.get("section"),
            "text": top["text"][:200],
        }
        answer = f"(LLM unavailable) Best matching passage: {top['text'][:800]}"
        return answer, True, _system_confidence(chunks, [cite], True), [cite], "none"

    parsed = _parse_llm_output(raw)
    if not parsed:
        return (
            "I couldn't find sufficient evidence in the indexed documents to answer this question.",
            False, 0.0, [], provider_used,
        )

    answer = parsed.get("answer", "")
    grounded = bool(parsed.get("grounded", False))
    citations = parsed.get("citations", [])
    confidence = _system_confidence(chunks, citations, grounded)

    return answer, grounded, confidence, citations, provider_used
