import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { dbSelect, dbAdminEnabled } from "@/lib/db";
import { isShareToken } from "@/lib/ask/token";
import { PICKS } from "@/lib/ask/model";
import { ENTRY_PLAN } from "@/lib/ask/plans";
import { NAME, ONE_LINER } from "@/lib/voice";
import Donut from "@/components/brand/Donut";
import PlanCta from "@/components/brand/PlanCta";

// 共有された A/B の結果。
//
// ══════════════════════════════════════════════════
// ここに出してよいもの
// ══════════════════════════════════════════════════
//   A と B の割れ方
//   一人ひとりのひとこと（年代だけ）
//
// ══════════════════════════════════════════════════
// 出してはいけないもの
// ══════════════════════════════════════════════════
//   A と B の中身（本人の写真・文章そのもの）
//   相談の本文
//   相談の鍵
//   誰が聞いたか
//
// 共有するのは「5人中4人がBだった」という結果であって、
// 本人の持ち物ではない。中身を見せるかどうかは、本人が別に決めること。

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${ONE_LINER} — His Recoveries`,
  description: "AとB、実際の女性5人はどちらを選んだか。",
};

type Row = {
  token: string;
  revoked_at: string | null;
  consultation_id: string;
  is_ab: boolean;
  panel_size: number;
};

const AGE: Record<string, string> = {
  "20-24": "20代前半",
  "25-29": "25〜29歳",
  "30s": "30代",
  "30-34": "30代前半",
  "35-39": "30代後半",
  "40-49": "40代",
};

export default async function SharePage({ params }: { params: { token: string } }) {
  if (!isShareToken(params.token)) notFound();
  if (!dbAdminEnabled) notFound();

  const rows = await dbSelect<Row>(
    `share_public?token=eq.${encodeURIComponent(params.token)}&select=*`,
  );
  const s = rows[0];
  if (!s || s.revoked_at) notFound();

  const answers = await dbSelect<{ id: string; display_age_band: string; pick: string | null; comment: string }>(
    `responses?consultation_id=eq.${s.consultation_id}&select=id,display_age_band,pick,comment&order=created_at.asc`,
  );

  const total = answers.length;
  const a = answers.filter((x) => x.pick === "a").length;
  const b = total - a;
  const winner = a >= b ? "a" : "b";
  const label = (id: string) => PICKS.find((p) => p.id === id)?.label ?? id.toUpperCase();

  return (
    <div data-brand className="min-h-screen bg-paper text-slate">
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex w-full max-w-[720px] items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
          <Link href="/" className="text-[15px] font-black">
            {NAME}
          </Link>
          <PlanCta
            plan={ENTRY_PLAN}
            from="share"
            className="min-h-[40px] rounded-pill bg-brand px-5 text-[13px] !text-paper shadow-card"
          >
            自分も聞く
          </PlanCta>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[720px] px-5 pb-20 pt-10 sm:px-8">
        <p className="text-[12px] font-bold tracking-[0.12em] text-brand">5人に聞いた結果</p>

        <h1 className="mt-3 text-huge font-black">
          {total > 0 ? (
            <>
              {Math.max(a, b)}人が
              <br />
              {label(winner)}を選びました。
            </>
          ) : (
            <>まだ結果がありません。</>
          )}
        </h1>

        {total > 0 && (
          <>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-6 rounded-card border border-line bg-paper p-6 shadow-card sm:gap-10">
              <Donut n={a} of={total} label={label("a")} positive={winner === "a"} size={132} />
              <Donut n={b} of={total} label={label("b")} positive={winner === "b"} size={132} />
            </div>

            <ul className="mt-6 flex flex-col gap-3">
              {answers.map((x) => (
                <li key={x.id} className="rounded-card border border-line bg-paper p-5 shadow-card">
                  <p className="flex items-center gap-2">
                    <span className="text-[12px] font-bold text-slate">
                      {AGE[x.display_age_band] ?? "—"}・女性
                    </span>
                    <span
                      className={`rounded-pill px-2.5 py-1 text-[11px] font-bold ${
                        x.pick === winner ? "bg-ok-tint text-ok-text" : "bg-mist text-steel"
                      }`}
                    >
                      {label(x.pick ?? "a")}
                    </span>
                  </p>
                  <p className="mt-2.5 text-[15px] leading-[1.85]">{x.comment}</p>
                </li>
              ))}
            </ul>
          </>
        )}

        <p className="mt-8 text-[12.5px] leading-[1.85] text-steel">
          AとBの中身は出していません。出しているのは、どちらが選ばれたかと、その理由だけです。
        </p>

        <div className="mt-10 rounded-card bg-brand p-7 text-paper shadow-card">
          <p className="text-[24px] font-black leading-[1.4]">{ONE_LINER}</p>
          <p className="mt-3 text-[14.5px] leading-[1.9]">
            迷ったら、相手に近い人へ聞く。AIじゃなく、本物の人の反応が返ってくる。
          </p>
          <PlanCta
            plan={ENTRY_PLAN}
            from="share_cta"
            className="mt-6 min-h-[54px] w-full rounded-pill bg-paper px-6 text-[15.5px] !text-brand-deep"
          >
            自分も聞いてみる <span aria-hidden className="ml-1.5">→</span>
          </PlanCta>
        </div>
      </div>
    </div>
  );
}
