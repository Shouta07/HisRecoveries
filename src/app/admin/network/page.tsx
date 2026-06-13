import type { Metadata } from "next";
import Link from "next/link";
import { dbSelect, dbAdminEnabled } from "@/lib/db";
import StatusBar from "@/components/admin/StatusBar";

export const metadata: Metadata = {
  title: "Recovery Certified — Admin",
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

type Row = {
  id: string;
  org_name: string;
  org_type: string;
  rep_name: string | null;
  email: string | null;
  location: string | null;
  website_url: string | null;
  status: string;
  utm_source: string | null;
  created_at: string;
};

export default async function NetworkAdminPage() {
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

  const rows = await dbSelect<Row>(
    "certified_applications?select=id,org_name,org_type,rep_name,email,location,website_url,status,utm_source,created_at&order=created_at.desc&limit=100"
  );

  const tally = STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s.value] = rows.filter((r) => r.status === s.value).length;
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-[1100px] px-6 sm:px-10 pt-12 sm:pt-16 pb-24">
      <header className="mb-10">
        <p className="text-[10px] tracking-[0.3em] text-sub-gray uppercase">
          Admin · Certified
        </p>
        <h1 className="mt-3 font-mincho text-3xl sm:text-4xl text-ink leading-[1.4]">
          Recovery Certified Network
        </h1>
        <p className="mt-4 text-[13px] text-sub-gray">
          {rows.length} 件 · 受付 {tally.submitted ?? 0} · 書類審査{" "}
          {tally.reviewing ?? 0} · 覆面審査 {tally.audit ?? 0} · 委員会{" "}
          {tally.committee ?? 0} · 認証 {tally.certified ?? 0}
        </p>
      </header>

      {rows.length === 0 ? (
        <p className="text-[14px] text-sub-gray border border-hair-line p-8">
          まだ申請はありません。
        </p>
      ) : (
        <ul className="space-y-2">
          {rows.map((r) => (
            <li
              key={r.id}
              className="bg-paper border border-hair-line p-5 flex flex-wrap items-center gap-4"
            >
              <div className="flex-1 min-w-[14rem]">
                <p className="logo-type italic text-[11px] tracking-[0.2em] uppercase text-gold">
                  {TYPE_LABELS[r.org_type] ?? r.org_type}
                  {r.location ? ` · ${r.location}` : ""}
                </p>
                <Link
                  href={`/admin/network/${r.id}`}
                  className="block mt-1 font-mincho text-[15px] text-ink hover:text-gold transition-colors"
                >
                  {r.org_name}
                </Link>
                <p className="mt-1 text-[11px] text-sub-gray">
                  {r.rep_name} · {r.email} ·{" "}
                  {new Date(r.created_at).toLocaleString("ja-JP", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                  {r.utm_source ? ` · ${r.utm_source}` : ""}
                </p>
              </div>
              <Link
                href={`/admin/network/${r.id}`}
                className="text-[11px] tracking-[0.06em] bg-ink text-cream hover:bg-gold px-3 py-1.5 transition-colors"
              >
                詳細 →
              </Link>
              <StatusBar
                endpoint={`/api/admin/network/${r.id}`}
                current={r.status}
                options={STATUSES}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
