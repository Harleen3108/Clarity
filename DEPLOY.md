# Deploy to Render (free plan) + Vercel

## Prerequisites

| Service | What you need |
|---|---|
| [Groq](https://console.groq.com/keys) | `GROQ_API_KEY` |
| [Qdrant Cloud](https://cloud.qdrant.io) | Cluster URL + API key |
| [Vercel](https://vercel.com) | For the Next.js frontend |

---

## 1. Backend → Render

### One-time setup
1. Push this repo to GitHub.
2. In [Render](https://dashboard.render.com), create **New → Web Service** → connect your repo.
3. Render will auto-detect `render.yaml` at the root and fill in most settings.

### Environment variables to set manually in Render dashboard
(these are marked `sync: false` in render.yaml — Render never auto-fills secrets)

| Variable | Value |
|---|---|
| `GROQ_API_KEY` | Your Groq key |
| `GEMINI_API_KEY` | Your Gemini key (fallback — optional) |
| `QDRANT_URL` | `https://<cluster>.cloud.qdrant.io` |
| `QDRANT_API_KEY` | Your Qdrant Cloud API key |
| `ALLOWED_ORIGINS` | `https://<your-app>.vercel.app,http://localhost:3000` |

### Verify deploy
```
curl https://<your-render-service>.onrender.com/health
# → {"status":"ok","models_loaded":false,"qdrant":"ok","bm25_chunks":0}
```
`models_loaded` becomes `true` after the first query (fastembed loads lazily).

---

## 2. Seed Qdrant Cloud

After the backend is up, index your documents from local machine:

```bash
cd backend
pip install python-dotenv   # only needed for the seed script
python ../scripts/seed.py ../sample_docs/
```

Make sure your `.env` (project root) has `QDRANT_URL` and `QDRANT_API_KEY` set.

---

## 3. Frontend → Vercel

```bash
cd frontend
# Set env var in Vercel dashboard (or .env.local for local dev):
# NEXT_PUBLIC_API_URL=https://<your-render-service>.onrender.com
```

Deploy via Vercel dashboard or `vercel --prod`.

---

## Memory budget (Render free plan: 512 MB)

| Component | RAM |
|---|---|
| Python + FastAPI + uvicorn | ~60 MB |
| fastembed ONNX model (loaded on first query) | ~80 MB |
| qdrant-client + rank-bm25 | ~30 MB |
| BM25 index (per 1000 chunks) | ~5 MB |
| **Estimated total after first query** | **~200–250 MB** |

---

## LLM fallback behaviour

- `LLM_PROVIDER=groq` → tries Groq first; if it returns 429/503/timeout, retries once; then falls back to Gemini if `GEMINI_API_KEY` is set.
- `LLM_PROVIDER=gemini` → tries Gemini first; falls back to Groq.
- `llm_provider` field in every `/query` response shows which provider actually answered.

---

## Re-index after changing the embedding model

If you switch `EMBEDDING_MODEL`, the existing Qdrant vectors become stale.
Delete the collection in the Qdrant Cloud UI, then re-run `scripts/seed.py`.
The current model (`BAAI/bge-small-en-v1.5`, 384-dim) matches the collection dimension
in Qdrant Cloud, so no recreation is needed for the default setup.
