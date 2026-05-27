import Link from "next/link";
import { site } from "@/lib/site";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-32 bg-navy text-white">
      <div className="mx-auto max-w-[1200px] px-6 sm:px-10 py-16 sm:py-20">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-10 gap-x-8 text-sm">
          <Column label="読む">
            <FLink href="/territories">地形図</FLink>
            <FLink href="/articles">記事</FLink>
            <FLink href="/articles/category/philosophy">哲学・思想</FLink>
            <FLink href="/articles/category/hyperhidrosis">多汗症</FLink>
            <FLink href="/articles/category/acne">ニキビ</FLink>
            <FLink href="/articles/category/bromhidrosis">ワキガ</FLink>
            <FLink href="/articles/category/face">顔</FLink>
          </Column>

          <Column label="参加する">
            <FLink href="/events">イベント</FLink>
            <FLink href="/shelf">整える道具</FLink>
            <FLink href="/subscribe">ニュースレター</FLink>
            <FLink href="/letters">Letters</FLink>
          </Column>

          <Column label="このサイト">
            <FLink href="/about">概要</FLink>
            <FLink href="/reflect">整理する</FLink>
            <FLink href="/disclosure">広告・アフィリエイト方針</FLink>
            <FExt href={`mailto:${site.email}`}>連絡</FExt>
            <FLink href="/feed.xml">Atom Feed</FLink>
          </Column>

          <Column label="ほかの場所">
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
