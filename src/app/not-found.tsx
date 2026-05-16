import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-reading px-6 pb-24 pt-32 text-center">
      <p className="text-[10px] tracking-[0.3em] text-sub-gray uppercase">
        Not Found
      </p>
      <p className="logo-type mt-6 text-7xl text-sub-gray">404</p>
      <h1 className="mt-10 font-mincho text-2xl text-ink leading-relaxed">
        この場所には、まだ何もありません。
      </h1>
      <p className="mt-6 font-mincho text-sub-gray leading-[2] max-w-[28rem] mx-auto">
        あるいは、まだ言葉になっていないだけかもしれません。
        いずれにせよ、お探しのページは見つかりませんでした。
      </p>
      <div className="mt-14 flex justify-center gap-6 text-sm">
        <Link
          href="/"
          className="border-b border-hair-line hover:border-ink transition-colors"
        >
          トップへ戻る
        </Link>
        <Link
          href="/articles"
          className="border-b border-hair-line hover:border-ink transition-colors"
        >
          すべての記録を見る
        </Link>
      </div>
    </div>
  );
}
