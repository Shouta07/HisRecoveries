import type { Metadata } from "next";
import Link from "next/link";
import { buildStudioData } from "@/lib/studio";

export const metadata: Metadata = {
  title: "Studio — Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border border-hair-line bg-paper/40 px-5 py-4">
      <p className="text-[10px] tracking-[0.25em] text-sub-gray uppercase">
        {label}
      </p>
      <p className="mt-2 font-mincho text-3xl text-ink leading-none">{value}</p>
      {sub ? <p className="mt-2 text-[12px] text-sub-gray">{sub}</p> : null}
    </div>
  );
}

function TrackBar({
  recover,
  refine,
}: {
  recover: number;
  refine: number;
}) {
  const total = Math.max(recover + refine, 1);
  const rPct = Math.round((recover / total) * 100);
  const fPct = 100 - rPct;
  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full border border-hair-line">
        <div
          className="bg-ink/70"
          style={{ width: `${rPct}%` }}
          title={`Recover ${recover}`}
        />
        <div
          className="bg-gold/70"
          style={{ width: `${fPct}%` }}
          title={`Refine ${refine}`}
        />
      </div>
      <div className="mt-2 flex justify-between text-[12px] text-sub-gray">
        <span>
          <span className="text-ink">Recover {recover}</span>（{rPct}%・顕在／SEOで刈る）
        </span>
        <span>
          <span className="text-ink">Refine {refine}</span>（{fPct}%・潜在／SNS動画で育てる）
        </span>
      </div>
    </div>
  );
}

export default function StudioPage() {
  const d = buildStudioData();

  return (
    <div className="mx-auto max-w-[1100px] px-6 sm:px-10 pt-12 sm:pt-16 pb-24">
      <header className="mb-10">
        <p className="text-[10px] tracking-[0.3em] text-sub-gray uppercase">
          Admin · Studio
        </p>
        <h1 className="mt-3 font-mincho text-3xl sm:text-4xl text-ink leading-[1.4]">
          スタジオ — 生成後の管理と数字
        </h1>
        <p className="mt-5 max-w-[40rem] text-[14px] leading-[2] text-sub-gray">
          記事と動画の在庫・カバレッジ・Recover/Refine の偏りをここで見る。
          「潜在（Refine）は SNS 動画で育てる」設計なので、
          <span className="text-ink">Refine で動画が無い記事</span>が次に作るべき対象。
          社外には出さない画面（Basic 認証・noindex）。
        </p>
      </header>

      {/* KPI */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Stat label="記事" value={String(d.totals.articles)} sub="cluster 記事の総数" />
        <Stat
          label="動画"
          value={String(d.totals.videos)}
          sub={`うち書き出し済み ${d.totals.videosRendered}`}
        />
        <Stat
          label="動画カバレッジ"
          value={`${d.totals.coveragePct}%`}
          sub="記事に対する動画化率"
        />
        <Stat
          label="Recover : Refine"
          value={`${d.track.recover}:${d.track.refine}`}
          sub={`未設定 ${d.track.untracked}`}
        />
      </section>

      {/* Track balance */}
      <section className="mt-12">
        <h2 className="font-mincho text-xl text-ink">トラックの偏り</h2>
        <p className="mt-2 mb-5 text-[13px] text-sub-gray">
          動画は Refine（プラスα・SNSで育てる）に効く。現在の動画{" "}
          {d.totals.videos} 本の内訳： Recover {d.trackVideos.recover} ／ Refine{" "}
          {d.trackVideos.refine}。
        </p>
        <TrackBar recover={d.track.recover} refine={d.track.refine} />
      </section>

      {/* Video library */}
      <section className="mt-14">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-mincho text-xl text-ink">動画ライブラリ</h2>
          <span className="text-[12px] text-sub-gray">
            packages/video · 9:16 縦
          </span>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[720px] text-[13px]">
            <thead>
              <tr className="border-b border-hair-line text-left text-sub-gray">
                <th className="py-2 pr-4 font-normal">コンポジション</th>
                <th className="py-2 pr-4 font-normal">元記事</th>
                <th className="py-2 pr-4 font-normal">尺</th>
                <th className="py-2 pr-4 font-normal">状態</th>
                <th className="py-2 pr-4 font-normal">書き出し</th>
              </tr>
            </thead>
            <tbody>
              {d.rows
                .filter((r) => r.video)
                .map((r) => (
                  <tr
                    key={r.video!.compositionId}
                    className="border-b border-hair-line/60 align-top"
                  >
                    <td className="py-3 pr-4 text-ink">{r.video!.title}</td>
                    <td className="py-3 pr-4">
                      <Link
                        href={r.href}
                        className="text-ink hover:text-gold underline underline-offset-2"
                      >
                        {r.title}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 text-sub-gray">
                      {r.video!.seconds}s
                    </td>
                    <td className="py-3 pr-4">
                      <span className="rounded-full border border-hair-line px-2 py-0.5 text-[11px] text-sub-gray">
                        {r.video!.status === "rendered"
                          ? "書き出し済み"
                          : "下書き"}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <code className="text-[11px] text-sub-gray break-all">
                        {r.video!.renderScript}
                      </code>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Next to make */}
      <section className="mt-14">
        <h2 className="font-mincho text-xl text-ink">
          次に動画化すべき記事
          <span className="ml-3 text-[13px] text-sub-gray">
            Refine × 動画なし（{d.refineWithoutVideo.length}件）
          </span>
        </h2>
        <p className="mt-2 mb-5 text-[13px] text-sub-gray">
          潜在層は動画で育てる設計。Refine 記事は動画の素材にしやすい。
          この一覧が空になれば Refine の動画在庫は満たされている。
        </p>
        {d.refineWithoutVideo.length === 0 ? (
          <p className="text-[13px] text-ink">
            Refine 記事はすべて動画化済み。
          </p>
        ) : (
          <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
            {d.refineWithoutVideo.map((r) => (
              <li
                key={r.href}
                className="flex items-baseline gap-2 border-b border-hair-line/50 py-2 text-[13px]"
              >
                <span className="text-[11px] text-sub-gray shrink-0">
                  {r.areaId}
                </span>
                <Link
                  href={r.href}
                  className="text-ink hover:text-gold underline underline-offset-2"
                >
                  {r.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* By area */}
      <section className="mt-14">
        <h2 className="font-mincho text-xl text-ink">エリア別の在庫</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[560px] text-[13px]">
            <thead>
              <tr className="border-b border-hair-line text-left text-sub-gray">
                <th className="py-2 pr-4 font-normal">エリア</th>
                <th className="py-2 pr-4 font-normal">記事</th>
                <th className="py-2 pr-4 font-normal">Recover</th>
                <th className="py-2 pr-4 font-normal">Refine</th>
                <th className="py-2 pr-4 font-normal">動画</th>
              </tr>
            </thead>
            <tbody>
              {d.byArea.map((a) => (
                <tr
                  key={a.areaId}
                  className="border-b border-hair-line/60"
                >
                  <td className="py-3 pr-4 text-ink">{a.label}</td>
                  <td className="py-3 pr-4 text-sub-gray">{a.articles}</td>
                  <td className="py-3 pr-4 text-sub-gray">{a.recover}</td>
                  <td className="py-3 pr-4 text-sub-gray">{a.refine}</td>
                  <td className="py-3 pr-4 text-sub-gray">{a.videos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Numbers pointers */}
      <section className="mt-14 rounded-lg border border-hair-line bg-paper/40 px-6 py-6">
        <h2 className="font-mincho text-xl text-ink">数字はどこで見るか</h2>
        <ul className="mt-4 space-y-3 text-[13px] leading-[1.9] text-sub-gray">
          <li>
            <Link
              href="/admin/insights"
              className="text-ink hover:text-gold underline underline-offset-2"
            >
              Insights
            </Link>
            ｜ サイトのファネル（診断開始・完了、応募、記事CTA、送客クリック）。
          </li>
          <li>
            <Link
              href="/admin/data"
              className="text-ink hover:text-gold underline underline-offset-2"
            >
              Data
            </Link>
            ｜ 生ログ・エクスポート。
          </li>
          <li>
            <span className="text-ink">Threads の数値</span>
            ｜ 別システム（<code className="text-[12px]">apps/threads/admin</code>
            ）。投稿ごとの閲覧・いいね・返信・機会別集計。承認キューもそこ。
          </li>
        </ul>
      </section>

      <p className="mt-12 text-[12px] text-sub-gray">
        新しい動画を作ったら packages/video に data を1つ足し、
        <code className="mx-1 text-[11px]">src/lib/studio.ts</code>
        の VIDEO_REGISTRY に1行追加すればこの画面に反映される。
      </p>
    </div>
  );
}
