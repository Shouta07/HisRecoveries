import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const runtime = "edge";
export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// 深緑のブランドカラーデザイン（サイトのヒーローと同じ register）。
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background:
            "radial-gradient(circle at 50% 22%, #263a2c 0%, #1E2A38 58%, #161F2A 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "80px",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 64,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            fontSize: 20,
            color: "#C28863",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
          }}
        >
          Men&apos;s Wellness Concierge
        </div>

        <div
          style={{
            fontSize: 104,
            color: "#F3F0EA",
            letterSpacing: "0.04em",
            fontWeight: 400,
            lineHeight: 1,
            display: "flex",
          }}
        >
          His <span style={{ color: "#C28863", marginLeft: 24 }}>Recoveries</span>
        </div>

        <div
          style={{
            marginTop: 34,
            fontSize: 30,
            color: "#C6CAD0",
            letterSpacing: "0.05em",
            display: "flex",
          }}
        >
          {site.tagline}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 60,
            left: 80,
            right: 80,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 18,
            color: "#7f9a84",
            letterSpacing: "0.2em",
          }}
        >
          <div style={{ display: "flex" }}>HISRECOVERIES.COM</div>
          <div style={{ display: "flex" }}>—</div>
          <div style={{ display: "flex" }}>RECOVER YOUR PRESENCE</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
