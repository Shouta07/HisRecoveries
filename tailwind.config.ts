import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FAF6EB",
        "cream-deep": "#F0E8D3",
        paper: "#FFFFFF",
        ink: "#1A1A1A",
        "sub-gray": "#757269",
        "hair-line": "#E9E1CC",
        navy: "#1B2A47",
        "navy-deep": "#131F36",
        gold: "#A17A4A",
        "gold-bright": "#B88F5D",
        // Legacy aliases
        "off-white": "#FAF6EB",
        "quiet-brass": "#A17A4A",
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
