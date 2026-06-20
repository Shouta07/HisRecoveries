import type { Metadata } from "next";
import Link from "next/link";
import NeutralBadge from "@/components/NeutralBadge";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import { getAllRecoveries } from "@/lib/recoveries";
import { getAllFeelings, TERRITORY_LABEL } from "@/lib/feelings";
import { getAllTerritories } from "@/lib/territories";
import { site } from "@/lib/site";

// "男性活力市場マップ" — the public-facing layer of the Recovery Graph.
// Sprint 1 ships the territory × actor grid + the Sankey-style flow
// (悩み → 行動 → 変化) computed from Recovery tag data. Experts /
// Services nodes appear as zero-states until those archives populate.

export const metadata: Metadata = {
  title: "男性活力市場マップ — His Recoveries",
  description:
    "His Recoveries が編集する、男性活力市場の見取り図。実例・専門家・事業者・編集解説を、領域とアクター種別で並べた中立のマップ。商業送客はせず、誰がどこにいるかだけを示します。",
  alternates: { canonical: `${site.url}/map` },
  openGraph: {
    title: "男性活力市場マップ — His Recoveries",
    description: "誰がどこにいて、何で何が変わったかの見取り図。",
    url: `${site.url}/map`,
  },
};

type Cell = {
  count: number;
  href: string | null;
};

function buildGrid() {
  const territories = getAllTerritories();
  const recoveries = getAllRecoveries();
  return territories.map((t) => {
    const recoveryCount = recoveries.filter((r) => r.territory === t.slug).length;
    return {
      slug: t.slug,
      label: TERRITORY_LABEL[t.slug] ?? t.title,
      sub: t.subtitle,
      cells: {
        recovery: {
          count: recoveryCount,
          href: recoveryCount > 0 ? `/recoveries` : null,
        } as Cell,
        expert: { count: 0, href: null } as Cell, // Sprint 1: zero-state
        service: { count: 0, href: null } as Cell, // Sprint 1: zero-state
        territory: { count: 1, href: `/territories/${t.slug}` } as Cell,
      },
    };
  });
}

function buildFlow() {
  // 悩み → 行動 → 変化 — derived from recovery tags.
  const recs = getAllRecoveries();
  const concerns = new Map<string, number>();
  const actions = new Map<string, number>();
  const outcomes = new Map<string, number>();
  for (const r of recs) {
    (r.concernTags ?? []).forEach((t) => concerns.set(t, (concerns.get(t) ?? 0) + 1));
    (r.actionTags ?? []).forEach((t) => actions.set(t, (actions.get(t) ?? 0) + 1));
    (r.outcomeTags ?? []).forEach((t) => outcomes.set(t, (outcomes.get(t) ?? 0) + 1));
  }
  const top = (m: Map<string, number>, n = 6) =>
    Array.from(m.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, n);
  return {
    concerns: top(concerns),
    actions: top(actions),
    outcomes: top(outcomes),
  };
}

export default function MapPage() {
  const grid = buildGrid();
  const flow = buildFlow();
  const feelings = getAllFeelings();

  return (
    <div className="mx-auto max-w-[1200px] px-6 sm:px-10 pt-14 sm:pt-24 pb-24">
      <header className="mb-10 sm:mb-14">
        <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold">
          Map
        </p>
        <h1 className="mt-5 font-mincho text-3xl sm:text-5xl text-ink leading-[1.3]">
          男性活力市場の、
          <br />
          見取り図。
        </h1>
        <p className="mt-7 font-mincho text-[15px] sm:text-base text-ink/85 leading-[2.05] max-w-[44rem]">
          実例・専門家・事業者・編集解説を、領域とアクターで並べた中立のマップです。
          誰がどこにいて、何で何が変わったかを、商業送客せずに示します。
        </p>
        <div className="mt-6">
          <NeutralBadge />
        </div>
      </header>

      {/* Territory × Actor grid */}
      <section className="mb-16">
        <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-4">
          領域 × アクター
        </p>
        <div className="overflow-x-auto border border-hair-line bg-paper">
          <table className="min-w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-hair-line text-[10px] tracking-[0.1em] uppercase text-sub-gray">
                <th className="text-left px-4 py-3 font-normal">領域</th>
                <th className="text-right px-4 py-3 font-normal">実例</th>
                <th className="text-right px-4 py-3 font-normal">専門家</th>
                <th className="text-right px-4 py-3 font-normal">事業者</th>
                <th className="text-right px-4 py-3 font-normal">編集解説</th>
              </tr>
            </thead>
            <tbody>
              {grid.map((row) => (
                <tr key={row.slug} className="border-b border-hair-line/60">
                  <td className="px-4 py-4">
                    <Link
                      href={`/territories/${row.slug}`}
                      className="font-mincho text-ink hover:text-gold transition-colors"
                    >
                      {row.label}
                    </Link>
                    <p className="mt-1 text-[11px] text-sub-gray">{row.sub}</p>
                  </td>
                  <Cell cell={row.cells.recovery} />
                  <Cell cell={row.cells.expert} />
                  <Cell cell={row.cells.service} />
                  <Cell cell={row.cells.territory} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[11px] text-sub-gray leading-[1.95]">
          ゼロのセルは、まだ揃っていない領域です。専門家・事業者の認証は順次進めます。
        </p>
      </section>

      {/* 悩み → 行動 → 変化 (tag-derived flow) */}
      <section className="mb-16">
        <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-4">
          悩み → 行動 → 変化（実例タグから集計）
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          <FlowColumn label="悩み" kind="concern" items={flow.concerns} />
          <FlowColumn label="行動" kind="action" items={flow.actions} />
          <FlowColumn label="変化" kind="outcome" items={flow.outcomes} />
        </div>
        <p className="mt-3 text-[11px] text-sub-gray leading-[1.95]">
          実例（Recoveries）が増えるほど、この列は厚くなります。各タグから紐づく実例に飛べます。
        </p>
      </section>

      {/* Feeling entries */}
      <section className="mb-16">
        <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-4">
          感情から入る
        </p>
        <ul className="border-t border-hair-line">
          {feelings.map((f) => (
            <li key={f.slug} className="border-b border-hair-line">
              <Link
                href={`/feelings/${f.slug}`}
                className="group flex items-baseline gap-4 py-4 hover:bg-paper/40 px-2 transition-all"
              >
                <span className="font-mincho text-[15px] text-ink leading-[1.55] group-hover:text-gold transition-colors">
                  {f.statement}
                </span>
                <span
                  aria-hidden
                  className="ml-auto text-sub-gray group-hover:text-gold transition-colors"
                >
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <MedicalDisclaimer />
    </div>
  );
}

function Cell({ cell }: { cell: Cell }) {
  if (cell.count === 0) {
    return (
      <td className="px-4 py-4 text-right text-sub-gray/60 tabular-nums">—</td>
    );
  }
  if (cell.href) {
    return (
      <td className="px-4 py-4 text-right">
        <Link
          href={cell.href}
          className="text-ink border-b border-gold/60 pb-0.5 hover:text-gold transition-colors tabular-nums"
        >
          {cell.count}
        </Link>
      </td>
    );
  }
  return (
    <td className="px-4 py-4 text-right text-ink tabular-nums">{cell.count}</td>
  );
}

function FlowColumn({
  label,
  kind,
  items,
}: {
  label: string;
  kind: "concern" | "action" | "outcome";
  items: [string, number][];
}) {
  return (
    <div className="bg-paper border border-hair-line p-5">
      <p className="logo-type italic text-[10px] tracking-[0.25em] uppercase text-gold mb-3">
        {label}
      </p>
      {items.length === 0 ? (
        <p className="text-[12px] text-sub-gray">タグが揃っていません。</p>
      ) : (
        <ul className="space-y-2.5 text-[12.5px]">
          {items.map(([tag, count]) => (
            <li key={tag} className="flex items-baseline justify-between gap-3">
              <Link
                href={`/recoveries/by-tag/${kind}/${encodeURIComponent(tag)}`}
                className="text-ink hover:text-gold transition-colors"
              >
                #{tag}
              </Link>
              <span className="text-sub-gray tabular-nums">{count}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
