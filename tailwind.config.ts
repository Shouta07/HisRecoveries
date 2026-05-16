import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#F6EFE0",
        "cream-deep": "#ECDFC6",
        paper: "#FFFFFF",
        ink: "#141414",
        "sub-gray": "#6B6B6B",
        "hair-line": "#E3D8C2",
        navy: "#1B2A47",
        "navy-deep": "#131F36",
        gold: "#B08755",
        "gold-bright": "#C39A6A",
        // Legacy aliases kept so existing class names continue to work
        "off-white": "#F6EFE0",
        "quiet-brass": "#B08755",
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
