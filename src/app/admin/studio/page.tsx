import type { Metadata } from "next";
import Link from "next/link";
import {
  buildStudioData,
  readThreadsSnapshot,
  CHANNELS,
  CHANNEL_LABELS,
  STAGE_LABELS,
  DRIVE_ROOT,
  EXTERNAL_LINKS,
} from "@/lib/studio";

export const metadata: Metadata = {
  title: "Studio — Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// 深緑ベースの1画面ダッシュボード。文字はクリーム/セージ。スクロール最小。
export default function StudioPage() {
  const d = buildStudioData();
  const t = readThreadsSnapshot();

  const pendingShown = t.pending.slice(0, 2);
  const nextShown = d.refineWithoutVideo.slice(0, 5);
  const rPct = Math.round(
    (d.track.recover / Math.max(d.track.recover + d.track.refine, 1)) * 100,
  );
  const videoRows = d.rows.filter((r) => r.video);

  const kpis = [
    { v: String(d.totals.articles), l: "記事" },
    { v: String(d.totals.videos), l: "動画" },
    { v: `${d.totals.coveragePct}%`, l: "動画化率" },
    { v: `${d.track.recover}:${d.track.refine}`, l: "Recover:Refine" },
  ];

  return (
    <div className="bg-brand text-brand-cream min-h-[calc(100vh-49px)]">
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8 py-7">
        {/* ヘッダー + KPI を1バンドに */}
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div>
            <span className="inline-flex items-center rounded-full bg-sage-bright px-3 py-0.5 text-[10px] tracking-[0.18em] text-brand uppercase font-semibold">
              Studio
            </span>
            <h1 className="mt-2 font-mincho text-2xl sm:text-3xl leading-tight text-brand-cream">
              スタジオ
            </h1>
            <p className="mt-1 text-[12px] text-brand-cream/55">
              在庫を見て、次に作るものを決める場所。
            </p>
            <div className="mt-2 flex flex-wrap gap-4 text-[12px]">
              <Link href="/admin/checkout" className="text-sage-bright hover:text-brand-cream font-semibold">
                お支払いリンク発行 →
              </Link>
              <Link href="/admin/markets" className="text-sage hover:text-sage-bright">
                勝てる市場 →
              </Link>
              <Link href="/admin/strategy" className="text-sage hover:text-sage-bright">
                マーケ戦略 →
              </Link>
              <Link href="/admin/threads" className="text-sage hover:text-sage-bright">
                Threads 予定 →
              </Link>
            </div>
          </div>
          <div className="flex gap-6 sm:gap-9">
            {kpis.map((k) => (
              <div key={k.l}>
                <p className="font-mincho text-3xl leading-none">{k.v}</p>
                <p className="mt-1.5 text-[11px] text-sage">{k.l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* トラックバー（細） */}
        <div className="mt-6">
          <div className="flex h-2 w-full overflow-hidden rounded-full bg-brand-cream/10">
            <div className="bg-brand-cream/35" style={{ width: `${rPct}%` }} />
            <div className="bg-sage-bright" style={{ width: `${100 - rPct}%` }} />
          </div>
          <div className="mt-1.5 flex justify-between text-[11px] text-brand-cream/55">
            <span>Recover {d.track.recover}（顕在／SEO）</span>
            <span>Refine {d.track.refine}（潜在／動画）</span>
          </div>
        </div>

        {/* メイン: 3カラム（やること2 + 配信1） */}
        <div className="mt-6 grid lg:grid-cols-3 gap-4">
          {/* 承認 */}
          <Panel
            title="承認する（Threads）"
            badge={`${t.available ? t.queue.pending : 0}`}
            action={
              <Link href="/admin/threads" className="text-[11px] text-sage hover:text-sage-bright">
                予定 →
              </Link>
            }
          >
            {!t.available || t.pending.length === 0 ? (
              <p className="text-[12px] text-brand-cream/55">承認待ちはありません。</p>
            ) : (
              <ul className="space-y-2.5">
                {pendingShown.map((it) => (
                  <li key={it.id} className="text-[12px] leading-[1.6]">
                    <p className="line-clamp-2">{it.preview}…</p>
                    <p className="mt-0.5 text-[10px] text-brand-cream/45">
                      {it.createdAt ? it.createdAt.slice(5, 16).replace("T", " ") : it.id}
                      {it.isThread ? " · 連投" : ""}
                    </p>
                  </li>
                ))}
                {t.pending.length > pendingShown.length ? (
                  <li className="text-[11px] text-brand-cream/55">
                    ほか {t.pending.length - pendingShown.length} 件
                  </li>
                ) : null}
              </ul>
            )}
          </Panel>

          {/* 次に作る動画 */}
          <Panel title="次に作る動画" badge={`${d.refineWithoutVideo.length}`}>
            {d.refineWithoutVideo.length === 0 ? (
              <p className="text-[12px] text-brand-cream/55">Refine はすべて動画化済み。</p>
            ) : (
              <ul className="space-y-1.5">
                {nextShown.map((r) => (
                  <li key={r.href} className="flex items-baseline gap-2 text-[12px]">
                    <span className="w-14 shrink-0 truncate text-[10px] text-sage">
                      {r.areaId}
                    </span>
                    <Link href={r.href} className="truncate hover:text-sage-bright">
                      {r.title}
                    </Link>
                  </li>
                ))}
                {d.refineWithoutVideo.length > nextShown.length ? (
                  <li className="text-[11px] text-brand-cream/55">
                    ほか {d.refineWithoutVideo.length - nextShown.length} 件
                  </li>
                ) : null}
              </ul>
            )}
          </Panel>

          {/* 配信ステータス */}
          <Panel
            title="動画と配信"
            action={
              <a
                href={DRIVE_ROOT}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-sage hover:text-sage-bright"
              >
                Drive →
              </a>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="text-brand-cream/45">
                    <th className="pb-1 pr-2 text-left font-normal">動画</th>
                    {CHANNELS.map((c) => (
                      <th key={c} className="pb-1 px-1 text-center font-normal">
                        {CHANNEL_LABELS[c]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {videoRows.map((r) => {
                    const v = r.video!;
                    return (
                      <tr key={v.compositionId} className="border-t border-brand-cream/10">
                        <td className="py-1.5 pr-2">
                          <span className="block max-w-[7.5rem] truncate">{v.title}</span>
                          <span className="text-[9px] text-brand-cream/40">
                            {STAGE_LABELS[v.stage ?? "producing"]}
                          </span>
                        </td>
                        {CHANNELS.map((c) => {
                          const rec = v.distributed?.[c];
                          return (
                            <td key={c} className="py-1.5 px-1 text-center tabular-nums">
                              {rec ? (
                                <span className="text-sage-bright">{rec.date.slice(5)}</span>
                              ) : (
                                <span className="text-brand-cream/25">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        {/* 数字・ツール（1行） */}
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px]">
          <span className="text-[10px] tracking-[0.2em] text-sage uppercase">数字</span>
          <a href={EXTERNAL_LINKS.searchConsole} target="_blank" rel="noreferrer" className="hover:text-sage-bright">
            Search Console ↗
          </a>
          <a href={EXTERNAL_LINKS.analytics} target="_blank" rel="noreferrer" className="hover:text-sage-bright">
            Analytics ↗
          </a>
          <a href={DRIVE_ROOT} target="_blank" rel="noreferrer" className="hover:text-sage-bright">
            Drive ↗
          </a>
          <Link href="/admin/insights" className="hover:text-sage-bright">
            Insights
          </Link>
          <Link href="/admin/data" className="hover:text-sage-bright">
            Data
          </Link>
        </div>

        {/* その他ツール（1行・小） */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-brand-cream/55">
          <span className="text-[10px] tracking-[0.2em] uppercase">その他</span>
          {[
            { href: "/admin/checks", label: "Checks" },
            { href: "/admin/asks", label: "Asks" },
            { href: "/admin/guides", label: "Guides" },
            { href: "/admin/network", label: "Certified" },
            { href: "/admin/tools/eval-thread", label: "Eval" },
            { href: "/admin/tools/letter", label: "Letter" },
          ].map((it) => (
            <Link key={it.href} href={it.href} className="hover:text-sage-bright">
              {it.label}
            </Link>
          ))}
        </div>

        <p className="mt-5 text-[10px] text-brand-cream/40 leading-[1.7]">
          配信したら studio.ts の該当動画に distributed / stage を記入。GA4・Search Console は
          埋め込み不可のため外部リンク（数字の画面内表示は API 連携で対応可）。
        </p>
      </div>
    </div>
  );
}

// ── パネル（深緑上の薄いカード） ─────────────────────────────────
function Panel({
  title,
  badge,
  action,
  children,
}: {
  title: string;
  badge?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-brand-cream/12 bg-brand-cream/[0.04] p-4">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="font-mincho text-[15px] text-brand-cream">{title}</h2>
        <div className="flex items-baseline gap-3">
          {badge !== undefined ? (
            <span className="text-[12px] text-sage tabular-nums">{badge}件</span>
          ) : null}
          {action}
        </div>
      </div>
      {children}
    </section>
  );
}
