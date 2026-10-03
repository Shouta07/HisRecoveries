import type { Metadata } from "next";
import Link from "next/link";
import { NAME } from "@/lib/voice";
import { site } from "@/lib/site";
import { notFound } from "next/navigation";
import { koiEnabled } from "@/lib/koi/gate";
import { isTalkerToken } from "@/lib/ask/token";
import { MAX_MINUTES_PER_CALL } from "@/lib/koi/session";
import { VOICE_MINUTES_PER_MONTH } from "@/lib/pass/entitle";
import VoiceRoom from "@/components/koi/VoiceRoom";
import PasteTalk from "@/components/koi/PasteTalk";
import { handoffPrompt } from "@/lib/koi/handoff";
import PersonBoard from "@/components/koi/PersonBoard";
import { peopleOf } from "@/lib/koi/store";
import { toBoard } from "@/lib/koi/board";

// 恋亀と話す画面。
//
// ══════════════════════════════════════════════════
// 設定は実行時に読む
// ══════════════════════════════════════════════════
// 鍵（REALTIME_API_KEY）が入ったら、作り直さずに開く。
// ビルド時に固定すると、鍵を入れても画面が変わらない。
//
// ══════════════════════════════════════════════════
// 開いていないのに、入口を出さない
// ══════════════════════════════════════════════════
// 鍵が無いときは、話せないことを先に言う。
// 押してから「つなげません」と出すのは、いちばん悪い。
//
// ══════════════════════════════════════════════════
// 検索から来てほしい面ではない
// ══════════════════════════════════════════════════
// 話している最中の画面なので、検索結果には出さない。

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "恋亀と話す — タシカメ" },
  description: "思っていることを、そのまま話す。話した内容から、相手ごとの記録が残ります。",
  alternates: { canonical: `${site.url}/koi` },
  robots: { index: false, follow: true },
};

export default async function KoiPage({ params }: { params: { token: string } }) {
  /* 鍵の形が違うものは、ここで終わり。
     形だけ見る。行があるかは見ない（まだ1件も話していない人は、
     行が無いのが正しい状態なので）。 */
  if (!isTalkerToken(params.token)) notFound();

  /* ══════════════════════════════════════════════
     開いて最初に出すのは、会話ではなく一覧
     ══════════════════════════════════════════════
     困っているのは「恋愛相談がしたい」ではない。
       withのAさん、昨日何話したっけ
       PairsのBさん、電話いつするんやっけ
     アプリが複数、相手が複数。そのたびに判断が増える。

     だから、ここを開いたときにまず分かるのは
     「誰と、どこまで、次に何を」であること。 */
  const board = toBoard(await peopleOf(params.token));

  return (
    <div data-brand className="min-h-screen bg-paper text-slate">
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex w-full max-w-[720px] items-center justify-between gap-4 px-5 py-3.5 sm:px-10">
          <Link href="/" className="truncate text-[16px] font-black">
            {NAME}
          </Link>
          <span className="shrink-0 text-[12px] font-bold text-steel">恋亀と話す</span>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[720px] px-5 pb-24 pt-10 sm:px-10">
        <h1 className="text-huge font-black leading-[1.35]">
          いま、どうなってる。
        </h1>
        <p className="mt-5 text-[15.5px] leading-[1.95] text-steel">
          誰と、どこまで進んでいて、次に何をするか。
          話すたびに、ここが更新されます。
        </p>

        {/* いま誰がいて、次に何をすることになっているか。
            1人もいなければ出さない（空の枠を見せない）。 */}
        {board.length > 0 && (
          <div className="mt-8">
            <PersonBoard cards={board} />
          </div>
        )}

        {/* ══════════════════════════════════════════
            会話は ChatGPT、記録はこちら
            ══════════════════════════════════════════
            声を自前でつなぐと、1人あたり月 ¥400 の原価が乗る。
            相談する人の多くは、もう ChatGPT を使っている。

            こちらの取り分は「会話」ではなく「残ること」なので、
            会話は向こうに任せる。
            これで、鍵が1本も無くても今日から動く。 */}
        <div className="mt-8">
          <PasteTalk talker={params.token} prompt={handoffPrompt()} />
        </div>

        {/* 声でつなぐ道は、鍵が入っているときだけ。
            貼る手間が無いぶん軽いが、原価が乗る。
            入っていないあいだは、上の道だけが出る。 */}
        {koiEnabled && (
          <div className="mt-10 border-t border-line pt-8">
            <p className="text-[12.5px] font-bold text-steel">このまま声で話す</p>
            <p className="mt-1.5 text-[13px] leading-[1.8] text-steel">
              貼らずに、ここで直接話せます。1回 {MAX_MINUTES_PER_CALL} 分、月 {VOICE_MINUTES_PER_MONTH} 分まで。
            </p>
            <div className="mt-4">
              <VoiceRoom talker={params.token} />
            </div>
          </div>
        )}

        <ul className="mt-8 flex flex-col gap-2 text-[12.5px] leading-[1.8] text-steel">
          <li>
            ・電話番号・アカウント名・勤務先・学校・駅名は、こちらに届く前に伏せ字にします。
          </li>
          <li>
            ・恋亀は、相手がどう思っているかを当てません。そこは実在の異性に聞きます。
          </li>
          <li>・話していないことは、記録に入りません。</li>
        </ul>

        {/* ── このリンクが、戻る道 ────────────────────
            会員登録が無いので、このURLを知っていることが本人の証拠。
            失うと、それまでの記録に戻れない。
            下に出しておく（端末を変えるときに持っていける）。 */}
        <div className="mt-8 rounded-soft border border-line bg-mist px-4 py-3.5">
          <p className="text-[12px] font-bold text-steel">このページのリンク</p>
          <p className="mt-1.5 break-all text-[12px] leading-[1.7] text-slate">
            {`/koi/${params.token}`}
          </p>
          <p className="mt-2 text-[12px] leading-[1.8] text-steel">
            次に来たときは、ここから続きに戻れます。
            控えはこの端末の中にだけ置くので、端末を変えるときはこのリンクを持っていってください。
          </p>
        </div>
      </div>
    </div>
  );
}
