# 🔍 Hybrid RAG Engine

**Live demo → [clarity-rag-engine.vercel.app](https://clarity-rag-engine.vercel.app)**

> Enterprise document search combining **lexical (BM25)** and **dense semantic** retrieval, fused with **Reciprocal Rank Fusion (RRF)**, with **grounded answer generation** and **hallucination guardrails**.

Built for the **MeetMux Hackathon**. This is not a chatbot — it's an **enterprise search + retrieval + grounded generation** system with a transparent explainability layer that proves hybrid retrieval is actually working.

<p align="left">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-14-black?logo=next.js">
  <img alt="FastAPI" src="https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white">
  <img alt="Qdrant" src="https://img.shields.io/badge/Qdrant-vector%20db-DC244C">
  <img alt="Python" src="https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white">
  <img alt="Gemini" src="https://img.shields.io/badge/Gemini-1.5%20Flash-4285F4?logo=google&logoColor=white">
</p>

---

## ✨ Features

- **Hybrid retrieval** — runs dense (semantic) and BM25 (keyword) search in parallel, then merges with RRF. Catches both _"what's our leave policy?"_ (semantic) and _"error code ERR_4021"_ (exact keyword).
- **Grounded generation** — the LLM answers **only** from retrieved evidence and cites every source (document → page → section → chunk).
- **Hallucination guardrails** — abstains with a clear message when evidence is insufficient, instead of making things up.
- **System-calculated confidence** — confidence is computed from retrieval scores + citation coverage, **not** hallucinated by the LLM.
- **Retrieval Insights panel** — per-query breakdown of dense score, BM25 score, RRF rank, and per-stage latency. Full transparency, nothing hidden behind the model.
- **Zero-infra local mode** — Qdrant runs **embedded on-disk** (no Docker, no server). One command to start.

---

## 🏗️ Architecture

```
User → Next.js → FastAPI → Hybrid Retrieval
                            ├── Dense semantic search → Qdrant (cosine, 384-dim MiniLM)
                            └── Sparse lexical search → BM25 (rank_bm25, in-memory)
                         → Reciprocal Rank Fusion (k=60) → Top-K evidence
                         → Gemini 1.5 Flash → Grounding / hallucination guardrail
                         → Answer + citations + retrieval trace → Next.js
```

### Ingestion pipeline

```
Upload → Parse (PDF/DOCX/TXT) → Heading-aware chunking → Dense embedding
       → BM25 indexing → Qdrant upsert
```

---

## 🧠 Key design decisions

| Decision             | Choice                       | Why                                                                                                                            |
| -------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Sparse index**     | `rank_bm25` in-memory        | Simplest to build; rebuilt on ingest/delete. No extra service.                                                                 |
| **Dense embeddings** | `all-MiniLM-L6-v2` (384-dim) | Fast, local, no API cost, strong quality for its size.                                                                         |
| **Fusion**           | Custom RRF (k=60)            | Rank-based, so it ignores incompatible score scales between cosine and BM25 — and we control the trace for the insights panel. |
| **Vector store**     | Qdrant (embedded local mode) | Real vector DB semantics with zero infra; swaps to server mode via one env var.                                                |
| **LLM**              | Gemini 1.5 Flash             | Generous free tier, fast, good instruction-following for JSON output.                                                          |
| **Confidence**       | System-calculated            | `0.6 · (avg RRF, normalized) + 0.4 · (citation coverage)` — never trust an LLM to score itself.                                |
| **Abstention**       | Pre-LLM evidence gate        | If no chunks survive fusion, returns the abstention message without ever calling the LLM.                                      |

---

## 🚀 Quick start (no Docker required)

**Prerequisites:** Python 3.11+, Node 18+, and a free [Gemini API key](https://aistudio.google.com/apikey).

### 1. Clone & configure

```bash
git clone <your-repo-url>
cd search-engine
cp .env.example .env
# Edit .env and paste your Gemini key:
# GEMINI_API_KEY=your_real_key_here
```

### 2. Install dependencies

```bash
# Backend
cd backend
python -m venv venv
venv\Scripts\activate        # Windows  (use: source venv/bin/activate on macOS/Linux)
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install
```

### 3. Run (two terminals)

**Terminal 1 — Backend** → http://localhost:8000

```powershell
.\run-backend.ps1
```

**Terminal 2 — Frontend** → http://localhost:3000

```powershell
.\run-frontend.ps1
```

> On macOS/Linux, run the equivalent commands directly:
> `cd backend && QDRANT_MODE=local venv/bin/python -m uvicorn app.main:app --port 8000`
> and `cd frontend && npm run dev`.

Open **http://localhost:3000**, upload a document, and ask a question.

> If PowerShell blocks the scripts, run once: `Set-ExecutionPolicy -Scope Process -Bypass`

---

## 🐳 Run with Docker (optional)

If you have Docker Desktop, this runs Qdrant as a real server:

```bash
docker compose up --build
```

Frontend → `:3000`, Backend → `:8000`, Qdrant → `:6333`.

---

## 📡 API reference

Base URL: `http://localhost:8000` — interactive docs at `/docs`.

| Method   | Endpoint                 | Description                                                      |
| -------- | ------------------------ | ---------------------------------------------------------------- |
| `POST`   | `/ingest/upload`         | Upload + parse + chunk + index a PDF/DOCX/TXT (multipart `file`) |
| `GET`    | `/ingest/documents`      | List indexed documents with chunk counts                         |
| `DELETE` | `/ingest/documents/{id}` | Remove a document from both indexes                              |
| `POST`   | `/query`                 | Hybrid retrieval + grounded answer + retrieval trace             |
| `GET`    | `/health`                | Health check                                                     |

<details>
<summary><b>Example <code>/query</code> response</b></summary>

```json
{
  "answer": "Employees are entitled to 18 days of paid leave per year.",
  "grounded": true,
  "confidence": 0.91,
  "citations": [
    {
      "document": "Employee Handbook.pdf",
      "page": 17,
      "section": "Leave Policy",
      "chunk_id": "…",
      "dense_score": 0.812,
      "bm25_score": 4.31,
      "rrf_score": 0.0325,
      "rrf_rank": 1
    }
  ],
  "retrieval_trace": {
    "dense_count": 20,
    "bm25_count": 14,
    "fused_count": 27,
    "top_chunks": []
  },
  "latency_ms": {
    "embedding_ms": 12,
    "dense_ms": 8,
    "bm25_ms": 3,
    "rrf_ms": 1,
    "llm_ms": 640,
    "total_ms": 664
  }
}
```

</details>

---

## 📁 Project structure

```
search-engine/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app + CORS + routers
│   │   ├── api/
│   │   │   ├── ingest.py        # upload / list / delete endpoints
│   │   │   └── query.py         # hybrid query pipeline + trace
│   │   ├── core/
│   │   │   ├── chunker.py       # PDF/DOCX/TXT parsing + heading-aware chunking
│   │   │   ├── embedder.py      # sentence-transformers embeddings
│   │   │   ├── bm25_index.py    # in-memory BM25 (thread-safe singleton)
│   │   │   ├── qdrant_store.py  # dense upsert/search (embedded or server)
│   │   │   ├── rrf.py           # Reciprocal Rank Fusion
│   │   │   ├── llm.py           # Gemini generation + system confidence
│   │   │   └── config.py        # settings (env-driven)
│   │   └── models/schemas.py    # Pydantic request/response models
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/page.tsx         # search UI + insights panel
│   │   └── lib/api.ts           # typed API client
│   └── Dockerfile
├── docker-compose.yml
├── run-backend.ps1
├── run-frontend.ps1
└── .env.example
```

---

## ⚙️ Configuration

Set in `.env` or as environment variables (see [backend/app/core/config.py](backend/app/core/config.py)):

| Variable          | Default                 | Description                                         |
| ----------------- | ----------------------- | --------------------------------------------------- |
| `GEMINI_API_KEY`  | —                       | **Required.** Your Gemini API key                   |
| `QDRANT_MODE`     | `local`                 | `local` (embedded on-disk) or `server` (remote URL) |
| `QDRANT_URL`      | `http://localhost:6333` | Used when `QDRANT_MODE=server`                      |
| `EMBEDDING_MODEL` | `all-MiniLM-L6-v2`      | Sentence-transformers model                         |
| `RRF_K`           | `60`                    | RRF constant                                        |
| `FINAL_TOP_K`     | `5`                     | Chunks passed to the LLM                            |

---

## 🗺️ Roadmap

- [ ] Cross-encoder reranking (RRF top-20 → rerank → top-5)
- [ ] Metadata filtering (`department = Engineering`)
- [ ] Conflict / outdated-version detection across sources
- [ ] Evaluation dashboard (Recall@K, MRR, Dense vs BM25 vs Hybrid)
- [ ] Sentence-level evidence highlighting

---

## 📝 License

MIT — built for the MeetMux Hackathon.
