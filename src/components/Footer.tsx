import Link from "next/link";
import { site } from "@/lib/site";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-32 bg-navy text-white">
      <div className="mx-auto max-w-[1200px] px-6 sm:px-10 py-16 sm:py-20">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-10 gap-x-8 text-sm">
          <Column label="Read · 記録">
            <FLink href="/articles">Presence Journal</FLink>
            <FLink href="/territories">Chapters — 章</FLink>
            <FLink href="/articles/category/philosophy">哲学・思想</FLink>
            <FLink href="/articles/category/hyperhidrosis">多汗症</FLink>
            <FLink href="/articles/category/bromhidrosis">ワキガ</FLink>
            <FLink href="/articles/category/acne">ニキビ・ニキビ跡</FLink>
            <FLink href="/articles/category/face">顔の印象</FLink>
            <FLink href="/articles/category/hair-loss">薄毛・AGA</FLink>
            <FLink href="/articles/category/body-hair">髭・体毛</FLink>
          </Column>

          <Column label="Engage · 整える">
            <FLink href="/events">Quiet Gatherings — 体験</FLink>
            <FLink href="/shelf">Conditioning Rituals — 道具</FLink>
            <FLink href="/reflect">Reflect — 整理する</FLink>
            <FLink href="/subscribe">Newsletter — 便り</FLink>
            <FLink href="/letters">Letters</FLink>
          </Column>

          <Column label="About · 思想">
            <FLink href="/about">Philosophy — About</FLink>
            <FLink href="/disclosure">広告・アフィリエイト方針</FLink>
            <FExt href={`mailto:${site.email}`}>連絡</FExt>
            <FLink href="/feed.xml">Atom Feed</FLink>
          </Column>

          <Column label="Elsewhere · ほかの場所">
            <FExt href={site.social.threads}>Threads</FExt>
            <FExt href={site.social.x}>X</FExt>
            <FExt href={site.social.note}>note</FExt>
            <FExt href={site.social.substack}>Substack</FExt>
          </Column>
        </div>

        <div className="mt-16 pt-8 border-t border-white/15 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="logo-type text-2xl text-white">{site.name}</p>
            <p className="mt-1 font-mincho text-xs text-white/60">
              {site.tagline}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-white/55">
            <span>© {year} {site.name}</span>
            <span aria-hidden>·</span>
            <Link href="/privacy" className="hover:text-white transition-colors">
              プライバシーポリシー
            </Link>
            <span aria-hidden>·</span>
            <Link href="/legal" className="hover:text-white transition-colors">
              特定商取引法に基づく表記
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Column({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs text-white/55 mb-4">{label}</p>
      <ul className="space-y-2.5 text-[13px] text-white/85">{children}</ul>
    </div>
  );
}

function FLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="hover:text-gold-bright transition-colors">
        {children}
      </Link>
    </li>
  );
}

function FExt({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-gold-bright transition-colors"
      >
        {children}
      </a>
    </li>
  );
}
