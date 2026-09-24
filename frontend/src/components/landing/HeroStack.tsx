"use client";
import { MutableRefObject } from "react";

/**
 * The 3D pipeline stack: 4 stacked planes (documents -> BM25|Dense -> RRF ->
 * grounded answer) plus 4 dashed corner pillars. Purely presentational — the
 * parent Hero drives all transforms per-frame through the refs passed in.
 */
export function HeroStack({
  stackInnerRef,
  planeRefs,
  pillarRefs,
}: {
  stackInnerRef: MutableRefObject<HTMLDivElement | null>;
  planeRefs: MutableRefObject<HTMLDivElement[]>;
  pillarRefs: MutableRefObject<HTMLDivElement[]>;
}) {
  const setPlane = (i: number) => (el: HTMLDivElement | null) => {
    if (el) planeRefs.current[i] = el;
  };
  const setPillar = (i: number) => (el: HTMLDivElement | null) => {
    if (el) pillarRefs.current[i] = el;
  };

  // plane 0 — documents -> chunks tile pattern (18 cells)
  const docTiles = [
    "#1E232A", "#1E232A", "#262C34", "#1E232A", "#1E232A", "#1E232A",
    "#1E232A", "#262C34", "#1E232A", "#1E232A", "#262C34", "#1E232A",
    "#1E232A", "#1E232A", "#1E232A", "#262C34", "#1E232A", "#1E232A",
  ];
  const bm25Tiles = [
    "#FF9F43", "#2A241D", "#2A241D",
    "#2A241D", "rgba(255,159,67,0.55)", "#2A241D",
    "#2A241D", "#2A241D", "rgba(255,159,67,0.3)",
  ];
  const denseTiles = [
    "#1D2330", "rgba(110,168,255,0.55)", "#1D2330",
    "#6EA8FF", "#1D2330", "#1D2330",
    "rgba(110,168,255,0.3)", "#1D2330", "#1D2330",
  ];

  const pillarBase: React.CSSProperties = {
    position: "absolute",
    width: 1,
    borderLeft: "1px dashed #3A414B",
    transformOrigin: "top",
  };

  return (
    <div
      style={{
        position: "absolute",
        left: 740,
        top: 90,
        width: 680,
        height: 780,
        perspective: 2200,
        perspectiveOrigin: "50% 30%",
      }}
    >
      <div
        ref={stackInnerRef}
        style={{
          position: "absolute",
          left: 160,
          top: 330,
          width: 380,
          height: 270,
          transformStyle: "preserve-3d",
          transform: "rotateX(64deg) rotateZ(-46deg)",
        }}
      >
        {/* dashed corner pillars */}
        <div ref={setPillar(0)} style={{ ...pillarBase, left: 0, top: 0, height: 300, transform: "rotateX(90deg)" }} />
        <div ref={setPillar(1)} style={{ ...pillarBase, right: 0, top: 0, height: 300, transform: "rotateX(90deg)" }} />
        <div ref={setPillar(2)} style={{ ...pillarBase, left: 0, bottom: 0, height: 300, transform: "translateY(1px) rotateX(90deg)" }} />
        <div ref={setPillar(3)} style={{ ...pillarBase, right: 0, bottom: 0, height: 300, transform: "translateY(1px) rotateX(90deg)" }} />

        {/* plane 0 — documents -> chunks */}
        <div
          ref={setPlane(0)}
          style={{
            position: "absolute",
            inset: 0,
            boxSizing: "border-box",
            border: "1px solid #2E343D",
            borderRadius: 14,
            background: "rgba(18,21,26,0.92)",
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            boxShadow: "0 60px 80px -30px rgba(0,0,0,0.9)",
            transform: "translateZ(0px)",
          }}
        >
          <span className="font-mono" style={{ fontSize: 11, color: "#A3A9B1" }}>
            01 · DOCUMENTS → CHUNKS
          </span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0,1fr))", gap: 6, flexGrow: 1 }}>
            {docTiles.map((c, i) => (
              <div key={i} style={{ borderRadius: 4, background: c }} />
            ))}
          </div>
        </div>

        {/* plane 1 — BM25 | Dense */}
        <div
          ref={setPlane(1)}
          style={{
            position: "absolute",
            inset: 0,
            boxSizing: "border-box",
            border: "1px solid #343B45",
            borderRadius: 14,
            background: "rgba(16,19,24,0.86)",
            padding: 16,
            display: "flex",
            gap: 12,
            transform: "translateZ(10px)",
          }}
        >
          <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            <span className="font-mono" style={{ fontSize: 11, color: "#FF9F43" }}>02a · BM25</span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 5, flexGrow: 1 }}>
              {bm25Tiles.map((c, i) => (
                <div key={i} style={{ borderRadius: 4, background: c }} />
              ))}
            </div>
          </div>
          <div style={{ width: 1, background: "#343B45" }} />
          <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            <span className="font-mono" style={{ fontSize: 11, color: "#6EA8FF" }}>02b · DENSE</span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 5, flexGrow: 1 }}>
              {denseTiles.map((c, i) => (
                <div key={i} style={{ borderRadius: 4, background: c }} />
              ))}
            </div>
          </div>
        </div>

        {/* plane 2 — RRF */}
        <div
          ref={setPlane(2)}
          style={{
            position: "absolute",
            inset: 0,
            boxSizing: "border-box",
            border: "1px solid #3E4651",
            borderRadius: 14,
            background: "rgba(20,23,29,0.88)",
            padding: 18,
            display: "flex",
            flexDirection: "column",
            gap: 9,
            transform: "translateZ(20px)",
          }}
        >
          <span className="font-mono" style={{ fontSize: 11 }}>03 · RECIPROCAL RANK FUSION</span>
          {[
            { w: "92%", bg: "#ECEAE4" },
            { w: "86%", bg: "#CFCDC7" },
            { w: "58%", bg: "#8A8F96" },
            { w: "40%", bg: "#5A6068" },
          ].map((b, i) => (
            <div key={i} style={{ height: 14, width: b.w, borderRadius: 3, background: b.bg }} />
          ))}
          <span className="font-mono" style={{ fontSize: 11, color: "#A3A9B1" }}>Σ 1 / (60 + rank)</span>
        </div>

        {/* plane 3 — grounded answer */}
        <div
          ref={setPlane(3)}
          style={{
            position: "absolute",
            inset: 0,
            boxSizing: "border-box",
            border: "1px solid #ECEAE4",
            borderRadius: 14,
            background: "rgba(236,234,228,0.96)",
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            transform: "translateZ(30px)",
            color: "#0A0C0F",
            boxShadow: "0 0 0 6px rgba(236,234,228,0.08)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="font-mono" style={{ fontSize: 11, color: "#3D4148" }}>04 · GROUNDED ANSWER</span>
            <span
              className="font-mono"
              style={{ fontSize: 11, background: "#0A0C0F", color: "#ECEAE4", padding: "3px 8px", borderRadius: 20 }}
            >
              94% grounded
            </span>
          </div>
          <p className="font-display" style={{ margin: 0, fontSize: 19, lineHeight: 1.3, fontWeight: 600 }}>
            You get 6 casual leaves during probation. They can&apos;t be carried forward.
          </p>
          <div style={{ display: "flex", gap: 6 }}>
            <span className="font-mono" style={{ fontSize: 11, border: "1px solid #0A0C0F", padding: "2px 7px", borderRadius: 5 }}>
              [1] Leave Policy p.3
            </span>
            <span className="font-mono" style={{ fontSize: 11, border: "1px solid #0A0C0F", padding: "2px 7px", borderRadius: 5 }}>
              [2] Leave Policy p.5
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
