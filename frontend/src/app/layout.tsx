import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MeetMux RAG Engine",
  description: "Enterprise Hybrid Document Search",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
