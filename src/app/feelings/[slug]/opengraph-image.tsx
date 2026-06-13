import { ImageResponse } from "next/og";
import { getFeeling } from "@/lib/feelings";
import { site } from "@/lib/site";

export const runtime = "nodejs";
export const alt = "His Recoveries";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: { slug: string } }) {
  const f = getFeeling(params.slug);
  const title = f ? f.statement : site.name;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#1C2230",
          display: "flex",
          flexDirection: "column",
          padding: "80px",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            fontSize: 26,
            color: "#F2EAD9",
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
              color: "#C79A4B",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            A Feeling
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 68,
              color: "#F7F1E3",
              lineHeight: 1.4,
              letterSpacing: "0.02em",
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
            borderTop: "1px solid #3A4254",
            display: "flex",
            justifyContent: "space-between",
            fontSize: 18,
            color: "#C79A4B",
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
