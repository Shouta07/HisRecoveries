import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#DDCBA8",
        "cream-deep": "#C8B492",
        paper: "#EBDDC0",
        ink: "#2A1F14",
        "sub-gray": "#6F5F45",
        "hair-line": "#C5B294",
        navy: "#3D2E1F",
        "navy-deep": "#2B1F12",
        gold: "#9F7944",
        "gold-bright": "#B89169",
        // Legacy aliases
        "off-white": "#DDCBA8",
        "quiet-brass": "#9F7944",
      },
      fontFamily: {
        sans: [
          "Noto Sans JP",
          "YuGothic",
          "Hiragino Sans",
          "system-ui",
          "sans-serif",
        ],
        serif: [
          "Noto Serif JP",
          "YuMincho",
          "Hiragino Mincho ProN",
          "serif",
        ],
        mincho: [
          "Noto Serif JP",
          "YuMincho",
          "Hiragino Mincho ProN",
          "serif",
        ],
        logo: ["Cormorant Garamond", "Crimson Pro", "serif"],
      },
      maxWidth: {
        reading: "720px",
      },
      letterSpacing: {
        logo: "0.05em",
      },
    },
  },
  plugins: [],
};

export default config;
