import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ロゴ（HRのモノグラム）から取った色。
        // ロゴは 濃紺 #2E4A66 → 浅葱 #70B0B0 のグラデーションと白。
        // それに合わせて、地も冷たい白に振っている。
        // 以前は生成り・深緑・銅の暖色だったが、ロゴと並ぶと色がぶつかっていた。
        // 詳細と使い分けは DESIGN.md「3. カラーパレット」。
        shironeri: "#F1F3F3",   // 白練 — サイトの地（冷たい白）
        hakuji: "#FAFBFB",      // 白磁 — 記事の紙
        sumi: "#1B2024",        // 墨 — 本文（純黒にしない。わずかに青み）
        keshizumi: "#414A50",   // 消炭 — リード・補足
        ainezu: "#5E6E76",      // 藍鼠 — キャプション・日付
        shironezu: "#D6DCDC",   // 白鼠 — 罫線
        konjo: "#2E4A66",       // 紺青 — 濃い面（ロゴの深い側）
        asagi: "#2F6F79",       // 浅葱 — リンク（明るい地の上で読める濃さ）
        "asagi-usu": "#70B0B0", // 淡浅葱 — 紺青の上のアクセント（ロゴの明るい側）
        mizu: "#A8CACA",        // 水 — ごく稀
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
