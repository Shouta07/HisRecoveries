import { ImageResponse } from "next/og";
import { complexById } from "@/lib/complexes";
import { clusters, getCluster } from "@/lib/clusters";
import { ogFont } from "@/lib/ogFont";
import { site } from "@/lib/site";

// 記事ごとのOG画像。
//
// これまで55本すべてが同じ絵だった。シェアされてもどの記事か分からず、
// タイムライン上でクリックされる理由がなかった。
// 記事のタイトルと分野を焼き込むだけで、そこが変わる。
//
// 絵は載せない（記事に写真がないので、あるように見せない）。
// 生成りの地・墨のタイトル・銅の罫線で、サイトと同じ見え方にする。

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = site.name;

export function generateStaticParams() {
  return clusters.map((c) => ({ id: c.areaId, slug: c.slug }));
}

export default async function Image({ params }: { params: { id: string; slug: string } }) {
  const a = getCluster(params.id, params.slug);
  const c = complexById(params.id);
  const title = a?.title ?? site.name;
  const area = c?.ja ?? "";

  // 長いタイトルは文字を落とす（切り詰めない。全部読ませる）
  const fontSize = title.length > 34 ? 54 : title.length > 24 ? 62 : 72;

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
          <div style={{ fontSize: 26, color: "#2F6F79", display: "flex" }}>{area}</div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize,
            lineHeight: 1.42,
            color: "#1B2024",
            letterSpacing: "0.01em",
            maxWidth: 1000,
          }}
        >
          {title}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid #D6DCDC",
            paddingTop: 28,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 32, color: "#1B2024", display: "flex" }}>His Recoveries</div>
            <div style={{ fontSize: 20, color: "#5E6E76", display: "flex" }}>男性ウェルネスメディア</div>
          </div>
          <div style={{ fontSize: 20, color: "#5E6E76", display: "flex" }}>hisrecoveries.com</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Noto", data: ogFont(), weight: 700, style: "normal" }],
    },
  );
}
