import Link from "next/link";
import { getAllArticles } from "@/lib/articles";
import ArticleCard from "@/components/ArticleCard";
import { site } from "@/lib/site";

export default function HomePage() {
  const latest = getAllArticles().slice(0, 5);

  return (
    <div className="mx-auto max-w-reading px-6 pb-24 pt-20 sm:pt-28">
      {/* Brand mark */}
      <section aria-labelledby="brand" className="mb-32">
        <p className="text-[10px] tracking-[0.3em] text-sub-gray uppercase">
          Est. 2026 — A Quiet Record
        </p>
        <h1
          id="brand"
          className="logo-type mt-6 text-5xl sm:text-7xl text-ink leading-[0.95]"
        >
          {site.name}
        </h1>
        <p className="mt-5 font-mincho text-base sm:text-lg text-sub-gray">
          — {site.tagline} —
        </p>
      </section>

      {/* Manifesto */}
      <section aria-labelledby="manifesto" className="mb-32">
        <p className="text-[10px] tracking-[0.3em] text-sub-gray uppercase mb-10">
          I. Manifesto
        </p>
        <h2 id="manifesto" className="sr-only">
          このメディアについて
        </h2>
        <div className="font-mincho text-[1.0625rem] leading-[2.2] text-ink space-y-7 max-w-[36rem]">
          <p>
            ここは、解決策を売る場所ではありません。
            治した話ではなく、まだ整えている途中の話。
            完了した過去としてではなく、続いている現在として、
            身体と自意識のあいだに残った景色を、低い声で記録しています。
          </p>
          <p>
            声を張りません。万人受けは目指しません。
            ただ、後ろから歩いてくる人の、半歩先にだけ届けばいい。
          </p>
          <p className="text-sub-gray">
            <em className="not-italic logo-type tracking-wider">
              Observed — not proclaimed.
            </em>
          </p>
        </div>
      </section>

      {/* Territories */}
      <section aria-labelledby="territories" className="mb-32">
        <p className="text-[10px] tracking-[0.3em] text-sub-gray uppercase mb-10">
          II. Territories
        </p>
        <h2
          id="territories"
          className="font-mincho text-xl text-ink mb-8"
        >
          扱う領域
        </h2>
        <ol className="font-mincho text-[1.0625rem] leading-[2.1] text-ink space-y-3">
          <li className="flex items-baseline gap-5">
            <span className="logo-type text-sub-gray text-sm w-8">I.</span>
            <Link
              href="/articles/category/hyperhidrosis"
              className="hover:text-quiet-brass transition-colors"
            >
              多汗症
            </Link>
          </li>
          <li className="flex items-baseline gap-5">
            <span className="logo-type text-sub-gray text-sm w-8">II.</span>
            <Link
              href="/articles/category/acne"
              className="hover:text-quiet-brass transition-colors"
            >
              ニキビ・ニキビ跡
            </Link>
          </li>
          <li className="flex items-baseline gap-5">
            <span className="logo-type text-sub-gray text-sm w-8">III.</span>
            <Link
              href="/articles/category/bromhidrosis"
              className="hover:text-quiet-brass transition-colors"
            >
              ワキガ・腋臭症
            </Link>
          </li>
          <li className="flex items-baseline gap-5">
            <span className="logo-type text-sub-gray text-sm w-8">IV.</span>
            <Link
              href="/articles/category/face"
              className="hover:text-quiet-brass transition-colors"
            >
              顔の自信のなさ
            </Link>
          </li>
          <li className="flex items-baseline gap-5 pt-3 mt-3 border-t border-hair-line">
            <span className="logo-type text-sub-gray text-sm w-8">V.</span>
            <Link
              href="/articles/category/philosophy"
              className="hover:text-quiet-brass transition-colors text-sub-gray"
            >
              これらを横断する観察
            </Link>
          </li>
        </ol>
      </section>

      {/* Latest records */}
      <section aria-labelledby="latest" className="mb-32">
        <div className="flex items-baseline justify-between border-b border-hair-line pb-4">
          <p className="text-[10px] tracking-[0.3em] text-sub-gray uppercase">
            III. Recent Records
          </p>
          <Link
            href="/articles"
            className="text-xs text-sub-gray hover:text-ink transition-colors"
          >
            すべて見る →
          </Link>
        </div>
        <h2 id="latest" className="sr-only">
          最近の記録
        </h2>

        {latest.length === 0 ? (
          <p className="mt-10 font-mincho text-sm text-sub-gray leading-[2]">
            記事はまもなく公開されます。
            <br />
            最初の数本は、いま静かに書かれているところです。
          </p>
        ) : (
          <div>
            {latest.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        )}
      </section>

      {/* Signature */}
      <section aria-labelledby="signature" className="mb-32">
        <h2 id="signature" className="sr-only">
          書き手より
        </h2>
        <p className="font-mincho text-sm text-sub-gray leading-[2.1] max-w-[28rem]">
          書き手は、かつて当事者でした。今は、半歩だけ先にいます。
          振り返ると、まだそこに立っている、という程度の距離です。
        </p>
        <p className="logo-type text-base text-ink mt-6 tracking-wider">
          —— Nagi
        </p>
      </section>

      {/* Connect */}
      <section aria-labelledby="connect">
        <p className="text-[10px] tracking-[0.3em] text-sub-gray uppercase border-b border-hair-line pb-4">
          IV. Elsewhere
        </p>
        <h2 id="connect" className="sr-only">
          別の場所での記録
        </h2>
        <ul className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-y-3 gap-x-6 text-sm text-sub-gray">
          <li>
            <a
              href={site.social.threads}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ink transition-colors"
            >
              Threads
              <span className="block text-[10px] text-sub-gray/60 tracking-wider mt-0.5">
                {site.handle}
              </span>
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
              <span className="block text-[10px] text-sub-gray/60 tracking-wider mt-0.5">
                {site.handle}
              </span>
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
              <span className="block text-[10px] text-sub-gray/60 tracking-wider mt-0.5">
                長い記録
              </span>
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
              <span className="block text-[10px] text-sub-gray/60 tracking-wider mt-0.5">
                Newsletter
              </span>
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}
