import type { Metadata } from "next";
import Link from "next/link";
import { getAllArticles } from "@/lib/articles";
import { formatDate } from "@/lib/articleTypes";
import { githubEnabled } from "@/lib/github";
import { categoryLabel } from "@/lib/site";

export const metadata: Metadata = {
  title: "Articles — Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function ArticlesAdminPage() {
  const articles = getAllArticles();

  return (
    <div className="mx-auto max-w-[1100px] px-6 sm:px-10 pt-12 sm:pt-16 pb-24">
      <header className="mb-10 flex items-end justify-between gap-6">
        <div>
          <p className="text-[10px] tracking-[0.3em] text-sub-gray uppercase">
            Admin · Articles
          </p>
          <h1 className="mt-3 font-mincho text-3xl sm:text-4xl text-ink leading-[1.4]">
            記事を編集する
          </h1>
          <p className="mt-4 text-[13px] text-sub-gray">
            選択して編集 · 保存すると GitHub にコミット → 1〜2 分で本番に反映
          </p>
        </div>
        <Link href="/admin/edit/new" className="btn-gold whitespace-nowrap">
          新規作成
        </Link>
      </header>

      {!githubEnabled && <SetupNotice />}

      <ul className="border-t border-hair-line">
        {articles.map((a) => (
          <li key={a.slug} className="border-b border-hair-line">
            <Link
              href={`/admin/edit/${a.slug}`}
              className="group grid grid-cols-[1fr_auto] gap-4 sm:gap-6 items-baseline py-5 sm:py-6 hover:bg-paper/60 transition-colors px-2 sm:px-3"
            >
              <div>
                <p className="text-[11px] tracking-[0.08em] text-gold">
                  {categoryLabel(a.category)}
                </p>
                <h3 className="mt-1 font-mincho text-base sm:text-lg text-ink group-hover:text-gold transition-colors leading-[1.55]">
                  {a.title}
                </h3>
                <p className="mt-2 text-[12px] text-sub-gray">
                  /{a.slug}
                </p>
              </div>
              <div className="text-right text-[11px] text-sub-gray shrink-0">
                <time dateTime={a.publishedAt}>
                  {formatDate(a.publishedAt)}
                </time>
                {a.status === "draft" && (
                  <span className="block mt-1 text-[10px] tracking-[0.1em] text-red-600">
                    下書き
                  </span>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SetupNotice() {
  return (
    <div className="mb-10 border border-hair-line bg-paper p-6 sm:p-8">
      <h2 className="font-mincho text-lg text-ink">セットアップが必要です</h2>
      <p className="mt-3 text-[14px] leading-[2] text-ink/85">
        編集機能を有効化するには GitHub API トークンが必要です。
        Vercel の Environment Variables に以下 2 つを追加してください：
      </p>
      <ol className="mt-4 space-y-2 text-[13px] text-ink/85 list-decimal pl-5 leading-[1.95]">
        <li>
          <code>GITHUB_TOKEN</code> — GitHub Fine-grained PAT
          （Settings → Developer settings → Personal access tokens → Fine-grained tokens
          → Generate）。Repository access はこのリポジトリのみ、
          Repository permissions の <b>Contents: Read and write</b> を許可。
        </li>
        <li>
          <code>GITHUB_REPO</code> = <code>Shouta07/HisRecoveries</code>
        </li>
      </ol>
      <p className="mt-4 text-[12px] text-sub-gray">
        保存後、再デプロイしてからこのページに戻ってください。
      </p>
    </div>
  );
}
