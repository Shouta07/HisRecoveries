import LinkBuilder from "./LinkBuilder";

// SNS投稿に貼るリンクを作る画面。
// /admin 配下は Basic 認証がかかる（middleware.ts）。

export const metadata = { title: "SNSリンクを作る" };

export default function LinksPage() {
  return (
    <main className="mx-auto max-w-[900px] px-5 py-12 sm:px-8">
      <h1 className="text-[22px] font-bold">SNSリンクを作る</h1>
      <p className="mt-3 max-w-[42em] text-[14px] leading-[1.95] text-keshizumi">
        投稿に貼るURLは、ここで作ったものだけを使ってください。
        手で書くと <code className="text-[13px]">threads</code> と{" "}
        <code className="text-[13px]">Threads</code> が混ざり、その時点でチャネル別の集計が使えなくなります。
      </p>

      <LinkBuilder />

      <section className="mt-14 max-w-[42em]">
        <h2 className="text-[16px] font-bold">これで何が分かるか</h2>
        <ul className="mt-4 border-t border-shironezu">
          {[
            ["どのSNSが、診断まで届くか", "フォロワー数ではなく、診断完了まで到達した人数で比べる"],
            ["どの種類の投稿が効くか", "共感・選択肢整理・一次情報・思想の4つを、同じ物差しで比べる"],
            ["どの投稿が効いたか", "識別子を入れておくと、伸びた投稿を後から特定できる"],
          ].map(([t, d]) => (
            <li key={t} className="border-b border-shironezu py-3.5">
              <p className="text-[14.5px] font-bold">{t}</p>
              <p className="mt-1 text-[13.5px] leading-[1.85] text-keshizumi">{d}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12 max-w-[42em] border border-shironezu bg-hakuji px-5 py-5">
        <h2 className="text-[15px] font-bold">いま測れていないこと</h2>
        <p className="mt-2.5 text-[13.5px] leading-[1.9] text-keshizumi">
          <code className="text-[13px]">/admin/insights</code> のダッシュボードは、
          <b>まだ古いイベント（assessment / story）を集計しています</b>。
          いまサイトが出しているのは <code className="text-[13px]">check_*</code> なので、
          診断のファネルはあの画面には出ません。
          Supabase 側のビューを差し替えるまで、数字は GA4 で見てください。
        </p>
      </section>
    </main>
  );
}
