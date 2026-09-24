"use client";
import { useState, useRef, useCallback } from "react";
import { uploadDocument, listDocuments, deleteDocument, queryDocuments } from "@/lib/api";
import type { QueryResponse, Document } from "@/lib/api";
import { Upload, Search, Trash2, FileText, ChevronDown, ChevronUp, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import clsx from "clsx";

export default function Home() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<QueryResponse | null>(null);
  const [error, setError] = useState("");
  const [showInsights, setShowInsights] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const refreshDocs = useCallback(async () => {
    try {
      setDocuments(await listDocuments());
    } catch {}
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadMsg("");
    try {
      const r = await uploadDocument(file);
      setUploadMsg(`Indexed ${r.chunks_indexed} chunks`);
      await refreshDocs();
    } catch (err: any) {
      setUploadMsg(`Error: ${err.message}`);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    await deleteDocument(id);
    await refreshDocs();
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setError("");
    setResult(null);
    try {
      const r = await queryDocuments(query);
      setResult(r);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-lg font-bold text-white">MeetMux RAG</h1>
          <p className="text-xs text-gray-400 mt-0.5">Hybrid Document Search</p>
        </div>

        <div className="p-4">
          <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={handleUpload} />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full flex items-center gap-2 justify-center bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium py-2 px-4 rounded-lg transition"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? "Indexing…" : "Upload Document"}
          </button>
          {uploadMsg && (
            <p className={clsx("text-xs mt-2", uploadMsg.startsWith("Error") ? "text-red-400" : "text-green-400")}>
              {uploadMsg}
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Documents</span>
            <button onClick={refreshDocs} className="text-xs text-blue-400 hover:text-blue-300">Refresh</button>
          </div>
          {documents.length === 0 && (
            <p className="text-xs text-gray-600 italic">No documents indexed yet</p>
          )}
          {documents.map((doc) => (
            <div key={doc.document_id} className="flex items-start justify-between gap-2 py-2 border-b border-gray-800">
              <div className="flex items-start gap-2 min-w-0">
                <FileText className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm text-gray-200 truncate">{doc.document_name}</p>
                  <p className="text-xs text-gray-500">{doc.chunks_count} chunks</p>
                </div>
              </div>
              <button onClick={() => handleDelete(doc.document_id)} className="text-gray-600 hover:text-red-400 shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Search bar */}
        <div className="p-6 border-b border-gray-800 bg-gray-950">
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question about your documents…"
              className="flex-1 bg-gray-900 border border-gray-700 text-gray-100 placeholder-gray-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button
              type="submit"
              disabled={searching || !query.trim()}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium px-5 py-3 rounded-xl transition"
            >
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search
            </button>
          </form>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 bg-red-950 border border-red-800 rounded-xl p-4 text-red-300 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {result && (
            <>
              {/* Answer card */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  {result.grounded ? (
                    <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0" />
                  )}
                  <span className={clsx("text-xs font-semibold px-2 py-0.5 rounded-full", result.grounded ? "bg-green-900 text-green-300" : "bg-yellow-900 text-yellow-300")}>
                    {result.grounded ? `Grounded · ${(result.confidence * 100).toFixed(0)}% confidence` : "Not grounded"}
                  </span>
                  <span className="text-xs text-gray-500 ml-auto">{result.latency_ms.total_ms}ms total</span>
                </div>
                <p className="text-gray-100 text-sm leading-relaxed">{result.answer}</p>
              </div>

              {/* Citations */}
              {result.citations.length > 0 && (
                <div className="space-y-2">
                  <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Sources</h2>
                  {result.citations.map((c, i) => (
                    <div key={c.chunk_id} className="bg-gray-900 border border-gray-800 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-blue-400">[{i + 1}]</span>
                        <span className="text-sm font-medium text-gray-200">{c.document}</span>
                        {c.page && <span className="text-xs text-gray-500">p.{c.page}</span>}
                        {c.section && <span className="text-xs text-gray-600 truncate">· {c.section}</span>}
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">{c.text}</p>
                      <div className="flex gap-3 mt-2 text-xs text-gray-600">
                        <span>Dense: {c.dense_score.toFixed(3)}</span>
                        <span>BM25: {c.bm25_score.toFixed(3)}</span>
                        <span>RRF: {c.rrf_score.toFixed(4)}</span>
                        <span>Rank #{c.rrf_rank}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Retrieval Insights toggle */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <button
                  onClick={() => setShowInsights((v) => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-300 hover:bg-gray-800 transition"
                >
                  <span>Retrieval Insights</span>
                  {showInsights ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showInsights && (
                  <div className="px-4 pb-4 border-t border-gray-800">
                    {/* Latency breakdown */}
                    <div className="mt-3 mb-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Pipeline Latency</p>
                      <div className="grid grid-cols-3 gap-2">
                        {Object.entries(result.latency_ms).map(([k, v]) => (
                          <div key={k} className="bg-gray-800 rounded p-2 text-center">
                            <p className="text-xs text-gray-500">{k.replace("_ms", "")}</p>
                            <p className="text-sm font-bold text-white">{v}ms</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Fusion trace table */}
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                      RRF Fusion ({result.retrieval_trace.dense_count} dense + {result.retrieval_trace.bm25_count} BM25 → {result.retrieval_trace.fused_count} fused)
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-gray-400">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="text-left py-1 pr-3">Rank</th>
                            <th className="text-left py-1 pr-3">Document</th>
                            <th className="text-left py-1 pr-3">Section</th>
                            <th className="text-right py-1 pr-3">Dense</th>
                            <th className="text-right py-1 pr-3">BM25</th>
                            <th className="text-right py-1">RRF</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.retrieval_trace.top_chunks.map((c) => (
                            <tr key={c.chunk_id} className="border-b border-gray-800 hover:bg-gray-800">
                              <td className="py-1.5 pr-3 font-bold text-white">#{c.rrf_rank}</td>
                              <td className="py-1.5 pr-3 text-gray-300 truncate max-w-[120px]">{c.document}</td>
                              <td className="py-1.5 pr-3 text-gray-500 truncate max-w-[100px]">{c.section ?? "—"}</td>
                              <td className="py-1.5 pr-3 text-right text-blue-400">{c.dense_score.toFixed(3)}</td>
                              <td className="py-1.5 pr-3 text-right text-purple-400">{c.bm25_score.toFixed(3)}</td>
                              <td className="py-1.5 text-right text-green-400">{c.rrf_score.toFixed(4)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Chunk previews */}
                    <p className="text-xs font-semibold text-gray-500 uppercase mt-4 mb-2">Retrieved Chunks</p>
                    {result.retrieval_trace.top_chunks.map((c) => (
                      <div key={c.chunk_id} className="mb-2 bg-gray-800 rounded p-2">
                        <p className="text-xs text-gray-500 mb-0.5">{c.document} {c.page ? `· p${c.page}` : ""} · {c.section}</p>
                        <p className="text-xs text-gray-300">{c.text_preview}…</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {!result && !error && !searching && (
            <div className="text-center text-gray-600 mt-20">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Upload documents and ask a question</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
