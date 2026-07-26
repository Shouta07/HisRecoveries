// Noto Sans JP をローカル（public/fonts）から読み込む。オフラインで確実に。
import { staticFile, delayRender, continueRender } from "remotion";
import { FONT } from "./theme";

let started = false;

export function ensureFont(): void {
  if (started || typeof document === "undefined") return;
  started = true;
  const handle = delayRender("load-noto-sans-jp");

  const faces = [
    { weight: 400, file: "fonts/notosansjp-400.woff2" },
    { weight: 700, file: "fonts/notosansjp-700.woff2" },
    { weight: 900, file: "fonts/notosansjp-900.woff2" },
  ];

  const style = document.createElement("style");
  style.textContent = faces
    .map(
      (f) =>
        `@font-face{font-family:'${FONT}';src:url('${staticFile(
          f.file,
        )}') format('woff2');font-weight:${f.weight};font-style:normal;font-display:block;}`,
    )
    .join("\n");
  document.head.appendChild(style);

  Promise.all([
    document.fonts.load(`900 120px "${FONT}"`),
    document.fonts.load(`700 60px "${FONT}"`),
    document.fonts.load(`400 40px "${FONT}"`),
  ])
    .then(() => continueRender(handle))
    .catch(() => continueRender(handle));
}
