import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { ogFont } from "@/lib/ogFont";
import { site } from "@/lib/site";
import { NAME, FULL, HERO_A, HERO_B } from "@/lib/voice";
import { STATUS_LINE, MVP } from "@/lib/concept";

// X・Threads・LINE に貼ったときのカード。
//
// ── ここは広告そのもの ────────────────────────────
// 投稿を回すほど、文章よりこのカードのほうが多く見られる。
//
// ── ここだけ、検査をすり抜けていた ────────────────
// 商品が変わったとき、画面7枚の文字は実測で確かめた。
// ここは PNG を描くので、HTML に文字が出ない。
// だから「古い文が残っていないこと」の確認から漏れて、
// マチアプ版の文がそのまま残っていた。
//
//   大事な相手だから、失敗する前に相談する。
//   送る前のLINE、アプリの自己紹介文。実在する◯◯人が読んで——
//
// リンクを貼るたびに、やめた商品の広告が出ていた。
// 絵の中の文字は、目で見ないと分からない。
// 以後は check-who が、持っていない商品の言葉を全ファイルで探す。
//
// ── 載せるのは4つだけ ─────────────────────────────
// 名前 / 何をするものか / いくら / 含まないもの。
//
// 人数・満足度・口コミは載せない。
// まだ無いものを、いちばん見られる場所に書かない。
//
// 「緊急時は含まない」は、カードにも載せる。
// ここを省くと、助けを呼べる先だと思って貼られる。

export const alt = `${FULL} — ${HERO_A}${HERO_B}（${STATUS_LINE}）`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* 画面と同じ色を使う。
   ここだけ前の青が残ると、カードから入った人が
   別のサイトに来たと感じる（tailwind.config.ts と同じ値）。 */
const INK = "#22251F";
const SUB = "#62675C";
const BRAND = "#1F4B3A";
const RULE = "#E2DED1";
const CREAM = "#FAF7EF";

/** マークを埋め込む。satori は URL を取りに行かないので、中身を渡す */
function mark(): string {
  const file = path.join(process.cwd(), "public", "img", "tashikame-mark-128.png");
  return `data:image/png;base64,${fs.readFileSync(file).toString("base64")}`;
}

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: CREAM,
          borderTop: `14px solid ${BRAND}`,
          padding: "64px 80px 60px",
          fontFamily: "Noto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* マークは画像。ここで丸と点を描き直すと、サイト側と別のものになる */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mark()} width={56} height={56} alt="" />
          <div style={{ fontSize: 34, color: INK, display: "flex", letterSpacing: 2 }}>{NAME}</div>
        </div>

        {/* ── 自分で折る ──────────────────────────────
            68px で HERO_B1+HERO_B2 を1行に置いたら、
            satori が幅で折って3行になり、値段と行き先が
            1200×630 の外へ落ちた。絵なので、はみ出した分は
            切れて消えるだけで、警告もエラーも出ない。

            voice.ts が折る場所（B1 / B2）を持っているので、
            そこで折って、3行に収まる大きさにする。
            実際に書き出して目で見て決めた。 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[HERO_A, HERO_B].map((line) => (
            <div key={line} style={{ fontSize: 58, color: INK, display: "flex", lineHeight: 1.26 }}>
              {line}
            </div>
          ))}
          <div
            style={{ fontSize: 27, color: SUB, display: "flex", lineHeight: 1.55, marginTop: 10 }}
          >
            地域を深く知りたい旅行者と、その土地らしさで選ばれたい宿をつなぐ構想。{STATUS_LINE}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: `1px solid ${RULE}`,
            paddingTop: 26,
            fontSize: 24,
            color: SUB,
          }}
        >
          <div style={{ display: "flex" }}>構想段階 ／ まず {MVP.line}</div>
          <div style={{ display: "flex", color: BRAND }}>
            {site.url.replace(/^https?:\/\//, "")}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Noto", data: ogFont(), weight: 700, style: "normal" }],
    },
  );
}
