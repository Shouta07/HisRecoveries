"use client";

import { useCallback, useEffect, useState } from "react";
import { FREE_PEOPLE, FREE_RECORDS } from "@/lib/pass/free";
import Link from "next/link";
import { NAME } from "@/lib/voice";
import KoiFace from "@/components/koi/KoiFace";

/* ══════════════════════════════════════════════════
   恋亀の入口
   ══════════════════════════════════════════════════

   ── 鍵が、本人の証拠 ────────────────────────────
   このサービスに会員登録は無い。
   話す人の鍵（t...）を知っていることが、本人の証拠になる。

   恋亀は、相手が何人いても、何か月でも同じ人と話し続ける。
   鍵が変わると、それまでの記録に戻れなくなる。

   だから、
     一度もらった鍵は、この端末に控える
     次に来たときは、その鍵のまま続きへ行く
     鍵は画面にも出す（端末を変えるときに持っていける）

   ── 端末の中だけだと、はっきり書く ──────────────
   控えは localStorage。別の端末では出ない。消したら戻らない。
   そこを曖昧にすると、あとで「消えた」と言われる。
   /mine と同じ言い方にそろえる。 */

const KEY = "tashikame.koi.talker";

function saved(): string | null {
  try {
    const v = localStorage.getItem(KEY);
    return v && /^t[a-z2-9]{32}$/.test(v) ? v : null;
  } catch {
    // 端末の設定で使えないことがある。使えなくても動く形にする
    return null;
  }
}

export default function KoiEntry() {
  const [token, setToken] = useState<string | null>(null);
  const [state, setState] = useState<"reading" | "ready" | "making" | "error">("reading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setToken(saved());
    setState("ready");
  }, []);

  const start = useCallback(async () => {
    setState("making");
    setError(null);
    try {
      const r = await fetch("/api/koi/start", { method: "POST" });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.talker) {
        setError(j.error ?? "いま始められません。");
        setState("error");
        return;
      }
      try {
        localStorage.setItem(KEY, j.talker);
      } catch {
        // 控えが取れなくても、このままなら話せる。
        // 次に来たときに戻れないことは、下に書いてある。
      }
      window.location.href = `/koi/${j.talker}`;
    } catch {
      setError("いま始められません。少し時間をおいてお試しください。");
      setState("error");
    }
  }, []);

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

      <div className="mx-auto w-full max-w-[560px] px-5 pb-24 pt-14 sm:px-10">
        <div className="flex justify-center">
          <KoiFace size={88} />
        </div>

        {/* ══════════════════════════════════════════
            ここは、トップから来た人が最初に着く場所
            ══════════════════════════════════════════
            前は「思っていることを、そのまま。」だけだった。
            既にこの製品を知っている人向けの言い方で、
            トップで「無料で始める」を押して来た人には、
            これから何が起きるのかが分からない。

            何をするか、何が返ってくるか、何分かかるかを先に書く。

            ── 「1人ぶん」をやめた ──────────────────
            無料の形を「1回だけ」から「2人・10記録まで」に変えた。
            ここだけ古い言い方（1人ぶん整理する）が残っていて、
            トップと食い違っていた。

            1人だと「並ぶ」が体験できない。
            この製品の良さは、貯まって並んでから出る。 */}
        <h1 className="mt-6 text-center text-huge font-black leading-[1.35]">
          気になっている人を、
          <br />
          まとめはじめる。
        </h1>

        <p className="mt-5 text-center text-[15px] leading-[1.95] text-steel">
          登録はありません。いまから5分くらいです。
          <br />
          {FREE_PEOPLE}人・{FREE_RECORDS}記録まで無料です。
        </p>

        {/* これから何が起きるかを、3つだけ。
            多いと読まれない。少ないと身構える。 */}
        <ol className="mt-7 flex flex-col gap-2.5">
          {[
            ["1", "恋亀の文をコピーして、ChatGPT に貼る", "次のページでボタン1つです"],
            ["2", "気になっている人のことを、普通に話す", "まとまっていなくて大丈夫です"],
            ["3", "会話をここに貼り戻す", "1枚に整理されて返ってきます"],
          ].map(([n, head, sub]) => (
            <li key={n} className="flex items-start gap-3 rounded-soft bg-mist px-4 py-3.5">
              <span
                aria-hidden
                className="mt-[1px] flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-[11px] font-black text-paper"
              >
                {n}
              </span>
              <span className="min-w-0">
                <span className="block text-[14px] font-bold leading-[1.6] text-slate">{head}</span>
                <span className="mt-0.5 block text-[12px] leading-[1.7] text-steel">{sub}</span>
              </span>
            </li>
          ))}
        </ol>

        <p className="mt-6 text-center text-[13px] leading-[1.9] text-steel">
          返ってくるのは、いまどこまで進んでいて、
          <br className="hidden sm:block" />
          次に何をするかの1枚です。
        </p>

        {state === "ready" && token ? (
          <>
            <Link
              href={`/koi/${token}`}
              className="mt-10 flex min-h-[56px] items-center justify-center rounded-pill bg-brand px-6 text-[16px] font-bold text-paper shadow-card"
            >
              続きから話す <span aria-hidden className="ml-2">&rarr;</span>
            </Link>
            <p className="mt-3 text-center text-[12.5px] leading-[1.8] text-steel">
              前に話した続きから始まります。
            </p>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={start}
              disabled={state === "making" || state === "reading"}
              className="mt-10 flex min-h-[56px] w-full items-center justify-center rounded-pill bg-brand px-6 text-[16px] font-bold text-paper shadow-card disabled:bg-line disabled:text-steel disabled:shadow-none"
            >
              {state === "making" ? "…" : "はじめる"}
            </button>
            <p className="mt-3 text-center text-[12.5px] leading-[1.8] text-steel">
              押すとすぐ始まります。お金はかかりません。
            </p>
          </>
        )}

        {error && (
          <p className="mt-5 rounded-soft border border-line bg-mist px-4 py-3 text-[13.5px] leading-[1.8] text-slate">
            {error}
          </p>
        )}

        {/* 控えの性質を、曖昧にしない */}
        <p className="mt-12 rounded-soft border border-line bg-mist px-4 py-3.5 text-[12px] leading-[1.85] text-steel">
          会員登録はありません。話した記録は、始めたときに出るリンクで開きます。
          リンクの控えはこの端末の中にだけ置くので、別の端末では出ません。
          端末を変えるときは、そのリンクを持っていってください。
        </p>
      </div>
    </div>
  );
}
