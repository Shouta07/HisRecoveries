import Link from "next/link";
import { site } from "@/lib/site";
import { complexes } from "@/lib/complexes";

const READ = [
  { href: "/recoveries", label: "インタビュー" },
  { href: "/territories", label: "メカニズム" },
  { href: "/articles", label: "記事" },
  { href: "/manifesto", label: "編集方針" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0E0E10] text-zinc-400 border-t border-white/10">
      <div className="mx-auto max-w-[1280px] px-6 sm:px-10 py-16 sm:py-20 pb-28 lg:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr_1fr] gap-12 lg:gap-16">
          {/* Brand */}
          <div>
            <p className="logo-type text-2xl tracking-[0.08em] text-[#F3EEE6]">{site.name}</p>
            <p className="mt-4 text-[13px] text-zinc-500 leading-[1.9] max-w-[24rem]">
              完全招待制の、会員制コンプレックス改善プログラム。
              原因の解明と専属の伴走で、男性の悩みに向き合います。
            </p>
            <Link
              href="/assessment"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#C5A572] text-[#0E0E10] text-[13px] font-bold px-5 py-2.5 hover:-translate-y-0.5 transition-transform"
            >
              招待をリクエスト <span aria-hidden>→</span>
            </Link>
          </div>

          {/* Complexes */}
          <nav aria-label="コンプレックス">
            <p className="text-[10.5px] tracking-[0.22em] uppercase text-[#C5A572] mb-5">
              Complexes
            </p>
            <ul className="space-y-2.5 text-[13px]">
              {complexes.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/territories/${c.territory}`}
                    className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                  >
                    <span
                      aria-hidden
                      className="block w-1.5 h-1.5"
                      style={{ backgroundColor: c.accent }}
                    />
                    {c.ja}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Read */}
          <nav aria-label="読みもの">
            <p className="text-[10.5px] tracking-[0.22em] uppercase text-[#C5A572] mb-5">
              Read
            </p>
            <ul className="space-y-2.5 text-[13px]">
              {READ.map((r) => (
                <li key={r.href}>
                  <Link
                    href={r.href}
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    {r.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/en"
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  English
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-14 pt-8 border-t border-white/10 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-zinc-600">
          <span>© {year} {site.name}</span>
          <span aria-hidden>·</span>
          <Link href="/privacy" className="hover:text-zinc-300 transition-colors">
            プライバシー・免責事項
          </Link>
          <span aria-hidden>·</span>
          <Link href="/network" className="hover:text-zinc-300 transition-colors">
            事業者の方へ
          </Link>
        </div>
      </div>
    </footer>
  );
}
