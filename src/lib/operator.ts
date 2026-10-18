import { site } from "./site";
import { BEEN, STANCE } from "./been";

/* ══════════════════════════════════════════════════
   答える人のこと
   ══════════════════════════════════════════════════

   ── 顔も動画もフォロワーも無い前提で作る ──────────
   知名度で信じてもらうことはできない。
   代わりに置けるのは「何を確かめていて、何を確かめていないか」を
   こちらから先に言うこと。

   隠していないことが、いちばん強い材料になる。

   ── 事実として言えること ────────────────────────
     運営会社      バイタリティデザイン合同会社（登記）
     代表者        特商法の表記に出している
     行った国・地域 15（lib/been.ts）
     問い合わせ先   メール

   ── 言えないこと ────────────────────────────────
     呼び名        どう呼ばれたいか、聞いていない
     旅のスタイル   どういう旅をする人か、聞いていない
     始めた理由     なぜこれを始めたか、聞いていない

   この3つは、紹介のページで読む人がいちばん知りたいところ。
   それでも、こちらでは書けない。書いたらそれは作り話になる。

   下の OPERATOR_OPEN に残してある。
   残っているあいだ、その節は画面に出ない。
   埋めたら出る。 */

/** 会社。登記されている事実 */
export const COMPANY = site.company.name;

/** 行った国・地域。been.ts が持つ */
export const VISITED = BEEN;

/** 名乗り。been.ts が持つ（専門家でも在住者でもガイドでもない） */
export const HOW_I_ANSWER = STANCE;

/** 問い合わせ先 */
export const CONTACT = site.company.email;

/**
 * 運営者から聞けていないこと。
 *
 * 聞けたら、下の PROFILE に足して、ここから消す。
 * 残っているものは、画面に出ない。
 */
export const OPERATOR_OPEN: { key: keyof Profile; label: string; why: string }[] = [
  {
    key: "callMe",
    label: "呼び名",
    why: "相談相手を「誰か」として覚えてもらうのに要ります。本名でなくてかまいません",
  },
  {
    key: "style",
    label: "旅のスタイル",
    why: "どういう旅をする人かが分かると、自分と合うかを判断できます（例：宿は安いところ、移動は現地の交通、予定は決めすぎない）",
  },
  {
    key: "why",
    label: "このサービスを始めた理由",
    why: "知名度の代わりになるのは、ここだけです。実際にあったことを3〜5行で",
  },
];

/* ══════════════════════════════════════════════════
   旅の写真
   ══════════════════════════════════════════════════
   見本には、ピラミッドと九份の写真が「実際に旅した経験」の
   見出しの下に並んでいた。置いていない。

   素材サイトの写真をそこへ置くと、読む人には
   本人が撮ったものと区別がつかない。
   行った証拠として見せているのに、行っていない写真になる。

   空のあいだ、その枠は出ない（線画と地図だけになる）。

   足すときは public/img/trips/ に置いて、ここに書く。
   置き場所を分けてあるのは、素材サイトの画像が
   まぎれ込まないようにするため（下の判定が見る）。

   country は been.ts の15のどれか。
   行っていない国の写真は、公開の前に止まる。 */
export type TripPhoto = {
  src: string;
  /** 何が写っているか。読み上げにも、写真が出ないときにも使う */
  alt: string;
  /** どこで撮ったか。been.ts の15のどれか */
  country: string;
};

/** 運営者が撮った写真だけ。いまは空 */
export const TRIP_PHOTOS: TripPhoto[] = [];

export type Profile = {
  callMe: string | null;
  style: string | null;
  why: string | null;
};

/**
 * 運営者が埋めるところ。
 *
 * いまは全部 null。埋めたら、その節が画面に出ます。
 * 埋めたら OPERATOR_OPEN からも消してください（判定が食い違いを見ます）。
 */
export const PROFILE: Profile = {
  callMe: null,
  style: null,
  why: null,
};

/** 画面に出せる項目だけを返す */
export function profileFilled(): { key: keyof Profile; label: string; text: string }[] {
  const labels: Record<keyof Profile, string> = {
    callMe: "呼び名",
    style: "旅のスタイル",
    why: "このサービスを始めた理由",
  };
  return (Object.keys(labels) as (keyof Profile)[])
    .filter((k) => PROFILE[k])
    .map((k) => ({ key: k, label: labels[k], text: PROFILE[k] as string }));
}

/* ── 公開の前に止めること ───────────────────────── */
{
  /* ── 埋めたのに、未確認のまま残っていないこと ──────
     逆も止める。空なのに「確認済み」の側へ移っていないこと。
     ここがずれると、画面に出ているのに
     「未確認です」と書いてある状態になる。 */
  for (const o of OPERATOR_OPEN) {
    if (PROFILE[o.key]) {
      throw new Error(
        `「${o.label}」は埋まっているのに、未確認の一覧に残っています` +
          `（lib/operator.ts の OPERATOR_OPEN から消してください）`,
      );
    }
    if (!o.why) throw new Error(`「${o.label}」に、なぜ要るかが書かれていません`);
  }
  const openKeys = new Set(OPERATOR_OPEN.map((o) => o.key));
  for (const k of ["callMe", "style", "why"] as (keyof Profile)[]) {
    if (!PROFILE[k] && !openKeys.has(k)) {
      throw new Error(
        `「${k}」が空なのに、未確認の一覧にもありません。` +
          `埋めるか、OPERATOR_OPEN へ戻してください`,
      );
    }
  }

  /* ── 書いたものが、名乗りと食い違わないこと ────────
     「旅のプロです」と書かれたら、been.ts の名乗りと衝突する。 */
  for (const { label, text } of profileFilled()) {
    for (const w of ["専門家", "精通", "熟知", "全域", "最新事情", "プロガイド", "現地在住"]) {
      if (text.includes(w)) {
        throw new Error(`${label} に「${w}」が入っています。行ったことがある、までが事実です`);
      }
    }
    for (const w of ["たち", "チーム", "スタッフ", "待機"]) {
      if (text.includes(w)) {
        throw new Error(`${label} に「${w}」が入っています。対応するのは1人です`);
      }
    }
  }

  /* ── 写真は、撮った本人のものだけ ──────────────────
     置き場所を限ると、素材サイトから落としたものを
     そのまま並べにくくなる。 */
  for (const ph of TRIP_PHOTOS) {
    if (!ph.src.startsWith("/img/trips/")) {
      throw new Error(
        `旅の写真が /img/trips/ の外にあります（${ph.src}）。` +
          `運営者が撮ったものだけを、そこへ置いてください`,
      );
    }
    if (!ph.alt) throw new Error(`旅の写真（${ph.src}）に、説明（alt）がありません`);
    if (!BEEN.includes(ph.country)) {
      throw new Error(
        `旅の写真の撮影地が「${ph.country}」になっていますが、` +
          `行ったことのある国・地域（lib/been.ts）に入っていません`,
      );
    }
  }

  if (!COMPANY) throw new Error("運営会社が書かれていません");
  if (!CONTACT) throw new Error("問い合わせ先が書かれていません");
  if (VISITED.length !== 15) {
    throw new Error(`行った国・地域が ${VISITED.length} 個です（確認できているのは15）`);
  }
}
