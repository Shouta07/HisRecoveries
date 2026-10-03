import { DEMO_TALK, DEMO_EP, DEMO_ASK } from "@/lib/koi/demo";
import KoiFace from "@/components/koi/KoiFace";

/* 恋亀との会話を、そのまま見せる。
 *
 * ── 説明より先に ────────────────────────────────
 * 「話すだけで整理されます」と書いても伝わらない。
 * やりとりを見せて、そのあとに、できたものを出す。
 *
 * ══════════════════════════════════════════════════
 * 1往復ずつ出すのをやめた
 * ══════════════════════════════════════════════════
 * 前は IntersectionObserver で見え始めたのを拾って、
 * 900ms ごとに1往復ずつ出していた。
 * 「話が進んでいることが伝わる」つもりだった。
 *
 * 実測すると、全部出るまで 6.3 秒かかっていた。
 * その間ここは空の箱で、下のEPまで含めて何も見えない。
 * スクロールして最初に目に入るのが、空白になっていた。
 *
 * 看板で見せたいのは「話すだけで、ここまで残る」で、
 * 会話が進む様子ではない。最初から全部出す。
 *
 * 動きを消したので、client である必要も無くなった。
 * 配る JavaScript も、そのぶん減る。
 */

export default function TalkDemo() {
  return (
    <div className="flex flex-col gap-3">
      {/* やりとり */}
      <ul className="flex flex-col gap-2.5 rounded-card bg-sky px-3 py-4 sm:px-4">
        {DEMO_TALK.map((t, i) => (
          <li
            key={t.say}
            className={`flex ${t.who === "me" ? "justify-end" : "justify-start"}`}
          >
            <div className="flex max-w-[86%] items-end gap-2">
              {t.who === "koi" && <KoiFace size={34} delay={i * 0.4} className="-mb-1" />}
              <p
                className={`rounded-card px-3.5 py-2.5 text-[13.5px] leading-[1.75] ${
                  t.who === "me"
                    ? "rounded-br-[4px] bg-brand font-bold text-paper"
                    : "rounded-bl-[4px] bg-paper text-slate shadow-card"
                }`}
              >
                {t.say}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {/* 話した結果できたもの。入力していないのに埋まっている、が見せたいこと */}
      <div className="rounded-card border border-line bg-paper p-4 shadow-card">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[15px] font-black text-slate">
            {DEMO_EP.person}
            <span className="ml-2 text-[11.5px] font-bold text-steel">{DEMO_EP.app}</span>
          </p>
          <p className="text-[11.5px] font-black text-brand">EP.0{DEMO_EP.number}</p>
        </div>
        <p className="mt-0.5 text-[12.5px] font-bold text-steel">{DEMO_EP.title}</p>

        <ul className="mt-3 flex flex-col gap-2">
          {DEMO_EP.rows.map((r) => (
            <li key={r.label} className="flex items-start gap-2 text-[12.5px] leading-[1.7]">
              <span aria-hidden className="shrink-0">
                {r.mark}
              </span>
              <span className="min-w-0">
                <span className="font-bold text-slate">{r.label}</span>
                <span className="text-steel">　{r.body}</span>
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-3 flex items-start gap-2 border-t border-line pt-3">
          <span aria-hidden className="shrink-0 text-[13px]">
            🎯
          </span>
          <p className="min-w-0 text-[13.5px] font-bold leading-[1.6] text-slate">
            <span className="text-steel">NEXT</span>
            <br />
            {DEMO_EP.next}
          </p>
        </div>
      </div>

      {/* 人に聞ける、が最後に来る。押し売りにしない */}
      <div className="flex items-start gap-2">
        <KoiFace size={34} delay={DEMO_TALK.length * 0.4} className="-mt-0.5" />
        <p className="min-w-0 rounded-card rounded-bl-[4px] bg-paper px-3.5 py-2.5 text-[13.5px] leading-[1.75] text-slate shadow-card">
          {DEMO_ASK}
        </p>
      </div>
    </div>
  );
}
