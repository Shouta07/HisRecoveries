/* ══════════════════════════════════════════════════
   この端末の、持ち主の鍵
   ══════════════════════════════════════════════════

   ── 会員登録を作らない ──────────────────────────
   タシカメはアカウントを作らせない（/mine の「控えを端末に置く」と同じ）。
   月額も同じにする。鍵を1つ端末に置いて、それを持ち主の証にする。

   ── 鍵が消えると、契約が迷子になる ────────────────
   ここが単発の相談と違うところ。相談は結果を見られなくなるだけだが、
   月額は**払い続けているのに解約できない**状態になる。

   だから、買う前に必ず断る（COPY_WARNING）。
   そして Stripe 側にも同じ鍵を渡してある（subscription_data.metadata）ので、
   鍵を失っても、問い合わせれば運営が辿れる。 */

const KEY = "tsk_me_v1";

/** 月額の持ち主の鍵。無ければ作る */
export function myToken(): string {
  if (typeof window === "undefined") return "";
  try {
    const got = window.localStorage.getItem(KEY);
    if (got && /^[A-Za-z0-9_-]{16,64}$/.test(got)) return got;
  } catch {
    // プライベートモードなどで読めないことがある。作り直す。
  }
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "u";
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  try {
    window.localStorage.setItem(KEY, out);
  } catch {
    // 保存できなくても、その場の申し込みは通す。
    // 通さないと、プライベートモードの人が一切買えなくなる。
  }
  return out;
}

/** 鍵を持っているか（画面の出し分け用。無くても申し込みはできる） */
export function hasToken(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return Boolean(window.localStorage.getItem(KEY));
  } catch {
    return false;
  }
}

/** 買う前に必ず出す断り。端末を変えると辿れなくなることを隠さない */
export const DEVICE_WARNING =
  "お申し込みの控えは、この端末に保存されます。別の端末では開けません。" +
  "端末を変えるときは、お手数ですがご連絡ください。";
