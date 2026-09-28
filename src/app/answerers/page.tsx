import type { Metadata } from "next";
import Link from "next/link";
import { dbSelect, dbAdminEnabled } from "@/lib/db";
import { site } from "@/lib/site";
import { Eyebrow, Hairline } from "@/components/brand/kit";
import { HumanCard, type Human } from "@/components/brand/market";

// 回答者の一覧。マーケットプレイスの供給側。
//
// ── ここを作り物にしない ──────────────────────────
// 「128 ANSWERS / HELPFUL 94%」の人を並べたくなる場所だが、
// 並べた瞬間、このページは嘘の名簿になる。
// 実在の登録者だけを出す。0人なら0人と書く。
//
// ── 出すものと出さないもの ────────────────────────
// 出す: 年代・地域・立場・得意な話題・回答数・確認済みかどうか
// 出さない: 連絡先・氏名・細かい居住地
// 読むのは responder_profiles ビューで、そこに連絡先の列は無い。

export const revalidate = 300;

export const metadata: Metadata = {
  title: "回答者 — His Recoveries",
  description:
    "いま登録している回答者。年代・地域・立場・得意な話題から選んで聞けます。名前や連絡先は出しません。",
  alternates: { canonical: `${site.url}/answerers` },
};

type Row = {
  id: string;
  display_age_band: string;
  area: string | null;
  attrs: string[] | null;
  specialties: string[] | null;
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

  const people: Human[] = rows.map((r) => ({
    id: r.id,
    age: r.display_age_band,
    area: r.area,
    attrs: r.attrs ?? [],
    specialties: r.specialties ?? [],
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
    <div data-brand className="min-h-screen bg-bone text-void">
      <header className="border-b border-rule">
        <div className="mx-auto flex w-full max-w-[1180px] items-center justify-between gap-4 px-6 py-4 sm:px-10">
          <Link href="/" className="text-[15px] font-black uppercase tracking-[0.1em]">
            His Recoveries
          </Link>
          <Link
            href="/ask"
            className="inline-flex min-h-[44px] items-center bg-void px-5 text-[12px] font-bold uppercase tracking-[0.16em] text-bone transition-colors hover:bg-lime hover:text-void"
          >
            人に聞く
          </Link>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1180px] px-6 pb-24 pt-12 sm:px-10 sm:pt-16">
        <Eyebrow>The people who answer</Eyebrow>
        <h1 className="mt-6 max-w-[14em] text-huge font-black text-void">
          答えるのは、
          <br />
          実在する人です。
        </h1>
        <p className="mt-8 max-w-[30em] text-[16px] leading-[1.95] text-ash sm:text-[17px]">
          年代・地域・立場・得意な話題まで見てから聞けます。
          名前も連絡先も出しません。出す仕組み自体を作っていません。
        </p>

        {people.length > 0 ? (
          <>
            <p className="mt-10 text-[11px] font-bold uppercase tracking-[0.2em] text-ash">
              {people.length} people
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {people.map((h, i) => (
                <HumanCard key={h.id} h={h} tilt={i % 3 === 1 ? 0.5 : -0.5} className="h-full" />
              ))}
            </div>
          </>
        ) : (
          <div className="mt-12 border-t-2 border-void pt-10">
            <p className="text-[26px] font-black leading-[1.35] sm:text-[34px]">
              まだ、1人も登録していません。
            </p>
            <p className="mt-6 max-w-[30em] text-[15.5px] leading-[1.95] text-ash">
              はじまったばかりなので、ここは空です。
              それらしい人を並べることはしません。
              登録して確認が済んだ方から、この場所に出ます。
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/join"
                className="inline-flex min-h-[58px] items-center justify-center bg-void px-8 text-[14px] font-bold uppercase tracking-[0.12em] text-bone transition-colors hover:bg-lime hover:text-void"
              >
                回答者として参加する
              </Link>
              <Link
                href="/ask"
                className="inline-flex min-h-[58px] items-center justify-center border border-void px-8 text-[14px] font-bold uppercase tracking-[0.12em] transition-colors hover:bg-void hover:text-bone"
              >
                先に聞いてみる
              </Link>
            </div>
          </div>
        )}

        <div className="mt-20">
          <Hairline />
          <p className="mt-7 max-w-[34em] text-[13px] leading-[1.9] text-ash">
            「確認済み」の印が付くのは、運営が年齢とプロフィールを確かめた方だけです。
            回答数と、役に立ったと言われた割合は、実際に貯まったものだけを出します。
            まだ評価が1件も付いていない方には、割合を表示しません。
          </p>
        </div>
      </div>

      <footer className="border-t border-rule">
        <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-3 px-6 py-10 sm:flex-row sm:items-baseline sm:justify-between sm:px-10">
          <div className="flex items-baseline gap-6">
            <Link href="/" className="text-[15px] font-black uppercase tracking-[0.08em]">
              His Recoveries
            </Link>
            <Link href="/safety" className="text-[12px] text-ash transition-colors hover:text-void">
              安全とできないこと
            </Link>
          </div>
          <p className="text-[11.5px] text-ash">
            © 2026 His Recoveries — Powered by AI. Answered by humans.
          </p>
        </div>
      </footer>
    </div>
  );
}
