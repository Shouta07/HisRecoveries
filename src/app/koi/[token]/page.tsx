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

export default function KoiPage({ params }: { params: { token: string } }) {
  /* 鍵の形が違うものは、ここで終わり。
     形だけ見る。行があるかは見ない（まだ1件も話していない人は、
     行が無いのが正しい状態なので）。 */
  if (!isTalkerToken(params.token)) notFound();

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
        {!koiEnabled ? (
          <>
            <h1 className="text-[22px] font-black leading-[1.5]">
              いま、恋亀とは話せません。
            </h1>
            <p className="mt-4 text-[14.5px] leading-[1.9] text-steel">
              声でつなぐ準備が終わっていません。整い次第、ここから話せるようになります。
            </p>
            <div className="mt-8 flex flex-col gap-3">
              <Link
                href="/trial"
                className="flex min-h-[54px] items-center justify-center rounded-pill bg-brand px-6 text-[15.5px] font-bold text-paper shadow-card"
              >
                体験を申し込む
              </Link>
              <Link
                href="/"
                className="flex min-h-[48px] items-center justify-center text-[13.5px] font-bold text-steel"
              >
                トップに戻る
              </Link>
            </div>
            {/* 足りないものは、ここに置かない。
                一度 data-why に入れたが、公開の面なので誰でも読める。
                中身ではなく変数名だけとはいえ、置く意味が無い。

                何が足りないかは /admin/setup が出すし、
                /api/koi/session がサーバー側のログに残す。 */}
          </>
        ) : (
          <>
            <h1 className="text-huge font-black leading-[1.35]">
              思っていることを、
              <br className="sm:hidden" />
              そのまま。
            </h1>
            <p className="mt-5 text-[15.5px] leading-[1.95] text-steel">
              うまくまとまっていなくて大丈夫です。話した内容から、相手ごとの記録が残ります。
              入力する欄はありません。
            </p>

            <div className="mt-8">
              <VoiceRoom talker={params.token} />
            </div>

            <ul className="mt-8 flex flex-col gap-2 text-[12.5px] leading-[1.8] text-steel">
              <li>・1回は {MAX_MINUTES_PER_CALL} 分までです。時間が来ると、こちらで終わります。</li>
              <li>・月に話せるのは {VOICE_MINUTES_PER_MONTH} 分までです。</li>
              <li>
                ・電話番号・アカウント名・勤務先・学校・駅名は、話に出ても伏せ字にしてから扱います。
              </li>
              <li>
                ・恋亀は、相手がどう思っているかを当てません。そこは実在の人に聞きます。
              </li>
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
          </>
        )}
      </div>
    </div>
  );
}
