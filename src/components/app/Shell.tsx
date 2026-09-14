"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// アプリの外枠。下タブと、中央の「記録」。
//
// ── 記事タブを置かない ────────────────────────────
// 「記事」「コラム」を下タブに置くと、その時点で読み物アプリに見える。
// 読むものは、ホームと見つけるから文脈つきで出す。
//
// ── 中央を記録にする ──────────────────────────────
// 5つのうち真ん中だけ形を変える。押す場所が迷いようがなくなる。
// ここが「これは記録するアプリだ」と3秒で伝える唯一の部品。

const TABS = [
  { href: "/app", label: "ホーム" },
  { href: "/app/journey", label: "ジャーニー" },
  { href: "/app/record", label: "記録", center: true },
  { href: "/app/discover", label: "見つける" },
  { href: "/app/me", label: "自分" },
];

function Icon({ name, on }: { name: string; on: boolean }) {
  const c = on ? "#D9694F" : "#8C8378";
  const p: Record<string, React.ReactNode> = {
    ホーム: <path d="M4 10.5 12 4l8 6.5V20h-5v-5H9v5H4z" />,
    ジャーニー: <path d="M5 19c3-1 4-4 7-5s5-2 7-6" />,
    見つける: (
      <>
        <circle cx="11" cy="11" r="6" />
        <path d="M16 16l4 4" />
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
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {p[name]}
    </svg>
  );
}

export default function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname() ?? "/app";

  return (
    <div className="min-h-screen bg-ground pb-[72px]">
      <div className="mx-auto w-full max-w-[520px] px-4 pt-5">{children}</div>

      <nav
        aria-label="メイン"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-surface"
      >
        <ul className="mx-auto grid max-w-[520px] grid-cols-5">
          {TABS.map((t) => {
            const on = t.href === "/app" ? path === "/app" : path.startsWith(t.href);
            if (t.center) {
              return (
                <li key={t.href} className="relative">
                  <Link
                    href={t.href}
                    aria-current={on ? "page" : undefined}
                    className="flex h-[60px] flex-col items-center justify-center gap-1"
                  >
                    <span
                      className="grid h-11 w-11 place-items-center rounded-full bg-coral text-[22px] font-bold leading-none text-white"
                      style={{ boxShadow: "0 3px 10px rgba(217,105,79,0.28)" }}
                    >
                      ＋
                    </span>
                    <span className="sr-only">{t.label}</span>
                  </Link>
                </li>
              );
            }
            return (
              <li key={t.href}>
                <Link
                  href={t.href}
                  aria-current={on ? "page" : undefined}
                  className="flex h-[60px] flex-col items-center justify-center gap-1"
                >
                  <Icon name={t.label} on={on} />
                  <span className={`text-[10.5px] ${on ? "text-coral" : "text-faint"}`}>
                    {t.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
