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

  // /app 配下はアプリの外枠を使う。サイトのフッターは出さない。
  if (pathname?.startsWith("/app")) return null;
  // 「女性に聞く」の面は、それ自体がプロダクト。記事サイトのフッターは出さない。
  if (pathname?.startsWith("/ask") || pathname?.startsWith("/r/") || pathname === "/join") return null;
  // The home ("/") ships its own footer; /apply and /partner are focused pages
  // that carry their own footer.
  if (pathname === "/" || pathname === "/apply" || pathname === "/partner") return null;

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
              {/* トップのフッターを8本に絞ったとき、/skip と /research への
                  内部リンクがサイト内から0本になった（トップが唯一の入口だった）。
                  サイトマップには載っていても、0本はさすがに孤立している。
                  記事20ルートに出るこちらのフッターへ移す。 */}
              <li>
                <Link href="/skip" className="transition-colors hover:text-asagi">
                  やらなくていいこと
                </Link>
              </li>
              <li>
                <Link href="/order" className="transition-colors hover:text-asagi">
                  男の改善、全部の順番
                </Link>
              </li>
              <li>
                <a
                  href="/letters"
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-asagi"
                >
                  ニュースレター（Substack）<span aria-hidden className="text-ainezu"> ↗</span>
                </a>
              </li>
              <li>
                <a href="/feed.xml" className="transition-colors hover:text-asagi">
                  RSS
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-[12.5px] text-ainezu">His Recoveries</p>
            <ul className="mt-4 space-y-2.5 text-[14px]">
              {/* 回答する側の入口。記事から来た人にも見えるように、
                  サイト全体のフッターに置く。 */}
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
                <Link href="/updates" className="transition-colors hover:text-asagi">
                  更新記録
                </Link>
              </li>
              <li>
                <Link href="/research" className="transition-colors hover:text-asagi">
                  調査
                </Link>
              </li>
              <li>
                <Link href="/interview" className="transition-colors hover:text-asagi">
                  取材にご協力いただけませんか
                </Link>
              </li>
              <li>
                <Link href="/partner" className="transition-colors hover:text-asagi">
                  取材・掲載について
                </Link>
              </li>
              <li>
                <Link href="/plan" className="transition-colors hover:text-asagi">
                  第一印象改善プラン
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
