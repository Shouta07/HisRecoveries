/* ══════════════════════════════════════════════════
   連絡先と、支払いの口
   ══════════════════════════════════════════════════

   ── 無いものを、あるように見せない ──────────────
   LINE公式アカウントのURLも、決済のURLも、
   いまは入っていない。

   ここで作り話のURLを置くと、押した人がどこにも行けない。
   「#」や「準備中」にリンクを張るのも同じで、
   押せる見た目をしている時点で、動くと約束している。

   入っていないときは、押せる形にしない。
   画面側は configured を見て、ボタンではなく
   「準備中」の文として出す。

   ── 買う前と、買ったあとを分ける ────────────────
   このサービスは、買う前に「対応できるか」を聞く。
   そこは無料。相談そのものは、支払いのあと。

   同じ LINE の中で続くので、黙っていると
   「無料で相談し放題」に見える。分けて書く。 */

const LINE = process.env.NEXT_PUBLIC_LINE_URL?.trim();
const PAY = process.env.NEXT_PUBLIC_PAY_URL?.trim();
const MAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();

function httpsOnly(u: string | undefined): string | null {
  if (!u) return null;
  if (!/^https:\/\/[^\s]+$/.test(u)) return null;
  return u;
}

export const lineUrl = httpsOnly(LINE);
export const payUrl = httpsOnly(PAY);
export const contactEmail = MAIL && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(MAIL) ? MAIL : null;

export const lineReady = lineUrl !== null;
export const payReady = payUrl !== null;

/** まだ開いていないときに、画面へ出す言葉 */
export const NOT_READY_JA = "準備中です。開き次第、ここからご案内します。";
export const NOT_READY_EN = "Not open yet. We will announce it here.";
export const NOT_READY_ZH = "尚未开放。开放后将在此通知。";

/* 買う前は無料、相談は支払い後。この2つを必ず並べて書く */
export const FREE_CHECK_JA = "対応できるかの確認は無料です";
export const PAID_START_JA = "相談は、お支払いのあとで始まります";

export const FREE_CHECK_EN = "Checking whether we can help is free";
export const PAID_START_EN = "Consultations begin after payment";

export const FREE_CHECK_ZH = "确认能否提供帮助是免费的";
export const PAID_START_ZH = "咨询在付款后开始";

/* ── 公開の前に止めること ───────────────────────── */
{
  /* URLを、作り話で埋めないこと。
     https で始まらないものは、無いものとして扱う。 */
  for (const [v, n] of [[lineUrl, "LINE"], [payUrl, "決済"]] as const) {
    if (v !== null && !v.startsWith("https://")) {
      throw new Error(`${n}のURLが https ではありません（${v}）`);
    }
    if (v !== null && /example\.com|localhost|your-|TODO|xxx/i.test(v)) {
      throw new Error(`${n}のURLが仮のものになっています（${v}）`);
    }
  }

  /* 無いときの言葉が、3言語ともあること。
     英語・中国語の面で、日本語の「準備中」が出ないように。 */
  for (const [t, n] of [[NOT_READY_JA, "日本語"], [NOT_READY_EN, "英語"], [NOT_READY_ZH, "中国語"]] as const) {
    if (!t) throw new Error(`${n}の「準備中」の言葉がありません`);
  }
  if (/[ぁ-んァ-ヶ一-龠]/.test(NOT_READY_EN)) {
    throw new Error("英語の「準備中」に、日本語が混ざっています");
  }
  if (/[ぁ-んァ-ヶ]/.test(NOT_READY_ZH)) {
    throw new Error("中国語の「準備中」に、かなが混ざっています");
  }

  /* 無料と有料の境目が、どの言語でも言えていること。
     ここが抜けると「無料で相談し放題」に見える。 */
  for (const [free, paid, n] of [
    [FREE_CHECK_JA, PAID_START_JA, "日本語"],
    [FREE_CHECK_EN, PAID_START_EN, "英語"],
    [FREE_CHECK_ZH, PAID_START_ZH, "中国語"],
  ] as const) {
    if (!free || !paid) throw new Error(`${n}の、無料と有料の境目が書かれていません`);
    if ((free as string) === (paid as string)) throw new Error(`${n}で、無料と有料が同じ文になっています`);
  }
}
