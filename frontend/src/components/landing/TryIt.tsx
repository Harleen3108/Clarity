"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogoMark } from "./Logo";
import { APP_ROUTE, askUrl } from "@/lib/routes";

const EXAMPLES = [
  "How do I fix error PAY-GW-504?",
  "What's the client dinner limit under FIN-09?",
  "What is the CEO's favourite movie?",
];

export function TryIt() {
  const router = useRouter();
  const [question, setQuestion] = useState("");

  const ask = (q: string) => {
    const query = q.trim();
    if (query) router.push(askUrl(query));
  };

  return (
    <>
      <section
        id="try"
        aria-labelledby="try-heading"
        className="relative flex items-center overflow-hidden border-t border-line px-16"
        style={{ minHeight: 560 }}
      >
        <div className="clarity-grid absolute inset-0" aria-hidden="true" />
        <div className="relative flex w-full flex-col items-center gap-8 text-center">
          <LogoMark size={72} strokeWidth={1.2} />
          <h2
            id="try-heading"
            className="m-0 font-display font-bold"
            style={{ fontSize: 56, lineHeight: 1.02, letterSpacing: "-0.03em" }}
          >
            Ask your documents
            <br />
            something hard.
          </h2>

          <form
            className="flex items-center gap-3 rounded-[16px] border border-border-strong bg-surface py-[10px] pl-5 pr-[10px]"
            style={{ width: 640, boxShadow: "0 30px 60px -20px rgba(0,0,0,0.8)" }}
            onSubmit={(e) => {
              e.preventDefault();
              ask(question);
            }}
          >
            <label htmlFor="cta-q" className="sr-only">Ask a question</label>
            <input
              id="cta-q"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What's the reimbursement limit for client dinners?"
              className="flex-grow border-0 bg-transparent text-left text-[17px] text-text outline-none placeholder:text-text-3"
            />
            <button
              type="submit"
              className="h-12 rounded-[10px] bg-text px-[22px] text-[15px] font-medium text-bg"
            >
              Ask Clarity
            </button>
          </form>

          <div className="flex flex-wrap justify-center gap-3">
            {EXAMPLES.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => ask(q)}
                className="rounded-full border border-border-strong bg-surface px-[18px] py-[10px] text-[14px] text-text transition-colors hover:border-[#4A525E]"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </section>

      <footer
        className="flex items-start justify-between px-16 py-12"
        style={{ background: "#08090C", borderTop: "1px solid #1A1E24" }}
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-[10px]">
            <LogoMark size={24} strokeWidth={1.8} />
            <span className="font-display text-[19px] font-bold">Clarity</span>
          </div>
          <span className="text-[14px] text-text-2">
            Hybrid dense-sparse RAG with hallucination guardrails.
          </span>
          <span className="font-mono text-[12px] text-text-2">
            Built by [YOUR TEAM] for the MeetMux hackathon
          </span>
        </div>

        <nav className="flex gap-16 text-[14px]">
          <div className="flex flex-col gap-[10px]">
            <span className="font-mono text-[11px] text-text-2">PRODUCT</span>
            <Link href={APP_ROUTE} className="no-underline" style={{ color: "#CFCDC7" }}>Open Clarity</Link>
            <a href="#top" className="no-underline" style={{ color: "#CFCDC7" }}>[YOUR REPO LINK]</a>
          </div>
          <div className="flex flex-col gap-[10px]">
            <span className="font-mono text-[11px] text-text-2">PAGE</span>
            <a href="#about" className="no-underline" style={{ color: "#CFCDC7" }}>What it does</a>
            <a href="#how-to-use" className="no-underline" style={{ color: "#CFCDC7" }}>How to use</a>
            <a href="#try" className="no-underline" style={{ color: "#CFCDC7" }}>Try it</a>
          </div>
        </nav>
      </footer>
    </>
  );
}
