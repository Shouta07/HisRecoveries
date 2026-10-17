import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { site } from "@/lib/site";
import { NAME, CITIES } from "@/lib/voice";
import { codeOf, offsetLabel } from "@/lib/trip/cities";
import { notesOf, notYetLine } from "@/lib/trip/notes";
import { LEG_LABEL } from "@/lib/trip/log";
import { advisorRule, FRESH_DAYS } from "@/lib/who";
import Mark from "@/components/brand/Mark";

/* ══════════════════════════════════════════════════
   行った人が残したこと
   ══════════════════════════════════════════════════
   ── こちらは1行も書かない ──────────────────────
   「各国の情報を発信する」はやらない。
   やると、この製品がいちばん否定している側に回る
   （古いブログ、慣れた人のSNS）。

   出すのは、実際に行った人が残した文だけ。
   こちらが書いた文を1行でも混ぜると、どれが実感で
   どれが編集なのか、読む人には分からなくなる。

   ── だから、空のときは空のまま出す ──────────────
   まだ誰も残していない都市は、そう書く。
   埋めるために、こちらで書かない。

   ── 検索に出す ──────────────────────────────────
   「バンコク 一人旅 空港から」で来た人に、
   90日以内の1次情報が出る。古いブログより新しい。
   ここが、作らない情報発信のかわりになる。 */

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return CITIES.map((city) => ({ city: encodeURIComponent(city) }));
}

function cityOf(raw: string): string | null {
  const c = decodeURIComponent(raw);
  return (CITIES as readonly string[]).includes(c) ? c : null;
}

export function generateMetadata({ params }: { params: { city: string } }): Metadata {
  const city = cityOf(params.city);
  if (!city) return { title: { absolute: NAME } };
  const title = `${city} 一人旅｜行った人が残したこと — ${NAME}`;
  return {
    title: { absolute: title },
    description: `${city}へ一人で行った人が、帰ってきてから残した記録です。${FRESH_DAYS}日以内のものだけを出しています。こちらでは書いていません。`,
    keywords: [`${city} 一人旅`, `${city} 一人旅 初めて`, `${city} 空港から`, `${city} 行った人`],
    alternates: { canonical: `${site.url}/cities/${encodeURIComponent(city)}` },
    openGraph: {
      type: "website",
      locale: site.locale,
      url: `${site.url}/cities/${encodeURIComponent(city)}`,
      siteName: NAME,
      title,
      description: `${city}へ一人で行った人が、帰ってきてから残した記録です。`,
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: title }],
    },
  };
}

export default async function CityPage({ params }: { params: { city: string } }) {
  const city = cityOf(params.city);
  if (!city) notFound();

  const notes = await notesOf(city);
  if (!notes) notFound();
  const code = codeOf(city);
  const offset = offsetLabel(city);

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
        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          <h1 className="text-huge font-black text-slate">{city}</h1>
          {code && (
            <span className="rounded-[3px] border border-line px-1.5 py-[1px] text-[11px] font-black tracking-[0.14em] text-steel">
              {code}
            </span>
          )}
          {offset && <span className="text-[12px] font-bold text-steel">{offset}</span>}
        </div>

        <p className="mt-4 text-[15px] font-bold leading-[1.9] text-slate">
          行った人が残したこと
        </p>
        <p className="mt-2 text-[13.5px] leading-[1.95] text-steel">
          {advisorRule()}
          こちらでは書いていません。残っているのは、実際に行った人の文だけです。
        </p>

        {notes.shown ? (
          <>
            <p className="mt-7 text-[12.5px] font-bold tabular-nums text-steel">
              {FRESH_DAYS}日以内 {notes.total}件
            </p>
            <div className="mt-3 flex flex-col gap-6">
              {notes.groups.map((g) => (
                <section key={g.leg}>
                  <h2 className="text-[11.5px] font-black tracking-[0.08em] text-steel">
                    {LEG_LABEL[g.leg]}
                  </h2>
                  <ul className="mt-2.5 flex flex-col gap-2">
                    {g.items.map((n) => (
                      <li
                        key={n.id}
                        className="rounded-card border border-line bg-paper px-4 py-3.5 shadow-card"
                      >
                        <p className="text-[14px] leading-[1.8] text-slate">{n.text}</p>
                        {/* 誰が言ったかは持たない。いつの旅かだけ */}
                        <p className="mt-1.5 text-[11px] tabular-nums text-steel">
                          帰国から{n.daysAgo}日
                        </p>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </>
        ) : (
          /* 埋めるために、こちらで書かない。空は空のまま出す */
          <p className="mt-7 rounded-soft bg-mist px-4 py-4 text-[13.5px] leading-[1.9] text-steel">
            {notYetLine(notes)}
          </p>
        )}

        <div className="mt-10 rounded-card bg-mist p-5">
          <p className="text-[14.5px] font-black leading-[1.7] text-slate">
            {city}へ行くなら。
          </p>
          <p className="mt-2 text-[13px] leading-[1.9] text-steel">
            AIに話した内容を貼るだけで、どこへ／何が終わって／次に何するか、が残ります。
          </p>
          <Link
            href="/plans"
            className="mt-4 inline-flex min-h-[50px] items-center justify-center rounded-pill bg-brand px-6 text-[14.5px] font-bold text-paper shadow-card"
          >
            無料で始める <span aria-hidden className="ml-1.5">&rarr;</span>
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {CITIES.filter((c) => c !== city).map((c) => (
            <Link
              key={c}
              href={`/cities/${encodeURIComponent(c)}`}
              className="rounded-pill border border-line bg-paper px-3.5 py-2 text-[13px] font-bold text-slate"
            >
              {c}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
