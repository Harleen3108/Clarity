"use client";
import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LandingNav } from "./LandingNav";
import { HeroStack } from "./HeroStack";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { APP_ROUTE, askUrl } from "@/lib/routes";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const easeOutCubic = (p: number) => 1 - Math.pow(1 - p, 3);

const STEPS = [
  { step: 3, label: "04 · Answer, cite, verify" },
  { step: 2, label: "03 · Fuse by rank (RRF)" },
  { step: 1, label: "02 · Search twice: BM25 + dense" },
  { step: 0, label: "01 · Chunk and index" },
];

export function Hero() {
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);
  const stackInnerRef = useRef<HTMLDivElement | null>(null);
  const planeRefs = useRef<HTMLDivElement[]>([]);
  const pillarRefs = useRef<HTMLDivElement[]>([]);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const lastActive = useRef(0);
  const [active, setActive] = useState(0);
  const [question, setQuestion] = useState("How many casual leaves do I get in probation?");

  const ask = useCallback(
    (q: string) => {
      const query = q.trim();
      if (query) router.push(askUrl(query));
    },
    [router]
  );

  const onFrame = useCallback((p: number, now: number) => {
    const e = easeOutCubic(p);
    const gap = lerp(10, 104, e);
    const rotX = lerp(64, 55, e) - mouse.current.y * 3;
    const rotZ = lerp(-46, -34, e) + mouse.current.x * 4;

    if (stackInnerRef.current) {
      stackInnerRef.current.style.transform = `rotateX(${rotX}deg) rotateZ(${rotZ}deg)`;
    }

    const nextActive = p >= 0.98 ? 3 : Math.floor(p * 4);
    for (let i = 0; i < planeRefs.current.length; i++) {
      const plane = planeRefs.current[i];
      if (!plane) continue;
      let z = i * gap;
      if (i === 3) {
        const lift = lerp(0, 30, clamp((p - 0.75) / 0.25, 0, 1));
        const float = Math.sin(now / 900) * 4;
        z += lift + float;
      }
      plane.style.transform = `translateZ(${z}px)`;
      plane.style.opacity = p < 0.02 ? "1" : i <= nextActive ? "1" : "0.35";
    }

    const pillarH = 3 * gap + 20;
    pillarRefs.current.forEach((pillar) => {
      if (pillar) pillar.style.height = `${pillarH}px`;
    });

    if (scrollHintRef.current) {
      scrollHintRef.current.style.opacity = `${clamp(1 - p * 6, 0, 1)}`;
    }

    if (nextActive !== lastActive.current) {
      lastActive.current = nextActive;
      setActive(nextActive);
    }
  }, []);

  useScrollProgress(sectionRef, onFrame);

  const handleMouseMove = (ev: React.MouseEvent) => {
    mouse.current = {
      x: (ev.clientX / window.innerWidth) * 2 - 1,
      y: (ev.clientY / window.innerHeight) * 2 - 1,
    };
  };

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative"
      style={{ height: 2000 }}
      onMouseMove={handleMouseMove}
      aria-label="Clarity introduction"
    >
      <div
        className="sticky top-0 overflow-hidden"
        style={{ height: "100vh", minHeight: 760 }}
      >
        <div className="clarity-grid absolute inset-0" aria-hidden="true" />

        {/* 1440px design canvas, centred */}
        <div className="relative mx-auto h-full" style={{ width: 1440 }}>
          <LandingNav />

          {/* left: hero copy */}
          <div
            className="absolute flex flex-col gap-7"
            style={{ left: 64, top: 170, width: 640 }}
          >
            <div className="flex items-center gap-2 font-mono text-[13px] text-text-2">
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: "#FF9F43" }} />
              BM25
              <span style={{ color: "#4A5058" }}>+</span>
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: "#6EA8FF" }} />
              Dense
              <span style={{ color: "#4A5058" }}>→</span>
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: "#ECEAE4" }} />
              Reciprocal Rank Fusion
            </div>

            <h1
              className="m-0 font-display font-bold"
              style={{ fontSize: 92, lineHeight: 0.96, letterSpacing: "-0.04em" }}
            >
              Answers you can see through.
            </h1>

            <p className="m-0 text-[20px] leading-[1.55] text-text-2" style={{ maxWidth: 560 }}>
              Clarity is an enterprise document search engine that reads your policies, runbooks
              and contracts two ways, fuses the results, and answers only from what it found.
              Every sentence is cited to the page. If the evidence isn&apos;t there, it says so.
            </p>

            <form
              className="flex items-center gap-3 rounded-[16px] border border-border-strong bg-surface py-[10px] pl-5 pr-[10px]"
              style={{ width: 600, boxShadow: "0 30px 60px -20px rgba(0,0,0,0.8)" }}
              onSubmit={(e) => {
                e.preventDefault();
                ask(question);
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A3A9B1" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20 L16 16" />
              </svg>
              <label htmlFor="home-q" className="sr-only">Ask your documents</label>
              <input
                id="home-q"
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="flex-grow border-0 bg-transparent text-[17px] text-text outline-none"
              />
              <button
                type="submit"
                className="h-12 rounded-[10px] bg-text px-[22px] text-[15px] font-medium text-bg"
              >
                Ask
              </button>
            </form>

            <div className="flex gap-3">
              <Link
                href={APP_ROUTE}
                className="flex h-12 items-center rounded-[10px] bg-text px-[22px] text-[15px] font-medium text-bg no-underline"
              >
                Open the workspace
              </Link>
              <a
                href="#how-to-use"
                className="flex h-12 items-center rounded-[10px] border border-border-strong px-[22px] text-[15px] text-text no-underline"
              >
                See how it works
              </a>
            </div>
          </div>

          {/* right: 3D pipeline stack */}
          <HeroStack
            stackInnerRef={stackInnerRef}
            planeRefs={planeRefs}
            pillarRefs={pillarRefs}
          />

          {/* bottom-right step list */}
          <div
            className="absolute flex flex-col gap-[10px] text-right font-mono text-[12px]"
            style={{ right: 64, bottom: 56 }}
            aria-hidden="true"
          >
            {STEPS.map((s) => (
              <span
                key={s.step}
                style={{
                  color:
                    s.step === active ? "#ECEAE4" : s.step < active ? "#A3A9B1" : "#5A6068",
                  transition: "color 0.3s ease",
                }}
              >
                {s.label}
              </span>
            ))}
          </div>

          {/* bottom-centre scroll hint */}
          <div
            ref={scrollHintRef}
            className="absolute left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 font-mono text-[12px] text-text-3"
            style={{ bottom: 24 }}
            aria-hidden="true"
          >
            scroll to take the pipeline apart
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A9098" strokeWidth="1.8" strokeLinecap="round">
              <path d="M12 5 V19 M6 13 L12 19 L18 13" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
