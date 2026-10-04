import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { NAME } from "@/lib/voice";
import { SCENES } from "@/lib/scene/problems";
import Mark from "@/components/brand/Mark";

/* ══════════════════════════════════════════════════
   場面の一覧
   ══════════════════════════════════════════════════
   ── 詰将棋にしない ──────────────────────────────
   元にした形（詰め）は、正解の1手を当てさせるもの。
   こちらは正解を持たない（lib/scene/problems.ts）。

   返すのは、同じ場面を見た人がどう分かれたか。
   それがこの製品の芯（正解は渡さない）と同じ形になる。

   ── 集客であり、仕入れでもある ──────────────────
   いま回答者は0人。そのあいだ「月3回、実在する異性に
   確カメられる」は空手形のまま。
   ここで答えた人が、そのまま回答者の候補になる。

   ── 検索に出す ──────────────────────────────────
   /koi と違い、この面は見られて困らない。
   トップに次いで、人が来る入口にする。 */

export const metadata: Metadata = {
  title: { absolute: `この場面、あなたならどうする？ — ${NAME}` },
  description:
    "マッチングアプリでマッチした後の、迷う場面を出します。選ぶと、同じ場面を見た人がどう分かれたかが出ます。正解は出しません。",
  alternates: { canonical: `${site.url}/scene` },
  openGraph: {
    type: "website",
    locale: site.locale,
    url: `${site.url}/scene`,
    siteName: NAME,
    title: `この場面、あなたならどうする？ — ${NAME}`,
    description:
      "マッチした後の、迷う場面。選ぶと、同じ場面を見た人がどう分かれたかが出ます。",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: NAME }],
  },
};

export default function ScenesPage() {
  return (
    <div data-brand className="min-h-screen bg-paper text-slate">
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex w-full max-w-[640px] items-center gap-2.5 px-5 py-3.5 sm:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Mark size={32} />
            <span className="text-[17px] font-black text-slate">{NAME}</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[640px] px-5 pb-20 pt-8 sm:px-8">
        <h1 className="text-huge font-black text-slate">
          この場面、
          <br />
          あなたならどうする？
        </h1>
        <p className="mt-4 text-[15px] leading-[1.95] text-steel">
          マッチした後の、迷う場面を出します。選ぶと、同じ場面を見た人がどう分かれたかが出ます。
        </p>
        {/* 先に断る。正解当てだと思って入ってきた人に、入口で言う */}
        <p className="mt-2.5 text-[15px] font-bold leading-[1.9] text-slate">
          正解は出しません。
        </p>

        <ul className="mt-8 flex flex-col gap-2.5">
          {SCENES.map((s) => (
            <li key={s.id}>
              <Link
                href={`/scene/${s.id}`}
                className="block rounded-card border border-line bg-paper p-5 shadow-card transition-shadow hover:shadow-card-hover"
              >
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="rounded-pill bg-mist px-2 py-0.5 text-[10.5px] font-bold text-steel">
                    {s.app}
                  </span>
                  <span className="text-[12px] font-bold text-steel">{s.stage}</span>
                </span>
                <span className="mt-2 block text-[15.5px] font-bold leading-[1.7] text-slate">
                  {s.setup[0]}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-10 rounded-card bg-mist p-5">
          <p className="text-[14.5px] font-black leading-[1.7] text-slate">
            答える側にも、なれます。
          </p>
          <p className="mt-2 text-[13px] leading-[1.9] text-steel">
            ここで答えた内容は、同じ場面で迷っている人に、数として返ります。
            実際に読んで答える側に興味がある方は、こちらへ。
          </p>
          <Link
            href="/answerers"
            className="mt-4 inline-flex min-h-[48px] items-center justify-center rounded-pill border border-brand bg-paper px-5 text-[14px] font-bold text-brand"
          >
            答える側について <span aria-hidden className="ml-1.5">&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
