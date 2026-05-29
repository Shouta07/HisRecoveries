import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * Apple touch icon — same brand sigil + small wordmark caption.
 * Reads as an editorial seal on iOS home screen / Safari pinned tabs.
 */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background:
            "radial-gradient(circle at 68% 24%, rgba(217,181,132,0.20) 0%, #0E0C09 65%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 18,
        }}
      >
        <div
          style={{
            width: 102,
            height: 102,
            borderRadius: "50%",
            border: "1.5px solid rgba(184, 145, 105, 0.36)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 66,
              height: 66,
              borderRadius: "50%",
              border: "1.5px solid rgba(217, 181, 132, 0.55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "1.8px solid rgba(217, 181, 132, 0.78)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: "50%",
                  background: "#D9B584",
                }}
              />
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 18,
            width: 36,
            height: 1,
            background: "rgba(184, 145, 105, 0.6)",
          }}
        />

        <div
          style={{
            marginTop: 12,
            color: "#E8DCBF",
            fontSize: 11,
            fontFamily: "serif",
            letterSpacing: 4,
            opacity: 0.78,
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
