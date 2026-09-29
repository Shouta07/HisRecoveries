import type { Metadata } from "next";
import { NAME, OPERATOR } from "@/lib/voice";
import Link from "next/link";
import { dbSelect, dbAdminEnabled } from "@/lib/db";
import { site } from "@/lib/site";
import { Eyebrow, Hairline } from "@/components/brand/kit";
import { HumanCard, type Human } from "@/components/brand/market";
import Says from "@/components/brand/Says";
import WhoReads from "@/components/brand/WhoReads";
import { EMPTY } from "@/lib/tashikame";

// 答えてくれる女性の一覧。マーケットプレイスの供給側。
//
// ── ここを作り物にしない ──────────────────────────
// 「128 ANSWERS / HELPFUL 94%」の人を並べたくなる場所だが、
// 並べた瞬間、このページは嘘の名簿になる。
// 実在の登録者だけを出す。0人なら0人と書く。
//
// ── 出すものと出さないもの ────────────────────────
// 出す: 年代・地域・職業のカテゴリ・立場・得意な話題・書き方・回答数・確認済みかどうか
// 出さない: 連絡先・氏名・細かい居住地
// 読むのは responder_profiles ビューで、そこに連絡先の列は無い。

export const revalidate = 300;

export const metadata: Metadata = {
  // 記事側のテンプレート（%s — His Recoveries）を使わない。
  // プロダクトの名乗りはタシカメなので、ここで完結させる。
  title: { absolute: "誰が読むのか — タシカメ" },
  description:
    "読むのは、審査を通った女性だけです。年齢と立場を確認し、通った方にだけお願いしています。名前や連絡先は出しません。",
  alternates: { canonical: `${site.url}/answerers` },
};

type Row = {
  id: string;
  display_age_band: string;
  area: string | null;
  attrs: string[] | null;
  specialties: string[] | null;
  job_band: string | null;
  tone: string | null;
  verified_age: boolean;
  verified_profile: boolean;
  avg_reply_minutes: number | null;
  answered: number;
  helpful_yes: number;
  helpful_rated: number;
};

export default async function AnswerersPage() {
  const rows = dbAdminEnabled
    ? await dbSelect<Row>("responder_profiles?select=*&order=answered.desc&limit=48")
    : [];

  // 応募の総数。通過率を実データで出すために要る。
  // ここを作ると、審査そのものが嘘になる。0なら0と出す。
  const allRows = dbAdminEnabled
    ? await dbSelect<{ id: string }>("responders?select=id")
    : [];
  const applied = allRows.length;

  const people: Human[] = rows.map((r) => ({
    id: r.id,
    age: r.display_age_band,
    area: r.area,
    attrs: r.attrs ?? [],
    specialties: r.specialties ?? [],
    job: r.job_band,
    tone: r.tone,
    answered: Number(r.answered) || 0,
    // 評価が1件も付いていないうちは、割合を名乗らない。
    helpfulRate:
      Number(r.helpful_rated) > 0
        ? Math.round((Number(r.helpful_yes) / Number(r.helpful_rated)) * 100)
        : undefined,
    replyMinutes: r.avg_reply_minutes,
    verifiedAge: r.verified_age,
    verifiedProfile: r.verified_profile,
  }));

  return (
    <div data-brand className="min-h-screen bg-paper pb-28 text-slate sm:pb-0">
      <header className="border-b border-line">
        <div className="mx-auto flex w-full max-w-[1180px] items-center justify-between gap-4 px-6 py-4 sm:px-10">
          <Link href="/" className="text-[16px] font-black">
            {NAME}
          </Link>
          <Link
            href="/ask"
            className="inline-flex min-h-[42px] shrink-0 items-center whitespace-nowrap rounded-pill bg-brand px-5 text-[13.5px] font-bold text-paper shadow-card transition-shadow hover:shadow-card-hover"
          >
            女性5人に相談する
          </Link>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1180px] px-6 pb-24 pt-12 sm:px-10 sm:pt-16">
        <Eyebrow>誰が読むのか</Eyebrow>
        <h1 className="mt-6 max-w-[14em] text-huge font-black text-slate">
          どの女性でも
          <br />
          読めるわけではない。
        </h1>
        <p className="mt-8 max-w-[31em] text-[16px] leading-[1.95] text-steel sm:text-[17px]">
          登録すれば読めるようにはしていません。
          年齢と立場を確認し、通った方にだけお願いしています。
          名前も連絡先も出しません。出す仕組み自体を作っていません。
        </p>
        <p className="mt-5 max-w-[31em] text-[15px] leading-[1.95] text-steel">
          相手本人には聞けません。友達の女性は、あなたを知っているぶん気を使います。
          相手と同じ側に立っていて、あなたを知らない。その両方が揃う人にだけ、お願いしています。
        </p>

        {/* 審査の実績。作らない。0なら0と出す */}
        <dl className="mt-10 grid grid-cols-3 gap-5 border-y border-line py-6 sm:max-w-[420px]">
          <div>
            <dt className="text-[11.5px] text-steel">登録</dt>
            <dd className="mt-1 text-[24px] font-black tabular-nums">{applied}</dd>
          </div>
          <div>
            <dt className="text-[11.5px] text-steel">確認済み</dt>
            <dd className="mt-1 text-[24px] font-black tabular-nums">{people.length}</dd>
          </div>
          <div>
            <dt className="text-[11.5px] text-steel">通過</dt>
            <dd className="mt-1 text-[24px] font-black tabular-nums">
              {applied > 0 ? `${Math.round((people.length / applied) * 100)}%` : "—"}
            </dd>
          </div>
        </dl>

        {/* 顔の代わりに、選べる条件と確認していることを出す。
            年齢の丸バッジだけだと、本当にいるのかが伝わらない。 */}
        <div className="mt-10 max-w-[520px]">
          <WhoReads />
        </div>

        {people.length > 0 ? (
          <>
            <p className="mt-10 text-[11px] font-bold text-steel">確認が済んだ方</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {people.map((h, i) => (
                <HumanCard key={h.id} h={h} tilt={i % 3 === 1 ? 0.5 : -0.5} className="h-full" />
              ))}
            </div>
          </>
        ) : (
          <div className="mt-12 border-t-2 border-slate pt-10">
            <Says text={EMPTY.noAnswerers.text} mood={EMPTY.noAnswerers.mood} size={72} />
            <p className="mt-8 max-w-[30em] text-[15.5px] leading-[1.95] text-steel">
              はじまったばかりなので、ここは空です。
              それらしい人を並べることはしません。
              確認が済んだ方から、この場所に出ます。
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/join"
                className="inline-flex min-h-[56px] items-center justify-center rounded-pill bg-brand px-9 text-[15.5px] font-bold text-paper shadow-card transition-shadow hover:shadow-card-hover"
              >
                答える側になる
              </Link>
              <Link
                href="/ask"
                className="inline-flex min-h-[56px] items-center justify-center rounded-pill border border-line bg-paper px-9 text-[15.5px] font-bold shadow-card transition-shadow hover:shadow-card-hover"
              >
                先に通してみる
              </Link>
            </div>
          </div>
        )}

        <div className="mt-20">
          <Hairline />
          <p className="mt-7 max-w-[34em] text-[13px] leading-[1.9] text-steel">
            「確認済み」の印が付くのは、運営が年齢とプロフィールを確かめた方だけです。
            回答数と、役に立ったと言われた割合は、実際に貯まったものだけを出します。
            まだ評価が1件も付いていない方には、割合を表示しません。
          </p>
        </div>
      </div>

      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-3 px-6 py-10 sm:flex-row sm:items-baseline sm:justify-between sm:px-10">
          <div className="flex items-baseline gap-6">
            <Link href="/" className="text-[15px] font-black">
              {NAME}
            </Link>
            <Link href="/safety" className="text-[12px] text-steel transition-colors hover:text-slate">
              安全とできないこと
            </Link>
          </div>
          <p className="text-[11.5px] text-steel">
            © 2026 {OPERATOR}
          </p>
        </div>
      </footer>
    </div>
  );
}
