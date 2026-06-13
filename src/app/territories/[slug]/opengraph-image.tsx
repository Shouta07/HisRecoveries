import { ImageResponse } from "next/og";
import { getTerritory } from "@/lib/territories";
import { site } from "@/lib/site";

export const runtime = "nodejs";
export const alt = "His Recoveries — 原因を読む";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: { slug: string } }) {
  const t = await getTerritory(params.slug);
  const title = t ? `${t.title}は、\nなぜ起こるのか` : site.name;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#F2EAD9",
          display: "flex",
          flexDirection: "column",
          padding: "80px",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            fontSize: 26,
            color: "#221A11",
            letterSpacing: "0.05em",
            fontWeight: 300,
            display: "flex",
          }}
        >
          {site.name}
        </div>

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              fontSize: 22,
              color: "#8E6A36",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            原因を読む
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 64,
              color: "#221A11",
              lineHeight: 1.35,
              letterSpacing: "0.02em",
              whiteSpace: "pre-wrap",
              display: "flex",
              maxWidth: 1040,
            }}
          >
            {title}
          </div>
        </div>

        <div
          style={{
            marginTop: 48,
            paddingTop: 24,
            borderTop: "1px solid #D8CBB0",
            display: "flex",
            justifyContent: "space-between",
            fontSize: 18,
            color: "#8E6A36",
            letterSpacing: "0.2em",
          }}
        >
          <div style={{ display: "flex" }}>HISRECOVERIES.COM</div>
          <div style={{ display: "flex" }}>RECOVER YOUR PRESENCE</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
