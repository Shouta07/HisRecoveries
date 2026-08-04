import Link from "next/link";
import ArticleRow, { type RowArticle } from "./ArticleRow";

// 分野ごとのまとまり。上から4本だけ出して、残りは畳む。
//
// ── なぜ畳むか ────────────────────────────────
// 実測で、索引だけで 12,090px（14画面ぶん）あった。
// ページ全体 21,614px の56%が、この一覧だった。
// 探しに来た人でも、6分野ぶんを全部スクロールしてから選ぶことはしない。
//
// ── なぜ details なのか ──────────────────────────
// 状態で出し分けると、閉じているぶんが HTML から消える。
// このサイトは検索エンジンとAI検索に一覧を読ませる前提で組んでいるので、
// 消えると索引としての役目がなくなる。
// details なら閉じていても中身は HTML に残り、JS も要らない。
//
// ── 4本という数 ──────────────────────────────
// 分野あたりの記事は9〜10本。半分近くを見せると畳む意味が薄く、
// 2本だと分野の中身が分からない。1画面に収まる範囲で4本。

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

const VISIBLE = 4;

export default function ArticleGroup({
  id,
  name,
  items,
}: {
  id: string;
  name: string;
  items: RowArticle[];
}) {
  const head = items.slice(0, VISIBLE);
  const rest = items.slice(VISIBLE);

  return (
    <section>
      <div className="flex items-baseline gap-4 border-b-2 border-sumi pb-3">
        <h3 className="text-[17px] sm:text-[19px]" style={{ ...MINCHO, fontWeight: 700 }}>
          {name}
        </h3>
        <span className="text-[12.5px] tabular-nums text-ainezu">{items.length}</span>
        <Link
          href={`/areas/${id}`}
          className="ml-auto text-[13px] font-bold text-asagi underline decoration-asagi/40 underline-offset-[5px] transition-colors hover:decoration-asagi"
        >
          この分野について
        </Link>
      </div>

      {/* 地色を敷いて gap-px で罫線を出す。分野タイルと同じ組み方 */}
      <div className="mt-5 border border-shironezu bg-shironezu">
        <ul className="grid gap-px lg:grid-cols-2">
          {head.map((a) => (
            <ArticleRow key={a.slug} a={a} />
          ))}
        </ul>

        {rest.length > 0 && (
          <details className="group border-t border-shironezu">
            <summary className="flex cursor-pointer list-none items-center justify-center gap-2 bg-shironeri px-4 py-4 text-[14px] font-bold text-asagi transition-colors hover:bg-hakuji">
              <span className="group-open:hidden">残り{rest.length}本を見る</span>
              <span className="hidden group-open:inline">閉じる</span>
              <span
                aria-hidden
                className="text-[11px] transition-transform group-open:rotate-180"
              >
                ▼
              </span>
            </summary>
            <ul className="grid gap-px border-t border-shironezu lg:grid-cols-2">
              {rest.map((a) => (
                <ArticleRow key={a.slug} a={a} />
              ))}
            </ul>
          </details>
        )}
      </div>
    </section>
  );
}
