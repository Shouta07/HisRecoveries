"use client";

// 記事末尾の「完了カード」— 読み終わりを、プロジェクトの一区切りにする。
//
// 旧構成は「無料相談」で終わっていた。それはサービス側の都合であって、
// 読んだ直後の人が知りたいのは「で、次は何をやるのか」。
// なので順番は固定する：
//   ① 承認（読み終えました）
//   ② 進捗（3/7）        … 残りが見える＝未完了が気になる状態を作る
//   ③ 次にやること（1つ）  … 複数出すと選択で止まるので、必ず1つ
//   ④ 次に読む（最大2本）  … ★付きで優先度も渡す
//   ⑤ CTA（ロードマップを作る）
//
// 目的が分からないときは、ここで初めて聞く。冒頭では聞かない
// （答えを探しに来た人に、答えの前にコストを払わせないため）。
// すでに分かっているときは聞かない。

import { useEffect, useState } from "react";
import Link from "next/link";
import ConsultLink from "@/components/ConsultLink";
import { track } from "@/lib/analytics";
import { allOccasions } from "@/lib/occasions";
import { positionOf, roadmapById, roadmapsContaining, type StepPosition } from "@/lib/roadmaps";
import { loadProgress, markRead, readCount, setGoal, setTask, type Progress } from "@/lib/progress";

const HEAD: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

/** 記事の一覧（次に読む、のタイトル解決用）。server から渡す */
export type NextArticle = { slug: string; areaId: string; title: string };

function Stars({ n }: { n: number }) {
  return (
    <span aria-label={`効き ${n} / 5`} className="text-[10px] tracking-[0.1em] text-[#85AB8B]">
      {"★".repeat(n)}
      <span className="text-[#d2dbcf]">{"★".repeat(5 - n)}</span>
    </span>
  );
}

export default function ArticleNext({
  slug,
  defaultGoal,
  articles,
}: {
  slug: string;
  /** その記事が最も効く目的（server 側で解決した既定値） */
  defaultGoal?: string;
  /** ロードマップに出てくる記事のメタ */
  articles: NextArticle[];
}) {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [goal, setGoalState] = useState<string | undefined>(undefined);
  const [asked, setAsked] = useState(false);

  const meta = new Map(articles.map((a) => [a.slug, a]));

  // 目的の解決順序：URL → 直近の選択 → 記事の既定値。
  // どれも無ければ、末尾で聞く。
  useEffect(() => {
    const p = markRead(slug);
    const fromUrl = new URLSearchParams(window.location.search).get("goal");
    let resolved: string | undefined;
    let source: Progress["goalSource"] | undefined;

    if (fromUrl && roadmapById(fromUrl)) {
      resolved = fromUrl;
      source = "url";
    } else if (p.goal && roadmapById(p.goal)) {
      resolved = p.goal;
      source = "picked";
    } else if (defaultGoal) {
      resolved = defaultGoal;
      source = "inferred";
    }

    if (resolved && source === "url") setGoal(resolved, source);
    setGoalState(resolved);
    setProgress(loadProgress());

    // 計測は「ロードマップ上の位置が実際に解決できたとき」だけ。
    // 目的が決まっていても、その記事がそのロードマップに載っていなければ
    // 表示は目的取得UIになるので、roadmap_view を送ると数字が嘘になる。
    if (resolved && positionOf(resolved, slug)) {
      track("article_roadmap_view", { goal: resolved, slug, source });
    }
  }, [slug, defaultGoal]);

  if (!progress) return null; // 初回描画は出さない（CLS より、誤った進捗を見せないほうを優先）

  const pos: StepPosition | undefined = positionOf(goal, slug);

  function chooseGoal(id: string) {
    setGoal(id, "picked");
    setGoalState(id);
    setProgress(loadProgress());
    setAsked(true);
    track("article_goal_set", { goal: id, slug });
  }

  function onTask(state: "done" | "later") {
    setProgress(setTask(slug, state));
    track(state === "done" ? "article_task_done" : "article_task_later", { goal: goal ?? "none", slug });
  }

  const taskState = progress.tasks[slug];

  return (
    <section className="mt-12">
      {/* ══ ロードマップがある場合＝完了カード ══ */}
      {pos ? (
        <div className="rounded-[1.4rem] border border-[#1f2a1d]/10 bg-white overflow-hidden">
          {/* ① 承認 ＋ ② 進捗 */}
          <div className="bg-[#16241A] text-[#EDF1E8] px-5 sm:px-7 py-5">
            <div className="flex items-center gap-2 text-[12px] font-bold text-[#9ec4a3] mb-3">
              <span aria-hidden className="grid place-items-center w-5 h-5 rounded-full bg-[#9ec4a3] text-[#16241A]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
              Step {pos.index} を読み終えました
            </div>

            <div className="flex items-baseline justify-between gap-3 mb-2">
              <span className="text-[13.5px] font-bold" style={HEAD}>
                {pos.roadmap.label}
              </span>
              <span className="text-[11.5px] text-[#C9D2C4]">
                {readCount(progress, pos.roadmap.steps.map((s) => s.slug))} / {pos.total} 読了
              </span>
            </div>

            {/* 進捗バー — 報酬演出ではなく、現在地の把握として置く */}
            <div className="flex gap-1" aria-hidden>
              {pos.roadmap.steps.map((s) => (
                <span
                  key={s.slug}
                  className={`h-1.5 flex-1 rounded-full ${progress.read[s.slug] ? "bg-[#9ec4a3]" : "bg-white/15"}`}
                />
              ))}
            </div>

            {/* 目的の切り替え。推定が外れたときの逃げ道を必ず残す */}
            {roadmapsContaining(slug).length > 1 && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-[10.5px] text-[#9FB0A0]">目的が違う場合：</span>
                {roadmapsContaining(slug)
                  .filter((r) => r.id !== goal)
                  .map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => chooseGoal(r.id)}
                      className="rounded-full border border-white/20 px-2.5 py-1 text-[10.5px] text-[#D7DED2] hover:bg-white/[0.08] transition-colors"
                    >
                      {r.label}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* ③ 次にやること — 1つだけ */}
          <div className="px-5 sm:px-7 py-5 border-b border-[#1f2a1d]/8">
            <div className="text-[11px] font-bold tracking-[0.06em] text-[#9aa79a] mb-2">
              次にやること（{pos.step.taskMinutes}分）
            </div>
            <p className="text-[13.5px] text-[#1f2a1d] leading-[1.85] font-semibold">{pos.step.task}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => onTask("done")}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] font-bold transition-colors ${
                  taskState === "done"
                    ? "bg-[#16241A] text-[#EDF1E8]"
                    : "border border-[#3d5638]/40 text-[#3d5638] hover:bg-[#eef3ea]"
                }`}
              >
                {taskState === "done" ? "できた ✓" : "できた"}
              </button>
              <button
                type="button"
                onClick={() => onTask("later")}
                className={`text-[12px] font-semibold underline underline-offset-4 transition-colors ${
                  taskState === "later" ? "text-[#3d5638]" : "text-[#6b7a66] hover:text-[#3d5638]"
                }`}
              >
                {taskState === "later" ? "あとでやる（記録しました）" : "あとでやる"}
              </button>
            </div>
          </div>

          {/* ④ 次に読む */}
          {pos.next.length > 0 && (
            <div className="px-5 sm:px-7 py-5">
              <div className="text-[11px] font-bold tracking-[0.06em] text-[#9aa79a] mb-2.5">次に読む</div>
              <ul className="space-y-2">
                {pos.next.map((s, i) => {
                  const m = meta.get(s.slug);
                  if (!m) return null;
                  return (
                    <li key={s.slug}>
                      <Link
                        href={`/areas/${m.areaId}/${m.slug}?goal=${pos.roadmap.id}`}
                        onClick={() => track("article_next_click", { goal: pos.roadmap.id, slug, to: s.slug })}
                        className="group flex items-start justify-between gap-3 rounded-[1rem] border border-[#1f2a1d]/10 bg-[#f6f8f4] px-4 py-3 hover:border-[#3d5638]/40 transition-colors"
                      >
                        <span className="min-w-0">
                          <span className="flex items-center gap-2 mb-0.5">
                            <span className="font-mono text-[10px] text-[#85AB8B]">Step {pos.index + i + 1}</span>
                            <Stars n={s.impact} />
                          </span>
                          <span className="block text-[13px] font-semibold text-[#1f2a1d] leading-[1.6] group-hover:text-[#3d5638] transition-colors">
                            {m.title}
                          </span>
                        </span>
                        <span aria-hidden className="text-[#3d5638] shrink-0 mt-1 group-hover:translate-x-0.5 transition-transform">
                          →
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      ) : (
        /* ══ ロードマップ未整備、または目的が不明 ══ */
        !asked && (
          <div className="rounded-[1.4rem] border border-[#1f2a1d]/10 bg-white p-5 sm:p-7">
            <div className="text-[13.5px] font-bold text-[#1f2a1d] leading-[1.6] mb-1.5" style={HEAD}>
              この記事を読んでいるのは、どの場面のためですか？
            </div>
            <p className="text-[12px] text-[#6b7a66] leading-[1.8] mb-4">
              答えると、次に読むものが、あなたの順番で並びます。
            </p>
            <div className="flex flex-wrap gap-2">
              {allOccasions
                .filter((o) => roadmapById(o.id))
                .map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => chooseGoal(o.id)}
                    className="rounded-full border border-[#1f2a1d]/15 bg-white px-4 py-2 text-[12.5px] font-semibold text-[#3a423a] hover:border-[#3d5638]/50 transition-colors"
                  >
                    {o.purpose}
                  </button>
                ))}
              <button
                type="button"
                onClick={() => setAsked(true)}
                className="rounded-full px-4 py-2 text-[12.5px] text-[#9aa79a] hover:text-[#6b7a66] transition-colors"
              >
                特に決まっていない
              </button>
            </div>
          </div>
        )
      )}

      {/* ⑤ CTA — 「相談」は手段。欲しいのは計画のほう */}
      <div className="mt-4 rounded-[1.4rem] bg-[#f6f8f4] border border-[#1f2a1d]/10 p-5 sm:p-7">
        <p className="text-[13.5px] font-bold text-[#1f2a1d] leading-[1.75] mb-1">
          {pos ? `${pos.total}ステップ全部を、あなたの日程で組み直しますか。` : "順番を、あなたの日程で組み直しますか。"}
        </p>
        <p className="text-[12px] text-[#6b7a66] leading-[1.85] mb-4">
          年齢とやりたいことだけで、構成と土日の日程が出ます。日付を入れると、間に合うものだけに絞ります。
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={goal ? `/?occasion=${goal}#diagnosis` : "/#occasions"}
            onClick={() => track("article_roadmap_cta", { goal: goal ?? "none", slug })}
            className="inline-flex items-center gap-2 rounded-full bg-[#16241A] hover:bg-[#22331f] text-[#EDF1E8] text-[13.5px] font-bold px-6 py-3 transition-colors"
          >
            あなた専用のロードマップを作る <span aria-hidden>→</span>
          </Link>
          <ConsultLink
            event="plan_consult_click"
            eventProps={{ job: goal ?? "none", placement: "article" }}
            className="text-[12.5px] font-semibold text-[#3d5638] underline underline-offset-4 hover:opacity-70 transition-opacity"
          >
            無料で相談する
          </ConsultLink>
        </div>
        <p className="mt-3 text-[11px] text-[#9aa79a]">30秒・無料・登録不要／匿名のまま進められます。</p>
      </div>
    </section>
  );
}
