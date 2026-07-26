import type { Metadata } from "next";
import Link from "next/link";
import { buildStudioData, readThreadsSnapshot } from "@/lib/studio";

export const metadata: Metadata = {
  title: "Studio — Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// ── 小さな部品 ──────────────────────────────────────────────────
function Kpi({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="py-1">
      <p className="font-mincho text-4xl text-ink leading-none">{value}</p>
      <p className="mt-2 text-[12px] text-ink">{label}</p>
      {sub ? <p className="mt-0.5 text-[11px] text-sub-gray">{sub}</p> : null}
    </div>
  );
}

function Card({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-hair-line bg-paper/30 p-6">
      <div className="flex items-baseline justify-between">
        <h2 className="font-mincho text-lg text-ink">{title}</h2>
        <span className="text-[13px] text-sub-gray tabular-nums">{count}件</span>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function StudioPage() {
  const d = buildStudioData();
  const t = readThreadsSnapshot();

  const pendingShown = t.pending.slice(0, 3);
  const nextShown = d.refineWithoutVideo.slice(0, 6);
  const rPct = Math.round(
    (d.track.recover / Math.max(d.track.recover + d.track.refine, 1)) * 100,
  );

  return (
    <div className="mx-auto max-w-[960px] px-6 sm:px-10 pt-12 sm:pt-16 pb-24">
      <header className="mb-10">
        <h1 className="font-mincho text-3xl sm:text-4xl text-ink leading-[1.4]">
          スタジオ
        </h1>
        <p className="mt-3 text-[13px] text-sub-gray">
          記事と動画の在庫を見て、次に作るものを決める場所。
        </p>
      </header>

      {/* KPI — 罫線区切りの静かな行 */}
      <section className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-hair-line border-y border-hair-line">
        <div className="px-1 sm:px-6 py-5 sm:pl-0">
          <Kpi label="記事" value={String(d.totals.articles)} />
        </div>
        <div className="px-1 sm:px-6 py-5">
          <Kpi
            label="動画"
            value={String(d.totals.videos)}
            sub={`書き出し済み ${d.totals.videosRendered}`}
          />
        </div>
        <div className="px-1 sm:px-6 py-5">
          <Kpi
            label="動画カバレッジ"
            value={`${d.totals.coveragePct}%`}
          />
        </div>
        <div className="px-1 sm:px-6 py-5">
          <Kpi
            label="Recover : Refine"
            value={`${d.track.recover}:${d.track.refine}`}
          />
        </div>
      </section>

      {/* いま やること — 2つの行動だけを前面に */}
      <h2 className="mt-14 mb-4 text-[11px] tracking-[0.25em] text-sub-gray uppercase">
        いま やること
      </h2>
      <div className="grid md:grid-cols-2 gap-4">
        {/* 承認待ち */}
        <Card title="承認する（Threads）" count={t.available ? t.queue.pending : 0}>
          {!t.available || t.pending.length === 0 ? (
            <p className="text-[13px] text-sub-gray">
              承認待ちはありません。
            </p>
          ) : (
            <ul className="space-y-3">
              {pendingShown.map((it) => (
                <li key={it.id} className="border-b border-hair-line/60 pb-3 last:border-0 last:pb-0">
                  <p className="text-[13px] text-ink leading-[1.7] line-clamp-2">
                    {it.preview}…
                  </p>
                  <p className="mt-1 text-[11px] text-sub-gray">
                    {it.createdAt ? it.createdAt.slice(5, 16).replace("T", " ") : it.id}
                    {it.isThread ? " · 連投" : ""}
                  </p>
                </li>
              ))}
              {t.pending.length > pendingShown.length ? (
                <li className="text-[12px] text-sub-gray">
                  ほか {t.pending.length - pendingShown.length} 件
                </li>
              ) : null}
            </ul>
          )}
          <p className="mt-4 text-[11px] text-sub-gray leading-[1.8]">
            承認は apps/threads 側で。承認後、次の cron で投稿されます。
          </p>
        </Card>

        {/* 次に作る動画 */}
        <Card title="次に作る動画" count={d.refineWithoutVideo.length}>
          {d.refineWithoutVideo.length === 0 ? (
            <p className="text-[13px] text-ink">
              Refine 記事はすべて動画化済み。
            </p>
          ) : (
            <ul className="space-y-2">
              {nextShown.map((r) => (
                <li key={r.href} className="flex items-baseline gap-2">
                  <span className="text-[10px] text-sub-gray shrink-0 w-14 truncate">
                    {r.areaId}
                  </span>
                  <Link
                    href={r.href}
                    className="text-[13px] text-ink hover:text-gold truncate"
                  >
                    {r.title}
                  </Link>
                </li>
              ))}
              {d.refineWithoutVideo.length > nextShown.length ? (
                <li className="text-[12px] text-sub-gray">
                  ほか {d.refineWithoutVideo.length - nextShown.length} 件
                </li>
              ) : null}
            </ul>
          )}
          <p className="mt-4 text-[11px] text-sub-gray leading-[1.8]">
            潜在（Refine）は動画で育てる。上から順に作れば偏りが埋まります。
          </p>
        </Card>
      </div>

      {/* 在庫 — 参照用。軽く */}
      <h2 className="mt-14 mb-4 text-[11px] tracking-[0.25em] text-sub-gray uppercase">
        在庫
      </h2>

      {/* トラックの偏り（1行バー） */}
      <div className="mb-8">
        <div className="flex h-2.5 w-full overflow-hidden rounded-full">
          <div className="bg-ink/70" style={{ width: `${rPct}%` }} />
          <div className="bg-gold/60" style={{ width: `${100 - rPct}%` }} />
        </div>
        <div className="mt-2 flex justify-between text-[12px] text-sub-gray">
          <span>Recover {d.track.recover}（顕在／SEO）</span>
          <span>Refine {d.track.refine}（潜在／動画）</span>
        </div>
      </div>

      {/* 動画ライブラリ（シンプルなリスト） */}
      <div className="mb-8">
        <p className="mb-3 text-[13px] text-ink">動画ライブラリ</p>
        <ul className="divide-y divide-hair-line/70 border-y border-hair-line/70">
          {d.rows
            .filter((r) => r.video)
            .map((r) => (
              <li
                key={r.video!.compositionId}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="text-[13px] text-ink truncate">{r.video!.title}</p>
                  <Link
                    href={r.href}
                    className="text-[11px] text-sub-gray hover:text-gold truncate block"
                  >
                    {r.title}
                  </Link>
                </div>
                <span className="shrink-0 text-[11px] text-sub-gray tabular-nums">
                  {r.video!.seconds}s ·{" "}
                  {r.video!.status === "rendered" ? "書き出し済み" : "下書き"}
                </span>
              </li>
            ))}
        </ul>
        <p className="mt-3 text-[11px] text-sub-gray">
          書き出し: <code className="text-[11px]">npm run render:&lt;id&gt; -w @hr/video</code>
        </p>
      </div>

      {/* エリア別（コンパクト表） */}
      <div className="overflow-x-auto">
        <p className="mb-3 text-[13px] text-ink">エリア別</p>
        <table className="w-full min-w-[480px] text-[13px]">
          <thead>
            <tr className="text-left text-[11px] text-sub-gray">
              <th className="py-1.5 pr-4 font-normal">エリア</th>
              <th className="py-1.5 pr-4 font-normal tabular-nums">記事</th>
              <th className="py-1.5 pr-4 font-normal tabular-nums">Recover</th>
              <th className="py-1.5 pr-4 font-normal tabular-nums">Refine</th>
              <th className="py-1.5 pr-4 font-normal tabular-nums">動画</th>
            </tr>
          </thead>
          <tbody className="text-sub-gray">
            {d.byArea.map((a) => (
              <tr key={a.areaId} className="border-t border-hair-line/60">
                <td className="py-2.5 pr-4 text-ink">{a.label}</td>
                <td className="py-2.5 pr-4 tabular-nums">{a.articles}</td>
                <td className="py-2.5 pr-4 tabular-nums">{a.recover}</td>
                <td className="py-2.5 pr-4 tabular-nums">{a.refine}</td>
                <td className="py-2.5 pr-4 tabular-nums">{a.videos}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* フッター — 数字の導線を1行に */}
      <footer className="mt-14 border-t border-hair-line pt-5 text-[12px] text-sub-gray">
        数字：
        <Link href="/admin/insights" className="text-ink hover:text-gold mx-1">
          Insights
        </Link>
        ·
        <Link href="/admin/data" className="text-ink hover:text-gold mx-1">
          Data
        </Link>
        · Threads の閲覧数・承認は{" "}
        <code className="text-[11px]">apps/threads/admin</code>。
      </footer>
    </div>
  );
}
