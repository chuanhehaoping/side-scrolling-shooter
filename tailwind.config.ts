import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "hud-cyan": "#5ef2ff",
        "hud-magenta": "#ff4fd8",
        "hud-amber": "#ffce54",
        "space-deep": "#04060f",
      },
      fontFamily: {
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 18px rgba(94, 242, 255, 0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
