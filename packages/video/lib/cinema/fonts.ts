// Inter（欧文）と Noto Sans JP（和文）をローカル(public/fonts)から読む。
// weight 300 が主役。太くしないことがブランドの規律なので 700/900 は積まない。
import { staticFile, delayRender, continueRender } from "remotion";
import { FONT } from "./theme";

let started = false;

const FACES = [
  { family: FONT.latin, weight: 300, file: "fonts/inter-300.woff2" },
  { family: FONT.latin, weight: 400, file: "fonts/inter-400.woff2" },
  { family: FONT.jp, weight: 300, file: "fonts/notosansjp-300.woff2" },
  { family: FONT.jp, weight: 400, file: "fonts/notosansjp-400.woff2" },
];

export function ensureCinemaFonts(): void {
  if (started || typeof document === "undefined") return;
  started = true;
  const handle = delayRender("load-cinema-fonts");

  const style = document.createElement("style");
  style.textContent = FACES.map(
    (f) =>
      `@font-face{font-family:'${f.family}';src:url('${staticFile(
        f.file,
      )}') format('woff2');font-weight:${f.weight};font-style:normal;font-display:block;}`,
  ).join("\n");
  document.head.appendChild(style);

  Promise.all([
    document.fonts.load(`300 58px "${FONT.latin}"`),
    document.fonts.load(`400 20px "${FONT.latin}"`),
    document.fonts.load(`300 56px "${FONT.jp}"`),
    document.fonts.load(`400 27px "${FONT.jp}"`),
  ])
    .then(() => continueRender(handle))
    .catch(() => continueRender(handle));
}
