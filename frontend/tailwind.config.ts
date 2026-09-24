import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/hooks/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff6ff",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },

        // ===== Clarity landing design tokens (added for landing-page branch) =====
        bg: "#0A0C0F",
        panel: "#0C0E12",
        surface: "#12151A",
        "surface-2": "#161A20",
        "surface-3": "#181C22",
        line: "#1A1E24",
        border: "#262B33",
        "border-strong": "#2E343D",
        text: "#ECEAE4",
        "text-2": "#A3A9B1",
        "text-3": "#8A9098",
        bm25: "#FF9F43", // keyword / orange
        dense: "#6EA8FF", // meaning / blue
        ok: "#7EE0A1",
        warn: "#F5C451",
        danger: "#E0736A",
        // ========================================================================
      },
      fontFamily: {
        // ===== Clarity landing fonts (wired via next/font CSS vars in layout.tsx) =
        display: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-ibm-plex-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
        // ========================================================================
      },
      letterSpacing: {
        tighter2: "-0.03em",
        tighter3: "-0.04em",
      },
    },
  },
  plugins: [],
};
export default config;
