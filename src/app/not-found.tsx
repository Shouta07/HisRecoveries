import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-reading px-6 pb-24 pt-32 text-center">
      <p className="logo-type text-6xl text-sub-gray">404</p>
      <h1 className="mt-6 font-mincho text-2xl text-ink">
        この場所には、まだ何もありません
      </h1>
      <p className="mt-4 text-sm text-sub-gray">
        ページが見つかりませんでした。
      </p>
      <div className="mt-10">
        <Link
          href="/"
          className="text-sm border-b border-hair-line hover:border-ink transition-colors"
        >
          トップへ戻る
        </Link>
      </div>
    </div>
  );
}
