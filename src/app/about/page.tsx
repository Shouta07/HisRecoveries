import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "His Recoveries は、半歩先から後ろを歩く人に静かに記録を残すメディアです。発信者 Nagi について。",
  alternates: { canonical: `${site.url}/about` },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-reading px-6 pb-24 pt-20 sm:pt-28">
      <header className="mb-16">
        <p className="text-xs tracking-widest text-sub-gray">ABOUT</p>
        <h1 className="mt-3 font-mincho text-3xl sm:text-4xl text-ink leading-relaxed">
          このメディアについて
        </h1>
      </header>

      <div className="font-mincho text-[1.0625rem] leading-[2.1] text-ink space-y-6">
        <p>
          His Recoveries は、いくつかのコンプレックスを抱えていた頃の経験と、
          それを超えてきた後の観察を、半歩先から記録するメディアです。
        </p>

        <p>
          扱うのは、男性の身体と自意識に関わる、けれど言葉にされにくい領域。
          多汗症、ニキビ、ワキガ、そして顔の自信のなさ。
          いずれも、当事者にとっては日常を静かに侵食する種類の悩みでした。
        </p>

        <p>
          このサイトの目的は、解決策を売ることでも、励ますことでもありません。
          後ろから歩いてくる人が、自分よりほんの少し先を歩いた人の記録を読むこと。
          それだけで距離が縮まる、という経験を残したい。
        </p>

        <h2 className="mt-16 font-mincho text-xl text-ink">扱う4つの領域</h2>
        <ul className="space-y-3 pl-0">
          <li>
            <span className="text-sub-gray text-sm tracking-wider">01</span>
            <span className="ml-3">多汗症</span>
          </li>
          <li>
            <span className="text-sub-gray text-sm tracking-wider">02</span>
            <span className="ml-3">ニキビ・ニキビ跡</span>
          </li>
          <li>
            <span className="text-sub-gray text-sm tracking-wider">03</span>
            <span className="ml-3">ワキガ（腋臭症）</span>
          </li>
          <li>
            <span className="text-sub-gray text-sm tracking-wider">04</span>
            <span className="ml-3">顔の自信のなさ</span>
          </li>
        </ul>

        <h2 className="mt-16 font-mincho text-xl text-ink">書き手について</h2>
        <p>
          ペンネームは <span className="text-ink">Nagi</span>。
          顔も実年齢も公開していません。
          かつて当事者だった、というだけが書き手の資格です。
        </p>

        <p>
          半歩先から、後ろから来る人へ。
          観察を主張に優先し、当事者の沈黙を尊重して書きます。
        </p>

        <h2 className="mt-16 font-mincho text-xl text-ink">編集の原則</h2>
        <ol className="space-y-3 list-none pl-0 text-[1rem]">
          <li>1. 叫ばない。整える。</li>
          <li>2. 観察を主張に優先する。</li>
          <li>3. 当事者の沈黙を尊重する。</li>
          <li>4. リアクションを煽らない。</li>
          <li>5. 万人に届くことを期待しない。</li>
          <li>6. 教える前に、書き残す。</li>
          <li>7. 半歩だけ先を歩く。</li>
        </ol>

        <h2 className="mt-16 font-mincho text-xl text-ink">連絡</h2>
        <p>
          ご連絡は{" "}
          <a
            href={`mailto:${site.email}`}
            className="border-b border-hair-line hover:border-ink transition-colors"
          >
            {site.email}
          </a>{" "}
          まで。
        </p>
      </div>
    </div>
  );
}
