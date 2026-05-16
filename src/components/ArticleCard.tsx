import Link from "next/link";
import { ArticleSummary } from "@/lib/articles";
import { categoryLabel } from "@/lib/site";
import { formatDate } from "@/lib/articles";

type Props = {
  article: ArticleSummary;
  showExcerpt?: boolean;
};

export default function ArticleCard({ article, showExcerpt = true }: Props) {
  return (
    <article className="border-b border-hair-line py-10 last:border-b-0">
      <Link
        href={`/articles/${article.slug}`}
        className="group block"
      >
        <div className="text-xs text-sub-gray tracking-wider">
          <span>{categoryLabel(article.category)}</span>
          <span className="mx-2">·</span>
          <time dateTime={article.publishedAt}>
            {formatDate(article.publishedAt)}
          </time>
        </div>
        <h2 className="mt-3 font-mincho text-xl sm:text-2xl leading-relaxed text-ink group-hover:text-quiet-brass transition-colors">
          {article.title}
        </h2>
        {showExcerpt && article.excerpt && (
          <p className="mt-3 text-sm sm:text-base leading-loose text-sub-gray">
            {article.excerpt}
          </p>
        )}
      </Link>
    </article>
  );
}
