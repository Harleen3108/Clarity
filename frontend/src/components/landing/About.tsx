"use client";
import { useRef } from "react";
import { IsoPlate } from "./IsoPlate";
import { LogoMark } from "./Logo";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E0736A" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6 L18 18 M18 6 L6 18" />
    </svg>
  );
}
function CheckIcon({ stroke = "#0A0C0F" }: { stroke?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M5 12 L10 17 L19 7" />
    </svg>
  );
}

const CAPABILITIES = [
  {
    title: "Hybrid search",
    body: "Reads every chunk two ways: exact keywords with BM25 and meaning with embeddings, then fuses the rankings with RRF.",
    icon: <LogoMark size={26} strokeWidth={1.8} />,
  },
  {
    title: "Cited answers",
    body: "Every sentence links to the document, page and section it came from.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ECEAE4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 3h8l4 4v14H6z" />
        <path d="M9 12h6M9 16h6M9 8h3" />
      </svg>
    ),
  },
  {
    title: "Honest refusals",
    body: "If the evidence isn't in your documents, Clarity says so instead of guessing. The model's own knowledge is never used.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ECEAE4" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M6 6 L18 18" />
      </svg>
    ),
  },
  {
    title: "Permission-aware",
    body: "Search is filtered by your role inside the database, so restricted documents never reach the answer.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ECEAE4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
      </svg>
    ),
  },
];

export function About() {
  const ref = useRef<HTMLElement>(null);
  useRevealOnScroll(ref);

  return (
    <section
      ref={ref}
      id="about"
      aria-labelledby="about-heading"
      className="border-t border-line px-16 pb-28 pt-28"
    >
      {/* heading row */}
      <div data-reveal className="flex items-start justify-between gap-16">
        <div className="flex max-w-[760px] flex-col gap-4">
          <span className="font-mono text-[13px] uppercase tracking-wide text-text-2">
            What Clarity does
          </span>
          <h2
            id="about-heading"
            className="m-0 font-display font-bold text-text"
            style={{ fontSize: 64, lineHeight: 1.04, letterSpacing: "-0.03em" }}
          >
            One search box for everything your company has written down.
          </h2>
        </div>
        <p className="mt-2 max-w-[420px] text-[18px] leading-[1.6] text-text-2">
          Upload policies, runbooks and contracts. Ask in plain language. Get an answer you can
          check, cited to the page, or an honest &ldquo;I couldn&rsquo;t find that.&rdquo;
        </p>
      </div>

      {/* Part A — the problem, three cards */}
      <span data-reveal className="mt-20 block font-mono text-[13px] uppercase tracking-wide text-text-2">
        The problem · keyword search misses meaning, vector search misses the error code
      </span>
      <div data-reveal className="mt-6 grid grid-cols-3 gap-6">
        {/* keyword only */}
        <div className="flex flex-col gap-4 rounded-[18px] p-7" style={{ border: "1px solid #3A2E22", background: "#14110D" }}>
          <span className="font-mono text-[12px]" style={{ color: "#FF9F43" }}>KEYWORD ONLY</span>
          <span className="font-mono text-[15px]" style={{ background: "#1E1A14", padding: "12px 14px", borderRadius: 10 }}>
            &quot;How many holidays do I get?&quot;
          </span>
          <div className="flex flex-col gap-[10px] text-[15px]">
            <div className="flex items-center gap-[10px] text-text-2"><XIcon />0 documents contain &quot;holidays&quot;</div>
            <div className="flex items-center gap-[10px] text-text-2"><XIcon />Policy says &quot;annual leave entitlement&quot;</div>
          </div>
          <span className="mt-auto font-display text-[22px] font-semibold">Misses the answer.</span>
        </div>
        {/* vector only */}
        <div className="flex flex-col gap-4 rounded-[18px] p-7" style={{ border: "1px solid #22304A", background: "#0E131B" }}>
          <span className="font-mono text-[12px]" style={{ color: "#6EA8FF" }}>VECTOR ONLY</span>
          <span className="font-mono text-[15px]" style={{ background: "#141B26", padding: "12px 14px", borderRadius: 10 }}>
            &quot;Fix PAY-GW-504&quot;
          </span>
          <div className="flex flex-col gap-[10px] text-[15px]">
            <div className="flex items-center gap-[10px] text-text-2"><XIcon />#1 is the PAY-GW-503 retry guide</div>
            <div className="flex items-center gap-[10px] text-text-2"><XIcon />Similar meaning, wrong code</div>
          </div>
          <span className="mt-auto font-display text-[22px] font-semibold">Confidently wrong.</span>
        </div>
        {/* clarity hybrid */}
        <div
          className="flex flex-col gap-4 rounded-[18px] p-7"
          style={{
            border: "1px solid #ECEAE4",
            background: "#ECEAE4",
            color: "#0A0C0F",
            transform: "perspective(1200px) rotateY(-6deg) translateZ(20px)",
            boxShadow: "0 40px 60px -30px rgba(0,0,0,0.9)",
          }}
        >
          <span className="font-mono text-[12px]" style={{ color: "#3D4148" }}>CLARITY HYBRID</span>
          <span className="font-mono text-[15px]" style={{ background: "#DAD7CF", padding: "12px 14px", borderRadius: 10 }}>
            Both questions
          </span>
          <div className="flex flex-col gap-[10px] text-[15px]">
            <div className="flex items-center gap-[10px]"><CheckIcon />#1 Leave Policy p.3 · annual leave</div>
            <div className="flex items-center gap-[10px]"><CheckIcon />#1 IT Runbook p.12 · PAY-GW-504</div>
          </div>
          <span className="mt-auto font-display text-[22px] font-semibold">Right document, both times.</span>
        </div>
      </div>

      {/* Part B — four capability cards */}
      <div data-reveal className="mt-6 grid grid-cols-4 gap-6">
        {CAPABILITIES.map((c) => (
          <div
            key={c.title}
            className="flex flex-col gap-4 rounded-[18px] p-7"
            style={{ border: "1px solid #262B33", background: "#101318" }}
          >
            <IsoPlate>{c.icon}</IsoPlate>
            <h3 className="m-0 font-display text-[22px] font-semibold">{c.title}</h3>
            <p className="m-0 text-[15px] leading-[1.6] text-text-2">{c.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
