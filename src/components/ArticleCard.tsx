import Link from "next/link";
import CoverImage from "./CoverImage";
import { ArticleSummary, formatDate } from "@/lib/articles";
import { categoryLabel } from "@/lib/site";

type Variant = "list" | "card";

type Props = {
  article: ArticleSummary;
  variant?: Variant;
  showExcerpt?: boolean;
};

export default function ArticleCard({
  article,
  variant = "list",
  showExcerpt = true,
}: Props) {
  if (variant === "card") {
    return (
      <Link
        href={`/articles/${article.slug}`}
        className="group block"
        aria-label={article.title}
      >
        <CoverImage
          src={article.cover}
          alt={article.coverAlt ?? `${article.title}`}
          eyebrow={categoryLabel(article.category)}
          title={article.title}
          meta={formatDate(article.publishedAt)}
          aspectRatio="16/10"
          size="md"
        />
        <div className="mt-5">
          <p className="text-xs text-sub-gray">
            {categoryLabel(article.category)} · {formatDate(article.publishedAt)}
          </p>
          <h3 className="mt-3 text-xl font-bold leading-[1.55] text-ink group-hover:text-navy transition-colors">
            {article.title}
          </h3>
          {showExcerpt && article.excerpt && (
            <p className="mt-3 text-sm leading-loose text-sub-gray line-clamp-2">
              {article.excerpt}
            </p>
          )}
        </div>
      </Link>
    );
  }

  return (
    <article className="border-b border-hair-line py-10 last:border-b-0">
      <Link
        href={`/articles/${article.slug}`}
        className="group block sm:grid sm:grid-cols-[1fr_260px] sm:gap-8 sm:items-start"
      >
        <div className="sm:order-1">
          <div className="text-xs text-sub-gray">
            {categoryLabel(article.category)}
            <span className="mx-2">·</span>
            <time dateTime={article.publishedAt}>
              {formatDate(article.publishedAt)}
            </time>
          </div>
          <h2 className="mt-3 text-xl sm:text-2xl font-bold leading-[1.55] text-ink group-hover:text-navy transition-colors">
            {article.title}
          </h2>
          {showExcerpt && article.excerpt && (
            <p className="mt-3 text-sm sm:text-base leading-loose text-sub-gray line-clamp-3">
              {article.excerpt}
            </p>
          )}
        </div>
        <div className="hidden sm:block sm:order-2 mt-1">
          <CoverImage
            src={article.cover}
            alt={article.coverAlt ?? `${article.title}`}
            eyebrow={categoryLabel(article.category)}
            title={article.title}
            meta={formatDate(article.publishedAt)}
            aspectRatio="4/3"
            size="sm"
          />
        </div>
      </Link>
    </article>
  );
}
