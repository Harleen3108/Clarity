"use client";
import { useCallback, useRef } from "react";
import Link from "next/link";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";
import { APP_ROUTE } from "@/lib/routes";

/** Bordered illustration box shell shared by all four steps. */
function IlloBox({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative"
      style={{ height: 240, border: "1px solid #1A1E24", borderRadius: 16, background: "#0D1014", perspective: 1200 }}
      aria-hidden="true"
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 240,
          height: 140,
          transform: "translate(-50%,-50%) rotateX(58deg) rotateZ(-38deg)",
          transformStyle: "preserve-3d",
        }}
      >
        {children}
      </div>
    </div>
  );
}

const plateBase: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  borderRadius: 10,
  boxSizing: "border-box",
};

function IlloIngest() {
  return (
    <>
      <div style={{ ...plateBase, border: "1px solid #2E343D", background: "#14171C" }} />
      <div style={{ ...plateBase, border: "1px solid #343B45", background: "#181C22", transform: "translateZ(24px)" }} />
      <div
        style={{
          ...plateBase,
          border: "1px solid #4A525E",
          background: "#1E232A",
          transform: "translateZ(48px)",
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0,1fr))",
          gap: 6,
          padding: 12,
        }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ borderRadius: 3, background: i === 2 ? "#ECEAE4" : "#2E343D" }} />
        ))}
      </div>
    </>
  );
}

function IlloSearchTwice() {
  return (
    <>
      <div style={{ position: "absolute", left: 0, top: 0, width: 112, height: 140, borderRadius: 10, border: "1px solid #FF9F43", background: "rgba(255,159,67,0.18)", transform: "translateZ(30px)", boxSizing: "border-box" }} />
      <div style={{ position: "absolute", right: 0, top: 0, width: 112, height: 140, borderRadius: 10, border: "1px solid #6EA8FF", background: "rgba(110,168,255,0.18)", transform: "translateZ(30px)", boxSizing: "border-box" }} />
      <div style={{ ...plateBase, border: "1px solid #2E343D", background: "#14171C" }} />
    </>
  );
}

function IlloFuse() {
  return (
    <>
      <div style={{ ...plateBase, border: "1px solid #2E343D", background: "#14171C" }} />
      <div
        style={{
          ...plateBase,
          border: "1px solid #ECEAE4",
          background: "#1A1E25",
          transform: "translateZ(40px)",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          padding: 16,
          justifyContent: "center",
        }}
      >
        {[
          { w: "90%", bg: "#ECEAE4" },
          { w: "80%", bg: "#A3A9B1" },
          { w: "55%", bg: "#5A6068" },
          { w: "35%", bg: "#3E444C" },
        ].map((b, i) => (
          <div key={i} style={{ height: 10, width: b.w, borderRadius: 2, background: b.bg }} />
        ))}
      </div>
    </>
  );
}

function IlloAnswer() {
  return (
    <>
      <div style={{ ...plateBase, border: "1px solid #2E343D", background: "#14171C" }} />
      <div
        style={{
          ...plateBase,
          border: "1px solid #ECEAE4",
          background: "#ECEAE4",
          transform: "translateZ(56px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 10,
          padding: 18,
        }}
      >
        <div style={{ height: 8, width: "88%", borderRadius: 2, background: "#0A0C0F" }} />
        <div style={{ height: 8, width: "70%", borderRadius: 2, background: "#0A0C0F" }} />
        <div style={{ display: "flex", gap: 6 }}>
          <div style={{ height: 14, width: 42, borderRadius: 3, border: "1px solid #0A0C0F" }} />
          <div style={{ height: 14, width: 42, borderRadius: 3, border: "1px solid #0A0C0F" }} />
        </div>
      </div>
    </>
  );
}

const STEPS = [
  { n: "01", title: "Add your sources", body: "Upload PDFs, Word files or Markdown into folders and choose which roles can see them. Duplicates are detected automatically.", Illo: IlloIngest },
  { n: "02", title: "Ask in plain language", body: "Type a question the way you'd ask a colleague. Exact codes like PAY-GW-504 and loose phrasing like ‘how many holidays’ both work.", Illo: IlloSearchTwice },
  { n: "03", title: "Watch it search", body: "Clarity scans every chunk with keyword and meaning search at once, then fuses the best evidence into a top 5.", Illo: IlloFuse },
  { n: "04", title: "Check the answer", body: "Read the answer with citations, open the exact page, or see the full Retrieval X-ray. Unsupported sentences are flagged.", Illo: IlloAnswer },
];

export function HowToUse() {
  const ref = useRef<HTMLElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  useRevealOnScroll(ref);

  const onFrame = useCallback((p: number) => {
    if (fillRef.current) fillRef.current.style.width = `${p * 100}%`;
  }, []);
  useScrollProgress(ref, onFrame, "through");

  return (
    <section
      ref={ref}
      id="how-to-use"
      aria-labelledby="how-heading"
      className="border-t border-line px-16 pb-28 pt-24"
    >
      {/* heading row */}
      <div data-reveal className="flex items-end justify-between gap-16">
        <div className="flex flex-col gap-3">
          <span className="font-mono text-[13px] uppercase tracking-wide text-text-2">How to use</span>
          <h2
            id="how-heading"
            className="m-0 font-display font-bold text-text"
            style={{ fontSize: 56, letterSpacing: "-0.03em" }}
          >
            From upload to answer in four steps.
          </h2>
        </div>
        <Link
          href={APP_ROUTE}
          className="flex h-11 items-center rounded-[10px] bg-text px-[18px] text-[14px] font-medium text-bg no-underline"
        >
          Try it now
        </Link>
      </div>

      {/* illustrations */}
      <div data-reveal className="mt-12 grid grid-cols-4 gap-6">
        {STEPS.map((s) => (
          <IlloBox key={s.n}>
            <s.Illo />
          </IlloBox>
        ))}
      </div>

      {/* progress line + numbered circles */}
      <div className="relative mt-6" style={{ height: 40 }}>
        <div className="absolute left-[20px] right-[20px] top-1/2 h-px -translate-y-1/2" style={{ background: "#262B33" }} />
        <div ref={fillRef} className="absolute left-[20px] top-1/2 h-px -translate-y-1/2" style={{ background: "#ECEAE4", width: "0%" }} />
        <div className="relative grid grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.n} className="flex">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full font-mono text-[12px] text-text-2"
                style={{ background: "#0A0C0F", border: "1px solid #2E343D" }}
              >
                {s.n}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* titles + text */}
      <div data-reveal className="mt-6 grid grid-cols-4 gap-6">
        {STEPS.map((s) => (
          <div key={s.n} className="flex flex-col gap-3">
            <h3 className="m-0 font-display text-[24px] font-semibold">{s.title}</h3>
            <p className="m-0 text-[15px] leading-[1.6] text-text-2">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
