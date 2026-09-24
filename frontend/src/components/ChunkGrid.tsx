"use client";

import { EMPTY_TRACE, GRID_COLS as COLS, GRID_ROWS as ROWS, colOf, gridIndex as gi, rowOf, type HitType, type RetrievalTrace, type TraceHit } from "@/lib/trace";

export type GridPhase = "idle" | "scan" | "found";

const P = 15; // cell pitch: 12px cell + 3px gap
const RAIL_X = 577;
const SLOT_H = 45;
const SLOT_GAP = 10.5;
const BANDS = [5, 4, 7, 3, 3, 4, 3, 3, 4]; // chunks-per-document columns

export const HIT_COLOR: Record<HitType, string> = { bm25: "#FF9F43", dense: "#6EA8FF", both: "#ECEAE4" };
const SOFT = { bm25: "rgba(255,159,67,0.42)", dense: "rgba(110,168,255,0.42)" };
const RING: Record<HitType, string> = { bm25: "rgba(255,159,67,0.28)", dense: "rgba(110,168,255,0.28)", both: "rgba(236,234,228,0.22)" };
const TYPE_NAME: Record<HitType, string> = { bm25: "keyword match", dense: "meaning match", both: "keyword + meaning" };

const BAND_OF: number[] = BANDS.flatMap((n, i) => Array<number>(n).fill(i));

/** Index of the column the scan beam is on; everything left of it has been visited. */
export function scanColumn(phase: GridPhase, progress: number) {
  if (phase === "scan") return Math.floor(progress * (COLS + 2)) - 1;
  return phase === "found" ? 999 : -999;
}

interface ChunkGridProps {
  phase: GridPhase;
  /** Scan progress, 0-1. Only used while phase is "scan". */
  progress?: number;
  /** Nothing passed the evidence gate: no hits, empty rail. */
  nohits?: boolean;
  trace?: RetrievalTrace;
}

export default function ChunkGrid({ phase, progress = 0, nohits = false, trace = EMPTY_TRACE }: ChunkGridProps) {
  const hits = nohits ? [] : trace.top5;
  const hitMap = new Map<number, TraceHit>(hits.map((h) => [h.grid_index, h]));
  const found = phase === "found";
  const sc = scanColumn(phase, progress);

  const cells = [];
  // DOM order is row-major for CSS grid; grid_index is column-major.
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const idx = gi(c, r);
      const h = hitMap.get(idx);
      const cd = trace.candidates[idx];
      const beam = phase === "scan" && (c === sc || c === sc - 1);
      const visited = found || c < sc - 1;
      let bg = BAND_OF[c] % 2 ? "#181E25" : "#161B21";
      let sh = "none";
      if (found) bg = cd ? "#1B2129" : "#12161B";
      else if (beam) bg = "#3C4856";
      else if (visited) bg = cd ? SOFT[cd] : "#1E252D";
      if (h && (visited || beam)) {
        bg = HIT_COLOR[h.type];
        sh = `0 0 0 3px ${RING[h.type]}`;
      }
      cells.push(
        <div
          key={idx}
          className="h-3 w-3 rounded-[2px] transition-[background] duration-150 motion-reduce:transition-none"
          style={{ background: bg, boxShadow: sh }}
        />,
      );
    }
  }

  const showBeam = phase === "scan" && sc >= 0 && sc <= COLS;
  const beamX = sc * P + 12;

  const visible = hits.filter((h) => found || colOf(h.grid_index) <= sc).sort((a, b) => a.grid_index - b.grid_index);
  const slotOf = (h: TraceHit) => (found ? h.rank : visible.indexOf(h));

  return (
    <div className="relative h-[300px] w-[748px] shrink-0">
      <div className="absolute left-0 top-0 grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${COLS}, 12px)` }}>
        {cells}
      </div>

      {showBeam && (
        <>
          <div className="pointer-events-none absolute top-[-6px] h-[279px] w-10 rounded bg-[rgba(236,234,228,.07)]" style={{ left: beamX - 40 }} />
          <div className="pointer-events-none absolute top-[-6px] h-[279px] w-[2px] rounded-[1px] bg-text opacity-80" style={{ left: beamX }} />
        </>
      )}

      <svg className="pointer-events-none absolute left-0 top-0 overflow-visible" width="748" height="300">
        {visible.map((h) => (
          <line
            key={h.grid_index}
            x1={colOf(h.grid_index) * P + 6}
            y1={rowOf(h.grid_index) * P + 6}
            x2={RAIL_X}
            y2={slotOf(h) * (SLOT_H + SLOT_GAP) + SLOT_H / 2}
            stroke={HIT_COLOR[h.type]}
            strokeWidth={1}
            opacity={found ? 0.75 : 0.5}
          />
        ))}
      </svg>

      <div className="absolute top-0 flex w-[171px] flex-col gap-[10.5px]" style={{ left: RAIL_X }}>
        {[0, 1, 2, 3, 4].map((i) => {
          const h = visible.find((v) => slotOf(v) === i);
          if (!h) {
            const empty = nohits && found;
            return (
              <Slot key={i} a={empty ? "No match above the gate" : `#${i + 1} waiting`} b={empty ? "—" : "top 5 evidence"} />
            );
          }
          return (
            <Slot
              key={i}
              full
              top={found && h.rank < 2}
              dot={HIT_COLOR[h.type]}
              a={`${found ? `#${h.rank + 1} ` : ""}${h.label}`}
              b={found ? `rrf ${h.score}` : TYPE_NAME[h.type]}
            />
          );
        })}
      </div>

      <div className="absolute left-0 top-[276px] flex w-[537px] gap-[3px]">
        {BANDS.map((n, i) => (
          <div
            key={i}
            className="h-1 rounded-sm"
            style={{
              width: n * P - 3,
              background: i === 2 && !nohits && (found || sc > 9) ? "#5A6068" : i % 2 ? "#20252C" : "#2A3038",
            }}
          />
        ))}
      </div>

      <span className="absolute left-0 top-[285px] font-mono text-[10px] text-text-3">each cell is one chunk · grouped by document</span>
      <span className="absolute top-[285px] font-mono text-[10px] text-text-3" style={{ left: RAIL_X }}>
        {found ? (nohits ? "nothing passed the gate" : "fused by RRF") : "evidence found so far"}
      </span>
    </div>
  );
}

function Slot({ a, b, full, top, dot }: { a: string; b: string; full?: boolean; top?: boolean; dot?: string }) {
  const frame = top
    ? "border-solid border-text bg-[#1E232B] text-text"
    : full
      ? "border-solid border-[#343B45] bg-[#14181D] text-text"
      : "border-dashed border-[#2A3038] text-[#5A6068]";
  return (
    <div className={`flex h-[45px] items-center gap-2 rounded-lg border px-2.5 ${frame}`}>
      <span
        className={`h-2 w-2 shrink-0 rounded ${full ? "" : "border border-[#3A414B]"}`}
        style={dot ? { background: dot } : undefined}
      />
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-[12px]">{a}</span>
        <span className="font-mono text-[10px] text-text-2">{b}</span>
      </div>
    </div>
  );
}
