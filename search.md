# MeetMux Hackathon — Hybrid RAG Engine Design Prompt (v2)

## How to use this file

The prompt is split into **3 parts** so the model doesn't rush and go shallow near the end.

1. Fill in **Section 0 (constraints)** first. Replace every `[fill in]`.
2. Send **Shared Context + Prompt 1**. Save the answer.
3. Send **Shared Context + Prompt 2** in the same chat, or a new chat with Prompt 1's decision table pasted in.
4. Send **Prompt 3** last, with the decision tables from Prompts 1 and 2 pasted in.

If you'd rather send it all at once, paste everything in order. The output requirements still apply.

---

## SHARED CONTEXT (include with every prompt)

I am participating in a company hackathon for **MeetMux**. We have **10 hours** and a **2-person team**.

### Problem statement

**Retrieval-Augmented Generation (RAG) Engine with Hybrid Dense-Sparse Search**

> Build an enterprise document search system combining lexical keyword search and dense semantic embeddings, using Reciprocal Rank Fusion (RRF), with hallucination guardrails.

Required technologies: **Next.js, FastAPI, Qdrant, BM25, Reciprocal Rank Fusion (RRF)**.
Do NOT replace these (e.g. with Pinecone or Elasticsearch) except when discussing them as reference architectures.

The goal is NOT simply a chatbot. It is an **enterprise search + retrieval + grounded answer generation system**.

The final system must demonstrate:
**hybrid retrieval + strong relevance + grounded generation + hallucination resistance + explainability**, while staying realistic to build in 10 hours.

### Section 0 — Our constraints

- **LLM access:** [fill in: e.g. Gemini free tier / OpenAI key with $X budget / Groq / local Ollama]
- **Laptops:** [fill in: e.g. 2× 16GB RAM, no GPU, OS]
- **Internet at venue:** [reliable / unreliable]
- **Documents:** [provided by company / we bring our own; formats if known]
- **Demo format:** [local laptop / hosted URL required]
- **Pre-hackathon prep allowed:** [yes: boilerplate, model downloads, sample docs / no]
- **Team skills:**
  - Developer A: [fill in: e.g. Python, FastAPI, some ML]
  - Developer B: [fill in: e.g. React/Next.js, UI]
- **Judging criteria (if known):** [fill in]

### Scope rules (apply to every answer)

- This is a **10-hour, 2-person hackathon**, not a production deployment. Be ruthless about scope.
- Classify every proposed component:
  - 🔴 **MUST HAVE**
  - 🟠 **HIGH VALUE**
  - 🟢 **STRETCH**
  - ⚪ **NOT WORTH IT**
- For each component, give **ONE recommended choice** with a one-line justification. Mention alternatives in one line at most. No menus.
- Do not recommend technology just because it is common in production. Explain **why** each component is needed and whether it is justified in 10 hours.
- Only include documentation links you are **certain exist**; otherwise mark them `(unverified)`.
- **Start every response with a one-page summary table** of the decisions in that response, with their 🔴/🟠/🟢/⚪ labels, then go into detail.

---

## PROMPT 1 — Requirements & core pipeline decisions

Using the shared context and constraints above, cover the following.

### 1. Requirements
- Exact functional requirements implied by the problem statement
- Exact non-functional requirements (latency, accuracy, traceability, security, reliability) and realistic targets for a hackathon demo

### 2. Core architecture

Expected shape:

```
User → Next.js → FastAPI → Hybrid Retrieval
                              ├── Dense semantic search → Qdrant
                              └── Sparse lexical search → BM25
                           → Reciprocal Rank Fusion → Top-K evidence
                           → LLM → Grounding / hallucination guardrail
                           → Answer + citations → Next.js
```

Decide whether BM25 should be:
- a separate index (e.g. `rank_bm25` in memory),
- Qdrant's native sparse vectors with BM25/IDF, or
- another design.

Pick one and justify it against the 10-hour constraint.

### 3. Document ingestion pipeline

```
Upload → File storage → Parsing → Text extraction → Structure detection
→ Chunking → Metadata extraction → Dense embedding → Sparse/BM25 indexing → Qdrant
```

Decide on: PDF parsing library, DOCX/PPTX support (worth it?), chunk size, chunk overlap, section-aware chunking, page preservation, heading/section preservation, tables, metadata, document IDs, chunk IDs, versions, hashing/deduplication, and re-indexing.

Give a final chunk schema, starting from:

```json
{
  "document_id": "...",
  "document_name": "...",
  "chunk_id": "...",
  "text": "...",
  "page": 17,
  "section": "Leave Policy",
  "metadata": {}
}
```

Explain which metadata is worth preserving for enterprise retrieval.

### 4. Qdrant architecture

Decide on: dense vectors, sparse vectors, named vectors, payload, payload indexes for filtering, collection design, point IDs (note: Qdrant point IDs must be unsigned integers or UUIDs, so explain how to map a readable chunk ID), and top-K.

Critique and correct this draft:

```json
{
  "id": "doc1_p17_c2",
  "vectors": { "dense": [], "sparse": {} },
  "payload": {
    "document_id": "doc1",
    "document_name": "Employee Handbook",
    "page": 17,
    "section": "Leave Policy",
    "text": "...",
    "department": "HR",
    "version": "2026"
  }
}
```

### 5. BM25
- What BM25 indexes, how chunks are indexed, and how queries are searched
- BM25 scoring, briefly (term frequency, IDF, length normalization, k1, b)
- Why it helps enterprise search: exact keywords, acronyms, IDs, product names, legal terms, numbers
- `rank_bm25` vs Qdrant sparse vectors vs Elasticsearch, evaluated against the 10-hour constraint (not production-grade status)
- Final recommendation

### 6. Dense retrieval
`Query → Embedding model → Vector similarity → Qdrant → Top-K`

Cover: practical embedding models, local vs API, dimensions, cosine similarity, latency, cost, availability, and whether sentence-transformers or fastembed fits better. **Recommend one model** for our constraints.

### 7. Reciprocal Rank Fusion

Worked example:

| Rank | Dense | BM25 |
|---|---|---|
| 1 | A | B |
| 2 | B | A |
| 3 | C | D |
| 4 | D | E |

Compute `RRF(d) = Σ 1 / (k + rank(d))` for this example with k = 60, and show the final order.

Discuss: choice of k, documents that appear in only one list, duplicate chunks, how many candidates to take from each retriever, whether to normalize scores, why RRF beats averaging BM25 and cosine scores, and an efficient implementation. Give Python pseudocode. Also say whether to use our own RRF or Qdrant's built-in fusion (consider the explainability panel).

### 8. Reranking
`Dense + BM25 → RRF → Top 10–20 → Cross-encoder → Top 5 → LLM`

Explain how RRF and reranking differ, the benefits, suitable models, CPU latency, and whether it's worth it in 10 hours. Label it 🔴/🟠/🟢/⚪.

### 9. RAG generation
`Top chunks → Context construction → System prompt → LLM → Structured response → Grounding verification → Answer`

The LLM must use only retrieved evidence, cite sources, avoid unsupported claims, and say explicitly when evidence is insufficient.

Give a **complete, copy-paste prompt template**. Target output:

```json
{
  "answer": "...",
  "grounded": true,
  "confidence": 0.94,
  "citations": [{ "document": "...", "page": 17, "chunk_id": "..." }]
}
```

Be critical: should `confidence` be generated by the LLM or **calculated by our system** (e.g. from retrieval scores, citation coverage, and grounding check results)? Propose a concrete formula if system-calculated.

### 10. Hallucination guardrails

```
Query → Retrieval → Evidence quality check → LLM → Grounding validation → Answer OR Abstain
```

Abstention message: *"I couldn't find sufficient evidence in the indexed documents to answer this question."*

Cover: minimum retrieval score thresholds (and how to calibrate them quickly), minimum number of supporting chunks, citation requirements, LLM grounding verification, contradictory documents, missing information, out-of-domain questions, prompt injection inside documents, whether a second LLM call is necessary, and lightweight alternatives to it. Do not overengineer.

### 11. Enterprise considerations

Rank by importance for 10 hours, with labels: metadata filtering (e.g. `department = Engineering`), access control / RBAC, document versioning (only the active version retrieved), `effective_date`, source traceability (document → page → section → chunk), deduplication, and re-indexing only changed content.

---

## PROMPT 2 — Infrastructure, evaluation, UI, references

Using the shared context, constraints, and the decisions from Prompt 1 [paste Prompt 1's summary table here], cover the following.

### 12. Storage architecture

Challenge the assumption that we need all of these:
- **Qdrant**: embeddings, sparse vectors, chunks, metadata
- **PostgreSQL**: users, documents, upload history, conversations, messages
- **Redis**: query, LLM response, and embedding caching; sessions
- **Object storage** (S3/Blob/GCS): original files

State what we **actually** need (e.g. could Qdrant payload + local disk + a JSON/SQLite file be enough?).

### 13. Docker
Services: frontend (Next.js :3000), backend (FastAPI :8000), qdrant (:6333), plus redis/postgres only if justified.

Provide an actual `docker-compose.yml`, the env variables, persistence volumes, how to handle model downloads (bake into the image vs cache volume), and a local dev workflow (e.g. only Qdrant in Docker during development). Prioritize speed over production complexity.

### 14. Caching
Evaluate query cache, answer cache (query + context hash), embedding cache (chunk hash → embedding), and retrieval cache. What's worth it, what goes stale, how document updates invalidate it, and whether Redis is justified or an in-process LRU is enough.

### 15. Observability & evaluation

Show per-query latency for: embedding, BM25, dense, RRF, reranking, LLM, total.

Metrics: Recall@K, Precision@K (if feasible), MRR, grounded answer rate, abstention accuracy, and a **Dense vs BM25 vs Hybrid (vs Hybrid + rerank)** comparison.

Design a small evaluation dataset (query, expected document/chunk, expected answer, question type: keyword / semantic / unanswerable), explain how to create ~30–50 items in under an hour, and give a minimal eval script outline.

### 16. UI

A professional enterprise search interface:
`Upload documents → Ask question → Answer → Citations/evidence`

Show: answer, grounded status and confidence, sources (document, page, section), and retrieved evidence.

Design a **"Retrieval Insights" panel** (dense score, BM25 score, RRF rank, final rank, retrieved chunks, per-stage latency) that proves hybrid retrieval actually works rather than hiding everything behind the LLM. Suggest a component list and layout.

### 17. Similar real-world systems

For each: what it does, which parts are relevant, which concepts to learn, and which parts are overkill. Official docs links (certain ones only, otherwise mark `unverified`).
1. Qdrant Hybrid Search
2. Azure AI Search hybrid search
3. Pinecone hybrid search
4. Elasticsearch/OpenSearch hybrid retrieval
5. Glean
6. Microsoft Copilot or similar enterprise assistants

### 18. What NOT to build

Evaluate each and label it: Kafka, Kubernetes, microservices, LangChain/LlamaIndex (worth it or not?), LangGraph, multi-agent systems, GraphRAG, knowledge graphs, Pinecone, Elasticsearch, complex event queues, fine-tuning, custom transformer training.

### 19. Competitive edge

List features that could set us apart from other hackathon teams, each labeled with an effort estimate in hours. Consider:
- query-aware adaptive fusion (weighted RRF based on query type)
- conflict and outdated-version detection
- a knowledge-gap dashboard (logged abstentions)
- sentence-level evidence highlighting
- Hinglish / Indian-language queries
- asking a clarifying question for ambiguous queries

Recommend the **top 2** we should attempt given 10 hours.

---

## PROMPT 3 — Final architecture, contract, plan

Using the shared context, constraints, and the decision tables from Prompts 1 and 2 [paste both here], produce the following.

### 20. Final architecture
- **A. Minimal:** the absolute minimum that satisfies the problem statement
- **B. Strong hackathon build:** what we should realistically build in 10 hours
- **C. Stretch:** only if the core is done early

Include one architecture diagram (Mermaid).

### 21. API contract (critical for parallel work)

Define every endpoint with exact request and response JSON: upload, ingestion status, list/delete documents, query (including the retrieval trace for the insights panel), and eval results.
Provide **mock fixture JSON** so Developer B can build the whole UI from hour 1 before the backend is ready.

### 22. Repository structure
The folder and file layout for backend and frontend, with a one-line purpose for each key file.

### 23. 10-hour plan (2 developers)

Blocks: Hour 0–1, 1–3, 3–5, 5–7, 7–8, 8–9, 9–10.

- **Developer A:** backend / ingestion / retrieval / RAG / guardrails
- **Developer B:** frontend / product / evaluation dataset / demo

Milestones (adjust if needed):
- **Hour 1:** API contract frozen, repo + Docker + Qdrant running, mocks in UI
- **Hour 3:** ingestion working
- **Hour 5:** Dense + BM25 + RRF working
- **Hour 7:** end-to-end RAG working
- **Hour 8:** guardrails + citations
- **Hour 9:** polish + evaluation
- **Hour 10:** demo rehearsal and testing (code freeze at 9:30)

Mark the **integration points** where A and B must sync.

### 24. Risks & fallbacks

The top 5 technical risks with a fallback for each (e.g. slow model downloads, PDF parsing failures on scanned files, Qdrant sparse-vector configuration errors, LLM rate limits or outages, CORS/Docker networking issues).

### 25. Cut list
- If behind at **hour 5**, drop: …
- If behind at **hour 7**, drop: …

### 26. Pre-hackathon checklist
What to prepare in advance, if allowed: model downloads, Docker images pulled, boilerplate, sample documents, API keys tested.

### 27. Demo script (3 minutes)
The exact flow and exact queries:
1. a keyword-heavy query (ID / error code) where BM25 wins
2. a semantic / paraphrased query where dense wins
3. an out-of-scope query where the system abstains
4. a conflicting-sources query (if implemented)

Plus what to show on screen at each step (insights panel, eval table).

### 28. Judge Q&A prep
The 10 most likely judge questions with short, strong answers, e.g.:
- Why RRF instead of averaging scores?
- How do you prevent hallucinations?
- How is confidence calculated?
- How would this scale to 10M documents?
- What would you do with another week?