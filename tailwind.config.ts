import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 自然素材の色。画面のための色（鮮やかな緑・金・青）は持たない。
        // 詳細と使い分けは DESIGN.md「3. カラーパレット」。
        kinari: "#F3F0EA",      // 生成り — サイトの地
        hakuji: "#FAF8F4",      // 白磁 — 記事の紙
        sumi: "#1F1E1B",        // 墨 — 本文（純黒にしない）
        keshizumi: "#45443E",   // 消炭 — リード・補足
        ainezu: "#5E6A70",      // 藍鼠 — キャプション・日付
        shironezu: "#DAD6CD",   // 白鼠 — 罫線
        tokiwa: "#2C3A2E",      // 常盤 — 濃い面（写真の下、締めの帯）
        dou: "#8A6A3B",         // 銅 — リンク（明るい地の上）
        "dou-usu": "#B9A06B",   // 淡銅 — 常盤の上のアクセント
        koke: "#6B6E55",        // 苔 — ごく稀
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
        reading: "680px",
      },
      letterSpacing: {
        logo: "0.05em",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        marquee: "marquee 70s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
