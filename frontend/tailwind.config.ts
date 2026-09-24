import type { Config } from "tailwindcss";

// Design tokens mirror the :root variables in design/app.html.
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0A0C0F",
        panel: "#0C0E12",
        surface: { DEFAULT: "#12151A", 2: "#161A20", 3: "#181C22" },
        line: "#1A1E24",
        border: { DEFAULT: "#262B33", strong: "#2E343D" },
        text: { DEFAULT: "#ECEAE4", 2: "#A3A9B1", 3: "#8A9098" },
        bm25: "#FF9F43",
        dense: "#6EA8FF",
        both: "#ECEAE4",
        ok: "#7EE0A1",
        warn: "#F5C451",
        danger: "#E0736A",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      keyframes: {
        pulse: { "50%": { boxShadow: "0 0 0 5px rgba(236,234,228,.05)" } },
        fade: {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "none" },
        },
      },
      animation: {
        pulse: "pulse 1s ease-in-out infinite",
        fade: "fade .4s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
