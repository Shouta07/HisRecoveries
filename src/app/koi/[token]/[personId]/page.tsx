import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NAME } from "@/lib/voice";
import { site } from "@/lib/site";
import { isTalkerToken } from "@/lib/ask/token";
import { ownedBy, recentEpisodes } from "@/lib/koi/store";
import { toCard, appLabel, HEAT_LABEL } from "@/lib/koi/board";
import { toTimeline } from "@/lib/koi/timeline";
import Timeline from "@/components/koi/Timeline";
import KoiFace from "@/components/koi/KoiFace";
import BriefCard from "@/components/koi/BriefCard";
import { briefFor } from "@/lib/koi/brief";

// 相手1人の画面。
//
// ══════════════════════════════════════════════════
// 上から3つだけ
// ══════════════════════════════════════════════════
// いまの状況 ／ ここまで ／ 次に話す
//
// 詳しく出したくなる場所だが、増やすほど
// 「で、今日どうすればいい？」が下へ沈む。
// いちばん上に出すのは、いまの状況と次の一手。
//
// ══════════════════════════════════════════════════
// 他人のものは、開けない
// ══════════════════════════════════════════════════
// URLのIDを書き換えれば、他人の記録を指せてしまう。
// ownedBy() が「その鍵のものか」を確かめる。
// 違えば 404。あるとも無いとも言わない。

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "相手の記録 — タシカメ" },
  alternates: { canonical: `${site.url}/koi` },
  robots: { index: false, follow: false },
};

export default async function PersonPage({
  params,
}: {
  params: { token: string; personId: string };
}) {
  if (!isTalkerToken(params.token)) notFound();

  const row = await ownedBy(params.token, params.personId);
  if (!row) notFound();

  const card = toCard({
    id: row.id,
    partner_label: row.partner_label,
    dating_app: row.dating_app,
    current_stage: row.current_stage,
    last_decision: row.last_decision,
    updated_at: row.updated_at,
    status_label: row.status_label,
    today_action: row.today_action,
  });
  const eps = await recentEpisodes(params.token, params.personId, 10);
  const timeline = toTimeline(eps);
  const brief = briefFor(row);

  const waiting =
    row.waiting_on === "partner" ? "相手の返事を待っています"
    : row.waiting_on === "user" ? "こちらが動く番です"
    : row.waiting_on === "scheduled_event" ? "次の予定を待っています"
    : null;

  return (
    <div data-brand className="min-h-screen bg-paper text-slate">
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex w-full max-w-[640px] items-center gap-3 px-5 py-3.5 sm:px-8">
          <Link
            href={`/koi/${params.token}`}
            aria-label="戻る"
            className="shrink-0 text-[18px] font-black text-steel"
          >
            ‹
          </Link>
          <span className="truncate text-[16px] font-black">{card.who}</span>
          {card.app && (
            <span className="shrink-0 rounded-pill bg-mist px-2 py-0.5 text-[10.5px] font-bold text-steel">
              {appLabel(row.dating_app)}
            </span>
          )}
          <span className="ml-auto shrink-0 text-[11px] font-bold text-steel">
            {HEAT_LABEL[card.heat]}
          </span>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[640px] px-5 pb-24 pt-6 sm:px-8">
        {/* ── いまの状況 ───────────────────────── */}
        <div className="rounded-card border border-line bg-paper p-5 shadow-card">
          <p className="text-[12px] font-bold text-steel">いまの状況</p>
          <p className="mt-1 text-[20px] font-black leading-[1.4] text-slate">
            {card.stage ?? "まだ分かっていません"}
          </p>

          <div className="mt-3.5 flex items-start gap-2 border-t border-line pt-3.5">
            <span
              aria-hidden
              className="mt-[2px] shrink-0 text-[10px] font-black tracking-wide text-brand"
            >
              NEXT
            </span>
            <span
              className={`min-w-0 flex-1 text-[14.5px] font-bold leading-[1.6] ${
                card.next ? "text-slate" : "text-steel"
              }`}
            >
              {card.next ?? "いまは待つ"}
            </span>
          </div>

          {/* いつ動くか・誰待ちか。無ければ出さない（埋めない） */}
          {(row.next_action_due || waiting) && (
            <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-steel">
              {row.next_action_due && <span>いつ　{row.next_action_due}</span>}
              {waiting && <span>{waiting}</span>}
            </div>
          )}

          {/* 今日やることは、次の一手と別。両方あるときだけ分けて出す */}
          {row.today_action && row.today_action !== card.next && (
            <p className="mt-3 rounded-soft bg-mist px-3.5 py-2.5 text-[13px] leading-[1.7] text-slate">
              今日は　{row.today_action}
            </p>
          )}
        </div>

        {/* ── ここまで ─────────────────────────── */}
        <div className="mt-8">
          <h2 className="text-[15px] font-black text-slate">ここまで</h2>
          {timeline.length > 0 ? (
            <div className="mt-3 rounded-card border border-line bg-paper p-5 shadow-card">
              <Timeline items={timeline} />
            </div>
          ) : (
            <p className="mt-3 rounded-soft bg-mist px-4 py-3.5 text-[13px] leading-[1.8] text-steel">
              まだ記録がありません。話すと、ここに残ります。
            </p>
          )}
        </div>

        {/* ── AIに渡す文章 ───────────────────────── */}
        {/* ══════════════════════════════════════════
            ここが「毎回説明しなくていい」の実体
            ══════════════════════════════════════════
            何を渡しているかを、本人が読める形で出す。
            中に隠して渡すこともできるが、そうすると
            何が外へ出るのか分からないまま貼ることになる。

            恋愛の話なので、そこは見えていること。
            間違っていたら、気づいて直せる。

            何も分かっていないうちは出さない。
            「Aさんの話です。」だけ渡しても意味が無い。 */}
        {!brief.empty && (
          <div className="mt-8">
            <BriefCard text={brief.text} />
          </div>
        )}

        {/* ── 次に話す ─────────────────────────── */}
        {/* ══════════════════════════════════════════
            前回の続きから始められるようにする
            ══════════════════════════════════════════
            この人の名前・段階・前回決めたことを持って
            /koi/<鍵> へ戻る。渡すプロンプトにそれが入るので、
            ChatGPT 側で「前回◯◯するところやったよね」から始まる。

            本人に思い出させないのが、この製品の中心。 */}
        <div className="mt-8">
          <Link
            href={`/koi/${params.token}?p=${encodeURIComponent(params.personId)}`}
            className="flex min-h-[54px] items-center justify-center gap-2 rounded-pill bg-brand px-6 text-[15.5px] font-bold text-paper shadow-card"
          >
            <KoiFace size={26} alive={false} />
            この人について話す
          </Link>
          {row.timeline_summary && (
            <p className="mt-2.5 text-center text-[12px] leading-[1.8] text-steel">
              前回まで：{row.timeline_summary}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
