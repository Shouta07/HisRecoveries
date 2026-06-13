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
          男性の悩みの、一次情報
        </h1>
        <p className="mt-4 text-[13px] text-sub-gray leading-[1.95] max-w-[40rem]">
          いま最も価値があるのは商品ではなく、「誰が何に悩んでいるか」の一次データです。
          Recovery Check を匿名で集計しています。
          個人を特定する情報（メール・氏名・自由記述）はここには表示されません。
        </p>

        {/* Progress toward the first 100 checks — the current phase goal. */}
        <div className="mt-6 bg-paper border border-hair-line p-5 max-w-[40rem]">
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-mincho text-2xl text-ink tabular-nums">
              {checks.length}
              <span className="text-[13px] text-sub-gray ml-2">/ 100 件</span>
            </span>
            <span className="text-[11px] tracking-[0.06em] text-sub-gray text-right">
              {checks.length >= 100
                ? "目標達成 — 改善事例の収集フェーズへ"
                : `最初の 100 件まで あと ${100 - checks.length} 件`}
            </span>
          </div>
          <div className="mt-3 h-1.5 bg-cream-deep">
            <div
              className="h-1.5 bg-gold"
              style={{
                width: `${Math.min(100, Math.round((checks.length / 100) * 100))}%`,
              }}
            />
          </div>
        </div>
      </header>

      {/* First-party concern intelligence — the reason this phase exists. */}
      <section className="mb-12">
        <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-4">
          誰が、何に悩んでいるか
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BarPanel title="悩みの領域" subtitle="複数選択・出現回数" data={concernFreq} />
          <BarPanel title="意識し始めてからの期間" subtitle="single" data={durationDist} />
          <BarPanel title="次の半歩として選ぶもの" subtitle="single" data={firstStep} />
          <BarPanel title="半年の予算感" subtitle="single" data={budget6m} />
        </div>
      </section>

      <section className="mb-12">
        <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-4">
          自意識の強さ（1–5 平均）
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ScoreCard label="ストレスの自覚" {...stress} />
          <ScoreCard label="写真への抵抗" {...photo} />
          <ScoreCard label="集団場面への抵抗" {...group} />
        </div>
      </section>

      <section className="mb-12">
        <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-4">
          流入と関心
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BarPanel title="月別の Check 受付数" subtitle="time series" data={monthly} />
          <BarPanel title="Recoveries Letter への関心" subtitle="single" data={guideInterest} />
        </div>
      </section>

      {/* Legacy operational queues (Guide / Certified) — kept for history. */}
      <section className="mt-14 pt-10 border-t border-hair-line">
        <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-sub-gray mb-4">
          Legacy — 旧オペレーション（参考）
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BarPanel title="Guide ステータス" subtitle="legacy" data={guideStatus} />
          <BarPanel title="Certified ステータス" subtitle="legacy" data={certStatus} />
        </div>
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
