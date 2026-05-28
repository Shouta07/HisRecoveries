import Link from "next/link";
import CoverImage from "./CoverImage";
import { ArticleSummary, formatDate } from "@/lib/articleTypes";
import { categoryLabel } from "@/lib/site";

type Props = {
  featured: ArticleSummary;
  rest: ArticleSummary[];
};

export default function WhatsNew({ featured, rest }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 lg:gap-12">
      {/* Featured (large) */}
      <Link
        href={`/articles/${featured.slug}`}
        className="group block card-lift"
        aria-label={featured.title}
      >
        <div className="cover-zoom">
          <CoverImage
            src={featured.cover}
            alt={featured.coverAlt ?? featured.title}
            eyebrow={categoryLabel(featured.category)}
            title={featured.title}
            meta={formatDate(featured.publishedAt)}
            aspectRatio="4/3"
            size="lg"
          />
        </div>
        <div className="mt-6 sm:mt-8">
          <p className="text-xs text-sub-gray">
            {categoryLabel(featured.category)}
            <span className="mx-2">·</span>
            {formatDate(featured.publishedAt)}
            <span className="mx-2">·</span>
            {featured.readingMinutes} min
          </p>
          <h3 className="mt-3 font-mincho text-2xl sm:text-3xl font-medium leading-[1.55] text-ink group-hover:text-navy transition-colors">
            {featured.title}
          </h3>
          {featured.excerpt && (
            <p className="mt-4 text-sm sm:text-base leading-[1.95] text-sub-gray line-clamp-3">
              {featured.excerpt}
            </p>
          )}
        </div>
      </Link>

      {/* Sidebar list */}
      <ul className="flex flex-col">
        {rest.slice(0, 3).map((a, i) => (
          <li
            key={a.slug}
            className={`group ${
              i > 0 ? "border-t border-hair-line pt-6 mt-6" : ""
            }`}
          >
            <Link
              href={`/articles/${a.slug}`}
              className="grid grid-cols-[100px_1fr] sm:grid-cols-[120px_1fr] gap-4 sm:gap-5 items-start"
            >
              <div className="cover-zoom">
                <CoverImage
                  src={a.cover}
                  alt={a.coverAlt ?? a.title}
                  eyebrow={categoryLabel(a.category)}
                  title={a.title}
                  meta={formatDate(a.publishedAt)}
                  aspectRatio="1/1"
                  size="sm"
                />
              </div>
              <div>
                <p className="text-[11px] text-sub-gray">
                  {categoryLabel(a.category)}
                  <span className="mx-1.5">·</span>
                  {formatDate(a.publishedAt)}
                </p>
                <h4 className="mt-1.5 text-sm sm:text-base font-bold leading-[1.6] text-ink group-hover:text-navy transition-colors line-clamp-3">
                  {a.title}
                </h4>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
