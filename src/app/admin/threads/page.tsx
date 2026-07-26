import type { Metadata } from "next";
import Link from "next/link";
import { readThreadsSnapshot } from "@/lib/studio";
import { readThreadsPlan, typeLabel } from "@/lib/threadsPreview";

export const metadata: Metadata = {
  title: "Threads Preview — Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// 連投を「投稿の吹き出し」風に並べる
function Thread({ posts }: { posts: string[] }) {
  if (posts.length === 0) {
    return <p className="text-[12px] text-brand-cream/50">本文なし</p>;
  }
  return (
    <ol className="space-y-2">
      {posts.map((p, i) => (
        <li
          key={i}
          className="rounded-lg border border-brand-cream/12 bg-brand-cream/[0.03] px-3 py-2 text-[12.5px] leading-[1.7] whitespace-pre-wrap"
        >
          <span className="mr-2 text-[10px] text-sage tabular-nums">{i + 1}</span>
          {p}
        </li>
      ))}
    </ol>
  );
}

export default function ThreadsPreviewPage() {
  const snap = readThreadsSnapshot();
  const plan = readThreadsPlan();

  // タイプ別にまとめる（読者層ごと）
  const byType = new Map<string, typeof plan.types>();
  for (const h of plan.types) {
    const arr = byType.get(h.type) ?? [];
    arr.push(h);
    byType.set(h.type, arr);
  }

  return (
    <div className="bg-brand text-brand-cream min-h-[calc(100vh-49px)]">
      <div className="mx-auto max-w-[860px] px-5 sm:px-8 py-7">
        {/* ヘッダー */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center rounded-full bg-sage-bright px-3 py-0.5 text-[10px] tracking-[0.18em] text-brand uppercase font-semibold">
              Threads
            </span>
            <h1 className="mt-2 font-mincho text-2xl sm:text-3xl text-brand-cream leading-tight">
              投稿プレビュー
            </h1>
            <p className="mt-1 text-[12px] text-brand-cream/55">
              どんな投稿がされる予定かを、事前に確認する。
            </p>
          </div>
          <Link href="/admin/studio" className="text-[12px] text-sage hover:text-sage-bright shrink-0">
            ← Studio
          </Link>
        </div>

        {/* 承認待ち（今すぐ判断する実物） */}
        <section className="mt-8">
          <h2 className="text-[11px] tracking-[0.25em] text-sage uppercase mb-3">
            承認待ち（今すぐ判断） · {snap.available ? snap.queue.pending : 0}件
          </h2>
          {!snap.available || snap.pending.length === 0 ? (
            <p className="text-[12px] text-brand-cream/55">
              承認待ちはありません。生成（threads-post）が走ると、ここに投稿前の実物が並びます。
            </p>
          ) : (
            <div className="space-y-4">
              {snap.pending.map((it) => (
                <div key={it.id} className="rounded-xl border border-brand-cream/12 bg-brand-cream/[0.04] p-4">
                  <p className="mb-2 text-[10px] text-brand-cream/45">
                    {it.createdAt ? it.createdAt.slice(0, 16).replace("T", " ") : it.id}
                    {it.isThread ? " · 連投" : ""}
                  </p>
                  <Thread posts={it.posts} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* スケジュール */}
        {plan.slots.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-[11px] tracking-[0.25em] text-sage uppercase mb-3">
              スケジュール（承認ゲート ON = 承認まで投稿されない）
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {plan.slots.map((s) => (
                <div key={s.time} className="rounded-lg border border-brand-cream/12 bg-brand-cream/[0.03] px-4 py-3">
                  <p className="text-[13px] text-brand-cream">{s.time}</p>
                  <p className="mt-1 text-[11px] text-brand-cream/60 leading-[1.7]">
                    {s.types.join(" ／ ")}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* タイプ別の投稿例 */}
        <section className="mt-10">
          <h2 className="text-[11px] tracking-[0.25em] text-sage uppercase mb-1">
            タイプ別の投稿例（この型で生成されます）
          </h2>
          <p className="text-[11px] text-brand-cream/45 mb-4">
            実際は Gemini がこの型・トーンで毎回作り直す。以下は各タイプの見本。
          </p>
          <div className="space-y-6">
            {[...byType.entries()].map(([type, list]) => (
              <div key={type}>
                <h3 className="font-mincho text-[15px] text-brand-cream mb-2">
                  {typeLabel(type)}
                  <span className="ml-2 text-[11px] text-brand-cream/45">{list.length}種</span>
                </h3>
                <div className="space-y-3">
                  {list.map((h) => (
                    <details
                      key={h.id}
                      className="rounded-xl border border-brand-cream/12 bg-brand-cream/[0.04] p-4"
                    >
                      <summary className="cursor-pointer list-none">
                        <span className="text-[13px] text-brand-cream">{h.name}</span>
                        <span className="ml-2 text-[10px] text-sage">
                          {h.when.length ? h.when.join("・") : "—"}
                        </span>
                        {h.topics.length ? (
                          <span className="ml-2 text-[10px] text-brand-cream/40">
                            {h.topics.slice(0, 3).join(" / ")}
                          </span>
                        ) : null}
                      </summary>
                      <div className="mt-3">
                        <Thread posts={h.sample} />
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-10 border-t border-brand-cream/15 pt-4 text-[11px] text-brand-cream/45 leading-[1.8]">
          承認・却下は apps/threads（CLI か admin）。承認後、次の post-approved cron で投稿。
          リンクは各連投の最後に1本だけ付きます（{"{link}"} = /apply か /areas）。
        </footer>
      </div>
    </div>
  );
}
