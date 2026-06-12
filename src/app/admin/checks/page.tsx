import type { Metadata } from "next";
import Link from "next/link";
import { dbSelect, dbAdminEnabled } from "@/lib/db";
import { CHECK_QUESTIONS, CHECK_SECTIONS } from "@/lib/checkQuestions";

export const metadata: Metadata = {
  title: "Recovery Checks — Admin",
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

export default async function ChecksAdminPage() {
  if (!dbAdminEnabled) {
    return (
      <div className="mx-auto max-w-[900px] px-6 sm:px-10 pt-14 pb-24">
        <h1 className="font-mincho text-3xl mb-6">Recovery Checks</h1>
        <p className="text-[14px] text-sub-gray leading-[2]">
          Supabase の Service Key が未設定です。SETUP.md を参照してください。
        </p>
      </div>
    );
  }

  const rows = await dbSelect<CheckRow>(
    "checks?select=*&order=created_at.desc&limit=100"
  );

  const submitted = rows.filter((r) => r.status === "submitted").length;
  const replied = rows.filter((r) => r.status === "replied").length;

  return (
    <div className="mx-auto max-w-[1100px] px-6 sm:px-10 pt-12 sm:pt-16 pb-24">
      <header className="mb-10">
        <p className="text-[10px] tracking-[0.3em] text-sub-gray uppercase">
          Admin · Checks
        </p>
        <h1 className="mt-3 font-mincho text-3xl sm:text-4xl text-ink leading-[1.4]">
          Recovery Check
        </h1>
        <p className="mt-4 text-[13px] text-sub-gray">
          {rows.length} 件 · 未対応 {submitted} · 返信済み {replied}
        </p>
      </header>

      {rows.length === 0 ? (
        <p className="text-[14px] text-sub-gray border border-hair-line p-8">
          まだ提出はありません。
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
                      {r.status}
                    </span>
                    <span className="font-mincho text-[15px] text-ink">
                      {r.name || "（無名）"}
                    </span>
                    <span className="text-[12px] text-sub-gray">
                      {r.email}
                    </span>
                    <span className="text-[11px] text-sub-gray">
                      {new Date(r.created_at).toLocaleString("ja-JP", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {r.utm_source && (
                      <span className="text-[11px] text-gold">
                        {r.utm_source}
                      </span>
                    )}
                  </div>
                </summary>
                <div className="px-5 pb-6 pt-2 border-t border-hair-line">
                  {CHECK_SECTIONS.map((s) => (
                    <section key={s.id} className="mt-6 first:mt-2">
                      <p className="logo-type italic text-[10px] tracking-[0.2em] uppercase text-gold mb-3">
                        {s.label}
                      </p>
                      <ul className="space-y-3">
                        {CHECK_QUESTIONS.filter((q) => q.section === s.id).map(
                          (q) => {
                            const v = r.responses?.[q.id];
                            const display = formatAnswer(q, v);
                            return (
                              <li
                                key={q.id}
                                className="border-b border-hair-line/60 pb-3"
                              >
                                <p className="text-[11.5px] text-sub-gray leading-[1.85]">
                                  {q.prompt}
                                </p>
                                <p className="mt-1 font-mincho text-[14px] text-ink leading-[1.95] whitespace-pre-wrap">
                                  {display || "—"}
                                </p>
                              </li>
                            );
                          }
                        )}
                      </ul>
                    </section>
                  ))}
                  <div className="mt-8 flex flex-wrap gap-3 text-[11px]">
                    {r.email && (
                      <Link
                        href={`mailto:${r.email}?subject=${encodeURIComponent(
                          "Recovery Check のご返信"
                        )}`}
                        className="border border-hair-line hover:border-gold hover:text-gold px-3 py-1.5 transition-colors"
                      >
                        メールで返信
                      </Link>
                    )}
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

function formatAnswer(
  q: (typeof CHECK_QUESTIONS)[number],
  v: unknown
): string {
  if (v === undefined || v === null || v === "") return "";
  if (q.kind === "single") {
    const found = q.options.find((o) => o.value === v);
    return found?.label ?? String(v);
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
