// Shape of the `trace` event from POST /query/stream.
// Grid layout: 36 columns x 18 rows, column-major: grid_index = col * ROWS + row.

export const GRID_COLS = 36;
export const GRID_ROWS = 18;

export type MatchType = "bm25" | "dense";
export type HitType = MatchType | "both";

export interface TraceHit {
  grid_index: number;
  type: HitType;
  label: string;
  /** Rerank score, pre-formatted for display. */
  score: string;
  /** Final position after fusion + rerank (0-based). */
  rank: number;
  /** Source document id; matches `SourceDoc.id`. */
  doc: string;
  /** Citation marker shown in the answer, e.g. "[1]" or "top 5". */
  cite: string;
}

export interface RetrievalTrace {
  top5: TraceHit[];
  /** Other chunks in the BM25 / dense top-30 lists, keyed by grid_index. */
  candidates: Record<number, MatchType>;
}

export const gridIndex = (col: number, row: number) => col * GRID_ROWS + row;
export const colOf = (gridIndex: number) => Math.floor(gridIndex / GRID_ROWS);
export const rowOf = (gridIndex: number) => gridIndex % GRID_ROWS;

export const EMPTY_TRACE: RetrievalTrace = { top5: [], candidates: {} };

interface TopChunk {
  chunk_id: string;
  document: string;
  page: number | null;
  dense_score: number;
  bm25_score: number;
  rrf_score: number;
  rrf_rank: number;
}

/** Deterministic cell for a chunk id (the API has no grid layout yet). */
function cellFor(id: string, taken: Set<number>) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  let idx = (h >>> 0) % (GRID_COLS * GRID_ROWS);
  while (taken.has(idx)) idx = (idx + 1) % (GRID_COLS * GRID_ROWS);
  taken.add(idx);
  return idx;
}

/** Builds the grid trace from POST /query's retrieval_trace. */
export function traceFromResponse(topChunks: TopChunk[], citedIds: Set<string>): RetrievalTrace {
  const taken = new Set<number>();
  const cited = Array.from(citedIds);
  return {
    candidates: {},
    top5: topChunks.slice(0, 5).map((c, rank) => ({
      grid_index: cellFor(c.chunk_id, taken),
      type: c.dense_score > 0 && c.bm25_score > 0 ? "both" : c.bm25_score > 0 ? "bm25" : "dense",
      label: c.page != null ? `${c.document} p.${c.page}` : c.document,
      score: c.rrf_score.toFixed(3),
      rank,
      doc: c.document,
      cite: citedIds.has(c.chunk_id) ? `[${cited.indexOf(c.chunk_id) + 1}]` : "top 5",
    })),
  };
}
