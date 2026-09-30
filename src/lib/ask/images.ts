import { dbAdminEnabled } from "../db";

// 画像を受け取る。
//
// ══════════════════════════════════════════════════
// なぜ、いままで作らなかったか
// ══════════════════════════════════════════════════
// 相談に添える画像には、相談者だけでなく
// 相手（第三者）の顔・名前・LINEのIDが写る。
// その人はこのサービスに同意していない。
//
// 文字なら機械で伏せられる（redact.ts）。画像は伏せられない。
// だから、置き場所と見せ方を先に決めるまで開けなかった。
//
// ══════════════════════════════════════════════════
// 開ける条件を、環境変数1つにする
// ══════════════════════════════════════════════════
// IMAGES_BUCKET に、非公開のバケット名を入れたときだけ開く。
//
// 「Supabaseが繋がっているから開く」にはしない。
// 公開バケットのまま開くと、第三者のLINEのやりとりが
// URLを知っている人全員に見える状態になる。
// バケットを作って非公開にした人が、明示的に名前を入れる。
//
// ══════════════════════════════════════════════════
// 公開URLを作らない
// ══════════════════════════════════════════════════
// 見るときは、そのつど短い期限の署名URLを作る。
// 恒久的なURLを1つでも作ったら、そこから漏れる。
//
// ══════════════════════════════════════════════════
// 原本を配らない
// ══════════════════════════════════════════════════
// 見られるのは
//   相談した本人（相談の鍵を持っている人）
//   その相談を受け持った人
//   運営
// だけ。それ以外の経路を作らない。

/** 非公開のバケット名。入っていなければ、画像の口は開かない */
const BUCKET = process.env.IMAGES_BUCKET?.trim() || "";

/** いま画像を受け取れるか */
export const imagesEnabled = Boolean(BUCKET && dbAdminEnabled);

/** バケット名。開いていないときに呼ばれたら落とす */
export function bucket(): string {
  if (!imagesEnabled) throw new Error("画像の置き場所が設定されていません");
  return BUCKET;
}

/**
 * 1回の相談に付けられる枚数。
 *
 * LINEのやりとりは、8枚くらいになることがある。
 * 5枚だと足りなくて、途中で切ることになる。
 * 20枚だと、読む人が読み切れない。
 */
export const MAX_FILES = 10;

/** 1枚の大きさ。スマホの写真はだいたい2〜5MB */
export const MAX_BYTES = 8 * 1024 * 1024;

/**
 * 受け取る種類。
 *
 * HEIC はiPhoneの既定。これを弾くと、
 * iPhoneの人が設定を変えるまで何も送れない。
 */
export const TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;

export function isAllowedType(t: unknown): t is (typeof TYPES)[number] {
  return typeof t === "string" && (TYPES as readonly string[]).includes(t);
}

/** 見るための署名URLの期限（秒）。長くしない */
export const SIGNED_TTL = 300;

/** 画面に出す言葉 */
export const IMAGE_COPY = {
  add: "写真・スクリーンショットを足す",
  hint: `${MAX_FILES}枚まで。LINEのやりとりは、そのまま並べて送って構いません。`,
  /**
   * 押す前に必ず読ませる。
   *
   * 「顔が写っていても構いません」とは書かない。
   * 同じ画面の下に「相手を特定できることは書かないでください」があって、
   * 読む人はどちらを信じればいいのか分からなくなる。
   *
   * スクリーンショットには、消せないものが写る。それは事実として認める。
   * そのうえで、どう扱うかだけを書く。
   */
  warn:
    "スクリーンショットには、相手の名前やアイコンが写ります。読んだ人以外には見えません。保存期間を過ぎたら消します。",
  /** 削除の言い方 */
  remove: "外す",
  /** 相談の中で、文字と画像が1回であることを言う */
  one: "文章でも、画像でも。判断材料はまとめて送ってOK。",
};

/** 保存しておく期間（日）。過ぎたものは消す */
export const KEEP_DAYS = 90;

/** 置き場所の道。相談ごとに分ける */
export function pathFor(consultToken: string, n: number, ext: string): string {
  return `c/${consultToken}/${String(n).padStart(2, "0")}.${ext}`;
}

/** 種類から拡張子 */
export function extOf(type: string): string {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/heic" || type === "image/heif") return "heic";
  return "jpg";
}

/* ── 公開の前に止めること ───────────────────────── */
{
  // 既定で開かないこと。
  // 何も設定していない環境で開くと、置き場所が無いまま
  // 「送れます」と言うことになる。
  if (!BUCKET && imagesEnabled) {
    throw new Error("置き場所が無いのに、画像の口が開いています");
  }

  // iPhone の既定（HEIC）を受け取れること。
  // 弾くと、iPhoneの人は設定を変えるまで1枚も送れない。
  if (!isAllowedType("image/heic")) {
    throw new Error("HEIC を受け取れません（iPhone の既定の形式です）");
  }

  // 枚数。LINEのやりとりは8枚くらいになる。
  if (MAX_FILES < 8) throw new Error("送れる枚数が少なすぎます（LINEのやりとりが切れます）");
  if (MAX_FILES > 20) throw new Error("送れる枚数が多すぎます（読む人が読み切れません）");

  // 署名URLの期限。長いと、渡ったURLがそのまま生き続ける。
  if (SIGNED_TTL > 900) throw new Error("署名URLの期限が長すぎます");

  // 押す前の断りに、誰に見えるのかが書かれていること。
  // 相手の顔が写ったものを送る画面なので、ここを省かない。
  if (!IMAGE_COPY.warn.includes("読んだ人以外には見えません")) {
    throw new Error("画像を足す画面に、誰に見えるのかが書かれていません");
  }
  if (!IMAGE_COPY.warn.includes("消します")) {
    throw new Error("画像を足す画面に、いつ消えるのかが書かれていません");
  }

  // 置き場所の道が、相談ごとに分かれていること。
  // 1つのフォルダに混ぜると、隣の相談の画像が見える設計になりやすい。
  if (!pathFor("ctest", 1, "jpg").startsWith("c/ctest/")) {
    throw new Error("画像の置き場所が、相談ごとに分かれていません");
  }
}
