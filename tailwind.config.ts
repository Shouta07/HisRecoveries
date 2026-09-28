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
        // ── ブランド（トップと「女性に聞く」）──────────────
        // Editorial × Dating App × Human Research Lab。
        // 恋愛サービスに見えすぎず、AIサービスにも見えすぎない色にする。
        // ピンクを中心にしない。青のAI風にもしない。
        //
        // ── ライムの使い方に規則を置く ────────────────────
        // ライムは地の上で 1.04:1 しかない。文字色には絶対に使わない。
        //   ・明るい地の上 → 面として塗り、その上は黒文字（16.9:1）
        //   ・黒の上      → 文字に使ってよい（17.8:1）
        // これを破ると、見えない文字が量産される。
        bone: "#F2F0EC",        // 温かいオフホワイト — 地
        void: "#0A0A0A",        // 黒 — 反転面と大見出し
        ash: "#6E6A63",         // 温かいグレー — 本文（地の上で 4.77:1、AA）
        "ash-soft": "#9A948B",  // 装飾・キャプションだけ。本文に使わない
        lime: "#CCFF00",        // アクセント1色。面と、黒地の上の文字だけ
        rule: "#DCD8D1",        // 明るい地の罫線
        "rule-dark": "#2A2A28", // 黒地の罫線

        ground: "#FBF9F7",      // アプリの地
        surface: "#FFFFFF",     // カードの面。使う場所を絞る（選択肢・経験談だけ）
        raised: "#F4F0EC",      // ごく稀。沈めたい帯
        // 注意: ink という名前は使えない。
        // tailwind に定義が無いまま text-ink が141箇所書かれていて、
        // いまは色が出ていない。ここで定義すると、その141箇所に
        // 突然色が付いて既存ページの見た目が変わる。名前を分ける。
        charcoal: "#2A2622",    // 見出し・問い
        bodytext: "#5A534C",    // 本文
        // #8C8378 だったが、地(#FBF9F7)の上で 3.55:1 しかなく、
        // 下タブのラベル（14px・非太字）が AA(4.5:1) に届いていなかった。
        // 色味は変えず、濃さだけ上げて 4.81:1 にする。
        faint: "#726D66",       // 補足・キャプション・日付
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
        // ── ブランドの動き ────────────────────────────
        // 目的は「すごく見せること」ではなく、
        // 人の反応が1枚ずつ集まってくる感覚を出すこと。
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-16px)" },
        },
        "card-in": {
          from: { opacity: "0", transform: "translateY(18px) rotate(var(--tilt, 0deg))" },
          to: { opacity: "1", transform: "translateY(0) rotate(var(--tilt, 0deg))" },
        },
        "bar-grow": {
          from: { transform: "scaleX(0)" },
          to: { transform: "scaleX(1)" },
        },
      },
      animation: {
        marquee: "marquee 70s linear infinite",
        "hr-rise": "hr-rise 260ms cubic-bezier(0.22,0.61,0.36,1) both",
        "hr-fade": "hr-fade 200ms ease-out both",
        "hr-draw": "hr-draw 420ms cubic-bezier(0.22,0.61,0.36,1) both",
        float: "float 6s ease-in-out infinite",
        "float-slow": "float-slow 9s ease-in-out infinite",
        "card-in": "card-in 520ms cubic-bezier(0.22,0.61,0.36,1) both",
        "bar-grow": "bar-grow 900ms cubic-bezier(0.22,0.61,0.36,1) both",
      },
      fontSize: {
        // 本文と見出しのサイズ差を大きくする。
        // 画面幅で伸ばすので、スマホでも大見出しが大見出しのままになる。
        mega: ["clamp(44px, 13vw, 132px)", { lineHeight: "0.92", letterSpacing: "-0.04em" }],
        huge: ["clamp(34px, 9vw, 84px)", { lineHeight: "1.04", letterSpacing: "-0.035em" }],
        big: ["clamp(26px, 6.4vw, 56px)", { lineHeight: "1.15", letterSpacing: "-0.025em" }],
        // 数字そのものをデザインの要素として扱う
        stat: ["clamp(48px, 16vw, 140px)", { lineHeight: "0.88", letterSpacing: "-0.05em" }],
      },
    },
  },
  plugins: [],
};

export default config;
