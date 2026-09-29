import type { Metadata } from "next";
import Link from "next/link";
import { NAME, TAGLINE } from "@/lib/voice";
import { plan as getPlan, type PlanId } from "@/lib/ask/plans";
import { findByToken, settle } from "@/lib/call/store";
import { isConsultToken } from "@/lib/ask/token";
import { canEnter, STATUS_LABEL, type CallStatus } from "@/lib/call/session";
import { callEnabled } from "@/lib/call/room";
import { dbAdminEnabled } from "@/lib/db";
import Tashikame from "@/components/brand/Tashikame";
import CallFlow from "@/components/call/CallFlow";

// 通話の面。相談した人が開く。
//
// ── 鍵だけで開く ──────────────────────────────────
// 会員登録は無い。URL を知っていることが鍵。
// ほかの面と同じやり方で、新しい仕組みを増やさない。
//
// ── 検索に出さない ────────────────────────────────
// 中身は相談した人のもの。robots で止める。

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: `通話 — ${NAME}` },
  robots: { index: false, follow: false },
};

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div data-brand className="min-h-screen bg-paper text-slate">
      <header className="border-b border-line">
        <div className="mx-auto flex w-full max-w-[560px] items-center gap-2.5 px-5 py-3 sm:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <Tashikame size={38} />
            <span className="min-w-0">
              <span className="block truncate text-[9.5px] font-bold leading-[1.3] text-steel">
                {TAGLINE}
              </span>
              <span className="block truncate text-[16px] font-black leading-[1.15]">
                {NAME}
              </span>
            </span>
          </Link>
        </div>
      </header>
      <div className="mx-auto w-full max-w-[560px] px-5 pb-20 pt-8 sm:px-8">{children}</div>
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-card border border-line bg-mist px-5 py-4 text-[13.5px] leading-[1.9] text-slate">
      {children}
    </div>
  );
}

export default async function CallPage({ params }: { params: { token: string } }) {
  if (!isConsultToken(params.token)) {
    return (
      <Shell>
        <Note>この通話は見つかりませんでした。URLをご確認ください。</Note>
      </Shell>
    );
  }
  if (!dbAdminEnabled) {
    return (
      <Shell>
        <Note>いまこの環境はデータベースに接続されていません。</Note>
      </Shell>
    );
  }

  const row0 = await findByToken(params.token);
  if (!row0) {
    return (
      <Shell>
        <Note>この通話は見つかりませんでした。URLをご確認ください。</Note>
      </Shell>
    );
  }

  const now = new Date();
  const row = await settle(row0, now);
  const p = getPlan(row.plan_id as PlanId);
  const status = row.status as CallStatus;

  // 終わっている。
  if (status === "completed" || status === "cancelled" || status === "no_show") {
    return (
      <Shell>
        <h1 className="text-big font-black">{STATUS_LABEL[status]}</h1>
        <div className="mt-5">
          <Note>
            {status === "completed"
              ? "この通話は終わりました。"
              : status === "no_show"
                ? "時間までにつながりませんでした。運営から連絡します。"
                : "この通話は取り消されました。"}
          </Note>
        </div>
      </Shell>
    );
  }

  // まだ入れない。
  const open = canEnter(row.scheduled_at, now) && Boolean(row.room_url) && callEnabled;
  if (!open) {
    return (
      <Shell>
        <p className="text-[12.5px] font-bold text-steel">
          {p.name} / {row.duration_minutes}分
        </p>
        <h1 className="mt-2 text-big font-black">{STATUS_LABEL[status]}</h1>
        <div className="mt-5">
          <Note>
            {row.scheduled_at ? (
              <>
                開始の10分前から入室できます。
                <br />
                予約：
                {new Date(row.scheduled_at).toLocaleString("ja-JP", {
                  month: "numeric",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </>
            ) : (
              "日時が決まりしだい、このページに出ます。"
            )}
          </Note>
        </div>
        <ul className="mt-6 flex flex-col gap-1.5">
          {p.includes.map((x) => (
            <li key={x} className="flex items-start gap-2 text-[13px] leading-[1.75]">
              <span aria-hidden className="mt-[3px] text-[11px] font-black text-brand">
                ✓
              </span>
              <span className="min-w-0 text-steel">{x}</span>
            </li>
          ))}
        </ul>
      </Shell>
    );
  }

  return (
    <Shell>
      <CallFlow token={row.token} planName={p.name} minutes={row.duration_minutes} />
    </Shell>
  );
}
