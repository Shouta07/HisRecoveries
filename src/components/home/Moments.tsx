import { assertNoPromoWords } from "@/lib/monetization";
import { clusters } from "@/lib/clusters";

// 「これは自分の話だ」と気づいてもらうための面。
//
// ── なぜ場面を書くのか ────────────────────────────
// 悩みの名前（薄毛・肌・清潔感）を並べても、自分ごとにはならない。
// 名前は分類であって、記憶ではないから。
// 思い出すのは、その悩みが立ち上がった具体的な場面のほう。
// 集合写真、美容室の椅子、明るい店の鏡。
// 名詞ではなく場面を置くと、読み手は自分の記憶で埋める。
//
// ── これは体験談ではない ──────────────────────────
// 取材は0本なので、誰かの声として書くことは絶対にしない。
// かぎ括弧を使わない。年齢も職業も付けない。人物を立てない。
// 「30代・会社員」と一言添えた瞬間に、
// それは取材していない人の証言になる。
//
// 書いてよい根拠は1つだけ。
// ここまでに公開した記事が、実際にこういう場面を扱っていること。
// だから下の但し書きは「取材で集めた声ではない」と自分から書く。
// 根拠のない共感を装うより、根拠のあるほうを出す。
//
// ── 最後の1行で折り返す ─────────────────────────
// 場面を並べるだけだと、ただ気分が下がって終わる。
// 「直し方が分からないのではなく、どこから直すかが分からない」で
// 折り返して、次の節（やることは、3つだけ）に渡す。
// 落として、上げない。位置をずらすだけにする。

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

const MOMENTS = [
  "集合写真で、自分の顔だけ後から確かめる。",
  "美容室で「いつも通りで」と言う。いつも通りが何かは、決めていない。",
  "明るい店の鏡の前を、少し早足で通る。",
  "夜中に調べて、ブックマークだけが増えた。",
  "気にしすぎだと言われて、それきり黙った。",
];

// 煽る言い回しが混ざっていないかを、公開の前に確かめる。
// ここは感情に触る面なので、いちばん筆が滑る場所でもある。
assertNoPromoWords(MOMENTS, "トップの場面");

export default function Moments() {
  return (
    <section className="border-b border-shironezu bg-hakuji">
      <div className="mx-auto max-w-[1080px] px-5 py-12 sm:px-8 sm:py-[88px] lg:px-12">
        <h2
          data-reveal
          className="text-[19px] leading-[1.6] sm:text-[23px]"
          style={{ ...MINCHO, fontWeight: 700 }}
        >
          書いているのは、だいたいこういう場面です。
        </h2>

        <ul data-reveal-stagger className="mt-7 max-w-[30em] sm:mt-9">
          {MOMENTS.map((m) => (
            <li
              key={m}
              data-reveal
              className="border-t border-shironezu py-4 text-[16px] leading-[1.9] text-keshizumi first:border-t-0 sm:py-5 sm:text-[17.5px] sm:leading-[1.95]"
              style={MINCHO}
            >
              {m}
            </li>
          ))}
        </ul>

        {/* 折り返し。ここが無いと、ただ気分が下がって終わる */}
        <p
          data-reveal
          className="mt-9 max-w-[30em] text-[17px] leading-[1.85] text-sumi sm:mt-11 sm:text-[20px]"
          style={{ ...MINCHO, fontWeight: 700 }}
        >
          直し方が分からないのではなく、
          <br className="sm:hidden" />
          どこから直すかが分からない。
        </p>

        {/* 誰の声なのかを、はっきりさせる。
            ここを書かないと、読んだ人は取材した誰かの話だと受け取る。 */}
        <p className="mt-7 max-w-[34em] text-[13px] leading-[1.95] text-ainezu sm:mt-8">
          取材で集めた声ではありません。ここまでに公開した{clusters.length}本の記事が
          扱っているのが、だいたいこういう場面だ、という編集部の整理です。
        </p>
      </div>
    </section>
  );
}
