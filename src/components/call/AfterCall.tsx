"use client";

import { useState } from "react";
import Link from "next/link";
import { track } from "@/lib/analytics";

// 話して終わりにしない。
//
// ══════════════════════════════════════════════════
// 相手を採点させない
// ══════════════════════════════════════════════════
// 聞くのは「役に立ったか」だけ。人柄の点数は付けさせない。
// 採点される仕事にすると、答える側が言いにくいことを言わなくなる。
// この製品が売っているのは、言いにくいことのほう。
//
// ══════════════════════════════════════════════════
// 最後に、次を1つだけ
// ══════════════════════════════════════════════════
// 商品の一覧は出さない。いまの場面の次に来るものだけを出す。

const SCORES = [1, 2, 3, 4, 5];

export default function AfterCall({
  token,
  responder,
}: {
  token: string;
  responder?: string;
}) {
  const [rating, setRating] = useState<number | null>(null);
  const [again, setAgain] = useState<boolean | null>(null);
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const isResponder = Boolean(responder);

  async function send() {
    if (busy) return;
    setBusy(true);
    try {
      await fetch(`/api/call/${token}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isResponder ? { responder, note } : { rating, again, note },
        ),
      });
      track("call_rated", { rating: rating ?? 0 });
      setSent(true);
    } catch {
      // 出せなくても、画面は次へ進める。ここで止めても誰も得しない
      setSent(true);
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div>
        <h2 className="text-big font-black text-slate">ありがとうございました。</h2>
        {!isResponder && (
          <>
            <p className="mt-4 text-[14.5px] leading-[1.9] text-steel">
              聞いたことをもとに、あとは自分で決めてください。
              決めたことが動かなかったときは、また来てください。
            </p>

            {/* 次は1つだけ。一覧は出さない */}
            <div className="mt-7 rounded-card border border-line bg-paper p-5 shadow-card">
              <p className="text-[12px] font-bold text-steel">この次に来ることが多いもの</p>
              <p className="mt-1.5 text-[15.5px] font-black leading-[1.5] text-slate">
                送る前の文面を、女性3人に読んでもらう
              </p>
              <p className="mt-2 text-[13px] leading-[1.8] text-steel">
                話して決めた言い方が、実際にどう受け取られるか。
                声で聞いたのと同じ側の人が、文字で読みます。
              </p>
              <Link
                href="/ask?plan=review&from=call"
                className="mt-4 inline-flex min-h-[50px] w-full items-center justify-center rounded-pill bg-brand px-6 text-[15px] font-bold text-paper shadow-card"
              >
                文面を確かめる <span aria-hidden className="ml-1.5">→</span>
              </Link>
            </div>
          </>
        )}
        {isResponder && (
          <p className="mt-4 text-[14.5px] leading-[1.9] text-steel">
            記録しました。次の依頼は、自分の画面から見られます。
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-big font-black text-slate">
        {isResponder ? "ひとこと残してください" : "どうでしたか"}
      </h2>

      {!isResponder && (
        <>
          <div className="mt-6">
            <p className="text-[12.5px] font-bold text-steel">役に立ちましたか</p>
            <div className="mt-2.5 flex gap-2">
              {SCORES.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  aria-pressed={rating === n}
                  className={`flex h-12 flex-1 items-center justify-center rounded-card border text-[16px] font-black tabular-nums ${
                    rating === n
                      ? "border-brand bg-brand text-paper"
                      : "border-line bg-paper text-slate"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="mt-2 flex justify-between text-[11.5px] text-steel">
              <span>役に立たなかった</span>
              <span>役に立った</span>
            </p>
          </div>

          <div className="mt-7">
            <p className="text-[12.5px] font-bold text-steel">またこの人に聞きたいですか</p>
            <div className="mt-2.5 flex gap-2">
              {[
                { v: true, l: "また聞きたい" },
                { v: false, l: "今回はこれで" },
              ].map((x) => (
                <button
                  key={x.l}
                  type="button"
                  onClick={() => setAgain(x.v)}
                  aria-pressed={again === x.v}
                  className={`min-h-[48px] flex-1 rounded-pill border text-[13.5px] font-bold ${
                    again === x.v
                      ? "border-brand bg-brand-tint text-brand-deep"
                      : "border-line bg-paper text-steel"
                  }`}
                >
                  {x.l}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="mt-7">
        <label
          htmlFor="call-note"
          className="block text-[12.5px] font-bold text-steel"
        >
          {isResponder ? "次の一手として伝えたこと" : "次にやること"}
        </label>
        <textarea
          id="call-note"
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 400))}
          rows={4}
          placeholder={
            isResponder
              ? "伝えたことを短く。相手の名前や連絡先は書かないでください。"
              : "話して決めたことを、自分の言葉で。"
          }
          className="mt-2 w-full rounded-card border border-line bg-paper px-4 py-3 text-[14px] leading-[1.8] text-slate placeholder:text-steel"
        />
        <p className="mt-1.5 text-[11.5px] text-steel">
          相手の実名・連絡先・SNSは書かないでください。保存しません。
        </p>
      </div>

      <button
        type="button"
        onClick={send}
        disabled={busy}
        className="mt-7 inline-flex min-h-[54px] w-full items-center justify-center rounded-pill bg-brand px-6 text-[15.5px] font-bold text-paper shadow-card disabled:bg-mist disabled:text-steel"
      >
        {busy ? "送っています…" : "出す"}
      </button>
    </div>
  );
}
