// Ported from design/xray.html by a mechanical HTML -> TSX conversion.
// Fixed 1440px frame, as in the prototype.

export default function XrayPage() {
  return (
    <div className="static-page flex min-w-[1440px] justify-center bg-bg">
      <div style={{ width: "1440px", height: "900px", boxSizing: "border-box", position: "relative", overflow: "hidden", background: "#0A0C0F", padding: "40px 64px", display: "flex", flexDirection: "column", gap: "20px", fontFamily: "var(--font-body), system-ui, sans-serif", color: "#ECEAE4" }}>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "12px", color: "#A3A9B1" }}>QUERY · "How do I fix error PAY-GW-504?" · role: engineering</span>
      <h1 style={{ margin: "0", fontFamily: "var(--font-display), sans-serif", fontWeight: "700", fontSize: "48px", letterSpacing: "-0.03em" }}>Retrieval X-ray</h1>
      </div>
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
      <a href="/app" style={{ textDecoration: "none", height: "44px", display: "flex", alignItems: "center", padding: "0 18px", border: "1px solid #2E343D", borderRadius: "10px", color: "#ECEAE4", fontSize: "14px" }}>Back to answer</a>
      <button type="button" style={{ height: "44px", padding: "0 18px", border: "0", borderRadius: "10px", background: "#ECEAE4", color: "#0A0C0F", font: "500 14px var(--font-body), sans-serif" }}>Compare all modes</button>
      </div>
      </div>
      
      <div style={{ position: "relative", height: "540px", perspective: "2400px", perspectiveOrigin: "50% -10%" }}>
      <div style={{ position: "absolute", left: "20px", right: "20px", top: "10px", bottom: "0", transformStyle: "preserve-3d", transform: "rotateX(26deg) rotateY(-10deg)", display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "28px" }}>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "16px", border: "1px solid #3A2E22", borderRadius: "16px", background: "rgba(22,19,15,0.95)", transform: "translateZ(0px)", boxShadow: "0 50px 60px -30px rgba(0,0,0,0.9)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontFamily: "var(--font-display), sans-serif", fontSize: "18px", fontWeight: "600", color: "#FF9F43" }}>BM25</span><span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "11px", color: "#A3A9B1" }}>keyword · 12ms</span></div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", border: "1px solid #ECEAE4", borderRadius: "10px", background: "#221C15" }}><span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "12px", color: "#A3A9B1" }}>1</span><span style={{ flexGrow: "1", fontSize: "14px" }}>Runbook p.12</span><span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "12px", color: "#FF9F43" }}>14.2</span></div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", border: "1px solid #3A2E22", borderRadius: "10px" }}><span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "12px", color: "#A3A9B1" }}>2</span><span style={{ flexGrow: "1", fontSize: "14px" }}>Error code index p.2</span><span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "12px", color: "#FF9F43" }}>12.8</span></div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", border: "1px solid #3A2E22", borderRadius: "10px" }}><span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "12px", color: "#A3A9B1" }}>3</span><span style={{ flexGrow: "1", fontSize: "14px" }}>Payments FAQ p.4</span><span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "12px", color: "#FF9F43" }}>9.1</span></div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", border: "1px solid #ECEAE4", borderRadius: "10px", background: "#221C15" }}><span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "12px", color: "#A3A9B1" }}>4</span><span style={{ flexGrow: "1", fontSize: "14px" }}>INC-2291 p.3</span><span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "12px", color: "#FF9F43" }}>7.6</span></div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", border: "1px solid #3A2E22", borderRadius: "10px" }}><span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "12px", color: "#A3A9B1" }}>5</span><span style={{ flexGrow: "1", fontSize: "14px", color: "#A3A9B1" }}>Refund SOP p.7</span><span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "12px", color: "#A3A9B1" }}>4.3</span></div>
      <span style={{ marginTop: "auto", fontSize: "13px", color: "#A3A9B1", lineHeight: "1.5" }}>Caught the exact code "PAY-GW-504".</span>
      </div>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "16px", border: "1px solid #22304A", borderRadius: "16px", background: "rgba(15,20,29,0.95)", transform: "translateZ(40px)", boxShadow: "0 50px 60px -30px rgba(0,0,0,0.9)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontFamily: "var(--font-display), sans-serif", fontSize: "18px", fontWeight: "600", color: "#6EA8FF" }}>Dense</span><span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "11px", color: "#A3A9B1" }}>semantic · 38ms</span></div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", border: "1px solid #ECEAE4", borderRadius: "10px", background: "#152036" }}><span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "12px", color: "#A3A9B1" }}>1</span><span style={{ flexGrow: "1", fontSize: "14px" }}>INC-2291 p.3</span><span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "12px", color: "#6EA8FF" }}>0.82</span></div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", border: "1px solid #22304A", borderRadius: "10px" }}><span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "12px", color: "#A3A9B1" }}>2</span><span style={{ flexGrow: "1", fontSize: "14px" }}>Gateway SLA p.5</span><span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "12px", color: "#6EA8FF" }}>0.79</span></div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", border: "1px solid #ECEAE4", borderRadius: "10px", background: "#152036" }}><span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "12px", color: "#A3A9B1" }}>3</span><span style={{ flexGrow: "1", fontSize: "14px" }}>Runbook p.12</span><span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "12px", color: "#6EA8FF" }}>0.77</span></div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", border: "1px solid #22304A", borderRadius: "10px" }}><span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "12px", color: "#A3A9B1" }}>4</span><span style={{ flexGrow: "1", fontSize: "14px" }}>VPN setup p.1</span><span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "12px", color: "#6EA8FF" }}>0.61</span></div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", border: "1px solid #22304A", borderRadius: "10px" }}><span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "12px", color: "#A3A9B1" }}>5</span><span style={{ flexGrow: "1", fontSize: "14px", color: "#A3A9B1" }}>Card block SOP p.2</span><span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "12px", color: "#A3A9B1" }}>0.58</span></div>
      <span style={{ marginTop: "auto", fontSize: "13px", color: "#A3A9B1", lineHeight: "1.5" }}>Found "gateway timeout" by meaning.</span>
      </div>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "16px", border: "1px solid #4A525E", borderRadius: "16px", background: "rgba(24,28,34,0.96)", transform: "translateZ(80px)", boxShadow: "0 50px 60px -30px rgba(0,0,0,0.9)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontFamily: "var(--font-display), sans-serif", fontSize: "18px", fontWeight: "600" }}>RRF fused</span><span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "11px", color: "#A3A9B1" }}>k = 60 · 1ms</span></div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", border: "1px solid #ECEAE4", borderRadius: "10px", background: "#22272F" }}><span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "12px", color: "#A3A9B1" }}>1</span><span style={{ flexGrow: "1", fontSize: "14px" }}>Runbook p.12</span><span style={{ display: "flex", gap: "3px" }}><span style={{ width: "6px", height: "6px", borderRadius: "3px", background: "#FF9F43" }}></span><span style={{ width: "6px", height: "6px", borderRadius: "3px", background: "#6EA8FF" }}></span></span><span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "12px" }}>.0323</span></div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", border: "1px solid #ECEAE4", borderRadius: "10px", background: "#22272F" }}><span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "12px", color: "#A3A9B1" }}>2</span><span style={{ flexGrow: "1", fontSize: "14px" }}>INC-2291 p.3</span><span style={{ display: "flex", gap: "3px" }}><span style={{ width: "6px", height: "6px", borderRadius: "3px", background: "#FF9F43" }}></span><span style={{ width: "6px", height: "6px", borderRadius: "3px", background: "#6EA8FF" }}></span></span><span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "12px" }}>.0320</span></div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", border: "1px solid #343B45", borderRadius: "10px" }}><span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "12px", color: "#A3A9B1" }}>3</span><span style={{ flexGrow: "1", fontSize: "14px" }}>Error code index p.2</span><span style={{ width: "6px", height: "6px", borderRadius: "3px", background: "#FF9F43" }}></span><span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "12px", color: "#A3A9B1" }}>.0161</span></div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", border: "1px solid #343B45", borderRadius: "10px" }}><span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "12px", color: "#A3A9B1" }}>4</span><span style={{ flexGrow: "1", fontSize: "14px" }}>Gateway SLA p.5</span><span style={{ width: "6px", height: "6px", borderRadius: "3px", background: "#6EA8FF" }}></span><span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "12px", color: "#A3A9B1" }}>.0161</span></div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", border: "1px solid #343B45", borderRadius: "10px" }}><span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "12px", color: "#A3A9B1" }}>5</span><span style={{ flexGrow: "1", fontSize: "14px", color: "#A3A9B1" }}>Payments FAQ p.4</span><span style={{ width: "6px", height: "6px", borderRadius: "3px", background: "#FF9F43" }}></span><span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "12px", color: "#A3A9B1" }}>.0159</span></div>
      <span style={{ marginTop: "auto", fontSize: "13px", color: "#A3A9B1", lineHeight: "1.5" }}>Found by both, so ranked first.</span>
      </div>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "16px", border: "1px solid #ECEAE4", borderRadius: "16px", background: "rgba(236,234,228,0.97)", color: "#0A0C0F", transform: "translateZ(120px)", boxShadow: "0 60px 70px -30px rgba(0,0,0,0.95)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontFamily: "var(--font-display), sans-serif", fontSize: "18px", fontWeight: "600" }}>Reranked</span><span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "11px", color: "#3D4148" }}>cross-encoder · 140ms</span></div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", border: "1px solid #0A0C0F", borderRadius: "10px", background: "#FFFFFF" }}><span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "12px", color: "#3D4148" }}>1</span><span style={{ flexGrow: "1", fontSize: "14px", fontWeight: "500" }}>Runbook p.12</span><span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "12px" }}>0.94</span></div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", border: "1px solid #0A0C0F", borderRadius: "10px", background: "#FFFFFF" }}><span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "12px", color: "#3D4148" }}>2</span><span style={{ flexGrow: "1", fontSize: "14px", fontWeight: "500" }}>INC-2291 p.3</span><span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "12px" }}>0.88</span></div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", border: "1px solid #B9B6AE", borderRadius: "10px" }}><span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "12px", color: "#3D4148" }}>3</span><span style={{ flexGrow: "1", fontSize: "14px" }}>Gateway SLA p.5</span><span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "12px", color: "#3D4148" }}>0.41</span></div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", border: "1px solid #B9B6AE", borderRadius: "10px" }}><span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "12px", color: "#3D4148" }}>4</span><span style={{ flexGrow: "1", fontSize: "14px" }}>Error code index p.2</span><span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "12px", color: "#3D4148" }}>0.37</span></div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", border: "1px dashed #B9B6AE", borderRadius: "10px" }}><span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "12px", color: "#3D4148" }}>5</span><span style={{ flexGrow: "1", fontSize: "14px", color: "#3D4148" }}>Payments FAQ p.4</span><span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "12px", color: "#3D4148" }}>0.12</span></div>
      <span style={{ marginTop: "auto", fontSize: "13px", color: "#3D4148", lineHeight: "1.5" }}>Top 2 above the 0.35 evidence gate go to the LLM.</span>
      </div>
      
      </div>
      </div>
      
      <div style={{ display: "flex", gap: "24px", alignItems: "stretch" }}>
      <div style={{ flexGrow: "1", display: "flex", flexDirection: "column", gap: "12px", padding: "18px 20px", border: "1px solid #1E232A", borderRadius: "14px", background: "#0F1216" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "12px", color: "#A3A9B1" }}>LATENCY WATERFALL</span><span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "12px" }}>total 1.41s</span></div>
      <div style={{ display: "flex", height: "14px", gap: "2px" }}>
      <div style={{ width: "2%", background: "#A3A9B1", borderRadius: "3px" }}></div>
      <div style={{ width: "2%", background: "#FF9F43", borderRadius: "3px" }}></div>
      <div style={{ width: "3%", background: "#6EA8FF", borderRadius: "3px" }}></div>
      <div style={{ width: "1%", background: "#ECEAE4", borderRadius: "3px" }}></div>
      <div style={{ width: "10%", background: "#8A8F96", borderRadius: "3px" }}></div>
      <div style={{ flexGrow: "1", background: "#3E444C", borderRadius: "3px" }}></div>
      </div>
      <div style={{ display: "flex", gap: "20px", fontFamily: "var(--font-mono), monospace", fontSize: "12px", color: "#A3A9B1" }}>
      <span>embed 18ms</span><span style={{ color: "#FF9F43" }}>bm25 12ms</span><span style={{ color: "#6EA8FF" }}>dense 38ms</span><span>rrf 1ms</span><span>rerank 140ms</span><span>llm 1.2s</span>
      </div>
      </div>
      <div style={{ width: "360px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "8px", padding: "18px 20px", border: "1px solid #1E232A", borderRadius: "14px", background: "#0F1216" }}>
      <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "12px", color: "#A3A9B1" }}>FUSION</span>
      <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "18px" }}>RRF(d) = Σ 1 / (60 + rank)</span>
      <span style={{ fontSize: "13px", color: "#A3A9B1" }}>Runbook: 1/61 + 1/63 = 0.0323</span>
      </div>
      </div>
      
      </div>
    </div>
  );
}
