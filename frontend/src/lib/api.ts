const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Citation {
  document: string;
  document_id: string;
  chunk_id: string;
  page: number | null;
  section: string | null;
  text: string;
  rrf_score: number;
  dense_score: number;
  bm25_score: number;
  rrf_rank: number;
}

export interface QueryResponse {
  answer: string;
  grounded: boolean;
  confidence: number;
  citations: Citation[];
  retrieval_trace: {
    dense_count: number;
    bm25_count: number;
    fused_count: number;
    top_k_used: number;
    top_chunks: Array<{
      chunk_id: string;
      document: string;
      page: number | null;
      section: string | null;
      dense_score: number;
      bm25_score: number;
      rrf_score: number;
      rrf_rank: number;
      text_preview: string;
    }>;
  };
  latency_ms: {
    embedding_ms: number;
    dense_ms: number;
    bm25_ms: number;
    rrf_ms: number;
    llm_ms: number;
    total_ms: number;
  };
}

export interface Document {
  document_id: string;
  document_name: string;
  chunks_count: number;
}

export async function uploadDocument(file: File): Promise<{ document_id: string; chunks_indexed: number }> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API}/ingest/upload`, { method: "POST", body: form });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function listDocuments(): Promise<Document[]> {
  const res = await fetch(`${API}/ingest/documents`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteDocument(id: string): Promise<void> {
  const res = await fetch(`${API}/ingest/documents/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
}

export async function queryDocuments(query: string, topK = 5): Promise<QueryResponse> {
  const res = await fetch(`${API}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, top_k: topK }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
