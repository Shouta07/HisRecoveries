import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Chic dark sophisticated palette — high-end men register
        // Contrast-tuned so text and borders stay readable on the
        // deep warm body.
        cream: "#1A130D",
        "cream-deep": "#0E0A07",
        paper: "#2A2018",
        ink: "#F2E7CB",
        "sub-gray": "#B5A380",
        "hair-line": "#5A4A36",
        navy: "#0E0805",
        "navy-deep": "#070402",
        gold: "#C9A37C",
        "gold-bright": "#E2C49A",
        // Legacy aliases
        "off-white": "#1A130D",
        "quiet-brass": "#C9A37C",
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
