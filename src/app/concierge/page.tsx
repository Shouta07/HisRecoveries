import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Recovery Concierge — 静かな対話、ひとりに 1 回",
  description:
    "Recovery Concierge は、His Recoveries が提供する 1 対 1 のプライベート対話。多汗症、ワキガ、ニキビ跡、AGA、ヒゲ脱毛、顔の自意識について、グループの集まりではなく個人的に整える時間。90 分・¥25,000・オンライン or 東京都内。",
  alternates: { canonical: `${site.url}/concierge` },
  openGraph: {
    title: `Recovery Concierge — ${site.name}`,
    description:
      "静かな対話、ひとりに 1 回。1 対 1 で整える時間を、ご一緒します。",
  },
};

export default function ConciergePage() {
  return (
    <div className="mx-auto max-w-[1100px] px-6 sm:px-10 pt-16 sm:pt-24 pb-24">
      <header className="text-center mb-16 sm:mb-20">
        <p className="logo-type italic text-[11px] sm:text-xs tracking-[0.4em] uppercase text-gold">
          Recovery Concierge
        </p>
        <h1 className="mt-6 font-mincho text-3xl sm:text-5xl lg:text-6xl text-ink leading-[1.35]">
          静かな対話、
          <br />
          ひとりに 1 回。
        </h1>
        <p className="mt-10 font-mincho text-[15px] sm:text-base text-ink/80 leading-[2.05] max-w-[34rem] mx-auto">
          1 対 1 で、整える時間を、ご一緒します。
          <br />
          グループの集まりよりも、もう少し個人的なご相談を希望される方のための、
          <br className="hidden sm:inline" />
          プライベートの 90 分です。
        </p>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-12 lg:gap-20 mb-20">
        <div>
          <p className="logo-type italic text-[10px] tracking-[0.4em] uppercase text-gold mb-5">
            For Whom
          </p>
          <h2 className="font-mincho text-2xl font-medium leading-[1.55] text-ink mb-6">
            こんな方のための時間
          </h2>
          <ul className="space-y-4 text-[15px] leading-[2] text-ink/80">
            <li>
              <span className="text-gold mr-2">—</span>
              グループの場ではなく、個人の状況を話したい方
            </li>
            <li>
              <span className="text-gold mr-2">—</span>
              整えるか、整えないかを迷っている方
            </li>
            <li>
              <span className="text-gold mr-2">—</span>
              過去に選んだ整え方を整理し直したい方
            </li>
            <li>
              <span className="text-gold mr-2">—</span>
              His Recoveries の記録が、自分に近いと感じた方
            </li>
            <li>
              <span className="text-gold mr-2">—</span>
              医療機関の前に、もう一段の整理が必要だと感じる方
            </li>
          </ul>
        </div>

        <div>
          <p className="logo-type italic text-[10px] tracking-[0.4em] uppercase text-gold mb-5">
            What We Do Not Do
          </p>
          <h2 className="font-mincho text-2xl font-medium leading-[1.55] text-ink mb-6">
            私たちが行わないこと
          </h2>
          <ul className="space-y-4 text-[15px] leading-[2] text-sub-gray">
            <li>
              <span className="text-sub-gray mr-2">—</span>
              医療診断・処方
            </li>
            <li>
              <span className="text-sub-gray mr-2">—</span>
              施術の斡旋・営業
            </li>
            <li>
              <span className="text-sub-gray mr-2">—</span>
              特定のクリニックへの誘導
            </li>
            <li>
              <span className="text-sub-gray mr-2">—</span>
              「これで解決」という断言
            </li>
            <li>
              <span className="text-sub-gray mr-2">—</span>
              録音・第三者への共有
            </li>
          </ul>
        </div>
      </section>

      <section className="border-y border-hair-line py-16 sm:py-20 mb-20">
        <p className="logo-type italic text-[10px] tracking-[0.4em] uppercase text-gold text-center mb-10">
          The Session
        </p>
        <ol className="max-w-[640px] mx-auto space-y-10">
          <SessionStep
            num="01"
            title="お問い合わせ"
            body="メール（contact@vitality-design.jp）から、お名前（匿名可）と概要をお送りください。返信に 24–72 時間いただきます。"
          />
          <SessionStep
            num="02"
            title="日程・形式の調整"
            body="オンライン（Zoom 等）か、都内対面（カフェ・ホテルラウンジ）か、ご希望に応じて。"
          />
          <SessionStep
            num="03"
            title="90 分のセッション"
            body="整えの全体像、選択肢の整理、過去の経験の振り返り。話す内容は、その日のあなたに合わせて。"
          />
          <SessionStep
            num="04"
            title="アフター・サマリー"
            body="セッション後 1 週間以内に、その日の整理を文章でお届けします。"
          />
        </ol>
      </section>

      <section className="text-center mb-12">
        <p className="logo-type italic text-[10px] tracking-[0.4em] uppercase text-gold mb-5">
          Investment
        </p>
        <p className="font-mincho text-3xl sm:text-4xl text-ink leading-[1.4]">
          ¥25,000
        </p>
        <p className="mt-3 text-[13px] text-sub-gray tracking-[0.08em]">
          90 分・税込・オンライン または 都内対面
        </p>
        <p className="mt-2 text-[12px] text-sub-gray">
          ※ 対面の場合、都内交通費を含みます
        </p>

        <div className="mt-12 flex justify-center">
          <a
            href={`mailto:${site.email}?subject=Recovery%20Concierge%20%E3%81%AE%E5%95%8F%E3%81%84%E5%90%88%E3%82%8F%E3%81%9B`}
            className="btn-gold"
          >
            メールで問い合わせる
            <span aria-hidden>→</span>
          </a>
        </div>
      </section>

      <section className="bg-paper border border-hair-line p-6 sm:p-8 max-w-[680px] mx-auto">
        <p className="text-[12px] text-sub-gray leading-[2]">
          ※ Recovery Concierge は医療行為ではありません。診断・処方が必要な場合は、医療機関の受診をご検討ください。
          <br />
          ※ 効果には個人差があります。本サービスは、整理と対話を通じた回復の補助であり、特定の結果を保証するものではありません。
        </p>
      </section>
    </div>
  );
}

function SessionStep({
  num,
  title,
  body,
}: {
  num: string;
  title: string;
  body: string;
}) {
  return (
    <li className="grid grid-cols-[4rem_1fr] sm:grid-cols-[5rem_1fr] gap-6 items-baseline">
      <span className="logo-type italic text-sm tracking-[0.2em] text-gold">
        {num}
      </span>
      <div>
        <h3 className="font-mincho text-xl sm:text-2xl font-medium leading-[1.45] text-ink">
          {title}
        </h3>
        <p className="mt-3 text-[15px] leading-[2] text-ink/80">{body}</p>
      </div>
    </li>
  );
}
