"use client";

import { useState } from "react";
import Link from "next/link";
import TerritoryArt from "./TerritoryArt";
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
    <section aria-labelledby="territories">
      <div className="flex items-baseline justify-between mb-6">
        <h2
          id="territories"
          className="font-mincho text-2xl sm:text-3xl font-medium leading-[1.5]"
        >
          地形図
        </h2>
        {selected && (
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="text-sm text-sub-gray hover:text-navy transition-colors"
          >
            選択を解除
          </button>
        )}
      </div>
      <p className="text-[0.9375rem] text-sub-gray leading-[1.9] mb-8 max-w-[36rem]">
        気になる領域を選ぶと、関連する記録が下に並びます。
      </p>

      <div
        role="tablist"
        aria-label="領域"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
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
              onClick={() =>
                setSelected(isSelected ? null : t.slug)
              }
              className={`group block overflow-hidden border text-left transition-colors ${
                isSelected
                  ? "border-gold bg-paper shadow-[0_0_0_1px_#B08755]"
                  : "border-hair-line bg-paper hover:border-gold"
              }`}
            >
              <TerritoryArt slug={t.slug} />
              <div className="p-5 sm:p-6">
                <h3
                  className={`text-lg font-bold leading-[1.6] transition-colors ${
                    isSelected ? "text-navy" : "text-ink group-hover:text-navy"
                  }`}
                >
                  {t.title}
                </h3>
                <p className="mt-2 font-mincho text-[13px] text-sub-gray leading-[1.9]">
                  {t.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Expanded panel */}
      {selectedTerritory && (
        <div
          id="territory-panel"
          role="tabpanel"
          aria-labelledby={`territory-${selectedTerritory.slug}`}
          className="mt-8 bg-paper border border-hair-line p-6 sm:p-10"
        >
          <h3 className="text-xl sm:text-2xl font-bold leading-[1.5] text-ink">
            {selectedTerritory.title}
          </h3>
          <p className="mt-3 font-mincho text-sub-gray text-[0.9375rem] leading-[2]">
            — {selectedTerritory.subtitle} —
          </p>
          <p className="mt-6 text-[0.9375rem] leading-[2] text-ink max-w-[36rem]">
            {selectedTerritory.intro}
          </p>

          <div className="mt-10">
            <h4 className="text-sm font-bold text-ink mb-5">
              この領域の記録 — {matched.length} 件
            </h4>
            {matched.length === 0 ? (
              <p className="text-sm text-sub-gray leading-[2]">
                この領域の記事はまもなく公開されます。
              </p>
            ) : (
              <ul className="space-y-3">
                {matched.map((a) => (
                  <li
                    key={a.slug}
                    className="border border-hair-line hover:border-gold transition-colors"
                  >
                    <Link
                      href={`/articles/${a.slug}`}
                      className="block p-5 group"
                    >
                      <p className="text-xs text-sub-gray">
                        {categoryLabel(a.category)}
                        <span className="mx-2">·</span>
                        {formatDate(a.publishedAt)}
                        <span className="mx-2">·</span>
                        {a.readingMinutes} min
                      </p>
                      <h5 className="mt-2 text-base sm:text-lg font-bold leading-[1.55] text-ink group-hover:text-navy transition-colors">
                        {a.title}
                      </h5>
                      {a.excerpt && (
                        <p className="mt-2 text-sm leading-[1.85] text-sub-gray line-clamp-2">
                          {a.excerpt}
                        </p>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
