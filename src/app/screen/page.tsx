import type { Metadata } from "next";
import Link from "next/link";
import { ALL_TERRITORIES, getScreening } from "@/lib/screenings";
import { TERRITORY_LABEL } from "@/lib/feelings";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "3 分の軽診断 — His Recoveries",
  description:
    "5 問でいまの状態と、次の半歩を返します。多汗症・ワキガ・ニキビ跡・薄毛・体毛・顔の印象・自意識。診断はしません。医療相談の判断材料として、編集者の所見と推奨される次の一手をひとつだけお返しします。",
  alternates: { canonical: `${site.url}/screen` },
  openGraph: {
    title: `3 分の軽診断 — ${site.name}`,
    description: "5 問でいまの状態と、次の半歩。",
    url: `${site.url}/screen`,
  },
};

export default function ScreenIndexPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-6 sm:px-10 pt-14 sm:pt-24 pb-24">
      <header className="mb-14 sm:mb-20 max-w-[40rem]">
        <p
          className="font-mincho text-[12.5px] tracking-[0.4em] uppercase text-gold"
          style={{ fontWeight: 600 }}
        >
          3 minutes / 5 questions
        </p>
        <h1
          className="mt-5 font-mincho text-[2rem] sm:text-[2.85rem] lg:text-[3.3rem] text-ink leading-[1.3] tracking-[-0.005em]"
          style={{ fontWeight: 700 }}
        >
          3 分の軽診断、
          <br />
          ひとつ選んでください。
        </h1>
        <p
          className="mt-7 font-mincho text-[14.5px] sm:text-[15.5px] text-ink/80 leading-[2.05]"
          style={{ fontWeight: 500 }}
        >
          5 問でいまの状態と、推奨される次の半歩をひとつだけお返しします。
          診断はしません。匿名で答えられて、回答はあなたの端末から出ません。
        </p>
        <p
          className="mt-4 text-[12px] tracking-[0.04em] text-sub-gray leading-[1.95]"
          style={{ fontWeight: 500 }}
        >
          紹介手数料・広告費は受け取りません。掲載・推薦は買えません。
        </p>
      </header>

      <ul className="border-t-2 border-ink/15">
        {ALL_TERRITORIES.map((t) => {
          const available = Boolean(getScreening(t.slug));
          const label = TERRITORY_LABEL[t.slug] ?? t.category;
          return (
            <li
              key={t.slug}
              className="border-b-2 border-ink/15"
            >
              {available ? (
                <Link
                  href={`/screen/${t.slug}`}
                  className="group grid grid-cols-[1fr_auto] gap-4 items-baseline py-7 sm:py-8 hover:px-2 transition-all"
                >
                  <div>
                    <h2
                      className="font-mincho text-[1.35rem] sm:text-[1.65rem] text-ink leading-[1.45] tracking-[-0.005em] group-hover:text-gold transition-colors"
                      style={{ fontWeight: 700 }}
                    >
                      {label}
                    </h2>
                    <p
                      className="mt-2 text-[12px] tracking-[0.22em] uppercase text-sub-gray"
                      style={{ fontWeight: 600 }}
                    >
                      3 min · 5 questions
                    </p>
                  </div>
                  <span
                    aria-hidden
                    className="text-sub-gray group-hover:text-gold group-hover:translate-x-1 transition-all text-2xl"
                  >
                    →
                  </span>
                </Link>
              ) : (
                <div className="grid grid-cols-[1fr_auto] gap-4 items-baseline py-7 sm:py-8 opacity-60">
                  <div>
                    <h2
                      className="font-mincho text-[1.35rem] sm:text-[1.65rem] text-ink leading-[1.45] tracking-[-0.005em]"
                      style={{ fontWeight: 700 }}
                    >
                      {label}
                    </h2>
                    <p
                      className="mt-2 text-[12px] tracking-[0.22em] uppercase text-sub-gray"
                      style={{ fontWeight: 600 }}
                    >
                      Coming soon
                    </p>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <p className="mt-10 text-[11px] text-sub-gray leading-[2]">
        ※ 本診断は当事者の自己観察を助ける編集ツールであり、医療行為・診断・受診勧奨を
        行うものではありません。個別の判断は医療機関にご相談ください。
      </p>
    </div>
  );
}
