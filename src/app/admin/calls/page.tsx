import type { Metadata } from "next";
import Link from "next/link";
import { dbSelect, dbAdminEnabled } from "@/lib/db";
import { plan as getPlan, type PlanId } from "@/lib/ask/plans";
import { STATUS_LABEL, clock, remainingSeconds, type CallStatus } from "@/lib/call/session";
import { callEnabled, whyCallDisabled } from "@/lib/call/room";
import { REWARD_CAP } from "@/lib/economics";

// 通話の運営画面。
//
// ── 毎日ここだけ見れば回る ────────────────────────
// 答えたいのは4つ。
//   今日の通話はどれか / 担当が決まっていないものはどれか /
//   いま話しているのはどれか / 払う額はいくらか
//
// ── 中身は出さない ────────────────────────────────
// 相談の本文はここに出さない。相談した人のものなので、
// 必要なときに相談の画面を開く。
//
// ── 無いものは0と出す ─────────────────────────────
// まだ1件も無いなら0。見栄えのために埋めない。

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "通話 — 運営", robots: { index: false } };

type Row = {
  id: string;
  token: string;
  plan_id: string;
  duration_minutes: number;
  status: CallStatus;
  scheduled_at: string | null;
  started_at: string | null;
  ends_at: string | null;
  ended_at: string | null;
  responder_id: string | null;
  responder_age_band: string | null;
  verified_age: boolean | null;
  asker_joined_at: string | null;
  responder_joined_at: string | null;
  price: number | null;
  reward_yen: number | null;
  extended_minutes: number;
  asker_rating: number | null;
  created_at: string;
};

const when = (s: string | null) =>
  s
    ? new Date(s).toLocaleString("ja-JP", {
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

export default async function AdminCallsPage() {
  const rows = dbAdminEnabled
    ? await dbSelect<Row>(
        "call_board?select=id,token,plan_id,duration_minutes,status,scheduled_at,started_at,ends_at,ended_at,responder_id,responder_age_band,verified_age,asker_joined_at,responder_joined_at,price,reward_yen,extended_minutes,asker_rating,created_at&limit=200",
      )
    : [];

  const now = new Date();
  const live = rows.filter((r) => r.status === "active");
  const needsResponder = rows.filter(
    (r) => !r.responder_id && !["completed", "cancelled", "no_show"].includes(r.status),
  );
  const needsTime = rows.filter(
    (r) => !r.scheduled_at && !["completed", "cancelled", "no_show"].includes(r.status),
  );
  const noShow = rows.filter((r) => r.status === "no_show");
  const owed = rows
    .filter((r) => r.status === "completed")
    .reduce(
      (n, r) =>
        n + (r.reward_yen ?? REWARD_CAP[(r.plan_id as PlanId) in REWARD_CAP ? (r.plan_id as PlanId) : "call15"]),
      0,
    );

  return (
    <div className="mx-auto w-full max-w-[1100px] px-5 py-10 sm:px-8">
      <p className="text-[11.5px] font-bold text-steel">運営</p>
      <h1 className="mt-1.5 text-[26px] font-black">通話</h1>

      {!callEnabled && (
        <p className="mt-5 rounded-card border border-line bg-mist px-5 py-4 text-[13px] leading-[1.85] text-slate">
          {whyCallDisabled()}。<code className="font-num">DAILY_API_KEY</code> が入るまで、
          部屋は作られず、入室もできません。
        </p>
      )}
      {!dbAdminEnabled && (
        <p className="mt-3 rounded-card border border-line bg-mist px-5 py-4 text-[13px] leading-[1.85] text-slate">
          いまこの環境はデータベースに接続されていません。数字は0のままです。
        </p>
      )}

      <dl className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          ["通話中", live.length],
          ["担当なし", needsResponder.length],
          ["日時なし", needsTime.length],
          ["つながらず", noShow.length],
          ["支払い予定", `¥${owed.toLocaleString()}`],
        ].map(([k, v]) => (
          <div key={String(k)} className="rounded-card border border-line bg-paper px-4 py-3.5">
            <dt className="text-[11px] text-steel">{k}</dt>
            <dd className="mt-1 text-[22px] font-black tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>

      {live.length > 0 && (
        <div className="mt-8">
          <p className="text-[12px] font-bold text-steel">いま話しているもの</p>
          <ul className="mt-2.5 flex flex-col gap-2">
            {live.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-card border border-brand bg-paper px-4 py-3"
              >
                <span className="text-[13px] font-black">{getPlan(r.plan_id as PlanId).name}</span>
                <span className="text-[13px] font-black tabular-nums text-brand">
                  残り {r.ends_at ? clock(remainingSeconds(r.ends_at, now)) : "—"}
                </span>
                <span className="text-[12px] text-steel">開始 {when(r.started_at)}</span>
                <Link
                  href={`/call/${r.token}`}
                  className="ml-auto text-[12.5px] font-bold text-brand underline decoration-line underline-offset-4"
                >
                  画面を見る
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 -mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
        <table className="w-full min-w-[900px] border-collapse overflow-hidden rounded-card border border-line bg-paper">
          <thead>
            <tr className="bg-mist text-left text-[11.5px] text-steel">
              {["予約", "商品", "分", "状態", "担当", "入室(男/女)", "売価", "報酬", "点", ""].map(
                (h) => (
                  <th key={h} className="whitespace-nowrap px-3 py-2.5 font-bold">
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={10} className="px-3 py-6 text-center text-[13px] text-steel">
                  まだ1件もありません。
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-line text-[12.5px]">
                <td className="whitespace-nowrap px-3 py-2.5">{when(r.scheduled_at)}</td>
                <td className="whitespace-nowrap px-3 py-2.5 font-bold">
                  {getPlan(r.plan_id as PlanId).name}
                </td>
                <td className="px-3 py-2.5 tabular-nums">
                  {r.duration_minutes}
                  {r.extended_minutes > 0 && (
                    <span className="text-brand"> +{r.extended_minutes}</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5">{STATUS_LABEL[r.status]}</td>
                <td className="whitespace-nowrap px-3 py-2.5">
                  {r.responder_id ? (
                    <>
                      {r.responder_age_band ?? "—"}
                      {r.verified_age && <span className="ml-1 text-brand">✓</span>}
                    </>
                  ) : (
                    <span className="text-rose-text">未</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-steel">
                  {r.asker_joined_at ? "◯" : "—"} / {r.responder_joined_at ? "◯" : "—"}
                </td>
                <td className="px-3 py-2.5 tabular-nums">
                  {r.price ? `¥${r.price.toLocaleString()}` : "—"}
                </td>
                <td className="px-3 py-2.5 tabular-nums">
                  {r.reward_yen ? `¥${r.reward_yen.toLocaleString()}` : "—"}
                </td>
                <td className="px-3 py-2.5 tabular-nums">{r.asker_rating ?? "—"}</td>
                <td className="whitespace-nowrap px-3 py-2.5">
                  <Link
                    href={`/call/${r.token}`}
                    className="font-bold text-brand underline decoration-line underline-offset-4"
                  >
                    開く
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 rounded-card border border-line bg-mist px-5 py-4">
        <p className="text-[12px] font-bold text-steel">手で直すとき</p>
        <p className="mt-2 text-[12.5px] leading-[1.9] text-steel">
          担当の入れ替え・日時の変更・延長・返金は、いまは Supabase の
          <code className="mx-1 font-num">call_sessions</code>
          を直に書き換えてください。延ばすときは
          <code className="mx-1 font-num">extended_minutes</code>
          と<code className="mx-1 font-num">extended_reason</code>
          を必ず一緒に入れてください。理由の無い延長を残さないためです。
          <br />
          時間を過ぎた通話は、誰かが画面を開いた時点で自動的に終わります。
        </p>
      </div>
    </div>
  );
}
