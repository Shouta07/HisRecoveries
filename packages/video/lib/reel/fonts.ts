// リール用の書体をローカル(public/fonts)から読む。オフラインでも確実に同じ絵になる。
// 明朝(Shippori Mincho B1) = 見出し / Noto Sans JP = 補助 / Cormorant = ロゴタイプ。
import { staticFile, delayRender, continueRender } from "remotion";
import { FONTS } from "../brand";

let started = false;

type Face = { family: string; weight: number; file: string; unicodeRange?: string };

const FACES: Face[] = [
  // 明朝は和文と欧文でファイルが分かれている（fontsource の subset）。
  // 同じ family 名で両方登録すると、ブラウザが字ごとに使い分ける。
  { family: FONTS.mincho, weight: 400, file: "fonts/shippori-mincho-jp-400.woff2" },
  { family: FONTS.mincho, weight: 400, file: "fonts/shippori-mincho-latin-400.woff2" },
  { family: FONTS.sans, weight: 400, file: "fonts/notosansjp-400.woff2" },
  { family: FONTS.sans, weight: 700, file: "fonts/notosansjp-700.woff2" },
  { family: FONTS.logo, weight: 300, file: "fonts/cormorant-garamond-300.woff2" },
  { family: FONTS.logo, weight: 400, file: "fonts/cormorant-garamond-400.woff2" },
];

/**
 * 書体の読み込みを保証する。全シーンの先頭で1度だけ呼ぶ。
 * 読み終わるまで Remotion のレンダリングを待たせる（＝1枚目から明朝で出る）。
 */
export function ensureReelFonts(): void {
  if (started || typeof document === "undefined") return;
  started = true;
  const handle = delayRender("load-reel-fonts");

  const style = document.createElement("style");
  style.textContent = FACES.map(
    (f) =>
      `@font-face{font-family:'${f.family}';src:url('${staticFile(
        f.file,
      )}') format('woff2');font-weight:${f.weight};font-style:normal;font-display:block;}`,
  ).join("\n");
  document.head.appendChild(style);

  Promise.all([
    document.fonts.load(`400 82px "${FONTS.mincho}"`),
    document.fonts.load(`400 34px "${FONTS.sans}"`),
    document.fonts.load(`300 76px "${FONTS.logo}"`),
    document.fonts.load(`400 76px "${FONTS.logo}"`),
  ])
    .then(() => continueRender(handle))
    .catch(() => continueRender(handle));
}
