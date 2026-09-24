import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const display = localFont({
  src: "../fonts/SpaceGrotesk.woff2",
  weight: "300 700",
  variable: "--font-display",
  adjustFontFallback: false,
  fallback: ["sans-serif"],
});
const body = localFont({
  src: "../fonts/IBMPlexSans.woff2",
  weight: "100 700",
  variable: "--font-body",
  adjustFontFallback: false,
  fallback: ["system-ui", "sans-serif"],
});
const mono = localFont({
  src: "../fonts/JetBrainsMono.woff2",
  weight: "100 800",
  variable: "--font-mono",
  adjustFontFallback: false,
  fallback: ["monospace"],
});

export const metadata: Metadata = {
  title: "clarity-rag-search-engine",
  description:
    "Enterprise document search with hybrid dense-sparse retrieval, RRF and hallucination guardrails.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
