"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import ChunkGrid, { HIT_COLOR, scanColumn } from "@/components/ChunkGrid";
import { deleteDocument, listDocuments, queryDocuments, uploadDocument, type Document, type QueryResponse } from "@/lib/api";
import { EMPTY_TRACE, colOf, traceFromResponse, type HitType, type RetrievalTrace, type TraceHit } from "@/lib/trace";

const SCAN_MS = 2000;
const FUSE_MS = 1200;

// idle -> scan -> fuse -> answer | refused (| error when the API call fails)
type Phase = "idle" | "scan" | "fuse" | "answer" | "refused" | "error";
type StageState = "pending" | "active" | "done" | "skipped";

interface AskState {
  phase: Phase;
  progress: number;
  asked: string;
  res: QueryResponse | null;
  error: string;
}

const INITIAL: AskState = { phase: "idle", progress: 0, asked: "", res: null, error: "" };

const STAGE_NAMES = ["Embed query", "BM25 search", "Dense search", "RRF fusion", "Generate"];

function fmtMs(ms: number) {
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${Math.round(ms)}ms`;
}

function stageTimes(res: QueryResponse | null): string[] {
  if (!res) return ["", "", "", "", ""];
  const l = res.latency_ms;
  return [l.embedding_ms, l.bm25_ms, l.dense_ms, l.rrf_ms, l.llm_ms].map(fmtMs);
}

function stageState(i: number, s: AskState): StageState {
  const llmSkipped = !!s.res && s.res.latency_ms.llm_ms === 0;
  if (s.phase === "idle" || s.phase === "error") return "pending";
  if (s.phase === "answer" || s.phase === "refused") return i === 4 && llmSkipped ? "skipped" : "done";
  if (s.phase === "fuse") {
    if (!s.res) return "active";
    return i === 4 && llmSkipped ? "skipped" : "done";
  }
  if (i === 0) return s.progress > 0.06 ? "done" : "active";
  return i <= 2 ? "active" : "pending";
}

function traceOf(res: QueryResponse | null): RetrievalTrace {
  if (!res) return EMPTY_TRACE;
  return traceFromResponse(res.retrieval_trace.top_chunks, new Set(res.citations.map((c) => c.chunk_id)));
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function useAskMachine(onDone: (q: string, res: QueryResponse) => void) {
  const [s, setS] = useState<AskState>(INITIAL);
  const raf = useRef(0);
  const run = useRef(0);

  const ask = useCallback(
    (q: string) => {
      q = q.trim();
      if (!q) return;
      const id = ++run.current;
      cancelAnimationFrame(raf.current);
      setS({ phase: "scan", progress: 0, asked: q, res: null, error: "" });

      const request = queryDocuments(q).then((res) => {
        if (run.current === id) setS((p) => ({ ...p, res }));
        return res;
      });
      request.catch(() => {}); // handled after the scan animation

      const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const t0 = performance.now();
      const step = async (now: number) => {
        if (run.current !== id) return;
        const progress = reduced ? 1 : Math.min(1, (now - t0) / SCAN_MS);
        if (progress < 1) {
          setS((p) => ({ ...p, progress }));
          raf.current = requestAnimationFrame(step);
          return;
        }
        setS((p) => ({ ...p, progress: 1, phase: "fuse" }));
        try {
          const [res] = await Promise.all([request, sleep(reduced ? 0 : FUSE_MS)]);
          if (run.current !== id) return;
          setS((p) => ({ ...p, res, phase: res.grounded ? "answer" : "refused" }));
          onDone(q, res);
        } catch (e) {
          if (run.current !== id) return;
          setS((p) => ({ ...p, phase: "error", error: e instanceof Error ? e.message : String(e) }));
        }
      };
      raf.current = requestAnimationFrame(step);
    },
    [onDone],
  );

  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  return { s, ask };
}

interface SessionEntry {
  q: string;
  res: QueryResponse;
}

export default function WorkspacePage() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [docsError, setDocsError] = useState("");
  const [history, setHistory] = useState<SessionEntry[]>([]);
  const onDone = useCallback((q: string, res: QueryResponse) => setHistory((h) => [...h, { q, res }]), []);
  const { s, ask } = useAskMachine(onDone);
  const [query, setQuery] = useState("");
  const busy = s.phase === "scan" || s.phase === "fuse";
  const trace = traceOf(s.res);
  const totalChunks = docs.reduce((a, d) => a + d.chunks_count, 0);

  const refreshDocs = useCallback(async () => {
    try {
      setDocs(await listDocuments());
      setDocsError("");
    } catch (e) {
      setDocsError(e instanceof Error ? e.message : "Backend unreachable");
    }
  }, []);

  useEffect(() => {
    refreshDocs();
  }, [refreshDocs]);

  const submit = (q: string) => {
    setQuery(q.trim());
    ask(q);
  };

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) submit(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const times = stageTimes(s.res);
  const stages = STAGE_NAMES.map((name, i) => {
    const k = stageState(i, s);
    return { name, k, t: k === "done" ? times[i] : k === "active" ? "…" : k === "skipped" ? "skipped" : "" };
  });

  return (
    <div className="flex h-screen min-h-[780px] flex-col overflow-x-auto overflow-y-hidden">
      <TopBar />
      <div className="flex min-h-0 min-w-[900px] flex-1">
        <Sources s={s} docs={docs} error={docsError} totalChunks={totalChunks} trace={trace} onChange={refreshDocs} />

        <main className="flex min-w-0 flex-1 flex-col gap-4 overflow-hidden px-9 pb-5 pt-6">
          {s.phase === "idle" && <IdleState docCount={docs.length} />}
          {busy && <BusyState s={s} stages={stages} trace={trace} />}
          {s.phase === "answer" && s.res && <AnswerState s={s} res={s.res} trace={trace} totalChunks={totalChunks} />}
          {s.phase === "refused" && s.res && <RefusedState s={s} res={s.res} />}
          {s.phase === "error" && <ErrorState s={s} />}

          <div className="flex shrink-0 items-center gap-2.5 rounded-[14px] border border-border-strong bg-surface py-2 pl-4 pr-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A3A9B1" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20L16 16" />
            </svg>
            <label htmlFor="q" className="sr">
              Ask your documents
            </label>
            <input
              id="q"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !busy) submit(query);
              }}
              placeholder="Ask anything about your sources…"
              className="flex-1 border-0 bg-transparent px-[2px] py-px font-body text-[16px] text-text outline-none"
            />
            <span className="rounded-md border border-border px-2 py-[3px] font-mono text-[11px] text-text-2">hybrid + RRF</span>
            <button
              type="button"
              disabled={busy || !query.trim()}
              onClick={() => submit(query)}
              className="h-11 cursor-pointer rounded-[10px] border-0 bg-text px-5 text-[15px] font-medium text-bg disabled:cursor-default disabled:bg-[#2A3038] disabled:text-text-2"
            >
              {busy ? "Searching…" : "Ask"}
            </button>
          </div>
        </main>

        <Analytics s={s} stages={stages} trace={trace} history={history} totalChunks={totalChunks} />
      </div>
    </div>
  );
}

/* ================= TOP BAR ================= */

function TopBar() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-line bg-panel px-5">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2.5 !text-text">
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none" strokeWidth="1.8">
            <circle cx="10.5" cy="14" r="7.5" stroke="#FF9F43" />
            <circle cx="17.5" cy="14" r="7.5" stroke="#6EA8FF" />
          </svg>
          <b className="font-display text-[19px] font-bold">Clarity</b>
        </Link>
        <Pill>workspace</Pill>
      </div>
      <nav className="flex items-center gap-5 text-[14px]">
        <Link href="/library">Library</Link>
        <Link href="/xray">Retrieval X-ray</Link>
      </nav>
    </header>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="rounded-md border border-border px-2 py-[3px] font-mono text-[11px] text-text-2">{children}</span>;
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="font-mono text-[11px] tracking-[.02em] text-text-2">{children}</span>;
}

/* ================= LEFT: SOURCES ================= */

function Sources({
  s,
  docs,
  error,
  totalChunks,
  trace,
  onChange,
}: {
  s: AskState;
  docs: Document[];
  error: string;
  totalChunks: number;
  trace: RetrievalTrace;
  onChange: () => Promise<void>;
}) {
  const [filter, setFilter] = useState("");
  const [status, setStatus] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const sc = scanColumn(s.phase === "scan" ? "scan" : "found", s.progress);
  const hitByDoc = new Map<string, TraceHit>();
  trace.top5.forEach((h) => {
    if (!hitByDoc.has(h.doc)) hitByDoc.set(h.doc, h);
  });

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    for (const f of Array.from(files)) {
      setStatus(`Indexing ${f.name}…`);
      try {
        const r = await uploadDocument(f);
        setStatus(`Indexed ${f.name} · ${r.chunks_indexed} chunks`);
      } catch (e) {
        setStatus(`Failed: ${f.name} · ${e instanceof Error ? e.message : e}`);
      }
      await onChange();
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const remove = async (d: Document) => {
    setStatus(`Removing ${d.document_name}…`);
    try {
      await deleteDocument(d.document_id);
      setStatus(`Removed ${d.document_name}`);
    } catch (e) {
      setStatus(`Failed to remove: ${e instanceof Error ? e.message : e}`);
    }
    await onChange();
  };

  const shown = docs.filter((d) => d.document_name.toLowerCase().includes(filter.toLowerCase()));

  return (
    <aside className="flex min-h-0 w-[220px] shrink-0 flex-col border-r border-line bg-panel xl:w-[280px]">
      <div className="flex flex-col gap-3.5 px-[18px] pb-3.5 pt-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-[18px] font-semibold">Sources</h2>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="h-8 cursor-pointer rounded-lg border border-border-strong bg-transparent px-3 text-[13px] font-medium text-text"
          >
            + Add
          </button>
          <input ref={fileRef} type="file" multiple accept=".pdf,.docx,.txt" className="hidden" onChange={(e) => upload(e.target.files)} />
        </div>
        <label htmlFor="filter" className="sr">
          Filter sources
        </label>
        <input
          id="filter"
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={`Filter ${docs.length} document${docs.length === 1 ? "" : "s"}`}
          className="h-9 rounded-lg border border-border bg-surface px-3 text-[13px] text-text outline-none placeholder:text-[#757575]"
        />
        {status && <span className="break-words text-[11px] text-text-2">{status}</span>}
      </div>

      <div className="flex flex-1 flex-col gap-0.5 overflow-auto px-2.5 pb-2.5">
        {error && <div className="px-2 py-2 text-[12px] text-danger">Can&apos;t reach the backend: {error}</div>}
        {!error && docs.length === 0 && (
          <div className="px-2 py-2 text-[13px] text-text-3">No documents yet. Use + Add to upload a PDF, DOCX or TXT.</div>
        )}
        {shown.map((d) => {
          const h = hitByDoc.get(d.document_name);
          const lit = !!h && s.phase !== "idle" && s.phase !== "refused" && (s.phase !== "scan" || colOf(h.grid_index) <= sc);
          return (
            <div
              key={d.document_id}
              className={`group flex items-center gap-2.5 rounded-lg p-2 transition-[background] duration-200 ${lit ? "bg-surface-2" : ""}`}
            >
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-[13px]" title={d.document_name}>
                  {d.document_name}
                </span>
                <span className="text-[11px] text-text-3">{d.chunks_count} chunks</span>
              </div>
              {lit && h && (
                <span className="shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] text-bg" style={{ background: HIT_COLOR[h.type] }}>
                  {s.phase === "answer" ? h.cite : "match"}
                </span>
              )}
              <button
                type="button"
                title="Remove document"
                onClick={() => remove(d)}
                className="shrink-0 cursor-pointer rounded border-0 bg-transparent px-1 text-[14px] text-text-3 opacity-0 hover:text-danger group-hover:opacity-100"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between border-t border-line px-[18px] py-3.5 font-mono text-[11px] text-text-2">
        <span>{totalChunks.toLocaleString("en-US")} chunks indexed</span>
        {error ? <span className="text-danger">● offline</span> : <span className="text-ok">● synced</span>}
      </div>
    </aside>
  );
}

/* ================= CENTRE STATES ================= */

function IdleState({ docCount }: { docCount: number }) {
  return (
    <section className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex flex-col gap-2 pt-3">
        <h1 className="font-display text-[40px] font-bold tracking-[-.03em]">
          {docCount ? `Ask across ${docCount} document${docCount === 1 ? "" : "s"}.` : "Add a document to begin."}
        </h1>
        <p className="text-[16px] text-text-2">
          Every chunk is read two ways: by exact keyword and by meaning. Then the two rankings are fused.
        </p>
      </div>
      <div className="flex items-center gap-[18px] font-mono text-[11px] text-text-2">
        <span>CORPUS</span>
        <LegendItem color="bg-bm25">keyword match</LegendItem>
        <LegendItem color="bg-dense">meaning match</LegendItem>
        <LegendItem color="bg-both">both</LegendItem>
      </div>
      <div>
        <ChunkGrid phase="idle" />
      </div>
    </section>
  );
}

function LegendItem({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span>
      <i className={`mr-1.5 inline-block h-2 w-2 rounded-[2px] align-[-1px] ${color}`} />
      {children}
    </span>
  );
}

function Bubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[520px] self-end rounded-[16px_16px_4px_16px] border border-border bg-surface-3 px-4 py-3 text-[15px]">{children}</div>
  );
}

const DOT = "h-2.5 w-2.5 shrink-0 rounded-[5px] border-2";
const dotClass = (k: StageState) =>
  k === "done"
    ? `${DOT} border-text bg-text`
    : k === "active"
      ? `${DOT} animate-pulse border-text shadow-[0_0_0_3px_rgba(236,234,228,.15)]`
      : `${DOT} border-[#3A414B]`;

type Stage = { name: string; k: StageState; t: string };

function BusyState({ s, stages, trace }: { s: AskState; stages: Stage[]; trace: RetrievalTrace }) {
  const scanning = s.phase === "scan";
  const rt = s.res?.retrieval_trace;
  const nohits = !!s.res && !s.res.grounded;
  return (
    <section className="flex min-h-0 flex-1 flex-col gap-4">
      <Bubble>{s.asked}</Bubble>
      <div className="flex flex-wrap gap-2">
        {stages.map((p) => (
          <div
            key={p.name}
            className={`flex h-[34px] items-center gap-2 rounded-[17px] border px-3 text-[13px] ${
              p.k === "done"
                ? "border-border bg-surface-2 text-text"
                : p.k === "active"
                  ? "border-text text-text"
                  : "border-border text-text-3"
            }`}
          >
            <span className={dotClass(p.k)} />
            <span className={p.k === "skipped" ? "line-through" : ""}>{p.name}</span>
            <span className="font-mono text-[11px] text-text-3">{p.t}</span>
          </div>
        ))}
      </div>
      <div className="flex items-baseline justify-between">
        <span className="font-display text-[22px] font-semibold">
          {scanning ? "Traversing chunks…" : nohits ? "Nothing passed the evidence gate" : "Fusing and generating…"}
        </span>
        <span className="font-mono text-[12px] text-text-2">
          {rt ? `${rt.bm25_count + rt.dense_count} candidates → RRF → top ${rt.top_k_used}` : "BM25 + dense, in parallel"}
        </span>
      </div>
      <div>
        <ChunkGrid phase={scanning ? "scan" : "found"} progress={s.progress} nohits={nohits} trace={trace} />
      </div>
      <p className="text-[13px] text-text-2">
        Orange cells matched the keywords, blue cells matched the meaning, white cells matched both. Lines pull the best evidence into the top 5.
      </p>
    </section>
  );
}

function MiniMap({ nohits = false, trace }: { nohits?: boolean; trace: RetrievalTrace }) {
  return (
    <div className="h-[186px] w-[464px] shrink-0 animate-fade overflow-hidden rounded-xl border border-line">
      <div className="origin-[12px_12px] scale-[.6]">
        <ChunkGrid phase="found" progress={1} nohits={nohits} trace={trace} />
      </div>
    </div>
  );
}

/** Renders answer text with [n] citation chips and `code` spans. */
function AnswerText({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/\n\s*\n/)
        .filter((p) => p.trim())
        .map((p, i) => (
          <p key={i} className="whitespace-pre-line text-[16px] leading-[1.6]">
            {p.split(/(\[\d+\]|`[^`]+`)/).map((part, j) =>
              /^\[\d+\]$/.test(part) ? (
                <span key={j} className="rounded border border-[#3A414B] px-1 font-mono text-[12px] text-text">
                  {part}
                </span>
              ) : /^`[^`]+`$/.test(part) ? (
                <span key={j} className="rounded bg-[#1E232A] px-1.5 py-0.5 font-mono text-[13px]">
                  {part.slice(1, -1)}
                </span>
              ) : (
                part
              ),
            )}
          </p>
        ))}
    </>
  );
}

function AnswerState({ s, res, trace, totalChunks }: { s: AskState; res: QueryResponse; trace: RetrievalTrace; totalChunks: number }) {
  const bothCount = trace.top5.filter((h) => h.type === "both").length;
  return (
    <section className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto">
      <Bubble>{s.asked}</Bubble>
      <article className="flex animate-fade flex-col gap-3.5 rounded-2xl border border-[#2A3038] bg-surface px-6 py-5">
        <div className="flex items-center gap-2.5 font-mono text-[12px]">
          <span className="h-[9px] w-[9px] rounded-[5px] bg-ok" />
          <span className="text-ok">GROUNDED · {Math.round(res.confidence * 100)}%</span>
          <span className="text-text-2">
            · {res.retrieval_trace.top_k_used} chunks · {(res.latency_ms.total_ms / 1000).toFixed(2)} s
          </span>
        </div>
        <div className="flex min-h-[52px] flex-col gap-2.5">
          <AnswerText text={res.answer} />
        </div>
        {res.citations.length > 0 && (
          <div className="flex flex-wrap gap-2.5">
            {res.citations.map((c, i) => (
              <div
                key={c.chunk_id}
                title={c.text}
                className="flex min-w-[200px] flex-1 flex-col gap-1 rounded-[10px] border border-[#343B45] px-3.5 py-2.5"
              >
                <span className="font-mono text-[11px] text-text-2">
                  [{i + 1}] RRF #{c.rrf_rank} · DENSE {(c.dense_score ?? 0).toFixed(2)} · BM25 {(c.bm25_score ?? 0).toFixed(2)}
                </span>
                <span className="text-[14px] text-text">
                  {c.document}
                  {c.page != null ? ` · p.${c.page}` : ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </article>
      <div className="flex animate-fade items-start gap-5">
        <MiniMap trace={trace} />
        <div className="flex flex-col gap-2 pt-1.5">
          <Label>SOURCE MAP</Label>
          <span className="text-[14px] leading-[1.55] text-[#CFCDC7]">
            Where the evidence came from, out of {totalChunks.toLocaleString("en-US")} chunks.{" "}
            {bothCount > 0
              ? `${bothCount} white cell${bothCount === 1 ? " was" : "s were"} found by both searches, so fusion ranked ${bothCount === 1 ? "it" : "them"} highly.`
              : "No chunk was found by both searches."}
          </span>
        </div>
      </div>
    </section>
  );
}

function RefusedState({ s, res }: { s: AskState; res: QueryResponse }) {
  const llmSkipped = res.latency_ms.llm_ms === 0;
  return (
    <section className="flex min-h-0 flex-1 flex-col gap-4">
      <Bubble>{s.asked}</Bubble>
      <article className="flex animate-fade flex-col gap-4 rounded-2xl border border-[#2A3038] bg-surface px-6 py-[22px]">
        <div className="flex items-center gap-2.5 font-mono text-[12px] text-text-2">
          <InfoIcon />
          {llmSkipped ? "INSUFFICIENT EVIDENCE · LLM NOT CALLED" : "NOT GROUNDED IN THE EVIDENCE"}
        </div>
        <p className="font-display text-[22px] font-semibold leading-[1.35]">{res.answer}</p>
        <span className="text-[13px] text-text-2">Logged as a knowledge gap for this session.</span>
      </article>
      <MiniMap nohits trace={EMPTY_TRACE} />
    </section>
  );
}

function ErrorState({ s }: { s: AskState }) {
  return (
    <section className="flex min-h-0 flex-1 flex-col gap-4">
      <Bubble>{s.asked}</Bubble>
      <article className="flex animate-fade flex-col gap-4 rounded-2xl border border-[#2A3038] bg-surface px-6 py-[22px]">
        <div className="flex items-center gap-2.5 font-mono text-[12px] text-danger">
          <InfoIcon />
          REQUEST FAILED
        </div>
        <p className="break-words font-mono text-[13px] text-text-2">{s.error}</p>
      </article>
    </section>
  );
}

function InfoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ECEAE4" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8V13" />
      <path d="M12 16V16.5" />
    </svg>
  );
}

/* ================= RIGHT: ANALYTICS ================= */

function Tile({ k, children, wide, kColor, border }: { k: string; children: React.ReactNode; wide?: boolean; kColor?: string; border?: string }) {
  return (
    <div className={`flex flex-col gap-1 rounded-[10px] border p-3 ${wide ? "col-span-2" : ""}`} style={{ borderColor: border ?? "#1E232A" }}>
      <span className="font-mono text-[10px] text-text-2" style={kColor ? { color: kColor } : undefined}>
        {k}
      </span>
      {children}
    </div>
  );
}

function Box({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-2 rounded-[10px] border border-[#1E232A] p-3.5">{children}</div>;
}

function BoxKey({ children }: { children: React.ReactNode }) {
  return <span className="font-mono text-[10px] text-text-2">{children}</span>;
}

const TILE_V = "font-display font-semibold";

function mix(hits: TraceHit[]) {
  const m: Record<HitType, number> = { both: 0, bm25: 0, dense: 0 };
  hits.forEach((h) => m[h.type]++);
  return m;
}

function Analytics({
  s,
  stages,
  trace,
  history,
  totalChunks,
}: {
  s: AskState;
  stages: Stage[];
  trace: RetrievalTrace;
  history: SessionEntry[];
  totalChunks: number;
}) {
  const busy = s.phase === "scan" || s.phase === "fuse";
  const sc = scanColumn(s.phase === "scan" ? "scan" : "found", s.progress);
  const pc = Math.min(s.progress, 1);
  const rt = s.res?.retrieval_trace;
  const both = trace.top5.filter((h) => h.type === "both" && (s.phase === "fuse" || colOf(h.grid_index) <= sc)).length;

  // Session stats from real queries only.
  const answered = history.filter((h) => h.res.grounded);
  const refused = history.filter((h) => !h.res.grounded);
  const lat = history.map((h) => h.res.latency_ms.total_ms).sort((a, b) => a - b);
  const p50 = lat.length ? lat[Math.floor((lat.length - 1) / 2)] : null;
  const sessionMix = mix(answered.flatMap((h) => traceOf(h.res).top5.filter((t) => t.cite !== "top 5")));
  const mixTotal = sessionMix.both + sessionMix.bm25 + sessionMix.dense;
  const pct = (n: number) => (mixTotal ? Math.round((n / mixTotal) * 100) : 0);
  const gapCounts: Record<string, number> = {};
  refused.forEach((h) => (gapCounts[h.q] = (gapCounts[h.q] ?? 0) + 1));
  const gaps = Object.entries(gapCounts).sort((a, b) => b[1] - a[1]);

  const res = s.res;
  const l = res?.latency_ms;
  const m = mix(trace.top5);

  return (
    <aside className="flex w-[260px] shrink-0 flex-col gap-[18px] overflow-auto border-l border-line bg-panel p-5 xl:w-[340px]">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-[18px] font-semibold">Analytics</h2>
        <span className={`rounded-[10px] border border-border px-2 py-[3px] font-mono text-[11px] ${busy ? "text-ok" : "text-text-2"}`}>
          {s.phase === "idle" || s.phase === "error" ? "this session" : busy ? "● live" : "this query"}
        </span>
      </div>

      {(s.phase === "idle" || s.phase === "error") && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2.5">
            {[
              ["QUERIES", String(history.length)],
              ["P50 LATENCY", p50 == null ? "—" : fmtMs(p50)],
              ["ANSWERED", String(answered.length)],
              ["REFUSED", String(refused.length)],
            ].map(([k, v]) => (
              <Tile key={k} k={k}>
                <span className={`${TILE_V} text-[26px]`}>{v}</span>
              </Tile>
            ))}
          </div>
          <div className="flex flex-col gap-2.5">
            <Label>WHERE CITED EVIDENCE CAME FROM</Label>
            {mixTotal ? (
              <>
                <div className="flex h-2.5 gap-0.5">
                  {sessionMix.both > 0 && <div className="rounded-[3px] bg-both" style={{ width: `${pct(sessionMix.both)}%` }} />}
                  {sessionMix.bm25 > 0 && <div className="rounded-[3px] bg-bm25" style={{ width: `${pct(sessionMix.bm25)}%` }} />}
                  {sessionMix.dense > 0 && <div className="flex-1 rounded-[3px] bg-dense" />}
                </div>
                <div className="flex justify-between text-[12px] text-text-2">
                  <span>both {pct(sessionMix.both)}%</span>
                  <span className="text-bm25">keyword {pct(sessionMix.bm25)}%</span>
                  <span className="text-dense">meaning {pct(sessionMix.dense)}%</span>
                </div>
              </>
            ) : (
              <span className="text-[12px] text-text-3">No answered questions yet.</span>
            )}
          </div>
          <div className="flex flex-col gap-2.5">
            <Label>KNOWLEDGE GAPS · refused questions</Label>
            {gaps.length ? (
              gaps.map(([q, n]) => (
                <div key={q} className="flex justify-between gap-3 rounded-lg border border-[#1E232A] px-3 py-2.5 text-[13px]">
                  <span className="truncate" title={q}>
                    {q}
                  </span>
                  <span className="font-mono text-text-2">{n}</span>
                </div>
              ))
            ) : (
              <span className="text-[12px] text-text-3">None yet.</span>
            )}
          </div>
        </div>
      )}

      {busy && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2.5">
            <Tile k="CHUNKS TRAVERSED" wide>
              <span className={`${TILE_V} text-[30px]`}>
                {Math.round(pc * totalChunks).toLocaleString("en-US")}{" "}
                <span className="text-[16px] text-text-3">/ {totalChunks.toLocaleString("en-US")}</span>
              </span>
            </Tile>
            <Tile k="BM25 CANDIDATES" kColor="#FF9F43" border="#3A2E22">
              <span className={`${TILE_V} text-[24px]`}>{rt ? rt.bm25_count : "…"}</span>
            </Tile>
            <Tile k="DENSE CANDIDATES" kColor="#6EA8FF" border="#22304A">
              <span className={`${TILE_V} text-[24px]`}>{rt ? rt.dense_count : "…"}</span>
            </Tile>
            <Tile k="FOUND BY BOTH" wide border="#343B45">
              <span className={`${TILE_V} text-[24px]`}>{both}</span>
            </Tile>
          </div>
          <div className="flex flex-col gap-2">
            <Label>PIPELINE</Label>
            <div className="flex flex-col gap-2">
              {stages.map((p) => (
                <div key={p.name} className={`flex items-center gap-2.5 text-[13px] ${p.k === "done" || p.k === "active" ? "text-text" : "text-text-3"}`}>
                  <span className={dotClass(p.k)} />
                  <span className={`flex-1 ${p.k === "skipped" ? "line-through" : ""}`}>{p.name}</span>
                  <span className="font-mono text-[11px] text-text-3">{p.t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {s.phase === "answer" && res && l && (
        <div className="flex flex-col gap-4">
          <Box>
            <div className="flex justify-between">
              <BoxKey>CONFIDENCE</BoxKey>
              <span className="font-mono text-[12px] text-ok">{Math.round(res.confidence * 100)}%</span>
            </div>
            <Bar pct={res.confidence * 100} fill="#7EE0A1" />
            <span className="text-[12px] text-text-2">
              {res.citations.length} of {res.retrieval_trace.top_k_used} retrieved chunks cited
            </span>
          </Box>
          <LatencyBox l={l} />
          <Box>
            <BoxKey>EVIDENCE MIX · top {trace.top5.length}</BoxKey>
            <div className="flex justify-between text-[13px]">
              <span>both</span>
              <span className="text-bm25">keyword</span>
              <span className="text-dense">meaning</span>
            </div>
            <div className="flex justify-between font-display text-[20px] font-semibold">
              <span>{m.both}</span>
              <span>{m.bm25}</span>
              <span>{m.dense}</span>
            </div>
          </Box>
        </div>
      )}

      {s.phase === "refused" && res && l && (
        <div className="flex flex-col gap-4">
          <Box>
            <BoxKey>LLM</BoxKey>
            <span className="text-[14px]">{l.llm_ms === 0 ? "Skipped. Nothing to ground an answer on." : "Called, but the answer wasn't grounded."}</span>
          </Box>
          <Box>
            <BoxKey>LATENCY</BoxKey>
            <span className="font-display text-[24px] font-semibold">{fmtMs(l.total_ms)}</span>
          </Box>
          <Box>
            <BoxKey>KNOWLEDGE GAP</BoxKey>
            <span className="text-[14px]">Added to this session&apos;s gap list.</span>
          </Box>
        </div>
      )}
    </aside>
  );
}

function Bar({ pct, fill }: { pct: number; fill: string }) {
  return (
    <div className="relative h-2 rounded bg-[#1E232A]">
      <div className="absolute inset-y-0 left-0 rounded" style={{ width: `${Math.max(0, Math.min(100, pct))}%`, background: fill }} />
    </div>
  );
}

function LatencyBox({ l }: { l: QueryResponse["latency_ms"] }) {
  const retrieval = l.embedding_ms + l.bm25_ms + l.dense_ms + l.rrf_ms;
  const w = (ms: number) => `${l.total_ms ? (ms / l.total_ms) * 100 : 0}%`;
  return (
    <Box>
      <div className="flex justify-between">
        <BoxKey>LATENCY</BoxKey>
        <span className="font-mono text-[11px]">{fmtMs(l.total_ms)}</span>
      </div>
      <div className="flex h-2 gap-0.5 [&>div]:min-w-[2px] [&>div]:rounded-[3px]">
        <div className="bg-text-2" style={{ width: w(l.embedding_ms) }} />
        <div className="bg-bm25" style={{ width: w(l.bm25_ms) }} />
        <div className="bg-dense" style={{ width: w(l.dense_ms) }} />
        <div className="flex-1 bg-[#3E444C]" />
      </div>
      <span className="font-mono text-[11px] text-text-2">
        retrieval {fmtMs(retrieval)} · llm {fmtMs(l.llm_ms)}
      </span>
    </Box>
  );
}
