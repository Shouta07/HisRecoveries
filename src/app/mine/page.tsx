"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { list, remove, shortDate, type MyAsk } from "@/lib/myasks";
import { category, type CategoryId } from "@/lib/ask/model";
import Tashikame from "@/components/brand/Tashikame";
import Says from "@/components/brand/Says";
import { EMPTY } from "@/lib/tashikame";

// 自分が出した相談の一覧。
//
// ── 会員登録の代わり ──────────────────────────────
// アカウントを作らせない代わりに、控えを端末に置く。
// リンクを失っても、同じ端末なら戻れる。
//
// ── 端末の中だけだと、はっきり書く ────────────────
// 別の端末では出ない。消したら戻らない。
// そこを曖昧にすると、あとで「消えた」と言われる。

export default function MinePage() {
  const [items, setItems] = useState<MyAsk[] | null>(null);

  useEffect(() => {
    setItems(list());
  }, []);

  return (
    <div data-brand className="min-h-screen bg-paper pb-24 text-slate sm:pb-0">
      <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[720px] items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Tashikame size={28} />
            <span className="whitespace-nowrap text-[15px] font-black">His Recoveries</span>
          </Link>
          <Link
            href="/ask"
            className="inline-flex min-h-[42px] shrink-0 items-center whitespace-nowrap rounded-pill bg-brand px-5 text-[13.5px] font-bold text-paper shadow-card"
          >
            聞いてみる
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[720px] px-5 pb-16 pt-8 sm:px-8 sm:pt-12">
        <h1 className="text-big font-black text-slate">聞いたこと</h1>

        {items === null ? (
          <div className="mt-8 flex flex-col gap-3">
            {[0, 1].map((i) => (
              <span key={i} className="block h-20 rounded-card bg-mist" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="mt-8">
            <Says text={EMPTY.noRecords.text} mood={EMPTY.noRecords.mood} size={64} />
            <p className="mt-6 max-w-[28em] text-[15px] leading-[1.95] text-steel">
              聞いた相談が、ここに並びます。結果のリンクを失っても、
              同じ端末ならここから戻れます。
            </p>
            <div className="mt-7">
              <Link
                href="/ask"
                className="inline-flex min-h-[56px] items-center justify-center rounded-pill bg-brand px-9 text-[15.5px] font-bold text-paper shadow-card"
              >
                30秒で聞いてみる
              </Link>
            </div>
          </div>
        ) : (
          <>
            <p className="mt-2 text-[13px] text-steel">{items.length}件</p>
            <ul className="mt-6 flex flex-col gap-3">
              {items.map((a) => {
                let label = a.category;
                try {
                  label = category(a.category as CategoryId).label;
                } catch {
                  /* 古い控えは、そのまま出す */
                }
                return (
                  <li key={a.token}>
                    <div className="rounded-card border border-line bg-paper p-4 shadow-card">
                      <Link href={`/ask/${a.token}`} className="block">
                        <div className="flex items-center justify-between gap-3">
                          <span className="rounded-pill bg-mist px-3 py-1 text-[12px] font-bold text-steel">
                            {label}
                          </span>
                          <span className="text-[12px] text-steel">{shortDate(a.at)}</span>
                        </div>
                        <p className="mt-3 text-[15.5px] font-bold">
                          {a.size}人に聞きました
                        </p>
                        <p className="mt-1 text-[13px] text-steel">結果を見る →</p>
                      </Link>
                      <button
                        type="button"
                        onClick={() => setItems(remove(a.token))}
                        className="mt-3 min-h-[40px] text-[12px] text-steel underline decoration-line underline-offset-4 transition-colors hover:text-slate"
                      >
                        この控えを消す
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        <div className="mt-14 rounded-card border border-line bg-paper p-5 shadow-card">
          <p className="text-[14px] font-bold">この一覧について</p>
          <p className="mt-3 text-[13.5px] leading-[1.9] text-steel">
            この端末の中にだけ保存しています。こちらのサーバーには送っていません。
            「誰がどの相談を出したか」の対応表を作らないためです。
          </p>
          <p className="mt-3 text-[13.5px] leading-[1.9] text-steel">
            別の端末では出ません。控えを消すと戻せません
            （相談そのものは残るので、リンクを持っていれば結果は見られます）。
          </p>
        </div>
      </main>
    </div>
  );
}
