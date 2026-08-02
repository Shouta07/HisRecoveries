import { ImageResponse } from "next/og";
import { ogFont } from "@/lib/ogFont";
import { site } from "@/lib/site";

// サイト共通のOG画像（記事以外のページで使う）。
//
// 以前は edge ランタイム＋ fontFamily: "serif" だった。日本語のフォントを
// 積んでいなかったので、タグラインを日本語にした時点で豆腐になる。
// 記事側のOG画像と同じ組みに揃え、フォントも同じものを積む。

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
          background: "#F1F3F3",
          padding: "72px 80px",
          fontFamily: "Noto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 44, height: 3, background: "#2F6F79", display: "flex" }} />
          <div style={{ fontSize: 26, color: "#2F6F79", display: "flex" }}>{site.tagline}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 84, color: "#1B2024", display: "flex" }}>His Recoveries</div>
          <div style={{ fontSize: 30, color: "#414A50", display: "flex", lineHeight: 1.6 }}>
            髪、肌、眠り、疲れ、体、パートナーとのこと。
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid #D6DCDC",
            paddingTop: 28,
            fontSize: 20,
            color: "#5E6E76",
          }}
        >
          <div style={{ display: "flex" }}>男性の美容・健康・恋愛を、編集部が調べて書いています</div>
          <div style={{ display: "flex" }}>hisrecoveries.com</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Noto", data: ogFont(), weight: 700, style: "normal" }],
    },
  );
}
