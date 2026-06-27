import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * Brand favicon — an "H" monogram in cream + sage on deep forest green,
 * matching the current His Recoveries identity (forest hero, sage accent).
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(150deg, #1b2c20 0%, #16241a 55%, #0e150d 100%)",
          borderRadius: 7,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* H monogram */}
        <div style={{ position: "relative", width: 17, height: 18, display: "flex" }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: 3.4, height: 18, background: "#EDF1E8" }} />
          <div style={{ position: "absolute", right: 0, top: 0, width: 3.4, height: 18, background: "#EDF1E8" }} />
          <div style={{ position: "absolute", left: 0, top: 7.4, width: 17, height: 3.2, background: "#85AB8B" }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
