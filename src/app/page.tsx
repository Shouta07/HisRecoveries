import Link from "next/link";
import { getAllArticles } from "@/lib/articles";
import ArticleCard from "@/components/ArticleCard";
import { site } from "@/lib/site";

export default function HomePage() {
  const latest = getAllArticles().slice(0, 5);

  return (
    <div className="mx-auto max-w-reading px-6 pb-24 pt-20 sm:pt-28">
      <section aria-labelledby="brand" className="mb-24">
        <h1
          id="brand"
          className="logo-type text-5xl sm:text-6xl text-ink leading-tight"
        >
          {site.name}
        </h1>
        <p className="mt-4 font-mincho text-base sm:text-lg text-sub-gray">
          {site.tagline}
        </p>

        <div className="mt-16 max-w-[36rem] font-mincho text-[1.0625rem] leading-[2.1] text-ink">
          <p>
            ここは、いくつかのコンプレックスを抱えていた頃の記録と、
            それを超えてきた後の観察を、半歩先から残す場所です。
          </p>
          <p className="mt-6">
            叫ばず、整える。万人に届くことは期待していません。
            後ろから歩いてくる誰かに、静かに届けばいい。
          </p>
        </div>
      </section>

      <section aria-labelledby="latest">
        <div className="flex items-baseline justify-between border-b border-hair-line pb-4">
          <h2
            id="latest"
            className="font-mincho text-sm tracking-widest text-sub-gray"
          >
            最近の記録
          </h2>
          <Link
            href="/articles"
            className="text-xs text-sub-gray hover:text-ink transition-colors"
          >
            すべて見る →
          </Link>
        </div>

        {latest.length === 0 ? (
          <p className="mt-10 text-sm text-sub-gray">
            記事はまもなく公開されます。
          </p>
        ) : (
          <div>
            {latest.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="connect" className="mt-32">
        <h2
          id="connect"
          className="font-mincho text-sm tracking-widest text-sub-gray border-b border-hair-line pb-4"
        >
          別の場所での記録
        </h2>
        <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-sub-gray">
          <li>
            <a
              href={site.social.threads}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ink transition-colors"
            >
              Threads
            </a>
          </li>
          <li>
            <a
              href={site.social.x}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ink transition-colors"
            >
              X
            </a>
          </li>
          <li>
            <a
              href={site.social.note}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ink transition-colors"
            >
              note
            </a>
          </li>
          <li>
            <a
              href={site.social.substack}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ink transition-colors"
            >
              Substack
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}
