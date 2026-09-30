import { existsSync } from "node:fs";
import { join } from "node:path";

// public/ に、そのファイルが置いてあるか。
//
// ══════════════════════════════════════════════════
// なぜ要るか
// ══════════════════════════════════════════════════
// 「置いてあれば出す、無ければ出さない」をやりたい場所が増えた。
//   1画面目の絵（moments.png）
//   紹介動画の表紙（video-poster.jpg）
//
// パスを直に書くと、ファイルが置かれるまでのあいだ、
// 壊れた画像の印が出続ける。
//
// サーバー側で1回だけ確かめる。
// 画面が出来上がる時点で決まるので、あとから化けない。
//
// ══════════════════════════════════════════════════
// server component からだけ呼ぶこと
// ══════════════════════════════════════════════════
// node:fs を読むので、"use client" の中では動かない。
// client に渡したいときは、server 側で呼んで結果を props で渡す。

/** 例: hasPublicFile("/img/moments.png") */
export function hasPublicFile(path: string): boolean {
  if (!path.startsWith("/")) return false;
  // 上へ辿らせない
  if (path.includes("..")) return false;
  return existsSync(join(process.cwd(), "public", path));
}
