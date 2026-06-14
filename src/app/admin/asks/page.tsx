import type { Metadata } from "next";
import { dbSelect, dbAdminEnabled } from "@/lib/db";
import StatusBar from "@/components/admin/StatusBar";

const STATUSES = [
  { value: "submitted", label: "受付" },
  { value: "reviewing", label: "確認中" },
  { value: "replied", label: "返信済" },
  { value: "published", label: "公開済" },
  { value: "archived", label: "アーカイブ" },
];

export const metadata: Metadata = {
  title: "Recovery Q&A — Asks — Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type AskRow = {
  id: string;
  email: string | null;
  question: string;
  context: string | null;
  age_range: string | null;
  territory: string | null;
  feeling: string | null;
  consent_reply: boolean;
  consent_publish: boolean;
  status: string;
  notes: string | null;
  qa_slug: string | null;
  utm_source: string | null;
  referrer_host: string | null;
  created_at: string;
};

export default async function AsksAdminPage() {
  if (!dbAdminEnabled) {
    return (
      <div className="mx-auto max-w-[900px] px-6 sm:px-10 pt-14 pb-24">
        <h1 className="font-mincho text-3xl mb-6">Recovery Q&A — Asks</h1>
        <p className="text-[14px] text-sub-gray leading-[2]">
          Supabase の Service Key が未設定です。
        </p>
      </div>
    );
  }

  const rows = await dbSelect<AskRow>(
    "asks?select=*&order=created_at.desc&limit=100"
  );

  const submitted = rows.filter((r) => r.status === "submitted").length;
  const replied = rows.filter((r) => r.status === "replied").length;
  const published = rows.filter((r) => r.status === "published").length;
  const publishable = rows.filter(
    (r) => r.consent_publish && r.status !== "published" && r.status !== "archived"
  ).length;

  return (
    <div className="mx-auto max-w-[1100px] px-6 sm:px-10 pt-12 sm:pt-16 pb-24">
      <header className="mb-10">
        <p className="text-[10px] tracking-[0.3em] text-sub-gray uppercase">
          Admin · Recovery Q&A
        </p>
        <h1 className="mt-3 font-mincho text-3xl sm:text-4xl text-ink leading-[1.4]">
          届いた問い
        </h1>
        <p className="mt-4 text-[13px] text-sub-gray">
          {rows.length} 件 · 未対応 {submitted} · 返信済 {replied} · 公開済 {published}
          {" · "}
          <span className="text-ink">公開同意あり・未公開 {publishable}</span>
        </p>
      </header>

      {rows.length === 0 ? (
        <p className="text-[14px] text-sub-gray border border-hair-line p-8">
          まだ問いは届いていません。
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
                    {r.consent_publish && (
                      <span className="text-[10px] tracking-[0.08em] uppercase px-1.5 py-0.5 border border-gold/60 text-gold">
                        公開同意
                      </span>
                    )}
                    {r.territory && (
                      <span className="text-[11px] text-sub-gray">
                        {r.territory}
                      </span>
                    )}
                    <span className="font-mincho text-[14.5px] text-ink line-clamp-1">
                      Q. {r.question.slice(0, 80)}
                    </span>
                    <span className="text-[11px] text-sub-gray tabular-nums ml-auto">
                      {r.created_at.slice(0, 10)}
                    </span>
                  </div>
                </summary>
                <div className="border-t border-hair-line p-5 space-y-4">
                  <div>
                    <p className="text-[10px] tracking-[0.1em] uppercase text-sub-gray mb-1">
                      質問
                    </p>
                    <p className="font-mincho text-[15px] text-ink leading-[1.95] whitespace-pre-wrap">
                      {r.question}
                    </p>
                  </div>
                  {r.context && (
                    <div>
                      <p className="text-[10px] tracking-[0.1em] uppercase text-sub-gray mb-1">
                        場面
                      </p>
                      <p className="font-mincho text-[14px] text-ink/85 leading-[1.95]">
                        {r.context}
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4 text-[12.5px] text-sub-gray">
                    <div>
                      <span className="block text-[10px] uppercase tracking-[0.1em]">
                        返信先
                      </span>
                      <span className="text-ink">{r.email || "—"}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase tracking-[0.1em]">
                        年代
                      </span>
                      <span className="text-ink">{r.age_range || "—"}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase tracking-[0.1em]">
                        領域 / 感情
                      </span>
                      <span className="text-ink">
                        {[r.territory, r.feeling].filter(Boolean).join(" · ") || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase tracking-[0.1em]">
                        流入
                      </span>
                      <span className="text-ink">
                        {[r.utm_source, r.referrer_host].filter(Boolean).join(" · ") || "—"}
                      </span>
                    </div>
                  </div>
                  {r.qa_slug && (
                    <div>
                      <p className="text-[10px] tracking-[0.1em] uppercase text-sub-gray mb-1">
                        紐づく Q&A
                      </p>
                      <a
                        href={`/qa/${r.qa_slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[13px] text-ink border-b border-gold pb-0.5 hover:text-gold transition-colors"
                      >
                        /qa/{r.qa_slug}
                      </a>
                    </div>
                  )}
                  <div className="pt-3 border-t border-hair-line">
                    <p className="text-[10px] tracking-[0.1em] uppercase text-sub-gray mb-2">
                      ステータス
                    </p>
                    <StatusBar
                      endpoint={`/api/admin/asks/${r.id}`}
                      current={r.status}
                      options={STATUSES}
                    />
                  </div>
                  {r.notes && (
                    <div>
                      <p className="text-[10px] tracking-[0.1em] uppercase text-sub-gray mb-1">
                        編集メモ
                      </p>
                      <p className="font-mincho text-[13px] text-ink/85 leading-[1.95] whitespace-pre-wrap">
                        {r.notes}
                      </p>
                    </div>
                  )}
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
