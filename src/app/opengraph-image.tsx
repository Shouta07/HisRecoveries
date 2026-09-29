import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { ogFont } from "@/lib/ogFont";
import { site } from "@/lib/site";
import { NAME, ONE_LINER } from "@/lib/voice";
import { ENTRY_PLAN, DEFAULT_PLAN, plan as getPlan } from "@/lib/ask/plans";

// X・Threads・LINE に貼ったときのカード。
//
// ── ここは広告そのもの ────────────────────────────
// 投稿を回すほど、文章よりこのカードのほうが多く見られる。
// 以前は記事メディアの説明が出ていた（「男性の美容・健康・恋愛を、
// 編集部が調べて書いています」）ので、商品のリンクを貼っても
// 何を売っているか分からなかった。
//
// ── 載せるのは4つだけ ─────────────────────────────
// 名前 / 何をするものか / 誰が読むのか / いくらから。
// 実績や人数の主張は載せない（売れてから、実数で書く）。
//
// 記事の一覧側は src/app/articles/opengraph-image.tsx が持つ。

export const alt = `${NAME} — ${ONE_LINER}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** マークを埋め込む。satori は URL を取りに行かないので、中身を渡す */
function mark(): string {
  const file = path.join(process.cwd(), "public", "img", "tashikame-mark-128.png");
  return `data:image/png;base64,${fs.readFileSync(file).toString("base64")}`;
}

export default async function Image() {
  const entry = getPlan(ENTRY_PLAN);
  const main = getPlan(DEFAULT_PLAN);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#FFFFFF",
          borderTop: "14px solid #2563EB",
          padding: "64px 80px 60px",
          fontFamily: "Noto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* マークは画像。ここで丸と点を描き直すと、サイト側と別のものになる */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mark()} width={56} height={56} alt="" />
          <div style={{ fontSize: 34, color: "#0F172A", display: "flex", letterSpacing: 2 }}>
            {NAME}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <div style={{ fontSize: 70, color: "#0F172A", display: "flex", lineHeight: 1.28 }}>
            大事な相手だから、
          </div>
          <div style={{ fontSize: 70, color: "#0F172A", display: "flex", lineHeight: 1.28 }}>
            失敗する前に相談する。
          </div>
          <div style={{ fontSize: 30, color: "#5B6676", display: "flex", lineHeight: 1.6 }}>
            送る前のLINE、アプリの自己紹介文。実在の女性{main.answers}人が読んで、正直に返します。
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid #E4E9F0",
            paddingTop: 26,
            fontSize: 24,
            color: "#5B6676",
          }}
        >
          <div style={{ display: "flex" }}>
            ¥{entry.yen.toLocaleString()}から / 1回ごと / 匿名
          </div>
          <div style={{ display: "flex", color: "#2563EB" }}>
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
