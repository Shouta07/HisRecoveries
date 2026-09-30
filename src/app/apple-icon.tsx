import { ImageResponse } from "next/og";

// ホーム画面に置いたときの絵。
//
// 角の丸めは端末側がやるので、こちらは角を丸めない。
// 丸めると、二重に丸まって小さく見える。
// 地は白。透過にすると、端末によって黒地に緑で沈む。

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FFFFFF",
        }}
      >
        <svg viewBox="0 0 32 32" width="148" height="148">
          <path
            d="M3 20a13 13 0 0 1 26 0v3a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3Z"
            fill="#15803D"
          />
          <path
            d="M10.6 17.4l3.9 3.9 7-7.4"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
