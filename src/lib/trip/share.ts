import { mask } from "./mask";
import { CITIES } from "../voice";

/* ══════════════════════════════════════════════════
   家族に、日程を伝える
   ══════════════════════════════════════════════════

   ── なぜ LINE か ────────────────────────────────
   準備の骨格に「家族に日程を伝える」が入っている。
   ペルソナの不安にも「親に何て言うか」がある。

   初めて一人で海外へ行くとき、家族への共有はだいたい
   「心配させない説明」とセットになっていて、それが面倒で
   後回しになる。文を作って渡せば、そこが済む。

   日本で家族に送るなら LINE。それだけの理由。

   ── 連携はしない。共有だけ ──────────────────────
   LINE ログインも、公式アカウントも、通知も作らない。

   どれも、本人を特定できる口を開けることになる。
   このサービスは会員登録が無く、鍵を知っていることが
   本人の証拠、という作りで通してきた。
   そこに「LINEのユーザーID」を持つと、匿名ではなくなる。

   使うのは共有リンク（line.me/R/msg/text/）だけ。
   鍵も、アカウントも、こちらの保存も要らない。
   押すと LINE が開いて、本文が入った状態になる。送るのは本人。

   ── 宿名と便名は、送らせない ────────────────────
   家族に送るものなので、むしろ詳しく書きたくなる。
   ただ、この文はトーク画面に残り、転送もされる。

   こちらが作る文には、都市と日程と連絡の約束だけを入れる。
   宿や便を伝えたい人は、自分で書き足せばいい。
   こちらが初期値として入れない。 */

export type ShareTrip = {
  city: string;
  departAt: string;
  returnAt: string;
};

const fmt = (s: string) => {
  const d = new Date(s);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
};

/** 家族に送る文。本人が直せる前提で、短く */
export function familyText(t: ShareTrip): string {
  return [
    `${fmt(t.departAt)}から${fmt(t.returnAt)}まで、${t.city}にひとりで行ってきます。`,
    "着いたら連絡します。毎日1回は連絡するようにします。",
    "何かあったら、こちらから必ず連絡します。",
  ].join("\n");
}

/** LINE で送るためのリンク。鍵もアカウントも要らない */
export function lineShareUrl(text: string): string {
  return `https://line.me/R/msg/text/?${encodeURIComponent(text)}`;
}

/* ── 公開の前に止めること ───────────────────────── */
{
  const t: ShareTrip = { city: CITIES[0], departAt: "2026-11-14", returnAt: "2026-11-17" };
  const text = familyText(t);

  /* 都市と日程が入っていること。
     ここが抜けると、送る意味が無い。 */
  if (!text.includes(t.city)) throw new Error("家族に送る文に、行き先がありません");
  if (!/\d+月\d+日/.test(text)) throw new Error("家族に送る文に、日程がありません");

  /* 連絡の約束が入っていること。
     家族がいちばん知りたいのは、行き先ではなく
     「連絡が来るかどうか」。 */
  if (!/連絡/.test(text)) throw new Error("家族に送る文に、連絡の約束がありません");

  /* 宿名・便名を、こちらから入れないこと。
     トーク画面に残り、転送もされる。 */
  for (const w of ["ホテル", "便", "予約番号", "号室"]) {
    if (text.includes(w)) {
      throw new Error(`家族に送る文に「${w}」が入っています。こちらから初期値にしないでください`);
    }
  }
  if (mask(text).found !== 0) {
    throw new Error("家族に送る文に、伏せるべきものが入っています");
  }

  /* 不安を煽らないこと。
     一人旅は、ただでさえ家族に反対される。
     こちらが作る文が心配を増やしたら、本末転倒。 */
  for (const w of ["危険", "心配しないで", "もしものとき", "万が一"]) {
    if (text.includes(w)) {
      throw new Error(`家族に送る文に「${w}」が入っています。心配を増やさないでください`);
    }
  }

  /* 長くしないこと。LINE のトークで読み切れる長さ。 */
  if (text.length > 120) {
    throw new Error(`家族に送る文が ${text.length} 字あります（120字まで）`);
  }

  /* リンクが、ログインを要らない形であること。
     line.me/R/msg/text/ は共有だけ。
     ログイン（access.line.me）や公式アカウント（@）を使わない。 */
  const url = lineShareUrl(text);
  if (!url.startsWith("https://line.me/R/msg/text/")) {
    throw new Error(`共有リンクの形が違います（${url.slice(0, 40)}）`);
  }
  for (const w of ["access.line.me", "oauth", "client_id", "liff"]) {
    if (url.includes(w)) {
      throw new Error(`共有リンクに「${w}」が入っています。ログインは作りません（匿名のままにします）`);
    }
  }
}
