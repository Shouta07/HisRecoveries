"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { complexes } from "@/lib/complexes";
import { site } from "@/lib/site";

// 下層ページのフッター。トップのフッターと同じ中身に揃える。
// 6分野へのリンクをここに置くのは、記事ページの末尾から
// 他の分野へ抜けられるようにするため（袋小路をなくす）。
export default function Footer() {
  const pathname = usePathname();
  // The home ("/") ships its own footer; /apply and /partner are focused pages
  // that carry their own footer.
  if (pathname === "/" || pathname === "/apply" || pathname === "/partner") return null;

  return (
    <footer className="border-t border-shironezu bg-hakuji text-sumi">
      <div className="mx-auto max-w-[1200px] px-5 py-14 sm:px-8 lg:px-12">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">
          <div className="col-span-2">
            <p className="text-[12.5px] text-ainezu">分野</p>
            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 text-[14px]">
              {complexes.map((c) => (
                <li key={c.id}>
                  <Link href={`/areas/${c.id}`} className="transition-colors hover:text-dou">
                    {c.ja}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[12.5px] text-ainezu">読みもの</p>
            <ul className="mt-4 space-y-2.5 text-[14px]">
              <li>
                <Link href="/#index" className="transition-colors hover:text-dou">
                  記事をさがす
                </Link>
              </li>
              <li>
                <a
                  href="https://substack.com/@hisrecoveries"
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-dou"
                >
                  ニュースレター（Substack）<span aria-hidden className="text-ainezu"> ↗</span>
                </a>
              </li>
              <li>
                <a href="/feed.xml" className="transition-colors hover:text-dou">
                  RSS
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-[12.5px] text-ainezu">His Recoveries</p>
            <ul className="mt-4 space-y-2.5 text-[14px]">
              <li>
                <Link href="/#about" className="transition-colors hover:text-dou">
                  編集方針
                </Link>
              </li>
              <li>
                <Link href="/partner" className="transition-colors hover:text-dou">
                  取材・掲載について
                </Link>
              </li>
              <li>
                <Link href="/plan" className="transition-colors hover:text-dou">
                  第一印象改善プラン
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="transition-colors hover:text-dou">
                  プライバシー・免責事項
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-14 flex flex-col gap-3 border-t border-shironezu pt-7 sm:flex-row sm:items-baseline sm:justify-between">
          <Link href="/" className="logo-type text-[19px]">
            {site.name}
          </Link>
          <p className="text-[12.5px] text-ainezu">
            © 2026 {site.name} — 男性の美容・健康・恋愛を、編集部が調べて書いています。
          </p>
        </div>
      </div>
    </footer>
  );
}
