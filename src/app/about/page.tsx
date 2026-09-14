import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";

// 編集方針。
//
// もとはトップの中の #about にあった。トップが /app の入口になったので、
// ここへ出した。消していない。文面も変えていない。
// 変えたのは置き場所だけで、トップのアンカーを指していたサイト内リンクは
// すべてここへ向け直してある。
//
// ── なぜ残すか ──────────────────────────────
// 取材がまだ0本の状態で信頼を主張できる根拠は、
// 「聞いていないことは聞いていないと書く」という書き方そのものしかない。
// これを畳むと、何も残らない。

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

export const metadata: Metadata = {
  title: "編集方針 — His Recoveries",
  description:
    "誰が、どういう立場で書いているか。聞いていないことは聞いていないと書きます。やらなくていいことは、やらなくていいと書きます。",
  alternates: { canonical: `${site.url}/about` },
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-[840px] px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
      <h1 className="text-[23px] sm:text-[27px]" style={{ ...MINCHO, fontWeight: 700 }}>
        His Recoveriesについて
      </h1>

      <div className="mt-8 max-w-[34em] space-y-6 text-[15px] leading-[2.05] text-keshizumi sm:text-[16px]">
        <p>
          男性の見た目、体、関係についての改善を、順番として編集しているところです。
          髪、肌、睡眠、疲れ、体、パートナーとのこと——誰にも相談できないまま
          検索していることを扱っています。
        </p>
        <p>
          調べても出てくるのは「やったほうがいい」ばかりで、順番も、やらなくていいことも
          書いてありません。ここでは、
          <span className="font-bold text-sumi">
            やらなくていいことは、やらなくていいと書きます。
          </span>
          何を先にやって、何を後回しにしていいのかを決められる状態にするのが、仕事です。
        </p>
        <p>
          いまの順番は、公開されている情報と編集部の判断で組んだ暫定版です。
          取材はこれからです。男性本人、女性、専門家に聞いて、分かったことから順に
          書き足していきます。順番が変わったら、変わった記録も残します。
        </p>
      </div>

      <ul className="mt-9 max-w-[34em] space-y-2.5 text-[15px] leading-[1.95] text-keshizumi">
        <li>聞いていないことは、聞いていないと書きます。</li>
        <li>
          「やったほうがいい」を全部は並べません。いまはやらなくていいものは、そう書きます。
        </li>
        <li>
          順番が変わったら、変わった記録を残します（
          <Link
            href="/updates"
            className="font-bold text-asagi underline decoration-asagi/40 underline-offset-[4px] hover:decoration-asagi"
          >
            更新記録
          </Link>
          ）。
        </li>
        <li>効果や結果は保証しません。医療的な判断は、医師の領域です。</li>
        <li>掲載の順番を、報酬額で決めません。</li>
      </ul>

      <p className="mt-8 max-w-[34em] text-[15px] leading-[1.95] text-keshizumi">
        順番が変わったときだけ、お知らせを送っています。多くて月2回で、
        開かれない状態が続いたら、こちらから止めます。
        <Link
          href="/letters"
          className="ml-1 font-bold text-asagi underline decoration-asagi/40 underline-offset-[4px] hover:decoration-asagi"
        >
          お便りについて
        </Link>
      </p>

      <p className="mt-6 max-w-[34em] text-[14px] leading-[1.95] text-ainezu">
        専門家への取材記事は、まだ0本です。記事の誤りは
        <a
          href={`mailto:${site.email}`}
          className="mx-1 font-bold text-asagi underline decoration-asagi/40 underline-offset-[4px] hover:decoration-asagi"
        >
          {site.email}
        </a>
        までお知らせください。
      </p>

      <p className="mt-12 border-t border-shironezu pt-7 text-[14px] leading-[1.95] text-keshizumi">
        出会ったあとの時間を記録するほうは
        <Link
          href="/app"
          className="mx-1 font-bold text-asagi underline decoration-asagi/40 underline-offset-[4px] hover:decoration-asagi"
        >
          こちら
        </Link>
        です。
      </p>
    </main>
  );
}
