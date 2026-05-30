import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Aesop-style warm bright palette
        cream: "#F2EAD9",
        "cream-deep": "#E6DBC4",
        paper: "#FBF6EA",
        ink: "#221A11",
        "sub-gray": "#7A6B57",
        "hair-line": "#D9CDB6",
        navy: "#1F1813",
        "navy-deep": "#15100B",
        gold: "#8E6A36",
        "gold-bright": "#A6824A",
        // Legacy aliases
        "off-white": "#F2EAD9",
        "quiet-brass": "#8E6A36",
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
