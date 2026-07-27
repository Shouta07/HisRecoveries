import type { Metadata } from "next";
import Link from "next/link";
import { buildMarketReport, MIN_SAMPLE } from "@/lib/markets";

export const metadata: Metadata = {
  title: "Markets — Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function Bar({ value, max }: { value: number; max: number }) {
  const w = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-1.5 w-full rounded-full bg-brand-cream/10">
      <div className="h-full rounded-full bg-sage-bright" style={{ width: `${w}%` }} />
    </div>
  );
}

export default async function MarketsPage() {
  const r = await buildMarketReport();
  const maxView = Math.max(...r.rows.map((x) => x.view), 1);
  const maxSelect = Math.max(...r.rows.map((x) => x.select), 1);

  return (
    <div className="bg-brand text-brand-cream min-h-[calc(100vh-49px)]">
      <div className="mx-auto max-w-[980px] px-5 sm:px-8 py-7">
        {/* ヘッダー */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center rounded-full bg-sage-bright px-3 py-0.5 text-[10px] tracking-[0.18em] text-brand uppercase font-semibold">
              Markets
            </span>
            <h1 className="mt-2 font-mincho text-2xl sm:text-3xl text-brand-cream leading-tight">
              どれが勝てる市場か
            </h1>
            <p className="mt-1 text-[12px] text-brand-cream/55">
              6領域を「需要 → 関心 → 意向」で測り、賭ける先を1つに絞るための画面。
              直近 {r.sinceDays} 日。
            </p>
          </div>
          <Link href="/admin/studio" className="text-[12px] text-sage hover:text-sage-bright shrink-0">
            ← Studio
          </Link>
        </div>

        {/* 状態の説明 */}
        {!r.enabled ? (
          <p className="mt-6 rounded-xl border border-brand-cream/12 bg-brand-cream/[0.04] p-4 text-[12.5px] leading-[1.9]">
            計測DB（Supabase）が未接続のため、まだ数字は出ません。
            <span className="text-brand-cream/60">
              {" "}
              環境変数（SUPABASE_URL / SERVICE_KEY）を設定すると、この画面が自動で埋まります。
            </span>
          </p>
        ) : !r.hasData ? (
          <p className="mt-6 rounded-xl border border-brand-cream/12 bg-brand-cream/[0.04] p-4 text-[12.5px] leading-[1.9]">
            計測は動いていますが、まだイベントがありません。サイトに人が来て
            「診断で悩みを選ぶ・領域の記事を読む・相談を押す」と、ここに溜まります。
          </p>
        ) : null}

        {/* 3点の合計 */}
        <div className="mt-6 flex gap-8">
          {[
            { v: r.totals.select, l: "需要（診断で選ばれた）" },
            { v: r.totals.view, l: "関心（記事を読んだ）" },
            { v: r.totals.consult, l: "意向（相談を押した）" },
          ].map((k) => (
            <div key={k.l}>
              <p className="font-mincho text-3xl leading-none">{k.v}</p>
              <p className="mt-1.5 text-[11px] text-sage">{k.l}</p>
            </div>
          ))}
        </div>

        {/* ゴール別（新しい軸の一次指標） */}
        <h2 className="mt-9 mb-1 text-[11px] tracking-[0.25em] text-sage uppercase">
          ゴール別（どの「理想の日」が求められているか）
        </h2>
        <p className="mb-3 text-[11px] text-brand-cream/45">
          サイトの軸を「悩み」から「迎えたい日」に移したため、勝てる市場の一次指標はこちら。
          選ばれた数だけでなく、<span className="text-brand-cream/70">実際に手が動いたか</span>（1選択あたりの完了ステップ）を見る。
        </p>
        <div className="grid sm:grid-cols-3 gap-3">
          {r.goals.map((g) => (
            <div key={g.id} className="rounded-xl border border-brand-cream/12 bg-brand-cream/[0.04] p-4">
              <p className="text-[13.5px] text-brand-cream">{g.label}</p>
              <p className="mt-2 font-mincho text-3xl leading-none">{g.select}</p>
              <p className="mt-1 text-[11px] text-brand-cream/50">選ばれた回数</p>
              <p className="mt-2.5 text-[11.5px] text-sage">
                完了 {g.stepDone}
                {g.stepsPerSelect !== null ? (
                  <span className="text-brand-cream/50">（1人あたり {g.stepsPerSelect}）</span>
                ) : null}
              </p>
            </div>
          ))}
        </div>

        {/* 判定 */}
        <h2 className="mt-9 mb-3 text-[11px] tracking-[0.25em] text-sage uppercase">
          判定（領域別・意向転換率）
        </h2>
        {r.ranked.length === 0 ? (
          <div className="rounded-xl border border-brand-cream/12 bg-brand-cream/[0.04] p-4 text-[12.5px] leading-[1.9]">
            <p className="text-brand-cream">まだ判定できません。</p>
            <p className="mt-1 text-brand-cream/60">
              1領域あたり関心（閲覧）{MIN_SAMPLE} 件を超えると、意向転換率で順位を出します。
              少ないサンプルで勝ち市場を決めないための安全装置です。
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-sage/30 bg-brand-cream/[0.06] p-4">
            <p className="text-[13px]">
              現時点の一次候補：
              <span className="ml-2 font-mincho text-lg text-sage-bright">
                {r.ranked[0].ja}
              </span>
              <span className="ml-2 text-[12px] text-brand-cream/60">
                意向転換率 {r.ranked[0].consultRate}%（閲覧 {r.ranked[0].view}）
              </span>
            </p>
            {r.ranked.length > 1 ? (
              <p className="mt-1.5 text-[11.5px] text-brand-cream/55">
                次点: {r.ranked.slice(1, 3).map((x) => `${x.ja} ${x.consultRate}%`).join(" ／ ")}
              </p>
            ) : null}
          </div>
        )}

        {/* 領域別 */}
        <h2 className="mt-9 mb-3 text-[11px] tracking-[0.25em] text-sage uppercase">領域別</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-[12.5px]">
            <thead>
              <tr className="text-left text-[11px] text-brand-cream/50">
                <th className="pb-2 pr-4 font-normal">領域</th>
                <th className="pb-2 pr-3 font-normal">需要</th>
                <th className="pb-2 pr-3 font-normal">関心</th>
                <th className="pb-2 pr-3 font-normal">意向</th>
                <th className="pb-2 pr-3 font-normal">意向率</th>
                <th className="pb-2 pr-3 font-normal">在庫</th>
                <th className="pb-2 font-normal w-[22%]">関心の分布</th>
              </tr>
            </thead>
            <tbody>
              {r.rows.map((m) => (
                <tr key={m.id} className="border-t border-brand-cream/10 align-middle">
                  <td className="py-2.5 pr-4">
                    <span className="text-brand-cream">{m.ja}</span>
                    <span className="block text-[10px] text-brand-cream/40 max-w-[16rem] truncate">
                      {m.worry}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 tabular-nums">{m.select}</td>
                  <td className="py-2.5 pr-3 tabular-nums">{m.view}</td>
                  <td className="py-2.5 pr-3 tabular-nums">{m.consult}</td>
                  <td className="py-2.5 pr-3 tabular-nums">
                    {m.enough && m.consultRate !== null ? (
                      <span className="text-sage-bright">{m.consultRate}%</span>
                    ) : (
                      <span className="text-brand-cream/30" title={`関心${MIN_SAMPLE}件未満は判定しない`}>
                        —
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 pr-3 text-[11px] text-brand-cream/60 whitespace-nowrap">
                    記事{m.articles} / 動画{m.videos}
                  </td>
                  <td className="py-2.5">
                    <Bar value={m.view} max={maxView} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 需要の分布（診断） */}
        <h2 className="mt-9 mb-3 text-[11px] tracking-[0.25em] text-sage uppercase">
          需要の分布（診断で選ばれた悩み）
        </h2>
        <div className="space-y-2">
          {[...r.rows]
            .sort((a, b) => b.select - a.select)
            .map((m) => (
              <div key={m.id} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-[12px] text-brand-cream/80">{m.ja}</span>
                <div className="flex-1">
                  <Bar value={m.select} max={maxSelect} />
                </div>
                <span className="w-10 text-right text-[11px] tabular-nums text-brand-cream/60">
                  {m.select}
                </span>
              </div>
            ))}
        </div>

        {/* 読み方 */}
        <h2 className="mt-9 mb-3 text-[11px] tracking-[0.25em] text-sage uppercase">読み方</h2>
        <div className="grid sm:grid-cols-3 gap-3 text-[12px] leading-[1.9]">
          {[
            ["需要が大きい", "悩む人は多い。ただし「多い＝勝てる」ではない（競合も多い）。"],
            ["意向率が高い", "読んだ人が相談まで動く＝お金と信頼が動く市場。ここが本命の指標。"],
            ["在庫が薄いのに数字が出る", "伸びしろ。記事・動画を足せば最も効率よく伸びる領域。"],
          ].map(([t, d]) => (
            <div key={t} className="rounded-xl border border-brand-cream/12 bg-brand-cream/[0.04] p-4">
              <p className="text-brand-cream mb-1">{t}</p>
              <p className="text-brand-cream/65">{d}</p>
            </div>
          ))}
        </div>

        <footer className="mt-8 border-t border-brand-cream/15 pt-4 text-[11px] text-brand-cream/45 leading-[1.8]">
          計測: 需要 market_select（診断）／関心 market_view（領域ページ）／意向
          market_consult_click（相談CTA）。1領域あたり関心 {MIN_SAMPLE} 件未満は
          意向率を出さない（早すぎる結論を防ぐため）。
        </footer>
      </div>
    </div>
  );
}
