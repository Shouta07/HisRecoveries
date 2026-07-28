import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Bright warm cream body + reserved dark for cinematic
        // sections. Aesop register on the page; chrome reads as
        // sand. Three places stay dark (Philosophy, Belonging,
        // /recoveries Act II) and earn their cinema by contrast.
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
        // Brand green register (hero / logo mark / videos). Deep green + sage.
        brand: "#16241A",
        "brand-cream": "#EDF1E8",
        sage: "#85AB8B",
        "sage-bright": "#9EC4A3",
        // 差し色（ブラス）。緑が"地"、ブラスが"ここを見て"の印。
        // 面で塗らない。細い線・小さいラベル・数字・1文のマーカーにだけ使う。
        // brass       … 明るい地の上の文字（#f4f6f2 に対して 5.5:1）
        // brass-mid   … 罫線・枠・アイコン
        // brass-bright… 深緑の上の文字（#16241A に対して 8.5:1）
        // brass-wash  … 蛍光ペンの下地
        brass: "#7E5B29",
        "brass-mid": "#B98A3C",
        "brass-bright": "#E0B75F",
        "brass-wash": "#F6E9CE",
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
