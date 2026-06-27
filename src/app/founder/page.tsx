import type { Metadata } from "next";
import Link from "next/link";
import FounderTimeline from "@/components/FounderTimeline";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Founder's Note — なぜ始めたか",
  description:
    "His Recoveries は、ある夜の検索体験から始まりました。多汗症、ワキガ、ニキビ跡、顔の自意識 — 男性のための回復ブランドを立ち上げた理由について。",
  alternates: { canonical: `${site.url}/founder` },
  openGraph: {
    title: `Founder's Note — ${site.name}`,
    description:
      "なぜ His Recoveries を始めたか。男性のための回復ブランドの origin。",
  },
};

export default function FounderPage() {
  return (
    <article className="mx-auto max-w-reading px-6 pt-16 sm:pt-24 pb-24">
      <header className="mb-16">
        <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold">
          Founder&apos;s Note
        </p>
        <h1 className="mt-5 font-mincho text-3xl sm:text-5xl text-ink leading-[1.4]">
          なぜ、始めたか。
        </h1>
        <p className="mt-7 font-mincho text-sub-gray text-[0.9375rem] leading-[2] max-w-[34rem]">
          His Recoveries の運営者から、最初の読者へ。
        </p>
      </header>

      <div className="font-mincho text-[1.0625rem] leading-[2.2] text-ink space-y-7">
        <p>
          His Recoveries は、ある夜の検索体験から始まりました。
        </p>

        <p>
          20 代のある夜、運営者は、自分の身体について何度も検索しました。
          多汗症、ワキガ、ニキビ跡、顔の自意識。
          画面に映ったのは、二種類の声でした。
        </p>

        <p className="pl-5 border-l-2 border-hair-line text-ink/85">
          「最短で治す」と煽る商業の声。
          <br />
          「気にしすぎ」と片付ける周囲の声。
        </p>

        <p>
          そのあいだに、半歩先を歩いた誰かの記録が、ありませんでした。
        </p>

        <div className="pt-10 mt-4">
          <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold mb-6">
            I. なかったから、自分で作り始めた
          </p>
          <p>
            当事者を装わず、治療を誇らず、ただ通過した時間を低い声で残しておく場所。
            誰かの解決策ではなく、自分の整え方を見つけるための地形図。
            医療と商業の射程の外側にある、男性の自意識についての言葉。
          </p>
          <p className="mt-6">なかったから、自分で作り始めました。</p>
        </div>

        <div className="pt-10 mt-4">
          <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold mb-6">
            II. 解決策を売らない理由
          </p>
          <p>
            解決策を売る場所は、もう十分にあります。
            クリニックも、コスメも、メンズ脱毛も、優れたサービスが既にあります。
          </p>
          <p className="mt-6">
            His Recoveries が立つのは、解決策の手前と、その後ろです。
            受けるかどうかを迷う数ヶ月、受けたあとに残る感覚。
            それは医療では「治癒」と書かれない領域です。
            そこに、ブランドが必要だ、と判断しました。
          </p>
        </div>

        <div className="pt-10 mt-4">
          <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold mb-6">
            III. 顔も実名も出さない理由
          </p>
          <p>
            ブランドの寿命が、運営者個人の人生より長く続いてほしいからです。
            実名や顔で運営すると、ブランドの価値が個人の評判と結びつき、運営者が辞めれば終わります。
          </p>
          <p className="mt-6">
            His Recoveries は、書き手が交代しても続けられる「型」として設計しています。
            運営者の経験は資格ですが、運営者の名前は資格ではありません。
          </p>
        </div>

        <div className="pt-10 mt-4">
          <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold mb-6">
            IV. 何を作りたいか
          </p>
          <p>
            His Recoveries は、男性のための「回復ブランド」です。
          </p>
          <ul className="mt-6 space-y-2 text-[15px] text-ink/85 leading-[1.95]">
            <li>— 治癒ではなく、回復。</li>
            <li>— 強さではなく、整い。</li>
            <li>— 変化ではなく、戻り方。</li>
          </ul>
          <p className="mt-7">
            記録、整える道具、静かな集まり、Letters。
            そのすべては、男性が「強く」ではなく「整って」生きるための、
            地形図と、道具と、場所です。
          </p>
        </div>

        <div className="pt-12 mt-6 border-t border-hair-line/60">
          <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold mb-6">
            V. 通過した時間
          </p>
          <p className="mb-10 text-[14px] text-ink/80 leading-[2]">
            ブランドを始める前に通過した、十数年の輪郭です。
          </p>
          <FounderTimeline />
          <p className="mt-10 text-[12px] tracking-[0.06em] text-sub-gray leading-[1.95]">
            この三幕の全体像は{" "}
            <Link
              href="/recoveries"
              className="border-b border-gold hover:text-gold transition-colors"
            >
              Three Recoveries
            </Link>
            に。
          </p>
        </div>

        <div className="pt-12 mt-6 border-t border-hair-line/60">
          <p className="logo-type italic tracking-[0.2em] text-base text-gold">
            Recover Your Presence —
          </p>
          <p className="mt-4 font-mincho text-lg text-ink leading-[1.8]">
            これは、私たちから、あなたへの、
            <br />
            最初の合図です。
          </p>
          <div className="mt-10 flex items-center gap-4">
            <span aria-hidden className="block w-12 h-px bg-gold" />
            <span className="logo-type tracking-[0.2em] text-sm text-ink">
              {site.name}
            </span>
          </div>
        </div>

        <div className="mt-16 pt-10 border-t border-hair-line text-sm">
          <p className="text-sub-gray text-[13px] leading-[2] mb-6">
            この note を読んでくれた人は、ここから次の一歩を選んでください。
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <Link
              href="/apply"
              className="text-ink border-b border-gold pb-0.5 hover:text-gold transition-colors"
            >
              Recovery Assessment を受ける
            </Link>
            <Link
              href="/articles"
              className="text-ink border-b border-gold pb-0.5 hover:text-gold transition-colors"
            >
              Presence Journal を読む
            </Link>
            <Link
              href="/events"
              className="text-ink border-b border-gold pb-0.5 hover:text-gold transition-colors"
            >
              Quiet Gatherings を見る
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
