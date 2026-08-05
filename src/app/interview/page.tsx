import type { Metadata } from "next";
import Link from "next/link";
import InterviewForm from "@/components/InterviewForm";
import { WILL_PUBLISH, WONT_PUBLISH, CONSENT_POINTS, QUESTIONS } from "@/lib/interview";
import { site, ogImage } from "@/lib/site";

// 取材にご協力いただくページ。
//
// ── 順番 ────────────────────────────────────
// 何を聞くか → 何に使うか → 載せるもの → 載せないもの →
// 取り消し方 → 同意 → フォーム
//
// 同意を最後のチェックボックスだけにしない。
// 健康・身体のことを聞く（＝要配慮個人情報）ので、
// 何が起きるかを全部読んでからチェックできる並びにする。
//
// ── 書かないこと ──────────────────────────────
// 「あなたの声が誰かを救います」の類は書かない。
// 協力の見返りを情緒で払う書き方になる。
// こちらが何に使うかだけを、事実として書く。

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

const url = `${site.url}/interview`;
const TITLE = "取材にご協力いただけませんか";
const DESC =
  "His Recoveries は、順番を書き換えるための取材を始めています。匿名で、書き言葉で、答えられるものだけ。お名前も連絡先もいただきません。載せるもの・載せないもの・取り消し方を先に書いています。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: url },
  openGraph: {
    type: "website",
    url,
    siteName: site.name,
    locale: site.locale,
    title: TITLE,
    description: "匿名・書き言葉・答えられるものだけ。載せないものを先に書いています。",
    images: [ogImage],
  },
};

function List({ items, mark }: { items: string[]; mark: "on" | "off" }) {
  return (
    <ul className="mt-5 border-t border-shironezu">
      {items.map((x) => (
        <li
          key={x}
          className="flex gap-3 border-b border-shironezu py-3.5 text-[15px] leading-[1.9] text-keshizumi"
        >
          <span
            aria-hidden
            className={`mt-[0.7em] h-px w-3.5 shrink-0 ${mark === "on" ? "bg-asagi" : "bg-ainezu"}`}
          />
          <span>{x}</span>
        </li>
      ))}
    </ul>
  );
}

export default function InterviewPage() {
  return (
    <main className="bg-shironeri">
      <div className="mx-auto max-w-reading px-5 pb-24 pt-12 sm:px-8 sm:pt-16">
        <nav aria-label="パンくず" className="text-[12.5px] text-ainezu">
          <Link href="/" className="transition-colors hover:text-asagi">
            ホーム
          </Link>
        </nav>

        <header className="mt-7">
          <h1 className="text-[26px] leading-[1.5] sm:text-[34px]" style={{ ...MINCHO, fontWeight: 700 }}>
            取材にご協力いただけませんか
          </h1>
          <p className="mt-5 text-[16px] leading-[2.05] text-keshizumi">
            このサイトが出している順番は、公開されている情報と編集部の判断で組んだ暫定版です。
            <span className="font-bold text-sumi">取材はまだ0本です。</span>
            ここを埋めないかぎり、順番は机の上のままになります。
          </p>
          <p className="mt-4 text-[16px] leading-[2.05] text-keshizumi">
            お名前も連絡先もいただきません。書き言葉で、答えられるものだけで構いません。
            {QUESTIONS.length}問ありますが、必須は1問だけです。
          </p>
        </header>

        {/* 何に使うか */}
        <section className="mt-14">
          <h2 className="text-[19px] sm:text-[21px]" style={{ ...MINCHO, fontWeight: 700 }}>
            何に使うか
          </h2>
          <p className="mt-4 text-[15.5px] leading-[2.05] text-keshizumi">
            記事と、サイトが出している順番を見直すために使います。それ以外には使いません。
            商品を売るための材料にも、提携先に渡す材料にもしません。
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-[19px] sm:text-[21px]" style={{ ...MINCHO, fontWeight: 700 }}>
            載せるもの
          </h2>
          <List items={WILL_PUBLISH} mark="on" />
        </section>

        <section className="mt-14">
          <h2 className="text-[19px] sm:text-[21px]" style={{ ...MINCHO, fontWeight: 700 }}>
            載せないもの
          </h2>
          <p className="mt-4 text-[15.5px] leading-[2.05] text-keshizumi">
            こちらのほうが大事だと思うので、先に書いておきます。
          </p>
          <List items={WONT_PUBLISH} mark="off" />
        </section>

        {/* 同意の中身 */}
        <section className="mt-14">
          <h2 className="text-[19px] sm:text-[21px]" style={{ ...MINCHO, fontWeight: 700 }}>
            同意していただくこと
          </h2>
          <ul className="mt-5 space-y-2.5 text-[15px] leading-[1.95] text-keshizumi">
            {CONSENT_POINTS.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <p className="mt-5 text-[14.5px] leading-[1.95] text-ainezu">
            個人情報の扱い全般は
            <Link
              href="/privacy"
              className="mx-1 font-bold text-asagi underline decoration-asagi/40 underline-offset-[4px] transition-colors hover:decoration-asagi"
            >
              プライバシーポリシー
            </Link>
            に書いています。
          </p>
        </section>

        {/* 取り消し */}
        <section className="mt-14 border-l-2 border-asagi pl-5 sm:pl-6">
          <h2 className="text-[17px] sm:text-[18px]" style={{ ...MINCHO, fontWeight: 700 }}>
            あとから取り消せます
          </h2>
          <p className="mt-3 text-[15px] leading-[1.95] text-keshizumi">
            送信すると受付番号が出ます。控えておいていただければ、
            <span className="font-bold text-sumi">その番号だけで取り消せます。</span>
            お名前を名乗る必要はありません。理由も聞きません。
            公開したあとでも、消します。
          </p>
          <p className="mt-3 text-[14.5px] leading-[1.95] text-ainezu">
            連絡先は
            <a
              href={`mailto:${site.email}`}
              className="mx-1 font-bold text-asagi underline decoration-asagi/40 underline-offset-[4px] hover:decoration-asagi"
            >
              {site.email}
            </a>
            です。
          </p>
        </section>

        {/* フォーム */}
        <section className="mt-16 border-t border-shironezu pt-10">
          <h2 className="text-[19px] sm:text-[21px]" style={{ ...MINCHO, fontWeight: 700 }}>
            聞かせてください
          </h2>
          <p className="mt-4 text-[15px] leading-[1.95] text-keshizumi">
            答えられるものだけで構いません。空欄のままでも送れます。
          </p>
          <InterviewForm />
        </section>

        <p className="mt-14 text-[13px] leading-[1.95] text-ainezu">
          ※ ここは相談の窓口ではありません。個別のお返事はできません。
          相談をご希望の場合は
          <Link
            href="/apply"
            className="mx-1 font-bold text-asagi underline decoration-asagi/40 underline-offset-[4px] hover:decoration-asagi"
          >
            こちら
          </Link>
          へお願いします。体調について不安がある場合は、順番に関係なく医療機関にご相談ください。
        </p>
      </div>
    </main>
  );
}
