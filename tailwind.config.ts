import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "off-white": "#FAFAF7",
        ink: "#1A1A1A",
        "sub-gray": "#6B6B6B",
        "hair-line": "#E5E5E0",
        "quiet-brass": "#8B7355",
      },
      fontFamily: {
        serif: [
          "Cormorant Garamond",
          "Noto Serif JP",
          "YuMincho",
          "Hiragino Mincho ProN",
          "serif",
        ],
        sans: [
          "Noto Sans JP",
          "YuGothic",
          "Hiragino Sans",
          "system-ui",
          "sans-serif",
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
