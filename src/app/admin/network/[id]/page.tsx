import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { dbSelect, dbAdminEnabled } from "@/lib/db";
import StatusBar from "@/components/admin/StatusBar";
import PublicBlurb from "./PublicBlurb";

export const metadata: Metadata = {
  title: "Certified — application detail",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const STATUSES = [
  { value: "submitted", label: "受付" },
  { value: "reviewing", label: "書類審査" },
  { value: "audit", label: "覆面審査" },
  { value: "committee", label: "委員会" },
  { value: "certified", label: "認証" },
  { value: "declined", label: "不認証" },
  { value: "revoked", label: "剥奪" },
];

const TYPE_LABELS: Record<string, string> = {
  clinic: "クリニック",
  salon: "サロン",
  gym: "ジム",
  specialist: "専門家",
};

const PRINCIPLES = [
  ["understanding", "顧客理解"],
  ["no_hard_sell", "強引営業の禁止"],
  ["improvement_data", "改善データの提供"],
  ["education", "顧客教育"],
  ["long_term", "長期伴走"],
] as const;

type Row = {
  id: string;
  org_name: string;
  org_type: string;
  rep_name: string | null;
  email: string | null;
  phone: string | null;
  website_url: string | null;
  location: string | null;
  services_description: string | null;
  philosophy: string | null;
  principles_checked: Record<string, boolean> | null;
  has_nps_data: string | null;
  has_education: string | null;
  has_longterm_plan: string | null;
  status: string;
  notes: string | null;
  certified_at: string | null;
  certified_year: number | null;
  public_blurb: string | null;
  utm_source: string | null;
  created_at: string;
};

export default async function NetworkDetailPage({
  params,
}: {
  params: { id: string };
}) {
  if (!dbAdminEnabled) {
    return (
      <div className="mx-auto max-w-[900px] px-6 sm:px-10 pt-14 pb-24">
        <h1 className="font-mincho text-3xl mb-6">Recovery Certified</h1>
        <p className="text-[14px] text-sub-gray leading-[2]">
          Supabase の Service Key が未設定です。
        </p>
      </div>
    );
  }
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) notFound();

  const rows = await dbSelect<Row>(
    `certified_applications?id=eq.${encodeURIComponent(params.id)}&limit=1`
  );
  const r = rows[0];
  if (!r) notFound();

  const yesNoLabel = (v: string | null) =>
    v === "yes"
      ? "はい"
      : v === "maybe"
        ? "半年以内に整える"
        : v === "no"
          ? "いいえ"
          : "—";

  return (
    <div className="mx-auto max-w-[1100px] px-6 sm:px-10 pt-10 pb-24">
      <header className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[0.3em] text-sub-gray uppercase">
            Admin · Certified · Application
          </p>
          <p className="mt-3 logo-type italic text-[11px] tracking-[0.2em] uppercase text-gold">
            {TYPE_LABELS[r.org_type] ?? r.org_type}
            {r.location ? ` · ${r.location}` : ""}
          </p>
          <h1 className="mt-2 font-mincho text-2xl sm:text-3xl text-ink leading-[1.4]">
            {r.org_name}
          </h1>
          <p className="mt-2 text-[12px] text-sub-gray">
            {r.rep_name} · {r.email}
            {r.phone ? ` · ${r.phone}` : ""} ·{" "}
            {new Date(r.created_at).toLocaleString("ja-JP", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          {r.website_url && (
            <a
              href={r.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-[12px] text-ink border-b border-gold hover:text-gold transition-colors"
            >
              {r.website_url}
            </a>
          )}
        </div>
        <div className="flex flex-col items-end gap-3">
          <Link
            href="/admin/network"
            className="text-[12px] tracking-[0.1em] text-sub-gray hover:text-ink transition-colors"
          >
            ← 一覧
          </Link>
          <StatusBar
            endpoint={`/api/admin/network/${r.id}`}
            current={r.status}
            options={STATUSES}
          />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        <div className="space-y-8">
          <Section label="提供サービスの概要">
            <p className="font-mincho text-[14.5px] text-ink leading-[2.05] whitespace-pre-wrap">
              {r.services_description || "—"}
            </p>
          </Section>

          <Section label="顧客理解についての立場">
            <p className="font-mincho text-[14.5px] text-ink leading-[2.05] whitespace-pre-wrap">
              {r.philosophy || "—"}
            </p>
          </Section>

          <Section label="5 つの原則のチェック">
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[13px]">
              {PRINCIPLES.map(([k, l]) => {
                const checked = r.principles_checked?.[k];
                return (
                  <li
                    key={k}
                    className={`flex items-center gap-2 border px-3 py-2 ${
                      checked
                        ? "border-gold text-ink"
                        : "border-hair-line text-sub-gray"
                    }`}
                  >
                    <span aria-hidden>{checked ? "✓" : "✕"}</span>
                    {l}
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[12px]">
              <div className="border border-hair-line p-3">
                <p className="text-[10px] tracking-[0.1em] uppercase text-sub-gray">
                  NPS データ
                </p>
                <p className="mt-1 font-mincho text-ink">
                  {yesNoLabel(r.has_nps_data)}
                </p>
              </div>
              <div className="border border-hair-line p-3">
                <p className="text-[10px] tracking-[0.1em] uppercase text-sub-gray">
                  顧客教育コンテンツ
                </p>
                <p className="mt-1 font-mincho text-ink">
                  {yesNoLabel(r.has_education)}
                </p>
              </div>
              <div className="border border-hair-line p-3">
                <p className="text-[10px] tracking-[0.1em] uppercase text-sub-gray">
                  長期伴走プラン
                </p>
                <p className="mt-1 font-mincho text-ink">
                  {yesNoLabel(r.has_longterm_plan)}
                </p>
              </div>
            </div>
          </Section>
        </div>

        <aside className="space-y-6">
          {r.email && (
            <a
              href={`mailto:${r.email}?subject=${encodeURIComponent(
                "Recovery Certified のお問い合わせ"
              )}`}
              className="block bg-ink text-cream hover:bg-gold transition-colors text-center px-4 py-3 text-[12px] tracking-[0.1em]"
            >
              担当者にメール
            </a>
          )}

          <PublicBlurb
            id={r.id}
            initialBlurb={r.public_blurb ?? ""}
            initialNotes={r.notes ?? ""}
            certifiedAt={r.certified_at}
            certifiedYear={r.certified_year}
            status={r.status}
          />
        </aside>
      </div>
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
    <section className="bg-paper border border-hair-line p-5">
      <p className="logo-type italic text-[10px] tracking-[0.2em] uppercase text-gold mb-3">
        {label}
      </p>
      {children}
    </section>
  );
}
