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
        // ── v2（Relationship Companion / /app）のトークン ──────
        // 既存の冷色（白練・墨・浅葱）はそのまま残す。20ルートが使っている。
        // v2 は名前を分けて併存させ、入れ替えの日まで互いに触らせない。
        // 実測: この下の9色は /app と components/app の外では1箇所も
        // 使われていない。だからここは自由に組み替えられる。
        //
        // 地は温かいオフホワイト。白にしないのは、
        // 白い紙の上に白いカードを置く設計から離れるため。
        ground: "#FBF9F7",      // アプリの地
        surface: "#FFFFFF",     // カードの面。使う場所を絞る（選択肢・経験談だけ）
        raised: "#F4F0EC",      // ごく稀。沈めたい帯
        // 注意: ink という名前は使えない。
        // tailwind に定義が無いまま text-ink が141箇所書かれていて、
        // いまは色が出ていない。ここで定義すると、その141箇所に
        // 突然色が付いて既存ページの見た目が変わる。名前を分ける。
        charcoal: "#2A2622",    // 見出し・問い
        bodytext: "#5A534C",    // 本文
        faint: "#8C8378",       // 補足・キャプション・日付
        hairline: "#EAE4DE",    // 線。このプロダクトの主役の一つ
        // アクセントは1色だけ。
        // 以前の #D9694F は本文コントラストが 3.33:1 で AA に届かず、
        // リンク文字に使っていた。沈めて 4.67:1（地の上）/ 4.86:1（白文字）。
        // 彩度を落とすと、恋愛アプリの記号からも離れる。
        accent: "#B2543C",
        "accent-tint": "#F4EAE6", // 選択中の面。塗りつぶしではなく、ごく淡く
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
        // v2 の動き。ここに無いものは使わない（§29）。
        // 弾ませない。光らせない。紙が一枚めくれる程度に留める。
        "hr-rise": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "hr-fade": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        // 線が引かれる。道のりと記録の時系列に使う唯一の装飾。
        "hr-draw": {
          from: { transform: "scaleX(0)" },
          to: { transform: "scaleX(1)" },
        },
      },
      animation: {
        marquee: "marquee 70s linear infinite",
        "hr-rise": "hr-rise 260ms cubic-bezier(0.22,0.61,0.36,1) both",
        "hr-fade": "hr-fade 200ms ease-out both",
        "hr-draw": "hr-draw 420ms cubic-bezier(0.22,0.61,0.36,1) both",
      },
    },
  },
  plugins: [],
};

export default config;
