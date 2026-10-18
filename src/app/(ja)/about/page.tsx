import type { Metadata } from "next";
import Link from "next/link";
import Mark from "@/components/brand/Mark";
import { site } from "@/lib/site";
import { NAME, FULL, DEFINITION } from "@/lib/voice";
import { BEEN, BEEN_NOTE, STANCE } from "@/lib/been";
import { NOT_INCLUDED, REPLY_LINE, WINDOW_LINE, MEET_LINE } from "@/lib/service";
import { profileFilled } from "@/lib/operator";

/* ══════════════════════════════════════════════════
   このサービスについて
   ══════════════════════════════════════════════════

   ── 前は、別の事業の説明だった ──────────────────
   商品を入れ替えたあとも、この面だけ記事事業の編集方針が
   そのまま残っていた（髪・肌・パートナーのこと）。

   しかも本文から /plans へ2回リンクしていた。
   その面はもう無い。押した人は、どちらも404に落ちていた。
   色も前の青のままで、トップから来ると別のサイトに見えた。

   ── 畳まずに、書き替えた ────────────────────────
   前の面が持っていた仕事は「聞いていないことは、聞いていないと書く」
   だった。取材0本で信頼を主張できる根拠が、書き方しか無かったから。

   商品が変わっても、その仕事は残る。向きだけ変える。

     前  聞いていないことは、聞いていないと書く
     後  確認できていないことは、確認できていないと書く

   有料の相談で、答えるのは運営者ひとり。
   読む人がいちばん知りたいのは「この人は誰で、何を知らないのか」。
   それを1枚にまとめるのが、この面の仕事。

   ── 持ちものから引く ────────────────────────────
   国の一覧・名乗り・含まないもの・期間・返信は、
   been.ts と service.ts が持つ。ここでは書き写さない。
   書き写すと、片方を直した日にここだけ古いまま残る。 */

export const metadata: Metadata = {
  title: { absolute: `答える人について — ${NAME}` },
  description:
    "誰が答えるのか。何が確認できていて、何が確認できていないのか。確認できていないことは、確認できていないと書きます。",
  alternates: { canonical: `${site.url}/about` },
};

/** 確認が取れていないこと。ここに書いたものは、画面のどこにも書かない */
const UNCONFIRMED = [
  "どの都市へ行ったか",
  "いつ行ったか",
  "何回行ったか",
  "一人で行ったかどうか",
  "旅行や語学の資格",
  "現地の言葉をどれだけ話せるか",
];

export default function AboutPage() {
  return (
    <div data-brand className="min-h-screen bg-paper pb-20 text-slate sm:pb-0">
      <header className="border-b border-line">
        <div className="mx-auto flex w-full max-w-[760px] items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Mark size={28} />
            <span className="whitespace-nowrap text-[16px] font-black">{NAME}</span>
          </Link>
          <Link href="/terms" className="text-[13px] text-steel transition-colors hover:text-slate">
            利用規約
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[760px] px-5 pb-20 pt-10 sm:px-8 sm:pt-14">
        <h1 className="text-big font-black">答える人について</h1>

        <p className="mt-7 max-w-[34em] text-[15px] leading-[1.95] text-steel sm:text-[16px]">
          {DEFINITION}
        </p>

        {/* ══════════════════════════════════════════
            運営者が埋めるところ
            ══════════════════════════════════════════
            呼び名・旅のスタイル・始めた理由。

            知名度が無い状態で、読む人がいちばん知りたいのはここ。
            それでも、こちらでは書けない。聞いていないから。

            埋まったものだけが出る（lib/operator.ts）。
            いまは3つとも空なので、この節ごと出ない。 */}
        {profileFilled().length > 0 && (
          <section className="mt-12 flex flex-col gap-7">
            {profileFilled().map((f) => (
              <div key={f.key}>
                <h2 className="text-[17px] font-black sm:text-[19px]">{f.label}</h2>
                <p className="mt-3 max-w-[34em] whitespace-pre-line text-[15px] leading-[1.95] text-steel">
                  {f.text}
                </p>
              </div>
            ))}
          </section>
        )}

        {/* ── 答えるのは誰か ───────────────────────────
            ここを曖昧にしたまま値段を付けない。
            誰が答えるのか分からないものに、人はお金を払えない。 */}
        <section className="mt-14">
          <h2 className="text-[19px] font-black sm:text-[21px]">答えるのは、ひとりです</h2>
          <p className="mt-4 max-w-[34em] text-[15px] leading-[1.95] text-steel">
            {FULL}の相談には、運営者が自分でお返事します。{STANCE}
          </p>
          <p className="mt-3 max-w-[34em] text-[15px] leading-[1.95] text-steel">
            ひとりで受けています。そのため{WINDOW_LINE}という期間を決めていて、
            {REPLY_LINE}。出発前のオンライン相談は、{MEET_LINE}。
          </p>
        </section>

        {/* ── 事実として言えること ─────────────────────
            言えるのは、国・地域に行ったことがある、まで。
            一覧は been.ts が持つ（15で固定。増やすと公開前に止まる）。 */}
        <section className="mt-14">
          <h2 className="text-[19px] font-black sm:text-[21px]">行ったことがある国・地域</h2>
          <ul className="mt-5 flex flex-wrap gap-2">
            {BEEN.map((b) => (
              <li
                key={b}
                className="rounded-full border border-line bg-mist px-3.5 py-1.5 text-[14px] font-bold"
              >
                {b}
              </li>
            ))}
          </ul>
          <p className="mt-5 max-w-[34em] text-[14px] leading-[1.95] text-steel">{BEEN_NOTE}</p>
        </section>

        {/* ── 確認できていないこと ─────────────────────
            この面の芯。
            書いていないことは、読む人が勝手に埋める。
            埋められる前に、こちらから言う。 */}
        <section className="mt-14">
          <h2 className="text-[19px] font-black sm:text-[21px]">
            確認できていないことは、確認できていないと書きます
          </h2>
          <p className="mt-4 max-w-[34em] text-[15px] leading-[1.95] text-steel">
            上の一覧について、はっきり言えるのは「行ったことがある」ところまでです。
            次のことは、まだ確認が取れていません。だから、どこにも書いていません。
          </p>
          <ul className="mt-5 max-w-[34em] space-y-2.5 border-l-2 border-line pl-5 text-[15px] leading-[1.9] text-steel">
            {UNCONFIRMED.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
          <p className="mt-5 max-w-[34em] text-[15px] leading-[1.95] text-steel">
            「各国の全域に詳しい」「最新の事情に精通している」とも言いません。
            行ったことと、詳しいことは別だからです。
          </p>
        </section>

        {/* ── 引き受けないこと ─────────────────────────
            料金の面にも同じものが出る。両方とも service.ts から引く。
            ここに無いと、/about から入った人だけが知らずに買う。 */}
        <section className="mt-14">
          <h2 className="text-[19px] font-black sm:text-[21px]">引き受けないこと</h2>
          <ul className="mt-5 max-w-[34em] space-y-2.5 text-[15px] leading-[1.9] text-steel">
            {NOT_INCLUDED.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
          <p className="mt-5 max-w-[34em] text-[15px] leading-[1.95] text-steel">
            現地で助けが必要なときは、警察・救急・大使館や領事館、
            ご契約の保険会社にご連絡ください。
          </p>
        </section>

        <section className="mt-14 border-t border-line pt-10">
          <h2 className="text-[19px] font-black sm:text-[21px]">運営</h2>
          <p className="mt-4 max-w-[34em] text-[15px] leading-[1.95] text-steel">
            {site.company.name}（{site.company.nameEn}）が運営しています。
            お問い合わせ・記載の誤りのご指摘は
            <a
              href={`mailto:${site.company.email}`}
              className="mx-1 font-bold text-brand underline decoration-brand/40 underline-offset-[4px] hover:decoration-brand"
            >
              {site.company.email}
            </a>
            までお願いします。
          </p>
          <p className="mt-5 text-[14px] leading-[1.95] text-steel">
            <Link
              href="/terms"
              className="font-bold text-brand underline decoration-brand/40 underline-offset-[4px] hover:decoration-brand"
            >
              利用規約
            </Link>
            <span className="mx-2 text-line">／</span>
            <Link
              href="/legal"
              className="font-bold text-brand underline decoration-brand/40 underline-offset-[4px] hover:decoration-brand"
            >
              特定商取引法に基づく表記
            </Link>
            <span className="mx-2 text-line">／</span>
            <Link
              href="/privacy"
              className="font-bold text-brand underline decoration-brand/40 underline-offset-[4px] hover:decoration-brand"
            >
              プライバシーポリシー
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
