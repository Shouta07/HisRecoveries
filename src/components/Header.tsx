"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import SearchButton from "@/components/search/SearchButton";
import { site } from "@/lib/site";
import { NAME } from "@/lib/voice";
import { MEDIA } from "@/lib/media";
import Mark from "@/components/brand/Mark";
import MenuButton from "@/components/brand/MenuButton";

// 下層ページのヘッダー。トップの GlassNav と同じ見え方に揃える
// （ロゴ＋肩書き1行、記事が先頭）。メディアが主、サービスが従。
// 記事一覧へは、ロゴが行く。ここには置かない
const LINKS: { href: string; label: string; desktopOnly?: boolean }[] = [
  { href: "/about", label: "編集方針", desktopOnly: true },
];

export default function Header() {
  const pathname = usePathname();

  // The home ("/") ships its own glass navbar; /apply and /partner are focused
  // pages that carry their own top bar.
  // 「女性に聞く」の面（相談・結果・回答）は、それ自体がプロダクト。
  // 記事サイトのヘッダー（男の改善は、順番で決まる／現在地を測る）が重なると、
  // 何のサービスを使っているのか分からなくなる。
  // 1つ増やすたびにこの行が伸びていたので、一覧にした。
  const BRAND_PAGES = [
    "/join", "/safety", "/mine", "/legal", "/how", "/talk", "/plans",
    "/reviewers", "/articles", "/terms",
  ];
  const BRAND_PREFIXES = ["/ask", "/r/", "/answerers", "/me/", "/s/"];
  if (
    BRAND_PAGES.includes(pathname ?? "") ||
    BRAND_PREFIXES.some((x) => pathname?.startsWith(x))
  ) {
    return null;
  }
  if (pathname === "/") return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-shironezu bg-hakuji/85 backdrop-blur-xl">
      {/* 320px では px-5（左右40px）が入らない。
          ロゴ＋現在地を測る＋検索で、あと8px足りなかった。
          いちばん狭いところだけ余白を詰める。 */}
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-3 px-4 py-3.5 xs:px-5 sm:px-8 sm:py-4 lg:px-12">
        {/* 縮まないようにしていたので、狭い画面では右側が押し出されていた。
            縮めるようにして、肩書きのほうを切る。ロゴの文字は切らない。 */}
        {/* ══════════════════════════════════════════════
            記事側も「たしかメディア by タシカメ」にする
            ══════════════════════════════════════════════
            「His Recoveries / 男の改善は、順番で決まる」だった。

            検索から来た人は、記事を読んだあとタシカメへ入る。
            そのとき名前が変わっていると、別のサイトに飛ばされたように
            見える。住所（hisrecoveries.com）は同じでも、
            店名が2つあると、どちらの店にいるのか分からない。

            記号（甲羅＋確かめた印）も、タブと同じものにする。 */}
        <Link href="/articles" aria-label={`${MEDIA.name} 記事一覧`} className="flex min-w-0 items-center gap-2">
          <Mark size={28} />
          <span className="min-w-0 leading-none">
            <span className="block truncate whitespace-nowrap text-[15px] font-black text-sumi sm:text-[17px]">
              {MEDIA.name}
            </span>
            <span className="mt-1 block truncate text-[10px] font-bold text-ainezu sm:text-[10.5px]">
              by {NAME}
            </span>
          </span>
        </Link>

        {/* 320px の端末で、この行が 53px はみ出していた。
            ロゴ＋肩書き＋記事＋現在地を測る＋検索は、その幅には入らない。
            いちばん狭いところでは「記事」を落とす（検索ボタンから同じ場所へ行ける）。
            間隔も詰める。 */}
        <div className="flex min-w-0 items-center gap-3 xs:gap-5 sm:gap-7">
          <ul className="flex items-center gap-3 xs:gap-5 sm:gap-7">
            {LINKS.map((l) => (
              <li key={l.href} className={l.desktopOnly ? "hidden md:block" : "hidden sm:block"}>
                <Link
                  href={l.href}
                  className="whitespace-nowrap text-[14.5px] font-normal text-keshizumi transition-colors hover:text-asagi sm:text-[15px]"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          {/* 記事側のヘッダーから、商品への唯一の常設導線。
              以前はここが診断（廃止）へ向いていた。 */}
          <Link
            href="/ask"
            className="inline-flex shrink-0 whitespace-nowrap rounded-full bg-[#2563EB] px-3.5 py-2 text-[12.5px] font-bold text-white transition-opacity hover:opacity-90 sm:px-4 sm:text-[13.5px]"
          >
            <span className="sm:hidden">確かめる</span>
            <span className="hidden sm:inline">女性に確かめる</span>
          </Link>
          <SearchButton />
          {/* フッターを外したので、ほかの面への行き先はここに畳んである。
              特商法の表記とプライバシーも、ここから辿れる */}
          <MenuButton />
        </div>
      </div>
    </header>
  );
}
