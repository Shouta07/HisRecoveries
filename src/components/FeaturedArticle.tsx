import Link from "next/link";
import CoverImage from "./CoverImage";
import { ArticleSummary, formatDate } from "@/lib/articleTypes";
import { categoryLabel } from "@/lib/site";

type Props = { article: ArticleSummary };

export default function FeaturedArticle({ article }: Props) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group block bg-paper hover:bg-paper/95 transition-colors"
      aria-label={article.title}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-0 lg:gap-10 items-stretch">
        <div className="order-1">
          <CoverImage
            src={article.cover}
            alt={article.coverAlt ?? article.title}
            eyebrow={categoryLabel(article.category)}
            title={article.title}
            meta={formatDate(article.publishedAt)}
            aspectRatio="4/3"
            size="lg"
          />
        </div>
        <div className="order-2 p-7 sm:p-10 lg:py-12 lg:pr-10 flex flex-col justify-center">
          <p className="text-xs text-sub-gray">
            {categoryLabel(article.category)}
            <span className="mx-2">·</span>
            <time dateTime={article.publishedAt}>
              {formatDate(article.publishedAt)}
            </time>
            <span className="mx-2">·</span>
            <span>{article.readingMinutes} min read</span>
          </p>
          <h3 className="mt-4 text-2xl sm:text-3xl lg:text-[2rem] font-bold leading-[1.55] text-ink group-hover:text-ink transition-colors">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="mt-5 font-mincho text-[1rem] leading-[2.1] text-ink/85 line-clamp-4">
              {article.excerpt}
            </p>
          )}
          <span className="mt-7 inline-flex items-center gap-2 text-sm tracking-wider text-ink border-b border-gold pb-0.5 self-start group-hover:text-gold transition-colors">
            この記録を読む
            <span aria-hidden>→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
