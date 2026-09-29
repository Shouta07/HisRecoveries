"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Tashikame from "./Tashikame";

// 下タブ。
//
// ── C2C のアプリに見える、いちばん効く部品 ────────────
// メルカリもココナラもタイミーも、下にタブがある。
// 「見る／さがす／出す／自分」が常に手の届くところにあるのが、
// この種のサービスの形。
//
// ── 出す側を真ん中に置かない ──────────────────────
// 中央に丸い＋を浮かせると投稿アプリの記号になるが、
// ここは「出す」より「聞く」なので、言葉で置く。
//
// ── 集中する画面では出さない ──────────────────────
// 相談を書いている途中（/ask）と回答中（/r/）では出さない。
// 一画面一問の最中に、外への出口を見せない。
//
// ── スマホだけ ────────────────────────────────────
// 広い画面では上のヘッダーで足りる。下に固定すると場所を食うだけ。

const TABS = [
  { href: "/", label: "ホーム" },
  { href: "/answerers", label: "誰が読む" },
  { href: "/ask", label: "相談する", primary: true },
  { href: "/mine", label: "自分" },
];

/** ここでは出さない */
const HIDE = ["/ask", "/r/", "/app", "/areas", "/articles", "/situations", "/check", "/order"];

function Glyph({ name, on }: { name: string; on: boolean }) {
  const c = on ? "#0A0A0A" : "#6E6A63";
  const d: Record<string, React.ReactNode> = {
    ホーム: <path d="M4 10.5 12 4l8 6.5V20h-5v-5H9v5H4z" />,
    誰が読む: (
      <>
        <circle cx="11" cy="11" r="6" />
        <path d="M15.5 15.5 20 20" />
      </>
    ),
    自分: (
      <>
        <circle cx="12" cy="9" r="3.2" />
        <path d="M5.5 19.5c0-3.2 2.9-5.5 6.5-5.5s6.5 2.3 6.5 5.5" />
      </>
    ),
  };
  return (
    <svg
      aria-hidden
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {d[name]}
    </svg>
  );
}

export default function TabBar() {
  const path = usePathname() ?? "/";
  // /ask は隠すが、結果（/ask/c…）では出す。戻る場所が要るので。
  const isResult = /^\/ask\/[cr]/.test(path);
  if (!isResult && HIDE.some((h) => path === h || path.startsWith(h + "/") || path.startsWith(h))) {
    return null;
  }

  return (
    <>
      {/* タブは fixed なので、そのぶん下を空ける。
          空けないと、ページ末尾のボタンがタブの裏に入って押せない。 */}
      <div aria-hidden className="h-[66px] sm:hidden" />
      <nav
        aria-label="メイン"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-paper/97 backdrop-blur sm:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul className="mx-auto grid max-w-[560px] grid-cols-4">
        {TABS.map((t) => {
          const on = t.href === "/" ? path === "/" : path.startsWith(t.href);
          if (t.primary) {
            return (
              <li key={t.href} className="flex items-center justify-center py-2">
                <Link
                  href={t.href}
                  aria-current={on ? "page" : undefined}
                  className="inline-flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-pill bg-brand px-3.5 text-[12.5px] font-bold text-paper shadow-card"
                >
                  <Tashikame size={20} tone="brand" />
                  {t.label}
                </Link>
              </li>
            );
          }
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                aria-current={on ? "page" : undefined}
                className="flex h-[58px] flex-col items-center justify-center gap-1"
              >
                <Glyph name={t.label} on={on} />
                <span className={`text-[10.5px] ${on ? "font-bold text-slate" : "text-steel"}`}>
                  {t.label}
                </span>
              </Link>
            </li>
          );
        })}
        </ul>
      </nav>
    </>
  );
}
