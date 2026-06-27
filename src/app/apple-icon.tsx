import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * Apple touch icon — "H" monogram + wordmark on deep forest green,
 * matching the current His Recoveries identity (forest, sage accent).
 */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(150deg, #1b2c20 0%, #16241a 55%, #0e150d 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        {/* H monogram */}
        <div style={{ position: "relative", width: 78, height: 84, display: "flex" }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: 15, height: 84, background: "#EDF1E8" }} />
          <div style={{ position: "absolute", right: 0, top: 0, width: 15, height: 84, background: "#EDF1E8" }} />
          <div style={{ position: "absolute", left: 0, top: 34.5, width: 78, height: 15, background: "#85AB8B" }} />
        </div>

        <div style={{ marginTop: 22, width: 40, height: 1, background: "rgba(133,171,139,0.6)" }} />

        <div
          style={{
            marginTop: 14,
            color: "#EDF1E8",
            fontSize: 12,
            fontFamily: "serif",
            letterSpacing: 4,
            opacity: 0.82,
            display: "flex",
          }}
        >
          HIS RECOVERIES
        </div>
      </div>
    ),
    { ...size }
  );
}
