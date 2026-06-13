import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { dbSelect, dbAdminEnabled } from "@/lib/db";
import { CHECK_QUESTIONS, CHECK_SECTIONS } from "@/lib/checkQuestions";
import { generateCheckReport } from "@/lib/checkReport";
import ReportClient from "./ReportClient";

export const metadata: Metadata = {
  title: "Recovery Check — Report draft",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type CheckRow = {
  id: string;
  email: string | null;
  name: string | null;
  responses: Record<string, unknown>;
  status: string;
  notes: string | null;
  utm_source: string | null;
  referrer_host: string | null;
  created_at: string;
};

export default async function CheckDetailPage({
  params,
}: {
  params: { id: string };
}) {
  if (!dbAdminEnabled) {
    return (
      <div className="mx-auto max-w-[900px] px-6 sm:px-10 pt-14 pb-24">
        <h1 className="font-mincho text-3xl mb-6">Recovery Check</h1>
        <p className="text-[14px] text-sub-gray leading-[2]">
          Supabase の Service Key が未設定です。
        </p>
      </div>
    );
  }

  if (!/^[0-9a-f-]{36}$/i.test(params.id)) notFound();

  const rows = await dbSelect<CheckRow>(
    `checks?id=eq.${encodeURIComponent(params.id)}&limit=1`
  );
  const row = rows[0];
  if (!row) notFound();

  // Pre-generated draft (server side, deterministic).
  const draft =
    row.notes && row.notes.trim().length > 0
      ? row.notes
      : generateCheckReport({ name: row.name, responses: row.responses ?? {} });

  return (
    <div className="mx-auto max-w-[1280px] px-6 sm:px-10 pt-10 pb-24">
      <header className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[0.3em] text-sub-gray uppercase">
            Admin · Check Report
          </p>
          <h1 className="mt-2 font-mincho text-2xl sm:text-3xl text-ink leading-[1.4]">
            {row.name || "（無名）"}
          </h1>
          <p className="mt-2 text-[12px] text-sub-gray">
            {row.email} ·{" "}
            {new Date(row.created_at).toLocaleString("ja-JP", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            ·{" "}
            <span className="text-gold">{row.status}</span>
          </p>
        </div>
        <Link
          href="/admin/checks"
          className="text-[12px] tracking-[0.1em] text-sub-gray hover:text-ink transition-colors"
        >
          ← 一覧
        </Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 lg:gap-8">
        {/* Responses panel */}
        <aside className="bg-paper border border-hair-line p-5 max-h-[80vh] overflow-y-auto lg:sticky lg:top-4 self-start">
          <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-3">
            30 Responses
          </p>
          {CHECK_SECTIONS.map((s) => (
            <section key={s.id} className="mt-5 first:mt-2">
              <p className="logo-type italic text-[10px] tracking-[0.2em] uppercase text-gold mb-2">
                {s.label}
              </p>
              <ul className="space-y-2.5">
                {CHECK_QUESTIONS.filter((q) => q.section === s.id).map((q) => {
                  const v = row.responses?.[q.id];
                  const display = formatAnswer(q, v);
                  return (
                    <li
                      key={q.id}
                      className="border-b border-hair-line/60 pb-2"
                    >
                      <p className="text-[10.5px] text-sub-gray leading-[1.7]">
                        {q.prompt}
                      </p>
                      <p className="mt-0.5 font-mincho text-[12.5px] text-ink leading-[1.85] whitespace-pre-wrap">
                        {display || "—"}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </aside>

        {/* Report editor */}
        <ReportClient
          id={row.id}
          email={row.email}
          name={row.name}
          status={row.status}
          initialDraft={draft}
          hasSavedDraft={Boolean(row.notes && row.notes.trim().length > 0)}
        />
      </div>
    </div>
  );
}

function formatAnswer(
  q: (typeof CHECK_QUESTIONS)[number],
  v: unknown
): string {
  if (v === undefined || v === null || v === "") return "";
  if (q.kind === "single") {
    return q.options.find((o) => o.value === v)?.label ?? String(v);
  }
  if (q.kind === "multi") {
    if (!Array.isArray(v)) return "";
    return v
      .map((val) => q.options.find((o) => o.value === val)?.label ?? String(val))
      .join(" · ");
  }
  if (q.kind === "scale") {
    return `${v} / ${q.max}`;
  }
  return String(v);
}
