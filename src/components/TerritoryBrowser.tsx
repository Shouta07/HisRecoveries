"use client";

import { useState } from "react";
import Link from "next/link";
import TerritoryIcon from "./TerritoryIcon";
import { ArticleSummary, formatDate } from "@/lib/articleTypes";
import { categoryLabel } from "@/lib/site";

type TerritoryItem = {
  slug: string;
  title: string;
  subtitle: string;
  intro: string;
  categories: string[];
};

type Props = {
  territories: TerritoryItem[];
  articles: ArticleSummary[];
};

export default function TerritoryBrowser({ territories, articles }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  const selectedTerritory = selected
    ? territories.find((t) => t.slug === selected)
    : null;

  const matched = selectedTerritory
    ? articles.filter((a) =>
        selectedTerritory.categories.includes(a.category)
      )
    : [];

  return (
    <div>
      {/* Concerns grid — SBC「悩みから探す」style */}
      <div
        role="tablist"
        aria-label="領域から探す"
        className="grid grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4"
      >
        {territories.map((t) => {
          const isSelected = selected === t.slug;
          return (
            <button
              type="button"
              key={t.slug}
              role="tab"
              aria-selected={isSelected}
              aria-controls="territory-panel"
              onClick={() => setSelected(isSelected ? null : t.slug)}
              className={`group flex flex-col items-center justify-start text-center px-2 py-5 sm:py-7 bg-paper border transition-all ${
                isSelected
                  ? "border-gold shadow-[0_0_0_1px_#9C764A] -translate-y-0.5"
                  : "border-hair-line hover:border-gold hover:-translate-y-0.5"
              }`}
            >
              <TerritoryIcon
                slug={t.slug}
                className={`mb-3 transition-colors ${
                  isSelected ? "text-gold" : "text-ink group-hover:text-gold"
                }`}
              />
              <span
                className={`text-[12px] sm:text-[13px] font-bold leading-[1.45] tracking-[0.04em] transition-colors ${
                  isSelected ? "text-ink" : "text-ink group-hover:text-ink"
                }`}
              >
                {t.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Expanded panel */}
      {selectedTerritory && (
        <div
          id="territory-panel"
          role="tabpanel"
          className="mt-10 sm:mt-12 bg-paper border border-hair-line"
        >
          <div className="px-6 sm:px-10 lg:px-12 pt-9 sm:pt-12 pb-2">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h3 className="font-mincho text-2xl sm:text-3xl font-medium leading-[1.45] text-ink">
                {selectedTerritory.title}
              </h3>
              <p className="text-xs text-sub-gray tracking-[0.08em]">
                {selectedTerritory.subtitle}
              </p>
            </div>
            <p className="mt-5 text-[0.9375rem] leading-[2] text-ink/85 max-w-[36rem]">
              {selectedTerritory.intro}
            </p>
            <div className="mt-7 flex items-center justify-between border-b border-hair-line pb-3">
              <p className="text-xs text-sub-gray tracking-[0.08em]">
                この領域の記録 — {matched.length} 件
              </p>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-xs text-sub-gray hover:text-ink transition-colors"
              >
                閉じる ×
              </button>
            </div>
          </div>

          <div className="px-6 sm:px-10 lg:px-12 pb-12">
            {matched.length === 0 ? (
              <p className="mt-6 text-sm text-sub-gray leading-[2]">
                この領域の記事はまもなく公開されます。
              </p>
            ) : (
              <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
                {matched.map((a) => (
                  <li key={a.slug}>
                    <Link
                      href={`/articles/${a.slug}`}
                      className="group block"
                    >
                      <h4 className="text-[15px] font-bold leading-[1.65] text-ink group-hover:text-ink transition-colors line-clamp-3">
                        {a.title}
                      </h4>
                      <p className="mt-2 text-[11px] text-sub-gray tracking-[0.06em]">
                        {formatDate(a.publishedAt)}
                        <span className="mx-1.5">·</span>
                        {a.readingMinutes} min
                      </p>
                      <p className="mt-2 text-[11px] text-gold tracking-[0.04em]">
                        # {categoryLabel(a.category)}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
