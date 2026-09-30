import type { Metadata } from "next";
import Link from "next/link";
import { NAME } from "@/lib/voice";
import { plan as getPlan, type PlanId } from "@/lib/ask/plans";
import { findByToken, settle } from "@/lib/call/store";
import { isConsultToken } from "@/lib/ask/token";
import { canEnter, STATUS_LABEL, type CallStatus } from "@/lib/call/session";
import { callEnabled } from "@/lib/call/room";
import { dbAdminEnabled, dbSelect } from "@/lib/db";
import { category, isCategoryId } from "@/lib/ask/model";
import CallFlow from "@/components/call/CallFlow";

// 答える人が開く、案件の画面。
//
// ══════════════════════════════════════════════════
// 出すもの・出さないもの
// ══════════════════════════════════════════════════
// 出す:   日時 / 何分 / 相談のカテゴリ / 相談の概要 / 報酬
// 出さない: 相手の名前・連絡先・SNS・住んでいるところ
//
// 相談の本文は、答えるのに要る分だけ。
// 「誰か」が分かる情報は、そもそもここへ持ってこない。
//
// ══════════════════════════════════════════════════
// 入るのに要る鍵は2つ
// ══════════════════════════════════════════════════
// 通話の鍵（URL）と、自分の鍵（?p=...）。
// 通話の鍵だけでは、答える側としては入れない。

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: `通話の依頼 — ${NAME}` },
  robots: { index: false, follow: false },
};

type Consult = { category: string; body: string; asker_age_band: string | null; panel_age: string | null };

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div data-brand className="min-h-screen bg-paper text-slate">
      <header className="border-b border-line">
        <div className="mx-auto w-full max-w-[560px] px-5 py-3.5 sm:px-8">
          <span className="text-[14px] font-black">{NAME}</span>
        </div>
      </header>
      <div className="mx-auto w-full max-w-[560px] px-5 pb-20 pt-8 sm:px-8">{children}</div>
    </div>
  );
}

export default async function ResponderCallPage({
  params,
  searchParams,
}: {
  params: { token: string };
  searchParams: { p?: string };
}) {
  const mine = typeof searchParams.p === "string" ? searchParams.p : "";

  if (!isConsultToken(params.token) || !dbAdminEnabled) {
    return (
      <Shell>
        <p className="text-[13.5px] leading-[1.9] text-steel">
          この依頼は見つかりませんでした。
        </p>
      </Shell>
    );
  }

  const row0 = await findByToken(params.token);
  if (!row0) {
    return (
      <Shell>
        <p className="text-[13.5px] leading-[1.9] text-steel">
          この依頼は見つかりませんでした。
        </p>
      </Shell>
    );
  }

  const now = new Date();
  const row = await settle(row0, now);
  const p = getPlan(row.plan_id as PlanId);
  const status = row.status as CallStatus;

  // もとの相談。概要だけを出す。
  let consult: Consult | null = null;
  if (row.consultation_id) {
    const rows = await dbSelect<Consult>(
      `consultations?id=eq.${encodeURIComponent(row.consultation_id)}&select=category,body,asker_age_band,panel_age&limit=1`,
    );
    consult = rows[0] ?? null;
  }

  const open =
    canEnter(row.scheduled_at, now) &&
    Boolean(row.room_url) &&
    callEnabled &&
    (status === "scheduled" || status === "ready" || status === "active");

  return (
    <Shell>
      <p className="text-[11.5px] font-bold text-steel">通話の依頼</p>
      <h1 className="mt-1.5 text-big font-black">
        {row.duration_minutes}分 / {p.name}
      </h1>

      <dl className="mt-6 flex flex-col divide-y divide-line rounded-card border border-line bg-paper">
        {[
          [
            "日時",
            row.scheduled_at
              ? new Date(row.scheduled_at).toLocaleString("ja-JP", {
                  month: "numeric",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "未定",
          ],
          ["長さ", `${row.duration_minutes}分（時間になると自動で終わります）`],
          [
            "話すこと",
            consult && isCategoryId(consult.category)
              ? category(consult.category).label
              : "—",
          ],
          ["相手の年代", consult?.asker_age_band ?? "—"],
          ["いまの状態", STATUS_LABEL[status]],
        ].map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between gap-4 px-4 py-3">
            <dt className="shrink-0 text-[12px] font-bold text-steel">{k}</dt>
            <dd className="min-w-0 text-right text-[13.5px] font-bold text-slate">{v}</dd>
          </div>
        ))}
      </dl>

      {consult?.body && (
        <div className="mt-5 rounded-card border border-line bg-mist px-4 py-4">
          <p className="text-[11.5px] font-bold text-steel">相談の概要</p>
          <p className="mt-2 whitespace-pre-wrap text-[13.5px] leading-[1.9] text-slate">
            {consult.body}
          </p>
        </div>
      )}

      <div className="mt-6 rounded-card border border-line bg-paper px-4 py-4">
        <p className="text-[11.5px] font-bold text-steel">この依頼の報酬</p>
        <p className="mt-1.5 text-[20px] font-black tabular-nums text-slate">
          ¥{(row.price ?? 0) > 0 ? "" : ""}
          {/* 報酬は運営が確定してから出す。見込みの額は出さない */}
          {row.duration_minutes === 15 ? "3,000" : "5,000"}
        </p>
        <p className="mt-1.5 text-[12px] leading-[1.75] text-steel">
          終わって確認が通った時点で、残高に入ります。
        </p>
      </div>

      <div className="mt-7">
        {!mine ? (
          <p className="rounded-card border border-line bg-mist px-4 py-4 text-[13px] leading-[1.9] text-slate">
            入室するには、自分の画面から開いてください。
            このURLだけでは入れません。
          </p>
        ) : open ? (
          <CallFlow
            token={row.token}
            responder={mine}
            planName={p.name}
            minutes={row.duration_minutes}
          />
        ) : (
          <p className="rounded-card border border-line bg-mist px-4 py-4 text-[13px] leading-[1.9] text-slate">
            開始の10分前から入室できます。
          </p>
        )}
      </div>

      <div className="mt-8 border-t border-line pt-5">
        <p className="text-[11.5px] font-bold text-steel">この通話でのきまり</p>
        <ul className="mt-2.5 flex flex-col gap-1.5">
          {[
            "声だけです。顔は出ません",
            "録音していません",
            "時間になると自動で切れます",
            "連絡先を渡すことはありません",
            "途中でやめても構いません",
            "あなた自身のことは聞かれません",
          ].map((t) => (
            <li key={t} className="flex items-start gap-2 text-[12.5px] leading-[1.75]">
              <span aria-hidden className="mt-[3px] text-[10px] font-black text-brand">
                ✓
              </span>
              <span className="min-w-0 text-steel">{t}</span>
            </li>
          ))}
        </ul>
        {/* 「答える側のきまり」は /join が持っていた。ページごと畳んだので、
            きまりは登録のときに個別に渡す（lib/responder/policy.ts）。 */}
      </div>
    </Shell>
  );
}
