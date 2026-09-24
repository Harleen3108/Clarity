import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Self-hosted latin variable fonts from Google Fonts, so builds don't need network access.
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
  title: "Clarity",
  description: "Hybrid retrieval with grounded answers",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
