import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllTagsByKind, getRecoveriesForTag } from "@/lib/recoveries";
import { TERRITORY_LABEL } from "@/lib/feelings";
import { site } from "@/lib/site";

type Params = { kind: string; tag: string };

const VALID_KIND = new Set(["concern", "action", "outcome"]);
const KIND_LABEL: Record<string, string> = {
  concern: "悩み",
  action: "行動",
  outcome: "変化",
};

export function generateStaticParams(): Params[] {
  const all = getAllTagsByKind();
  return [
    ...all.concern.map((tag) => ({ kind: "concern", tag })),
    ...all.action.map((tag) => ({ kind: "action", tag })),
    ...all.outcome.map((tag) => ({ kind: "outcome", tag })),
  ];
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  if (!VALID_KIND.has(params.kind)) return {};
  const label = KIND_LABEL[params.kind];
  const tag = decodeURIComponent(params.tag);
  const title = `「${tag}」に紐づく実例（${label}）`;
  return {
    title,
    description: `${label}タグ「${tag}」に紐づく男性の実例集。His Recoveries の Recovery アーカイブから。`,
    alternates: {
      canonical: `${site.url}/recoveries/by-tag/${params.kind}/${params.tag}`,
    },
  };
}

export default function TagPage({ params }: { params: Params }) {
  if (!VALID_KIND.has(params.kind)) notFound();
  const tag = decodeURIComponent(params.tag);
  const items = getRecoveriesForTag(
    tag,
    params.kind as "concern" | "action" | "outcome"
  );
  const label = KIND_LABEL[params.kind];

  return (
    <div className="mx-auto max-w-reading px-6 sm:px-10 pt-14 sm:pt-20 pb-24">
      <nav aria-label="breadcrumb" className="mb-8 text-[11px] tracking-widest text-sub-gray">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:text-ink transition-colors uppercase">
              Home
            </Link>
          </li>
          <li aria-hidden>—</li>
          <li>
            <Link href="/recoveries" className="hover:text-ink transition-colors">
              Recoveries
            </Link>
          </li>
        </ol>
      </nav>

      <header className="mb-10">
        <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold">
          {label} タグ
        </p>
        <h1 className="mt-5 font-mincho text-2xl sm:text-[1.9rem] text-ink leading-[1.4]">
          #{tag}
        </h1>
        <p className="mt-5 font-mincho text-[13.5px] text-sub-gray">
          {items.length} 件の実例
        </p>
      </header>

      {items.length === 0 ? (
        <p className="text-[14px] text-sub-gray border border-hair-line p-8">
          このタグに紐づく実例は、まだありません。
        </p>
      ) : (
        <ul className="border-t border-hair-line">
          {items.map((r) => (
            <li key={r.slug} className="border-b border-hair-line">
              <Link
                href={`/recoveries/${r.slug}`}
                className="group block py-6 hover:bg-paper/40 transition-colors"
              >
                <p className="logo-type italic text-[11px] tracking-[0.25em] uppercase text-gold">
                  {TERRITORY_LABEL[r.territory] ?? r.territory}
                  {r.span ? ` · ${r.span}` : ""}
                </p>
                <h2 className="mt-2 font-mincho text-base sm:text-lg text-ink leading-[1.55] group-hover:text-gold transition-colors">
                  {r.title}
                </h2>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
