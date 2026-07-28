import Link from "next/link";
import CoverImage from "./CoverImage";
import { ArticleSummary, formatDate } from "@/lib/articleTypes";
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
    // TENTIAL Journal style: 16:10 cover, gothic bold title, date, # tag
    return (
      <Link
        href={`/articles/${article.slug}`}
        className="group block card-lift"
        aria-label={article.title}
      >
        <div className="cover-zoom">
          <CoverImage
            src={article.cover}
            alt={article.coverAlt ?? `${article.title}`}
            eyebrow={categoryLabel(article.category)}
            title={article.title}
            meta={formatDate(article.publishedAt)}
            aspectRatio="16/10"
            size="md"
          />
        </div>
        <div className="mt-5">
          <h3 className="text-[15px] sm:text-base font-bold leading-[1.65] text-ink group-hover:text-ink transition-colors line-clamp-3">
            {article.title}
          </h3>
          {showExcerpt && article.excerpt && (
            <p className="mt-3 text-[14px] leading-[1.85] text-sub-gray line-clamp-3">
              {article.excerpt}
            </p>
          )}
          <div className="mt-4 flex items-center justify-between gap-3 text-[12px] tracking-[0.06em]">
            <time dateTime={article.publishedAt} className="text-sub-gray">
              {formatDate(article.publishedAt)}
            </time>
            <span className="text-gold">
              # {categoryLabel(article.category)}
            </span>
          </div>
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
          <h2 className="mt-3 text-xl sm:text-2xl font-bold leading-[1.55] text-ink group-hover:text-ink transition-colors">
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
