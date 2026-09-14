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
        // ── v2（Relationship Companion）のトークン ──────────
        // 既存の冷色（白練・墨・浅葱）はそのまま残す。20ルートが使っている。
        // v2 は名前を分けて併存させ、入れ替えの日まで互いに触らせない。
        //
        // コーラルは彩度を落としてある。純粋な #FF6B5A は警告色に見え、
        // かつ恋愛アプリの記号にもなる。ここは「静か」が要件なので外す。
        ground: "#FBF9F7",      // 温かみのあるオフホワイト — アプリの地
        surface: "#FFFFFF",     // カードの面
        raised: "#F4F0EC",      // 一段沈んだ面（見出し帯・タブ）
        // 注意: ink という名前は使えない。
        // tailwind に定義が無いまま text-ink が141箇所書かれていて、
        // いまは色が出ていない。ここで定義すると、その141箇所に
        // 突然色が付いて既存ページの見た目が変わる。名前を分ける。
        charcoal: "#2A2622",    // 温かいチャコール — 見出し
        bodytext: "#5A534C",    // 本文
        faint: "#8C8378",       // 補足・キャプション
        hairline: "#EAE4DE",    // 罫線
        coral: "#D9694F",       // アクセント。1画面に1箇所だけ
        "coral-soft": "#FBEDE8",
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
        // v2 の見出し。明朝から離すのが要点で、
        // 明朝は「読み物」の記号なのでアプリでは重く見える。
        // 追加の読み込みはせず、端末にある角ゴシックを順に当てる。
        display: [
          "Hiragino Sans",
          "Noto Sans JP",
          "YuGothic",
          "system-ui",
          "sans-serif",
        ],
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
