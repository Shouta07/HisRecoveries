import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#1A1A1A",
          color: "#FAFAF7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          fontFamily: "serif",
          fontWeight: 300,
          letterSpacing: "-0.05em",
        }}
      >
        H
      </div>
    ),
    { ...size }
  );
}
