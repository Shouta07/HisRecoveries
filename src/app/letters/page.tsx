import type { Metadata } from "next";
import Link from "next/link";
import TrackedCTA from "@/components/TrackedCTA";
import {
  MAX_PER_MONTH,
  WILL_SEND,
  WONT_SEND,
  QUIET_RULE,
} from "@/lib/letters";
import { site } from "@/lib/site";

// お便りについて。
//
// ── 何を訴求するか ──────────────────────────────
// 「登録すると得をします」で押すと、公式アカウントの通知と同じ場所に立つ。
// あそこは中身の勝負ではなく、頻度と煽りの勝負になっていて、
// 登録する側はそれを知っているから、そもそも登録しない。
//
// だから売りにするのは、中身の豪華さではなく静かさのほうにした。
// ただし「うるさくしません」は言うだけならタダなので、
// 上限の数、止める条件、止め方を、先に数字で書く。
//
// ── 構成 ────────────────────────────────────
// 送るもの（3つ・少ない）→ 送らないもの（5つ・こちらが本体）→
// こちらから止める規則 → いまの状態 → 登録
//
// 「送らないもの」を「送るもの」より長くしてあるのは、
// この順番と分量そのものが、いちばん伝えたいことだから。
//
// 組みはサイト共通（白練の地・明朝の見出し・罫線・カードなし）。

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

const url = `${site.url}/letters`;
const SUBSCRIBE = `${site.social.substack}/subscribe`;

export const metadata: Metadata = {
  title: "お便りについて",
  description: `His Recoveries のお便りは、多くて月${MAX_PER_MONTH}回です。セールも、流行の話も、既読の催促も送りません。開かれない状態が続いたら、こちらから止めます。登録は無料です。`,
  alternates: { canonical: url },
  openGraph: {
    type: "website",
    url,
    siteName: site.name,
    locale: site.locale,
    title: "お便りについて",
    description: `多くて月${MAX_PER_MONTH}回。セールも流行も送りません。開かれなければ、こちらから止めます。`,
  },
};

function Row({ t, d, mark }: { t: string; d: string; mark: "will" | "wont" }) {
  return (
    <div className="border-b border-shironezu py-5">
      <dt className="flex items-baseline gap-3 text-[15.5px] leading-[1.7] sm:text-[16.5px]">
        <span
          aria-hidden
          className={`mt-[0.55em] h-px w-3.5 shrink-0 ${mark === "will" ? "bg-asagi" : "bg-ainezu"}`}
        />
        <span style={{ ...MINCHO, fontWeight: 700 }}>{t}</span>
      </dt>
      <dd className="mt-2 pl-[26px] text-[14.5px] leading-[1.95] text-keshizumi">{d}</dd>
    </div>
  );
}

export default function LettersPage() {
  return (
    <main className="bg-shironeri">
      <div className="mx-auto max-w-reading px-5 pb-24 pt-12 sm:px-8 sm:pt-16">
        <nav aria-label="パンくず" className="text-[12.5px] text-ainezu">
          <Link href="/" className="transition-colors hover:text-asagi">
            ホーム
          </Link>
        </nav>

        <header className="mt-7">
          <h1
            className="text-[26px] leading-[1.5] sm:text-[34px]"
            style={{ ...MINCHO, fontWeight: 700 }}
          >
            お便りについて
          </h1>
          <p className="mt-5 text-[15.5px] leading-[2.05] text-keshizumi">
            登録すると、順番が変わったときにお知らせが届きます。無料です。
          </p>
          <p className="mt-4 text-[15.5px] leading-[2.05] text-keshizumi">
            ただ、先に書いておきたいことがあります。
            登録すると通知が増えることのほうが、たいていの人にとっては困ることだと思っています。
            なので<span className="font-bold text-sumi">送る回数の上限と、こちらから止める条件</span>
            を先に決めました。下に全部書いてあります。
          </p>
        </header>

        {/* 送るもの。少ない */}
        <section className="mt-14">
          <h2 className="text-[19px] sm:text-[21px]" style={{ ...MINCHO, fontWeight: 700 }}>
            送るもの
          </h2>
          <dl className="mt-6 border-t border-shironezu">
            {WILL_SEND.map((x) => (
              <Row key={x.t} t={x.t} d={x.d} mark="will" />
            ))}
          </dl>
        </section>

        {/* 送らないもの。ここが本体なので、上より長い */}
        <section className="mt-16">
          <h2 className="text-[19px] sm:text-[21px]" style={{ ...MINCHO, fontWeight: 700 }}>
            送らないもの
          </h2>
          <p className="mt-4 text-[15px] leading-[2] text-keshizumi">
            こちらのほうが、たぶん大事です。
          </p>
          <dl className="mt-6 border-t border-shironezu">
            {WONT_SEND.map((x) => (
              <Row key={x.t} t={x.t} d={x.d} mark="wont" />
            ))}
          </dl>
        </section>

        {/* 止める規則 */}
        <section className="mt-16">
          <h2 className="text-[19px] sm:text-[21px]" style={{ ...MINCHO, fontWeight: 700 }}>
            {QUIET_RULE.t}
          </h2>
          <p className="mt-4 text-[15.5px] leading-[2.1] text-keshizumi">{QUIET_RULE.d}</p>
          <p className="mt-4 text-[15.5px] leading-[2.1] text-keshizumi">
            読まれていないのに送り続けると、増えるのは開封ではなくブロックです。
            それはこちらにとっても損なので、
            <span className="font-bold text-sumi">追いかけないことを規則にしています。</span>
            この回数は、送る側の判定にも同じ数字を使っています。表示だけ変えることはできません。
          </p>
          <p className="mt-4 text-[15.5px] leading-[2.1] text-keshizumi">
            もちろん、ご自分で解除することもできます。どのお便りの下にも解除の場所があります。
            理由を聞くことも、引き止めることもしません。
          </p>
        </section>

        {/* いまの状態。良く見せない */}
        <section className="mt-16 border-l-2 border-ainezu/40 pl-5 sm:pl-6">
          <h2 className="text-[16px] sm:text-[17px]" style={{ ...MINCHO, fontWeight: 700 }}>
            いまの状態
          </h2>
          <ul className="mt-4 space-y-2.5 text-[14.5px] leading-[1.95] text-keshizumi">
            <li>専門家への取材記事は、まだ0本です。取材の回は、これから出します。</li>
            <li>
              いまお送りできるのはメールだけです。LINEはまだ用意していません。
              用意できたときも、ここに書いてある約束は変えません。
            </li>
            <li>
              送った号は
              <Link
                href="/updates"
                className="mx-1 font-bold text-asagi underline decoration-asagi/40 underline-offset-[4px] transition-colors hover:decoration-asagi"
              >
                更新記録
              </Link>
              と同じ内容です。登録しなくても、そちらで全部読めます。
            </li>
          </ul>
        </section>

        {/* 登録 */}
        <section className="mt-16 border-t border-shironezu pt-10">
          <h2 className="text-[19px] sm:text-[21px]" style={{ ...MINCHO, fontWeight: 700 }}>
            登録する
          </h2>
          <p className="mt-4 text-[15.5px] leading-[2.05] text-keshizumi">
            メールアドレスだけで登録できます。費用はかかりません。
          </p>
          <p className="mt-6">
            <TrackedCTA
              href={SUBSCRIBE}
              event="subscribe_click"
              eventProps={{ location: "letters" }}
              className="inline-block border border-asagi bg-asagi px-6 py-3 text-[15px] font-bold text-shironeri transition-colors hover:bg-transparent hover:text-asagi"
            >
              お便りを受け取る
            </TrackedCTA>
          </p>
          <p className="mt-5 text-[13px] leading-[1.95] text-ainezu">
            配信には Substack を使っています。メールアドレスの取り扱いは
            <Link
              href="/privacy"
              className="mx-1 font-bold text-asagi underline decoration-asagi/40 underline-offset-[4px] transition-colors hover:decoration-asagi"
            >
              プライバシーポリシー
            </Link>
            に書いています。
          </p>
        </section>
      </div>
    </main>
  );
}
