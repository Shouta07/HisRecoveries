"use client";

import { useEffect, useState } from "react";
import { getDone, toggle, daysSince } from "@/lib/progress";
import { track } from "@/lib/analytics";

// 今月やること3つ。押して終えられるようにした。
//
// ── なぜ押せるようにするか ──────────────────────
// 「診断して終わり」を「やったかどうかを追う」に変える一点がここ。
// 順番を渡しただけでは、動いたかどうかは誰にも分からない。
//
// ── 描き分けに注意 ────────────────────────────
// 記録は localStorage にあるので、サーバーには無い。
// 最初の描画で読むと、サーバーとクライアントで中身が食い違う
// （hydration の不一致）。だから初回は必ず「未チェック」で描き、
// 画面に出てから読み込んで差し替える。
//
// ── 取り消せるようにする ────────────────────────
// 一度押したら戻せない形にしない。戻せないと、
// 「たぶんやった」で押すようになり、記録が意味を失う。

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

export default function ThisMonth({
  items,
  code,
}: {
  items: { when: string; text: string }[];
  /** 診断結果のコード（?r= の中身）。記録の鍵になる */
  code: string;
}) {
  const [done, setDone] = useState<string[]>([]);
  const [since, setSince] = useState<number | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDone(getDone(code));
    setSince(daysSince(code));
    setReady(true);
  }, [code]);

  function flip(text: string) {
    const next = toggle(code, text);
    setDone(next);
    setSince(0);
    // 追いたいのは「診断した人のうち何人が動いたか」。
    // 外したときも送らないと、動いた数が実際より多く出る。
    track(next.includes(text) ? "action_done" : "action_undone", {
      count: next.length,
      total: items.length,
    });
  }

  const n = done.length;

  return (
    <section className="mt-12">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-[18px] sm:text-[20px]" style={{ ...MINCHO, fontWeight: 700 }}>
          今月やること、3つだけ
        </h3>
        {ready && n > 0 && (
          <p className="shrink-0 text-[12.5px] tabular-nums text-asagi">
            {n} / {items.length}
          </p>
        )}
      </div>

      {/* 戻ってきた人に、前回からの間隔を出す。
          「続いていますね」とは書かない。日数だけを置く。 */}
      {ready && since !== null && since > 0 && (
        <p className="mt-2 text-[13px] text-ainezu">前に開いたのは{since}日前です。</p>
      )}

      <ol className="mt-5 border-t border-shironezu">
        {items.map((a) => {
          const on = done.includes(a.text);
          return (
            <li key={a.text} className="border-b border-shironezu">
              <button
                type="button"
                onClick={() => flip(a.text)}
                aria-pressed={on}
                className="flex w-full gap-3.5 py-4 text-left transition-colors hover:bg-hakuji"
              >
                <span
                  aria-hidden
                  className={`mt-[0.2em] grid h-[22px] w-[22px] shrink-0 place-items-center border text-[13px] transition-colors ${
                    on ? "border-asagi bg-asagi text-shironeri" : "border-shironezu bg-shironeri text-transparent"
                  }`}
                >
                  ✓
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[12.5px] text-asagi">{a.when}</span>
                  <span
                    className={`mt-0.5 block text-[15px] leading-[1.9] transition-colors ${
                      on ? "text-ainezu line-through decoration-shironezu" : "text-keshizumi"
                    }`}
                  >
                    {a.text}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <p className="mt-4 text-[13px] leading-[1.9] text-ainezu">
        押すと、この端末に印が残ります。こちらには送られません。
        <span className="mt-1 block">
          別の端末で同じリンクを開いても、印は出ません。端末の中にだけ置いているためです。
        </span>
      </p>
    </section>
  );
}
