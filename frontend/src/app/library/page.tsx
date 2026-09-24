// Ported from design/library.html by a mechanical HTML -> TSX conversion.
// Fixed 1440px frame, as in the prototype.

export default function LibraryPage() {
  return (
    <div className="static-page flex min-w-[1440px] justify-center bg-bg">
      <div style={{ width: "1440px", height: "900px", boxSizing: "border-box", position: "relative", overflow: "hidden", background: "#0A0C0F", padding: "40px 64px", display: "flex", flexDirection: "column", gap: "24px", fontFamily: "var(--font-body), system-ui, sans-serif", color: "#ECEAE4" }}>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "12px", color: "#A3A9B1" }}>NORTHWIND BANK · 214 documents · 6,380 chunks</span>
      <h1 style={{ margin: "0", fontFamily: "var(--font-display), sans-serif", fontWeight: "700", fontSize: "48px", letterSpacing: "-0.03em" }}>Library</h1>
      </div>
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
      <label htmlFor="role" style={{ fontFamily: "var(--font-mono), monospace", fontSize: "12px", color: "#A3A9B1" }}>VIEW AS</label>
      <select id="role" style={{ height: "44px", padding: "0 14px", background: "#12151A", color: "#ECEAE4", border: "1px solid #2E343D", borderRadius: "10px", font: "500 14px var(--font-body), sans-serif" }}>
      <option>Priya · employee, engineering</option>
      <option>Anita · hr</option>
      <option>Admin</option>
      </select>
      <button type="button" style={{ height: "44px", padding: "0 18px", border: "0", borderRadius: "10px", background: "#ECEAE4", color: "#0A0C0F", font: "500 14px var(--font-body), sans-serif" }}>Upload documents</button>
      </div>
      </div>
      
      <div style={{ display: "flex", gap: "40px", flexGrow: "1", minHeight: "0" }}>
      
      <div style={{ width: "560px", position: "relative", perspective: "2000px", perspectiveOrigin: "50% 20%" }}>
      <div style={{ position: "absolute", left: "90px", top: "250px", width: "360px", height: "230px", transformStyle: "preserve-3d", transform: "rotateX(60deg) rotateZ(-42deg)" }}>
      
      <div style={{ position: "absolute", inset: "0", boxSizing: "border-box", border: "1px solid #2A3038", borderRadius: "14px", background: "rgba(16,19,24,0.94)", padding: "16px", display: "flex", flexDirection: "column", justifyContent: "space-between", transform: "translateZ(0px)", boxShadow: "0 60px 80px -30px rgba(0,0,0,0.9)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontFamily: "var(--font-display), sans-serif", fontSize: "20px", fontWeight: "600", color: "#8A9098" }}>Finance</span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A9098" strokeWidth="1.8" strokeLinecap="round"><rect x="5" y="11" width="14" height="10" rx="2"></rect><path d="M8 11 V8 a4 4 0 0 1 8 0 V11"></path></svg></div>
      <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "11px", color: "#8A9098" }}>finance, admin · 38 docs</span>
      </div>
      
      <div style={{ position: "absolute", inset: "0", boxSizing: "border-box", border: "1px solid #2A3038", borderRadius: "14px", background: "rgba(16,19,24,0.94)", padding: "16px", display: "flex", flexDirection: "column", justifyContent: "space-between", transform: "translateZ(80px)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontFamily: "var(--font-display), sans-serif", fontSize: "20px", fontWeight: "600", color: "#8A9098" }}>HR</span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A9098" strokeWidth="1.8" strokeLinecap="round"><rect x="5" y="11" width="14" height="10" rx="2"></rect><path d="M8 11 V8 a4 4 0 0 1 8 0 V11"></path></svg></div>
      <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "11px", color: "#8A9098" }}>hr, admin · 41 docs</span>
      </div>
      
      <div style={{ position: "absolute", inset: "0", boxSizing: "border-box", border: "1px solid #22304A", borderRadius: "14px", background: "rgba(15,20,29,0.95)", padding: "16px", display: "flex", flexDirection: "column", justifyContent: "space-between", transform: "translateZ(160px)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontFamily: "var(--font-display), sans-serif", fontSize: "20px", fontWeight: "600", color: "#6EA8FF" }}>Engineering</span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6EA8FF" strokeWidth="1.8" strokeLinecap="round"><path d="M5 12 L10 17 L19 7"></path></svg></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: "5px", height: "60px" }}>
      <div style={{ borderRadius: "4px", background: "#1D2A40" }}></div><div style={{ borderRadius: "4px", background: "#1D2A40" }}></div><div style={{ borderRadius: "4px", background: "#6EA8FF" }}></div><div style={{ borderRadius: "4px", background: "#1D2A40" }}></div><div style={{ borderRadius: "4px", background: "#1D2A40" }}></div>
      <div style={{ borderRadius: "4px", background: "#1D2A40" }}></div><div style={{ borderRadius: "4px", background: "#1D2A40" }}></div><div style={{ borderRadius: "4px", background: "#1D2A40" }}></div><div style={{ borderRadius: "4px", background: "#1D2A40" }}></div><div style={{ borderRadius: "4px", background: "#1D2A40" }}></div>
      </div>
      <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "11px", color: "#A3A9B1" }}>engineering, admin · 72 docs</span>
      </div>
      
      <div style={{ position: "absolute", inset: "0", boxSizing: "border-box", border: "1px solid #ECEAE4", borderRadius: "14px", background: "rgba(236,234,228,0.96)", color: "#0A0C0F", padding: "16px", display: "flex", flexDirection: "column", justifyContent: "space-between", transform: "translateZ(240px)", boxShadow: "0 0 0 6px rgba(236,234,228,0.08)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontFamily: "var(--font-display), sans-serif", fontSize: "20px", fontWeight: "600" }}>Company-wide</span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0A0C0F" strokeWidth="1.8" strokeLinecap="round"><path d="M5 12 L10 17 L19 7"></path></svg></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: "5px", height: "60px" }}>
      <div style={{ borderRadius: "4px", background: "#D6D3CB" }}></div><div style={{ borderRadius: "4px", background: "#0A0C0F" }}></div><div style={{ borderRadius: "4px", background: "#D6D3CB" }}></div><div style={{ borderRadius: "4px", background: "#D6D3CB" }}></div><div style={{ borderRadius: "4px", background: "#D6D3CB" }}></div>
      <div style={{ borderRadius: "4px", background: "#D6D3CB" }}></div><div style={{ borderRadius: "4px", background: "#D6D3CB" }}></div><div style={{ borderRadius: "4px", background: "#D6D3CB" }}></div><div style={{ borderRadius: "4px", background: "#D6D3CB" }}></div><div style={{ borderRadius: "4px", background: "#D6D3CB" }}></div>
      </div>
      <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "11px", color: "#3D4148" }}>everyone · 63 docs</span>
      </div>
      
      </div>
      <div style={{ position: "absolute", left: "0", bottom: "0", display: "flex", gap: "20px", fontFamily: "var(--font-mono), monospace", fontSize: "12px", color: "#A3A9B1" }}>
      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ECEAE4" strokeWidth="2" strokeLinecap="round"><path d="M5 12 L10 17 L19 7"></path></svg>Searchable for Priya</span>
      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8A9098" strokeWidth="2" strokeLinecap="round"><rect x="5" y="11" width="14" height="10" rx="2"></rect><path d="M8 11 V8 a4 4 0 0 1 8 0 V11"></path></svg>Filtered out before retrieval</span>
      </div>
      </div>
      
      <div style={{ flexGrow: "1", display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
      
      <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 18px", border: "1px solid #2B4A36", background: "#0F1712", borderRadius: "12px" }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7EE0A1" strokeWidth="1.8" strokeLinecap="round"><path d="M5 12 L10 17 L19 7"></path></svg>
      <div style={{ display: "flex", flexDirection: "column", gap: "2px", flexGrow: "1" }}>
      <span style={{ fontSize: "15px" }}>Leave Policy 2025.pdf is already indexed</span>
      <span style={{ fontSize: "13px", color: "#A3A9B1" }}>Same SHA-256 hash. Nothing re-embedded.</span>
      </div>
      <button type="button" style={{ height: "36px", padding: "0 14px", border: "1px solid #2B4A36", borderRadius: "8px", background: "transparent", color: "#7EE0A1", font: "500 13px var(--font-body), sans-serif" }}>Dismiss</button>
      </div>
      
      <div style={{ border: "1px solid #1E232A", borderRadius: "14px", overflow: "hidden", background: "#0F1216" }}>
      <div style={{ display: "grid", gridTemplateColumns: "2.2fr 1fr 1.2fr 0.8fr", gap: "12px", padding: "12px 18px", fontFamily: "var(--font-mono), monospace", fontSize: "11px", color: "#A3A9B1", borderBottom: "1px solid #1E232A" }}>
      <span>DOCUMENT</span><span>FOLDER</span><span>ACCESS</span><span>STATUS</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2.2fr 1fr 1.2fr 0.8fr", gap: "12px", padding: "14px 18px", fontSize: "14px", borderBottom: "1px solid #171B21", alignItems: "center" }}>
      <span>IT Runbook — Payments.pdf</span><span style={{ color: "#6EA8FF" }}>Engineering</span><span style={{ color: "#A3A9B1" }}>engineering, admin</span><span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "12px" }}>412 chunks</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2.2fr 1fr 1.2fr 0.8fr", gap: "12px", padding: "14px 18px", fontSize: "14px", borderBottom: "1px solid #171B21", alignItems: "center" }}>
      <span>Incident INC-2291.docx</span><span style={{ color: "#6EA8FF" }}>Engineering</span><span style={{ color: "#A3A9B1" }}>engineering, admin</span><span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "12px" }}>18 chunks</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2.2fr 1fr 1.2fr 0.8fr", gap: "12px", padding: "14px 18px", fontSize: "14px", borderBottom: "1px solid #171B21", alignItems: "center" }}>
      <span>Leave Policy 2025.pdf</span><span>Company-wide</span><span style={{ color: "#A3A9B1" }}>everyone</span><span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "12px" }}>64 chunks</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2.2fr 1fr 1.2fr 0.8fr", gap: "12px", padding: "14px 18px", fontSize: "14px", borderBottom: "1px solid #171B21", alignItems: "center", color: "#8A9098" }}>
      <span>Leave Policy 2023.pdf</span><span>Company-wide</span><span>everyone</span><span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "12px" }}>superseded</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2.2fr 1fr 1.2fr 0.8fr", gap: "12px", padding: "14px 18px", fontSize: "14px", borderBottom: "1px solid #171B21", alignItems: "center", color: "#8A9098" }}>
      <span>Compensation Bands.xlsx</span><span>HR</span><span>hr, admin</span><span style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "var(--font-mono), monospace", fontSize: "12px" }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8A9098" strokeWidth="2" strokeLinecap="round"><rect x="5" y="11" width="14" height="10" rx="2"></rect><path d="M8 11 V8 a4 4 0 0 1 8 0 V11"></path></svg>hidden</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2.2fr 1fr 1.2fr 0.8fr", gap: "12px", padding: "14px 18px", fontSize: "14px", alignItems: "center" }}>
      <span>Expense Policy FIN-09.pdf</span><span style={{ color: "#8A9098" }}>Finance</span><span style={{ color: "#A3A9B1" }}>finance, admin</span><span style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "var(--font-mono), monospace", fontSize: "12px", color: "#FF9F43" }}><span style={{ width: "40px", height: "4px", borderRadius: "2px", background: "#2A241D", position: "relative", overflow: "hidden", display: "block" }}><span style={{ position: "absolute", left: "0", top: "0", bottom: "0", width: "62%", background: "#FF9F43", display: "block" }}></span></span>62%</span>
      </div>
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "16px 18px", border: "1px solid #262B33", borderRadius: "12px", background: "#12151A" }}>
      <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "11px", color: "#A3A9B1" }}>AS PRIYA · ENGINEERING</span>
      <span style={{ fontSize: "14px" }}>"Salary band for senior engineers?"</span>
      <span style={{ fontSize: "14px", color: "#A3A9B1", lineHeight: "1.5" }}>I couldn't find sufficient evidence in the documents you have access to.</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "16px 18px", border: "1px solid #ECEAE4", borderRadius: "12px", background: "#ECEAE4", color: "#0A0C0F" }}>
      <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "11px", color: "#3D4148" }}>AS ANITA · HR</span>
      <span style={{ fontSize: "14px" }}>"Salary band for senior engineers?"</span>
      <span style={{ fontSize: "14px", lineHeight: "1.5" }}>Band L5, [YOUR RANGE]. <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "12px" }}>[Compensation Bands, sheet 2]</span></span>
      </div>
      </div>
      
      </div>
      </div>
      
      </div>
    </div>
  );
}
