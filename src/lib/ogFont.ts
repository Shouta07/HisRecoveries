import fs from "node:fs";
import path from "node:path";

// OG画像に日本語を描くためのフォント。
//
// satori（next/og の中身）は WOFF2 を読めないので WOFF を渡す。
// fontsource を自前ホストしているので、node_modules から直接読める
// （外部フェッチをしないぶん、ビルドがネットワークで落ちない）。
//
// runtime を edge にすると fs が使えずフォントを積めない。
// 日本語が全部豆腐になるので、OG画像は node ランタイムで動かすこと。

const FILES = "@fontsource/noto-sans-jp/files";

let cache: ArrayBuffer | null = null;

/** Noto Sans JP 700。見出し1本しか描かないので太字だけ積む */
export function ogFont(): ArrayBuffer {
  if (cache) return cache;
  const p = path.join(process.cwd(), "node_modules", FILES, "noto-sans-jp-japanese-700-normal.woff");
  const buf = fs.readFileSync(p);
  cache = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
  return cache;
}
