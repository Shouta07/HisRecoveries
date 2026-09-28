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
        // ── 2026-09 デザイン刷新 ───────────────────────────
        // 見本に合わせて、地を白・主色を青に変える。
        // 狙いは「スッと分かる」こと。編集的な生成りとライムは、
        // 目を引く代わりに、読み解く一拍を要求していた。
        //
        // 使い分け:
        //   brand   ボタンの面・選択中・強調。白文字を載せてよい（5.17:1）
        //   ok      良い側の反応。リング(stroke)と面にだけ使う
        //   ok-text 同じ緑でも文字にするときはこちら（4.54:1）
        // 緑を文字に使うときに ok を使うと 3.16:1 で AA に届かない。
        paper: "#FFFFFF",       // 地
        mist: "#F4F7FB",        // 帯・へこませたい面（わずかに青い）
        brand: "#2563EB",       // 主色
        "brand-deep": "#1D4ED8", // 押したとき・濃い面
        "brand-tint": "#EAF1FE", // 選択中の淡い面
        ok: "#16A34A",          // 良い側。面とリングだけ
        "ok-text": "#15803D",   // 良い側の文字
        "ok-tint": "#E8F7EE",
        slate: "#0F172A",       // 見出し・本文の濃い側
        steel: "#5B6676",       // 本文・補足（白の上で 6.1:1）
        line: "#E4E9F0",        // 白地の罫線
        "line-dark": "#2B3648", // 暗い面の罫線（slate の上で見える濃さ）
        "steel-dark": "#C3CCD9", // 暗い面の本文・補足（slate の上で 10.1:1）

        bone: "#F2F0EC",        // 温かいオフホワイト — 地
        void: "#0A0A0A",        // 黒 — 反転面と大見出し
        ash: "#6E6A63",         // 温かいグレー — 本文（地の上で 4.77:1、AA）
        "ash-soft": "#9A948B",  // 装飾・キャプションだけ。本文に使わない
        lime: "#CCFF00",        // アクセント1色。面と、黒地の上の文字だけ
        // C2C の親しみやすさ用。
        // 角を落として白いカードを並べると、硬い罫線より柔らかい影が要る。
        // 影は濃くしない。濃いと「管理画面」に戻る。
        card: "#FFFFFF",        // カードの面
        "bone-soft": "#F7F5F2", // 帯・へこませたい面
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
      // 360px 前後で折り返しを変えたい場所がある。
      // Tailwind の既定は sm=640px からで、そこまで何も切り替わらない。
      screens: {
        xs: "380px",
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
      // 角丸。0px の直角は編集的で強いが、消費者向けだと硬く見える。
      borderRadius: {
        card: "16px",
        soft: "12px",
        pill: "999px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(10,10,10,0.04), 0 4px 16px rgba(10,10,10,0.05)",
        "card-hover": "0 2px 6px rgba(10,10,10,0.06), 0 10px 28px rgba(10,10,10,0.08)",
      },
      fontSize: {
        // 本文と見出しのサイズ差を大きくする。
        // 画面幅で伸ばすので、スマホでも大見出しが大見出しのままになる。
        // 80〜132px は広告の寸法で、アプリでは威圧的に見える。
        // 読める大きさまで落として、丸みと余白で印象を作る。
        mega: ["clamp(30px, 6.2vw, 52px)", { lineHeight: "1.25", letterSpacing: "-0.025em" }],
        huge: ["clamp(26px, 4.6vw, 40px)", { lineHeight: "1.35", letterSpacing: "-0.02em" }],
        big: ["clamp(21px, 3.2vw, 28px)", { lineHeight: "1.45", letterSpacing: "-0.015em" }],
        // 数字そのものをデザインの要素として扱う
        stat: ["clamp(34px, 7vw, 56px)", { lineHeight: "1", letterSpacing: "-0.03em" }],
      },
    },
  },
  plugins: [],
};

export default config;
