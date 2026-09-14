"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// アプリの外枠。
//
// ── 下タブを機能一覧にしない（§06）────────────────
// 「ジャーニー」「見つける」のような機能名を並べると、
// そこは道具箱になる。置くのは、その人が居る場所の名前だけ。
//   今日  いま自分はどうか
//   記録  残したもの
//   知る  他の人のこと
//   自分  分かってきたこと
//
// ── 中央のボタンを置かない ────────────────────────
// 丸い＋を中央に浮かせると、投稿アプリの記号になる。
// 記録へは「今日」から入る。そこが一番手前にある。
//
// ── ジャーニーはタブに置かない（§09）──────────────
// タブに置いた瞬間、そこは進捗を見に行く場所になる。
// 道のりは「今日」の線から入る。

const TABS = [
  { href: "/app", label: "今日" },
  { href: "/app/record", label: "記録" },
  { href: "/app/knowledge", label: "知る" },
  { href: "/app/me", label: "自分" },
];

/** 下タブを出さない画面。一画面一問の最中に、外への出口を見せない */
const BARE = ["/app/new", "/app/start"];

function Glyph({ name, on }: { name: string; on: boolean }) {
  const c = on ? "#B2543C" : "#8C8378";
  // 線1本で描く。このプロダクトのモチーフと同じ太さにそろえる。
  const d: Record<string, React.ReactNode> = {
    今日: <circle cx="12" cy="12" r="7" />,
    記録: (
      <>
        <path d="M5 6h14" />
        <path d="M5 12h14" />
        <path d="M5 18h9" />
      </>
    ),
    知る: (
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
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {d[name]}
    </svg>
  );
}

function isOn(path: string, href: string): boolean {
  return href === "/app" ? path === "/app" : path.startsWith(href);
}

export default function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname() ?? "/app";
  const bare = BARE.some((p) => path.startsWith(p));

  return (
    <div className={`min-h-screen bg-ground ${bare ? "" : "pb-[68px] sm:pb-16"}`}>
      {/* Desktop をスマホの巨大版にしない（§32）。
          横幅は伸ばさず、左右の余白を大きく取る。
          下に固定したタブは、画面が広いところでは電話の名残にしかならないので、
          幅が取れる環境では上の一行に置き換える。 */}
      {!bare && (
        <nav
          aria-label="メイン"
          className="mx-auto hidden w-full max-w-[560px] px-8 pt-10 sm:block"
        >
          <ul className="flex gap-7 border-b border-hairline pb-3">
            {TABS.map((t) => {
              const on = isOn(path, t.href);
              return (
                <li key={t.href}>
                  <Link
                    href={t.href}
                    aria-current={on ? "page" : undefined}
                    className={`text-[14px] transition-colors ${
                      on ? "font-bold text-accent" : "text-faint hover:text-bodytext"
                    }`}
                  >
                    {t.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      <div className="mx-auto w-full max-w-[560px] px-5 pt-6 sm:px-8 sm:pt-10">{children}</div>

      {!bare && (
        <nav
          aria-label="メイン"
          className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-ground/95 backdrop-blur-sm sm:hidden"
        >
          <ul className="mx-auto grid max-w-[560px] grid-cols-4">
            {TABS.map((t) => {
              const on = isOn(path, t.href);
              return (
                <li key={t.href}>
                  <Link
                    href={t.href}
                    aria-current={on ? "page" : undefined}
                    className="flex h-[60px] flex-col items-center justify-center gap-1"
                  >
                    <Glyph name={t.label} on={on} />
                    <span className={`text-[10.5px] ${on ? "text-accent" : "text-faint"}`}>
                      {t.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}
