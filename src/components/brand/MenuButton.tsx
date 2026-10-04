"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { OPERATOR } from "@/lib/voice";

// ヘッダーのメニュー。
//
// ── なぜ要るか ────────────────────────────────────
// フッターを外したので、特定商取引法の表記とプライバシーの行き先が
// 無くなる。この2つは、課金する以上どこかから必ず辿れないといけない。
// 下に長く並べる代わりに、ここへ畳んだ。
//
// ── 入れないもの ──────────────────────────────────
// 記事・編集方針・更新記録・広告と収益については、記事側のもの。
// タシカメを買いに来た人には要らない（記事側のヘッダーと
// 記事内の表示から辿れるので、消えるわけではない）。
// メニューが長いほど、本当に要る2つが見つけにくくなる。
//
// ── 開いている間は、後ろを動かさない ──────────────
// 背景がスクロールすると、閉じたときに違う場所に戻る。
//
// ── Esc と、背景を押したら閉じる ──────────────────
// 閉じ方が1つしかないメニューは、閉じられないメニューになる。
//
// ── body の直下に出す ─────────────────────────────
// ヘッダーに backdrop-blur が掛かっている。backdrop-filter は
// position: fixed の基準（containing block）になるので、
// ヘッダーの中に置くと inset-0 がヘッダーの箱に閉じ込められ、
// メニューがヘッダーの高さに潰れる。実際そうなっていた。

// ── 何を置くか ────────────────────────────────────
// 4つの見出しに11項目を並べていた。
// 見出しが多いほど、目が上下に行ったり来たりして、
// 結局どこを押せばいいのか決まらない。
//
// 置くのは「ここからしか行けないもの」だけにする。
//   確かめる      ヘッダーのボタンが常に出ている
//   誰が読むのか  トップに節がある
//   電話の練習    料金のカードと相談の画面から行ける
// この3つは外した。
//
// 見出しも外して、1本の並びにした。
// 法定の表記だけ、線で分ける（性質が違うので混ぜない）。
const LINKS = [
  /* 無料で触れる唯一の面。会員登録も鍵も要らない。
     ここから入って、答えた人が回答者の候補にもなる。 */
  ["/scene", "この場面、どうする？"],
  ["/reviewers", "今日の受付"],
  ["/plans", "料金"],
  ["/mine", "相談したこと"],
  // 記事。ここから読んで、そのまま自分の場面を確かめてもらう
  ["/articles", "たしかメディア"],
] as const;

const LEGAL = [
  // 規約が無いと、誰と誰の契約なのかがどこにも書かれていないことになる。
  // 決済の直前（PurchaseTerms）からも開けるが、常設の導線もここに置く。
  ["/terms", "利用規約"],
  ["/legal", "特定商取引法に基づく表記"],
  ["/privacy", "プライバシー・免責事項"],
] as const;

/* ── 公開の前に止めること ─────────────────────────
   フッターを外したので、ここが特商法の表記とプライバシーへの
   唯一の常設導線になっている。整理のときに消えると、
   課金する画面から法定の表記へ辿れなくなる。 */
{
  const hrefs: string[] = [...LINKS, ...LEGAL].map(([h]) => h);
  for (const must of ["/terms", "/legal", "/privacy"]) {
    if (!hrefs.includes(must)) {
      throw new Error(`メニューから ${must} が消えています（ここが唯一の導線です）`);
    }
  }
  // 値段はトップから外して別のページにした。ここから辿れないと、
  // 押す前に金額を確かめる方法が無くなる。
  if (!hrefs.includes("/plans")) {
    throw new Error("メニューから料金が消えています（トップに値段は出していません）");
  }
  // 「答える側になる」（/join）の判定は外した。
  // 回答者の募集ページごと畳んだので、公開の入口はもう無い
  // （募集は個別に案内する）。
  // 自分が出した相談へ戻る道も、ここしかない。
  if (!hrefs.includes("/mine")) {
    throw new Error("メニューから「相談したこと」が消えています（戻る道がここだけです）");
  }
  // 短くすること自体が目的なので、増え始めたら止める。
  // 記事への入口。ここが消えると、書いた記事が誰にも届かない
  if (!hrefs.includes("/articles")) {
    throw new Error("メニューから記事の入口が消えています");
  }
  if (LINKS.length > 7) {
    throw new Error(`メニューが長くなっています（${LINKS.length}項目）。増やすなら、どれかを外してください`);
  }
}

export default function MenuButton() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="メニューを開く"
        aria-expanded={open}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-soft text-slate transition-colors hover:bg-mist lg:hidden"
      >
        <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {open && mounted && createPortal(
        <div className="fixed inset-0 z-[60] lg:hidden">
          {/* 背景。読み上げには出さない（閉じる操作は右上の×と Esc） */}
          <div
            aria-hidden
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-slate/40"
          />
          <div className="absolute inset-x-0 top-0 max-h-full overflow-y-auto rounded-b-card bg-paper pb-8 shadow-card">
            <div className="flex items-center justify-between px-5 py-3.5">
              <span className="text-[15px] font-black text-slate">メニュー</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="メニューを閉じる"
                className="flex h-11 w-11 items-center justify-center rounded-soft text-slate transition-colors hover:bg-mist"
              >
                <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <nav aria-label="サイト内" className="border-t border-line">
              <ul className="flex flex-col">
                {LINKS.map(([href, l]) => (
                  <li key={href} className="border-b border-line last:border-b-0">
                    <Link
                      href={href}
                      onClick={() => setOpen(false)}
                      className="flex min-h-[54px] items-center px-5 text-[15.5px] font-bold text-slate transition-colors hover:bg-mist"
                    >
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* 法定の表記。性質が違うので、上の並びと混ぜない */}
              <ul className="flex flex-col border-t-4 border-mist">
                {LEGAL.map(([href, l]) => (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={() => setOpen(false)}
                      className="flex min-h-[44px] items-center px-5 text-[12.5px] text-steel transition-colors hover:text-slate"
                    >
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <p className="mt-4 px-5 text-[11.5px] text-steel">
              © 2026 {OPERATOR}
            </p>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
