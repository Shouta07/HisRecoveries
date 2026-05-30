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
        cream: "#1A130D",
        "cream-deep": "#0E0A07",
        paper: "#241B12",
        ink: "#E8DCBF",
        "sub-gray": "#9B8B6E",
        "hair-line": "#3D3225",
        navy: "#100A06",
        "navy-deep": "#080503",
        gold: "#B89169",
        "gold-bright": "#D9B584",
        // Legacy aliases
        "off-white": "#1A130D",
        "quiet-brass": "#B89169",
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
