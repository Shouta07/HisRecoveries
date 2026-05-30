import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const runtime = "edge";
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
          background: "#F2EAD9",
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
            top: 60,
            left: 80,
            fontSize: 22,
            color: "#6B6B6B",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          since 2026
        </div>

        <div
          style={{
            fontSize: 96,
            color: "#1A1A1A",
            letterSpacing: "0.05em",
            fontWeight: 300,
            lineHeight: 1,
            display: "flex",
          }}
        >
          {site.name}
        </div>

        <div
          style={{
            marginTop: 32,
            fontSize: 30,
            color: "#6B6B6B",
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
            color: "#8B7355",
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
