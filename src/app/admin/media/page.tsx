import type { Metadata } from "next";
import { getAllArticles } from "@/lib/articles";
import { storageEnabled } from "@/lib/storage";
import MediaClient from "./MediaClient";

export const metadata: Metadata = {
  title: "Media — Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function MediaAdminPage() {
  const articles = getAllArticles().map((a) => ({
    slug: a.slug,
    title: a.title,
  }));

  return (
    <div className="mx-auto max-w-[1100px] px-6 sm:px-10 pt-12 sm:pt-16 pb-24">
      <header className="mb-10">
        <p className="text-[10px] tracking-[0.3em] text-sub-gray uppercase">
          Admin · Media
        </p>
        <h1 className="mt-3 font-mincho text-3xl sm:text-4xl text-ink leading-[1.4]">
          記事のメディアを管理する
        </h1>
        <p className="mt-5 max-w-[36rem] text-[14px] leading-[2] text-sub-gray">
          画像と短尺動画（最大 4MB）をドラッグ&ドロップで Supabase Storage に
          アップロードします。アップロード後に表示される URL を、記事の
          markdown 本文に貼り付けてください。
          <br />
          長尺動画は YouTube にアップロードして、URL を記事本文に貼るだけで
          自動で埋め込みになります。
        </p>
      </header>

      {!storageEnabled ? (
        <SetupNotice />
      ) : (
        <MediaClient articles={articles} />
      )}
    </div>
  );
}

function SetupNotice() {
  return (
    <div className="border border-hair-line bg-paper p-8 sm:p-10">
      <h2 className="font-mincho text-xl text-ink">セットアップが必要です</h2>
      <ol className="mt-6 space-y-3 font-mincho text-[14px] leading-[2] text-ink/85 list-decimal pl-5">
        <li>
          Vercel の Environment Variables に <code>SUPABASE_URL</code> /{" "}
          <code>SUPABASE_SERVICE_KEY</code> が入っているか確認。
        </li>
        <li>
          Supabase ダッシュボード → Storage → <b>New bucket</b> →
          名前 <code>article-media</code> → <b>Public bucket</b> を ON →
          Create
        </li>
        <li>
          作成後、再デプロイ → このページに戻ってアップロード開始。
        </li>
      </ol>
    </div>
  );
}
