import Link from "next/link";
import { site } from "@/lib/site";

const nav = [
  { href: "/territories", label: "Chapters", ja: "章" },
  { href: "/articles", label: "Journal", ja: "記録" },
  { href: "/events", label: "Experiences", ja: "体験" },
  { href: "/shelf", label: "Rituals", ja: "道具", desktopOnly: true },
  { href: "/reflect", label: "Reflect", ja: "整理", desktopOnly: true },
  { href: "/about", label: "Philosophy", ja: "思想" },
];

export default function Header() {
  return (
    <header className="w-full bg-navy text-white">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 sm:px-10 py-5 sm:py-6">
        <Link
          href="/"
          aria-label={`${site.name} ホーム`}
          className="logo-type text-lg sm:text-xl text-white hover:text-gold-bright transition-colors"
        >
          {site.name}
        </Link>
        <nav aria-label="primary" className="text-sm">
          <ul className="flex items-center gap-3 sm:gap-6 text-white/85">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`inline-block py-2 hover:text-white transition-colors ${
                    item.desktopOnly ? "hidden sm:inline-block" : ""
                  }`}
                >
                  <span className="logo-type italic text-[12px] sm:text-[13px] tracking-[0.08em]">
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
