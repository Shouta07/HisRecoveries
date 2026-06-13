import type { Metadata } from "next";
import { dbSelect, dbAdminEnabled } from "@/lib/db";
import {
  tallySingle,
  tallyMulti,
  averageScale,
  byMonth,
  tallyStatus,
  type CheckRow,
  type Tally,
} from "@/lib/recoveryData";

export const metadata: Metadata = {
  title: "Recovery Data — Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type GuideRow = { status: string; format: string | null; budget: string | null; created_at: string };
type CertRow = { status: string; org_type: string | null };

export default async function DataPage() {
  if (!dbAdminEnabled) {
    return (
      <div className="mx-auto max-w-[900px] px-6 sm:px-10 pt-14 pb-24">
        <h1 className="font-mincho text-3xl mb-6">Recovery Data</h1>
        <p className="text-[14px] text-sub-gray leading-[2]">
          Supabase の Service Key が未設定です。
        </p>
      </div>
    );
  }

  const [checks, guides, certs] = await Promise.all([
    dbSelect<CheckRow>("checks?select=responses,created_at&order=created_at.desc&limit=1000"),
    dbSelect<GuideRow>("guide_requests?select=status,format,budget,created_at&limit=1000"),
    dbSelect<CertRow>("certified_applications?select=status,org_type&limit=1000"),
  ]);

  const concernFreq = tallyMulti(checks, "concerns");
  const durationDist = tallySingle(checks, "duration");
  const firstStep = tallySingle(checks, "first_step");
  const guideInterest = tallySingle(checks, "guide_interest");
  const budget6m = tallySingle(checks, "budget_6m");
  const monthly = byMonth(checks);

  const stress = averageScale(checks, "stress");
  const photo = averageScale(checks, "photo_resistance");
  const group = averageScale(checks, "group_resistance");

  const guideStatus = tallyStatus(guides, {
    submitted: "受付",
    scheduling: "日程調整",
    scheduled: "予定",
    completed: "完了",
    cancelled: "キャンセル",
  });
  const certStatus = tallyStatus(certs, {
    submitted: "受付",
    reviewing: "書類",
    audit: "覆面",
    committee: "委員会",
    certified: "認証",
    declined: "不認証",
    revoked: "剥奪",
  });

  return (
    <div className="mx-auto max-w-[1100px] px-6 sm:px-10 pt-12 sm:pt-16 pb-24">
      <header className="mb-10">
        <p className="text-[10px] tracking-[0.3em] text-sub-gray uppercase">
          Admin · Recovery Data
        </p>
        <h1 className="mt-3 font-mincho text-3xl sm:text-4xl text-ink leading-[1.4]">
          知見の集積
        </h1>
        <p className="mt-4 text-[13px] text-sub-gray leading-[1.95] max-w-[40rem]">
          Recovery Check {checks.length} 件・Guide {guides.length} 件・Certified{" "}
          {certs.length} 件から集計した匿名インサイト。
          将来、Recovery Data Quarterly として B2B に提供する素地です。
          個人を特定する情報（メール・氏名・自由記述）はここには表示されません。
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarPanel title="悩みの領域（Check）" subtitle="複数選択・出現回数" data={concernFreq} />
        <BarPanel title="意識し始めてからの期間" subtitle="Check single" data={durationDist} />
        <BarPanel title="次の半歩として選ぶもの" subtitle="Check single" data={firstStep} />
        <BarPanel title="半年の予算感" subtitle="Check single" data={budget6m} />
        <BarPanel title="Recovery Guide への関心" subtitle="Check single" data={guideInterest} />
        <BarPanel title="月別の Check 受付数" subtitle="time series" data={monthly} />
      </div>

      <section className="mt-10">
        <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-4">
          抵抗・ストレスの平均（1–5）
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ScoreCard label="ストレスの自覚" {...stress} />
          <ScoreCard label="写真への抵抗" {...photo} />
          <ScoreCard label="集団場面への抵抗" {...group} />
        </div>
      </section>

      <section className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarPanel title="Recovery Guide ステータス" subtitle="運用" data={guideStatus} />
        <BarPanel title="Certified ステータス" subtitle="運用" data={certStatus} />
      </section>
    </div>
  );
}

function BarPanel({
  title,
  subtitle,
  data,
}: {
  title: string;
  subtitle: string;
  data: Tally[];
}) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="bg-paper border border-hair-line p-5">
      <div className="flex items-baseline justify-between gap-3 mb-4">
        <h2 className="font-mincho text-[15px] text-ink">{title}</h2>
        <span className="text-[10px] tracking-[0.1em] uppercase text-sub-gray">
          {subtitle}
        </span>
      </div>
      {data.length === 0 ? (
        <p className="text-[12px] text-sub-gray">データがありません。</p>
      ) : (
        <ul className="space-y-2.5">
          {data.map((d) => (
            <li key={d.value}>
              <div className="flex items-baseline justify-between gap-3 text-[12.5px]">
                <span className="text-ink">{d.label}</span>
                <span className="text-sub-gray tabular-nums">{d.count}</span>
              </div>
              <div className="mt-1 h-1.5 bg-cream-deep">
                <div
                  className="h-1.5 bg-gold"
                  style={{ width: `${(d.count / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ScoreCard({
  label,
  avg,
  n,
}: {
  label: string;
  avg: number;
  n: number;
}) {
  return (
    <div className="bg-paper border border-hair-line p-5">
      <p className="text-[11px] tracking-[0.08em] text-sub-gray">{label}</p>
      <p className="mt-2 font-mincho text-3xl text-ink">
        {avg || "—"}
        <span className="text-[12px] text-sub-gray ml-2">/ 5</span>
      </p>
      <p className="mt-1 text-[10px] text-sub-gray">n = {n}</p>
    </div>
  );
}
