"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITUATIONS } from "@/lib/situations";
import { site } from "@/lib/site";

// 下層ページのフッター。トップのフッターと同じ中身に揃える。
// 6分野へのリンクをここに置くのは、記事ページの末尾から
// 他の分野へ抜けられるようにするため（袋小路をなくす）。
//
// 分野は props で受け取る。ここは "use client" なので complexes を
// import すると、6領域それぞれの解説文まで丸ごとバンドルに入る。
// 要るのは id と表示名だけ。
export default function Footer({ areas }: { areas: { id: string; ja: string }[] }) {

  const pathname = usePathname();

  // 「女性に聞く」の面は、それ自体がプロダクト。記事サイトのフッターは出さない。
  if (pathname?.startsWith("/ask") || pathname?.startsWith("/r/") || pathname === "/join" || pathname?.startsWith("/answerers") || pathname === "/safety" || pathname === "/mine" || pathname === "/legal" || pathname === "/how" || pathname === "/talk" || pathname?.startsWith("/me/") || pathname?.startsWith("/s/")) return null;
  // トップは自前のフッターを持っている。
  if (pathname === "/") return null;

  return (
    <footer className="border-t border-shironezu bg-hakuji text-sumi">
      <div className="mx-auto max-w-[1200px] px-5 py-14 sm:px-8 lg:px-12">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-5">
          <div className="col-span-2">
            <p className="text-[12.5px] text-ainezu">分野</p>
            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 text-[14px]">
              {areas.map((c) => (
                <li key={c.id}>
                  <Link href={`/areas/${c.id}`} className="transition-colors hover:text-asagi">
                    {c.ja}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[12.5px] text-ainezu">状況からさがす</p>
            <ul className="mt-4 space-y-2.5 text-[14px]">
              {SITUATIONS.map((x) => (
                <li key={x.id}>
                  <Link href={`/situations/${x.id}`} className="transition-colors hover:text-asagi">
                    {x.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[12.5px] text-ainezu">読みもの</p>
            <ul className="mt-4 space-y-2.5 text-[14px]">
              <li>
                <Link href="/articles" className="transition-colors hover:text-asagi">
                  記事をさがす
                </Link>
              </li>
              <li>
                <Link href="/updates" className="transition-colors hover:text-asagi">
                  更新記録
                </Link>
              </li>
              <li>
                <a href="/feed.xml" className="transition-colors hover:text-asagi">
                  RSS
                </a>
              </li>
            </ul>
          </div>
          <div>
            {/* 記事から来た人が、商品にたどり着ける唯一の線。
                記事を残す以上、ここが切れていると読まれて終わる。 */}
            <p className="text-[12.5px] text-ainezu">タシカメ</p>
            <ul className="mt-4 space-y-2.5 text-[14px]">
              <li>
                <Link href="/ask" className="font-bold transition-colors hover:text-asagi">
                  女性に相談する
                </Link>
              </li>
              <li>
                <Link href="/answerers" className="transition-colors hover:text-asagi">
                  誰が読むのか
                </Link>
              </li>
              <li>
                <Link href="/join" className="transition-colors hover:text-asagi">
                  回答する（女性の方へ）
                </Link>
              </li>
              <li>
                <Link href="/about" className="transition-colors hover:text-asagi">
                  編集方針
                </Link>
              </li>
              <li>
                <Link href="/disclosure" className="transition-colors hover:text-asagi">
                  広告と収益について
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="transition-colors hover:text-asagi">
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
