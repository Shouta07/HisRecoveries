/* ══════════════════════════════════════════════════
   連絡先
   ══════════════════════════════════════════════════

   ── 口が、1つになった ───────────────────────────
   ここには LINE の口と決済の口があった。
   相談サービスを売っていたときのもので、
   「URLが無いときは押せる形にしない」をここで守っていた。

   相談サービスを畳んだので、LINE も決済も無い。
   残るのはメールだけ。

   ── 無いものを、あるように見せないのは変わらない ──
   メールが環境変数に入っていなければ、押せる形にしない。
   面は contactEmail を見て、ボタンか「準備中」の文かを出し分ける。

   ── 作り話のアドレスを、置かないこと ────────────
   example.com や TODO が入っていたら、無いものとして扱う。 */

const MAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();

function realEmail(v: string | undefined): string | null {
  if (!v) return null;
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) return null;
  if (/example\.com|localhost|your-|TODO|xxx/i.test(v)) return null;
  return v;
}

export const contactEmail = realEmail(MAIL);

/* ── 公開の前に止めること ───────────────────────── */
{
  /* 環境変数に仮の値が入っていたら、ここで分かるようにする。
     realEmail は黙って null にするので、理由を出しておく。 */
  if (MAIL && contactEmail === null) {
    throw new Error(`NEXT_PUBLIC_CONTACT_EMAIL が仮の値か、形が違います（${MAIL}）`);
  }
}
