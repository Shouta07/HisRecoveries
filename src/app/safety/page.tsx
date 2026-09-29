import type { Metadata } from "next";
import { NAME, OPERATOR } from "@/lib/voice";
import Link from "next/link";
import { site } from "@/lib/site";
import { PLANS } from "@/lib/ask/plans";
import { canCharge, whyCannotCharge } from "@/lib/legal";
import { Eyebrow, Hairline } from "@/components/brand/kit";
import Yen from "@/components/brand/Yen";

// 安全と、いまの制約。
//
// ── トップから降ろしたものの行き先 ────────────────
// 運営の事情、答えてくれる女性が少ない理由、画像を受け付けていない技術的な理由、
// 免責の細かいところ。これらはトップに置くと、
// 製品が何なのかを理解する前に言い訳を読ませることになる。
//
// ただし消さない。相手の顔が見えない以上、
// 「何をしないか」「いま何ができないか」は、
// 探せば必ず出てくる場所に置いておく必要がある。
//
// ── 規約ページのように重くしない ──────────────────
// 読ませるために書く。条文を並べない。

export const metadata: Metadata = {
  // 記事側のテンプレート（%s — His Recoveries）を使わない。
  // プロダクトの名乗りはタシカメなので、ここで完結させる。
  title: { absolute: "安全と、いまできないこと — タシカメ" },
  description:
    "匿名の扱い、扱わない相談、個人情報の伏せ方、料金、いまの制約。タシカメが何をして、何をしないか。",
  alternates: { canonical: `${site.url}/safety` },
};

function Section({ title, en, children }: { title: string; en: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line pt-10">
      <Eyebrow>{en}</Eyebrow>
      <h2 className="mt-5 text-big font-black text-slate">{title}</h2>
      <div className="mt-6 flex max-w-[34em] flex-col gap-5 text-[15.5px] leading-[1.95] text-steel">
        {children}
      </div>
    </section>
  );
}

export default function SafetyPage() {
  return (
    <div data-brand className="min-h-screen bg-paper pb-28 text-slate sm:pb-0">
      <header className="border-b border-line">
        <div className="mx-auto flex w-full max-w-[900px] items-center justify-between gap-4 px-6 py-4 sm:px-10">
          <Link href="/" className="text-[14px] font-black">
            His Recoveries
          </Link>
          <Link
            href="/ask"
            className="inline-flex min-h-[42px] shrink-0 items-center whitespace-nowrap rounded-pill bg-brand px-5 text-[13.5px] font-bold text-paper shadow-card transition-shadow hover:shadow-card-hover"
          >
            人に聞く
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[900px] px-6 pb-24 pt-12 sm:px-10 sm:pt-16">
        <Eyebrow>匿名でつかえます</Eyebrow>
        <h1 className="mt-6 max-w-[16em] text-huge font-black text-slate">
          何をして、
          <br />
          何をしないか。
        </h1>
        <p className="mt-8 max-w-[32em] text-[16px] leading-[1.95] text-steel sm:text-[17px]">
          見ず知らずの人どうしが、相手を特定できないまま言葉をやりとりする場所です。
          安全の話を後ろに回さないために、ここにまとめています。
        </p>

        <div className="mt-16 flex flex-col gap-14">
          <Section en="匿名について" title="匿名について">
            <p>
              相談した人の名前も連絡先も、答えてくれる女性には渡りません。
              答えてくれる女性の名前も連絡先も、相談した人には渡りません。
              どちらにも、相手へ直接連絡する方法を作っていません。
            </p>
            <p>
              相談した人に見えるのは、答えてくれる女性の年代・地域・立場・得意な話題だけです。
              答えてくれる女性に見えるのは、相談の内容と、相談した人が選んだ年代・関係だけです。
            </p>
          </Section>

          <Section en="個人情報の伏せ方" title="個人情報の伏せ方">
            <p>
              送信の前に、電話番号・メールアドレス・LINE ID・SNSのアカウント名・
              リンク・郵便番号・番地までの住所を見つけて伏せます。
              伏せたものは保存しません。原文はこちらのデータベースに入りません。
            </p>
            <p>
              人名は機械では見分けられません。「佐藤」も「ゆうき」も普通の語なので、
              機械的に消すと文が読めなくなり、残せば漏れます。
              だから人名は消さず、書いている途中で確認をお願いしています。
              消すかどうかは本人が決めることです。
            </p>
          </Section>

          <Section en="扱わない相談" title="扱わない相談">
            <ul className="flex list-disc flex-col gap-2.5 pl-5">
              <li>同意のない撮影・行為に関するもの</li>
              <li>相手の判断力を奪う方法に関するもの</li>
              <li>特定・晒し・身元調べにつながるもの</li>
              <li>相手が断っていることを続ける前提のもの</li>
              <li>対価を伴う性的関係に関するもの</li>
              <li>18歳未満に関するもの</li>
              <li>監視・追跡に関するもの</li>
            </ul>
            <p>
              これらは投稿の時点で止まります。運用の心がけではなく、送信できません。
              止まったときは、理由を画面に出します。
            </p>
          </Section>

          <Section en="画像について" title="画像を受け付けていない理由">
            <p>
              画像の中に写り込んだ顔と文字は、こちらでは確実に消せません。
              消せないまま配ると、晒されるのは相談した本人ではなく、写っている第三者になります。
            </p>
            <p>
              その人はこのサービスを使うと決めた覚えがありません。
              安全に扱える形が整うまで、画像の受け付けは止めています。
              受け入れ側の仕組み（人が見てから配る）だけ先に用意してあります。
            </p>
          </Section>

          <Section en="答えてくれる女性について" title="答えてくれる女性について">
            <p>
              答えてくれる女性は、こちらが確認した人だけです。登録しただけでは相談は届きません。
              年齢とプロフィールを確かめた方に「確認済み」の印を付けています。
            </p>
            <p>
              条件に合う人が集まらなかった場合は、集まらなかった分をご返金します。
              先に人数を売っておいて、集まらないまま待たせることはしません。
            </p>
            <p>
              回答の質は、回答数・役に立ったと言われた割合・回答までの時間・通報の有無で
              記録しています。順位を公開して競わせることはしません。目的は質を保つことです。
            </p>
          </Section>

          <Section en="料金" title="料金">
            {canCharge() ? (
              <p>下記の料金でご利用いただけます。1件ごとのお支払いです。</p>
            ) : (
              <p>
                <strong className="font-bold text-slate">いまお支払いは受け付けていません。</strong>
                {whyCannotCharge()}。
                揃うまで、決済を開始できないようにしてあります。
              </p>
            )}
            <dl className="divide-y divide-line border-y border-line">
              {PLANS.map((p) => (
                <div key={p.id} className="flex items-baseline justify-between gap-4 py-3">
                  <dt className="text-[15px] text-slate">
                    {p.name}
                    {!p.available && <span className="ml-2 text-[12px] text-steel">受付前</span>}
                  </dt>
                  <dd className="text-[15px] font-bold tabular-nums text-slate">
                    <Yen yen={p.yen} />
                    {p.from && "〜"}
                  </dd>
                </div>
              ))}
            </dl>
            <p>
              月額はありません。入会金もありません。必要なときだけ、1件ごとにお支払いいただきます。
              募集を始める前であればキャンセルできます。詳しくは{" "}
              <Link href="/legal" className="underline decoration-line underline-offset-4 hover:text-slate">
                特定商取引法に基づく表記
              </Link>{" "}
              に書いています。
            </p>
            <p>
              答えてくれる女性への謝礼は、1件ごとにお渡ししています。
              金額と方法は、登録後に個別にご相談しています。
              決まっていないものを、決まったように書かないことにしています。
            </p>
          </Section>

          <Section en="記録の扱い" title="記録の扱い">
            <p>
              相談の内容は、回答を届けるためと、サービスを直すためにだけ使います。
              第三者に提供しません。広告の配信には使いません。
            </p>
            <p>
              答えてくれる女性の連絡先は、お願いするためだけに使います。
              相談した人に渡す仕組みを作っていません。
            </p>
            <p>
              扱いの全般は{" "}
              <Link href="/privacy" className="underline decoration-line underline-offset-4 hover:text-slate">
                プライバシー・免責事項
              </Link>{" "}
              に書いています。
            </p>
          </Section>

          <Section en="できないこと" title="できないこと">
            <p>
              集まるのは、その人たちがそう感じた、ということだけです。
              そのとおりにすれば思いどおりになる、という話ではありません。
              相手の気持ちを当てる場所でもありません。
            </p>
            <p>
              医療・法律・金銭に関わる判断の代わりにはなりません。
              体調について不安がある場合は、医療機関にご相談ください。
            </p>
          </Section>
        </div>

        <div className="mt-20">
          <Hairline />
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/ask"
              className="inline-flex min-h-[56px] items-center justify-center rounded-pill bg-brand px-9 text-[15.5px] font-bold text-paper shadow-card transition-shadow hover:shadow-card-hover"
            >
              人に相談する
            </Link>
            <Link
              href="/join"
              className="inline-flex min-h-[56px] items-center justify-center rounded-pill border border-line bg-paper px-9 text-[15.5px] font-bold shadow-card transition-shadow hover:shadow-card-hover"
            >
              答えてくれる女性について
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-[900px] flex-col gap-3 px-6 py-10 sm:flex-row sm:items-baseline sm:justify-between sm:px-10">
          <Link href="/" className="text-[15px] font-black">
            His Recoveries
          </Link>
          <p className="text-[11.5px] text-steel">
            © 2026 {OPERATOR}
          </p>
        </div>
      </footer>
    </div>
  );
}
