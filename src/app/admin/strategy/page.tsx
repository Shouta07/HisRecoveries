import type { Metadata } from "next";
import Link from "next/link";
import { buildStudioData } from "@/lib/studio";

export const metadata: Metadata = {
  title: "Strategy — Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function H({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-9 mb-3 text-[11px] tracking-[0.25em] text-sage uppercase">
      {children}
    </h2>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-brand-cream/12 bg-brand-cream/[0.04] p-4 text-[13px] leading-[1.9]">
      {children}
    </div>
  );
}

export default function StrategyPage() {
  const d = buildStudioData();

  return (
    <div className="bg-brand text-brand-cream min-h-[calc(100vh-49px)]">
      <div className="mx-auto max-w-[860px] px-5 sm:px-8 py-7">
        {/* ヘッダー */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center rounded-full bg-sage-bright px-3 py-0.5 text-[10px] tracking-[0.18em] text-brand uppercase font-bold">
              Strategy
            </span>
            <h1 className="mt-2 font-mincho text-2xl sm:text-3xl text-brand-cream leading-tight">
              マーケティング戦略
            </h1>
            <p className="mt-1 text-[12px] text-brand-cream/55">
              AIで男性を最も深く理解し、複数媒体で「変わりたい」に伴走する。
            </p>
          </div>
          <Link href="/admin/studio" className="text-[12px] text-sage hover:text-sage-bright shrink-0">
            ← Studio
          </Link>
        </div>

        {/* 核心の思想 */}
        <H>核心の思想</H>
        <Card>
          <p className="text-brand-cream">
            目的はひとつ：すべての導線を His Recoveries に集約すること。
          </p>
          <pre className="mt-3 text-[11.5px] text-brand-cream/70 leading-[1.8] whitespace-pre-wrap font-mono">
{`認知（Threads / IG / YouTube / SEO / GEO）
   ↓ SNSで終わらせない。目的は「サイトに来てもらう」
His Recoveries（所有する場所）
   ↓ 興味の判別（今困っている / もっと良くなりたい）
Recover  or  Refine
   ↓ 相談（LINE・/apply）
最適なサービスへ接続 → 継続伴走`}
          </pre>
          <p className="mt-3 text-brand-cream/70">
            借りた注目（フォロワー）ではなく、自分の場所と関係を所有する。SNSは入口、目的ではない。
          </p>
        </Card>

        {/* KPI */}
        <H>KPI（SNS指標は追わない）</H>
        <div className="grid sm:grid-cols-2 gap-3">
          <Card>
            <p className="text-brand-cream/50 mb-1 text-[11px]">見ない</p>
            いいね・フォロワー数・バズ
          </Card>
          <Card>
            <p className="text-sage mb-1 text-[11px]">見る</p>
            サイト流入 → 相談 → Recover率／Refine率 → 予約率 → 継続率
          </Card>
        </div>

        {/* 2層モデル */}
        <H>2層モデル（プロダクトとマーケが同じ構造）</H>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-[12.5px]">
            <thead>
              <tr className="text-left text-[11px] text-brand-cream/50">
                <th className="py-1.5 pr-4 font-normal"></th>
                <th className="py-1.5 pr-4 font-normal">Recover（顕在）</th>
                <th className="py-1.5 pr-4 font-normal">Refine（潜在）</th>
              </tr>
            </thead>
            <tbody className="text-brand-cream/80">
              {[
                ["状態", "今、困っている", "もっと良くなりたい"],
                ["目的", "既存需要の刈り取り", "需要の創造"],
                ["チャネル", "SEO / GEO / 選び方・診断", "Threads / IG / Shorts"],
                ["内容", "仕組み・選び方・費用", "始め方・習慣・before/after"],
                ["着地", "無料相談", "記事→診断→相談"],
                ["記事在庫", `${d.track.recover} 本`, `${d.track.refine} 本`],
              ].map((r) => (
                <tr key={r[0]} className="border-t border-brand-cream/10">
                  <td className="py-2 pr-4 text-sage">{r[0]}</td>
                  <td className="py-2 pr-4">{r[1]}</td>
                  <td className="py-2 pr-4">{r[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[11px] text-brand-cream/45">
          記事 計 {d.totals.articles} 本／動画 {d.totals.videos} 本（カバレッジ {d.totals.coveragePct}%）。
          動画は Refine を SNS で育てる主力。
        </p>

        {/* ペルソナ×チャネル */}
        <H>誰に、どこで（ペルソナ×チャネル）</H>
        <div className="grid sm:grid-cols-2 gap-3">
          <Card>
            <p className="text-brand-cream mb-1">Recover 男性</p>
            検索で出会う（SEO/GEO）。悩みが顕在化した瞬間に、選び方・費用で受け止める。
          </Card>
          <Card>
            <p className="text-brand-cream mb-1">Refine 男性</p>
            男性が公に反応できる唯一の入口。恥ではなく「向上心」で、動画・連投で育てる。
          </Card>
          <Card>
            <p className="text-brand-cream mb-1">女性（ギフト）／母</p>
            Threads の主反応層。本人を説得せず、贈り手の気づきから橋渡し（応援フレーミング）。
          </Card>
          <Card>
            <p className="text-brand-cream mb-1">施術者（Supply）</p>
            /partner で募集。紹介できる在庫を増やすほど「接続」の価値が上がる。
          </Card>
        </div>

        {/* チャネル×役割 */}
        <H>6チャネルと役割</H>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-[12.5px]">
            <tbody className="text-brand-cream/80">
              {[
                ["/areas 記事（SEO・GEO）", "主エンジン。顕在を刈り取る・信頼の証拠"],
                ["Threads", "共感で拡散（女性/母/施術者/Refine男性）→ 送客"],
                ["YouTube Shorts・IG Reels", "Refine を縦動画で育てる（Remotion）"],
                ["note・substack", "記事を長文化。GEO・信頼を厚くする"],
                ["Instagram", "ビジュアル資産・世界観"],
              ].map((r) => (
                <tr key={r[0]} className="border-t border-brand-cream/10">
                  <td className="py-2 pr-4 text-brand-cream whitespace-nowrap">{r[0]}</td>
                  <td className="py-2">{r[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* コンテンツの流れ */}
        <H>コンテンツの流れ（源泉→転用）</H>
        <Card>
          <pre className="text-[11.5px] text-brand-cream/75 leading-[1.9] whitespace-pre-wrap font-mono">
{`一次情報の記事（源泉・当事者監修）
   │ Claude Code が各媒体の形式へ「転用」（作り直さない）
   ├─ Threads 連投  … 生成→[承認]→投稿
   ├─ Shorts/Reels  … Remotion＋VOICEVOX＋Playwright
   ├─ note/substack … 長文へ派生
   └─ Instagram     … カルーセル＋世界観`}
          </pre>
        </Card>

        {/* ガードレール */}
        <H>越えない3つの線</H>
        <div className="grid sm:grid-cols-3 gap-3">
          <Card>
            <p className="text-brand-cream mb-1">医療は人間レビュー</p>
            医療的断定はしない。自動配信しない（薬機法・景表法）。
          </Card>
          <Card>
            <p className="text-brand-cream mb-1">当事者の声は捏造しない</p>
            体験談をAIに書かせない。煽らない・見下さない。
          </Card>
          <Card>
            <p className="text-brand-cream mb-1">データは集計のみ</p>
            行動データは集計で。個人単位でパートナーに渡さない。
          </Card>
        </div>

        <footer className="mt-10 border-t border-brand-cream/15 pt-4 text-[11px] text-brand-cream/45 leading-[1.8]">
          出典: docs/AI_MARKETING_ENGINE.md。SNSは入口、目的ではない。20万人の男性理解DBは
          「事業をうまく回した結果」であって、開始戦略ではない。
        </footer>
      </div>
    </div>
  );
}
