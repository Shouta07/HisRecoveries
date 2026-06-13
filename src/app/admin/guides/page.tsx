import type { Metadata } from "next";
import Link from "next/link";
import { dbSelect, dbAdminEnabled } from "@/lib/db";
import StatusBar from "@/components/admin/StatusBar";

export const metadata: Metadata = {
  title: "Recovery Guides — Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const GUIDE_STATUSES = [
  { value: "submitted", label: "受付" },
  { value: "scheduling", label: "日程調整中" },
  { value: "scheduled", label: "予定済み" },
  { value: "completed", label: "完了" },
  { value: "cancelled", label: "キャンセル" },
];

const PREF_LABELS: Record<string, string> = {
  weekday_day: "平日昼",
  weekday_eve: "平日夜",
  weekend: "土日",
};

const BUDGET_LABELS: Record<string, string> = {
  beta: "β ¥9,800",
  regular: "通常 ¥30,000",
  undecided: "未定",
};

type GuideRow = {
  id: string;
  email: string | null;
  name: string | null;
  format: "online" | "in_person" | null;
  preferences: string[] | null;
  check_taken: "yes" | "no" | "maybe" | null;
  topic: string;
  budget: string | null;
  extra: string | null;
  status: string;
  notes: string | null;
  utm_source: string | null;
  referrer_host: string | null;
  created_at: string;
};

export default async function GuidesAdminPage() {
  if (!dbAdminEnabled) {
    return (
      <div className="mx-auto max-w-[900px] px-6 sm:px-10 pt-14 pb-24">
        <h1 className="font-mincho text-3xl mb-6">Recovery Guides</h1>
        <p className="text-[14px] text-sub-gray leading-[2]">
          Supabase の Service Key が未設定です。SETUP.md を参照してください。
        </p>
      </div>
    );
  }

  const rows = await dbSelect<GuideRow>(
    "guide_requests?select=*&order=created_at.desc&limit=100"
  );

  const submitted = rows.filter((r) => r.status === "submitted").length;
  const scheduling = rows.filter((r) => r.status === "scheduling").length;
  const scheduled = rows.filter((r) => r.status === "scheduled").length;

  return (
    <div className="mx-auto max-w-[1100px] px-6 sm:px-10 pt-12 sm:pt-16 pb-24">
      <header className="mb-10">
        <p className="text-[10px] tracking-[0.3em] text-sub-gray uppercase">
          Admin · Guides
        </p>
        <h1 className="mt-3 font-mincho text-3xl sm:text-4xl text-ink leading-[1.4]">
          Recovery Guide
        </h1>
        <p className="mt-4 text-[13px] text-sub-gray">
          {rows.length} 件 · 受付 {submitted} · 日程調整中 {scheduling} ·
          予定済み {scheduled}
        </p>
      </header>

      {rows.length === 0 ? (
        <p className="text-[14px] text-sub-gray border border-hair-line p-8">
          まだ申し込みはありません。
        </p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id}>
              <details className="bg-paper border border-hair-line">
                <summary className="px-5 py-4 cursor-pointer hover:bg-cream-deep/30 transition-colors">
                  <div className="inline-flex items-baseline gap-3 flex-wrap">
                    <span
                      className={`text-[10px] tracking-[0.1em] uppercase px-1.5 py-0.5 border ${
                        r.status === "submitted"
                          ? "border-gold text-gold"
                          : "border-hair-line text-sub-gray"
                      }`}
                    >
                      {GUIDE_STATUSES.find((s) => s.value === r.status)?.label ??
                        r.status}
                    </span>
                    <span className="font-mincho text-[15px] text-ink">
                      {r.name || "（無名）"}
                    </span>
                    <span className="text-[12px] text-sub-gray">{r.email}</span>
                    <span className="text-[11px] text-sub-gray">
                      {new Date(r.created_at).toLocaleString("ja-JP", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {r.budget && (
                      <span className="text-[11px] text-gold">
                        {BUDGET_LABELS[r.budget] ?? r.budget}
                      </span>
                    )}
                    {r.utm_source && (
                      <span className="text-[11px] text-sub-gray">
                        · {r.utm_source}
                      </span>
                    )}
                  </div>
                </summary>
                <div className="px-5 pb-6 pt-2 border-t border-hair-line">
                  <Section label="話したいこと">
                    <p className="font-mincho text-[14.5px] text-ink leading-[2.05] whitespace-pre-wrap">
                      {r.topic}
                    </p>
                  </Section>
                  <Section label="形式 / 希望時間帯">
                    <p className="font-mincho text-[14px] text-ink/85 leading-[1.95]">
                      {r.format === "in_person" ? "都内対面" : "オンライン"} ·{" "}
                      {(r.preferences ?? [])
                        .map((p) => PREF_LABELS[p] ?? p)
                        .join(" / ") || "—"}
                    </p>
                  </Section>
                  <Section label="Recovery Check 受講">
                    <p className="font-mincho text-[14px] text-ink/85">
                      {r.check_taken === "yes"
                        ? "受けた"
                        : r.check_taken === "maybe"
                          ? "わからない"
                          : "まだ"}
                    </p>
                  </Section>
                  {r.extra && (
                    <Section label="その他">
                      <p className="font-mincho text-[14px] text-ink/85 leading-[2] whitespace-pre-wrap">
                        {r.extra}
                      </p>
                    </Section>
                  )}
                  <div className="mt-8 flex flex-wrap items-center gap-3 text-[11px]">
                    {r.email && (
                      <Link
                        href={`mailto:${r.email}?subject=${encodeURIComponent(
                          "Recovery Guide のご連絡"
                        )}`}
                        className="border border-hair-line hover:border-gold hover:text-gold px-3 py-1.5 transition-colors"
                      >
                        メールで連絡
                      </Link>
                    )}
                    <StatusBar
                      endpoint={`/api/admin/guides/${r.id}`}
                      current={r.status}
                      options={GUIDE_STATUSES}
                    />
                  </div>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6 first:mt-2 border-b border-hair-line/60 pb-3">
      <p className="logo-type italic text-[10px] tracking-[0.2em] uppercase text-gold mb-2">
        {label}
      </p>
      {children}
    </section>
  );
}
