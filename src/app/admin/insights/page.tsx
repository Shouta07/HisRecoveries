import { dbSelect, dbAdminEnabled } from "@/lib/db";

export const runtime = "edge";
export const dynamic = "force-dynamic";

type DailySignal = {
  day: string;
  assessment_starts: number;
  assessments_done: number;
  story_starts: number;
  stories_done: number;
  gathering_applies: number;
  affiliate_clicks: number;
  subscribe_clicks: number;
  hero_cta_clicks: number;
  article_cta_clicks: number;
};

type Concern = {
  concern: string;
  count: number;
  avg_impact: number;
  high_impact_count: number;
  untreated_count: number;
  treated_count: number;
  email_capture_count: number;
};

type StoryCat = {
  category: string;
  count: number;
  publishable_count: number;
  email_capture_count: number;
  avg_total_length: number;
};

type Affiliate = {
  provider: string | null;
  product: string | null;
  clicks: number;
  last_click_at: string;
};

type UTM = {
  source: string;
  events: number;
  assessments: number;
  stories: number;
  gathering_applies: number;
  affiliate_clicks: number;
};

export default async function InsightsPage() {
  if (!dbAdminEnabled) {
    return (
      <div className="mx-auto max-w-[820px] px-6 pt-20 pb-24 text-ink">
        <h1 className="font-mincho text-3xl mb-6">Recovery Insights</h1>
        <div className="bg-paper border border-hair-line p-6">
          <p className="text-sub-gray leading-[2] text-sm">
            Supabase の環境変数が設定されていません。
            <br />
            <code className="text-gold">SUPABASE_URL</code> と{" "}
            <code className="text-gold">SUPABASE_SERVICE_KEY</code>{" "}
            をデプロイ環境に設定してください。
          </p>
        </div>
      </div>
    );
  }

  const [daily, concerns, stories, affiliates, utms] = await Promise.all([
    dbSelect<DailySignal>("daily_signals?order=day.desc&limit=30"),
    dbSelect<Concern>("concern_frequency?order=count.desc"),
    dbSelect<StoryCat>("story_categories?order=count.desc"),
    dbSelect<Affiliate>("affiliate_by_provider?order=clicks.desc&limit=20"),
    dbSelect<UTM>("utm_source_breakdown?order=events.desc&limit=15"),
  ]);

  const totals = totalize(daily);
  const assessmentRate = pct(totals.assessments_done, totals.assessment_starts);
  const storyRate = pct(totals.stories_done, totals.story_starts);

  return (
    <div className="mx-auto max-w-[1200px] px-6 sm:px-10 pt-12 pb-24 text-ink">
      <header className="mb-12">
        <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold">
          Recovery Insights
        </p>
        <h1 className="mt-3 font-mincho text-3xl sm:text-4xl">
          顧客理解ダッシュボード
        </h1>
        <p className="mt-3 text-[13px] text-sub-gray">
          Last 30 days · {totals.events_total} events
        </p>
      </header>

      <section className="mb-14">
        <SectionLabel en="Funnel Summary" ja="ファネル 30日" />
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
          <Stat label="Assessment 開始" value={totals.assessment_starts} />
          <Stat
            label="Assessment 完了"
            value={totals.assessments_done}
            sub={`完了率 ${assessmentRate}%`}
          />
          <Stat label="Story 開始" value={totals.story_starts} />
          <Stat
            label="Story 投稿"
            value={totals.stories_done}
            sub={`投稿率 ${storyRate}%`}
          />
          <Stat label="Gathering 応募" value={totals.gathering_applies} />
          <Stat label="Hero CTA" value={totals.hero_cta_clicks} />
          <Stat label="Article CTA" value={totals.article_cta_clicks} />
          <Stat label="Subscribe" value={totals.subscribe_clicks} />
          <Stat label="Affiliate Click" value={totals.affiliate_clicks} />
        </div>
      </section>

      <section className="mb-14">
        <SectionLabel en="Daily" ja="日次推移（直近 30 日）" />
        <Table
          rows={daily}
          columns={[
            { key: "day", header: "日", format: (v) => fmtDay(v as string) },
            { key: "assessment_starts", header: "A 開" },
            { key: "assessments_done", header: "A 完" },
            { key: "story_starts", header: "S 開" },
            { key: "stories_done", header: "S 完" },
            { key: "gathering_applies", header: "応募" },
            { key: "subscribe_clicks", header: "購読" },
            { key: "affiliate_clicks", header: "Aff" },
            { key: "article_cta_clicks", header: "ArtCTA" },
          ]}
        />
      </section>

      <section className="mb-14">
        <SectionLabel
          en="Pain Topology"
          ja="悩み × 影響度（Assessment 集計）"
        />
        <Table
          rows={concerns}
          columns={[
            { key: "concern", header: "悩み" },
            { key: "count", header: "件数" },
            { key: "avg_impact", header: "平均影響" },
            { key: "high_impact_count", header: "影響 8+" },
            { key: "untreated_count", header: "未対処" },
            { key: "treated_count", header: "対処中" },
            { key: "email_capture_count", header: "メール取得" },
          ]}
        />
        <p className="mt-4 text-[12px] text-sub-gray leading-[1.85]">
          影響 8+ が「市場の深さ」、未対処 ÷ 件数 が「未解決需要」、メール取得 ÷ 件数 が「次に繋がる温度」。
        </p>
      </section>

      <section className="mb-14">
        <SectionLabel en="Stories" ja="体験投稿（カテゴリ別）" />
        <Table
          rows={stories}
          columns={[
            { key: "category", header: "カテゴリ" },
            { key: "count", header: "投稿数" },
            { key: "publishable_count", header: "掲載可" },
            { key: "email_capture_count", header: "メール取得" },
            { key: "avg_total_length", header: "平均文字数" },
          ]}
        />
        <p className="mt-4 text-[12px] text-sub-gray leading-[1.85]">
          Story の本数が、そのカテゴリの「打ち明けやすさ」のシグナル。最深シグナル。
        </p>
      </section>

      <section className="mb-14">
        <SectionLabel en="Affiliate Signal" ja="アフィリ × プロバイダ" />
        <Table
          rows={affiliates}
          columns={[
            { key: "provider", header: "プロバイダ" },
            { key: "product", header: "商品" },
            { key: "clicks", header: "クリック" },
            {
              key: "last_click_at",
              header: "最終",
              format: (v) => fmtDay(v as string),
            },
          ]}
        />
        <p className="mt-4 text-[12px] text-sub-gray leading-[1.85]">
          アフィリリンクは「金を払う準備があるか」のセンサー。
          プロバイダ/商品ごとのクリック差が、カテゴリ別 WTP の代理指標。
        </p>
      </section>

      <section className="mb-14">
        <SectionLabel en="Attribution" ja="流入元 × 行動" />
        <Table
          rows={utms}
          columns={[
            { key: "source", header: "流入元" },
            { key: "events", header: "イベント計" },
            { key: "assessments", header: "Assessment" },
            { key: "stories", header: "Story" },
            { key: "gathering_applies", header: "応募" },
            { key: "affiliate_clicks", header: "Aff" },
          ]}
        />
        <p className="mt-4 text-[12px] text-sub-gray leading-[1.85]">
          Threads / X / Direct ごとに「どの行動を生む流入か」を見る。
        </p>
      </section>

      <footer className="mt-20 pt-8 border-t border-hair-line/60 text-[11px] text-sub-gray">
        Data freshness: live · powered by Supabase
      </footer>
    </div>
  );
}

function totalize(daily: DailySignal[]) {
  return daily.reduce(
    (acc, d) => ({
      assessment_starts: acc.assessment_starts + (d.assessment_starts || 0),
      assessments_done: acc.assessments_done + (d.assessments_done || 0),
      story_starts: acc.story_starts + (d.story_starts || 0),
      stories_done: acc.stories_done + (d.stories_done || 0),
      gathering_applies:
        acc.gathering_applies + (d.gathering_applies || 0),
      affiliate_clicks: acc.affiliate_clicks + (d.affiliate_clicks || 0),
      subscribe_clicks: acc.subscribe_clicks + (d.subscribe_clicks || 0),
      hero_cta_clicks: acc.hero_cta_clicks + (d.hero_cta_clicks || 0),
      article_cta_clicks:
        acc.article_cta_clicks + (d.article_cta_clicks || 0),
      events_total:
        acc.events_total +
        (d.assessment_starts || 0) +
        (d.assessments_done || 0) +
        (d.story_starts || 0) +
        (d.stories_done || 0) +
        (d.gathering_applies || 0) +
        (d.affiliate_clicks || 0) +
        (d.subscribe_clicks || 0) +
        (d.hero_cta_clicks || 0) +
        (d.article_cta_clicks || 0),
    }),
    {
      assessment_starts: 0,
      assessments_done: 0,
      story_starts: 0,
      stories_done: 0,
      gathering_applies: 0,
      affiliate_clicks: 0,
      subscribe_clicks: 0,
      hero_cta_clicks: 0,
      article_cta_clicks: 0,
      events_total: 0,
    }
  );
}

function pct(numerator: number, denominator: number): string {
  if (!denominator) return "—";
  return ((numerator / denominator) * 100).toFixed(0);
}

function fmtDay(iso: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("ja-JP", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function SectionLabel({ en, ja }: { en: string; ja: string }) {
  return (
    <div>
      <p className="logo-type italic text-[10px] tracking-[0.4em] uppercase text-gold">
        {en}
      </p>
      <h2 className="mt-1 font-mincho text-lg sm:text-xl text-ink">{ja}</h2>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: number;
  sub?: string;
}) {
  return (
    <div className="bg-paper border border-hair-line p-4">
      <p className="text-[11px] tracking-[0.06em] text-sub-gray">{label}</p>
      <p className="mt-1 font-mincho text-2xl text-ink">{value}</p>
      {sub && (
        <p className="mt-0.5 text-[11px] text-gold tracking-[0.04em]">{sub}</p>
      )}
    </div>
  );
}

type Column<T> = {
  key: keyof T;
  header: string;
  format?: (v: T[keyof T]) => string;
};

function Table<T extends Record<string, unknown>>({
  rows,
  columns,
}: {
  rows: T[];
  columns: Column<T>[];
}) {
  if (rows.length === 0) {
    return (
      <div className="mt-6 bg-paper border border-hair-line p-6 text-center text-sm text-sub-gray">
        まだデータがありません。
      </div>
    );
  }
  return (
    <div className="mt-6 overflow-x-auto bg-paper border border-hair-line">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-hair-line">
            {columns.map((c) => (
              <th
                key={String(c.key)}
                className="text-left px-4 py-3 text-[11px] tracking-[0.06em] text-sub-gray font-normal"
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-hair-line/60 last:border-b-0"
            >
              {columns.map((c) => {
                const v = row[c.key];
                const formatted = c.format ? c.format(v) : String(v ?? "—");
                return (
                  <td
                    key={String(c.key)}
                    className="px-4 py-2.5 text-ink text-[13px]"
                  >
                    {formatted}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
