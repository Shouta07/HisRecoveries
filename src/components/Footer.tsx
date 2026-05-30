import Link from "next/link";
import { site } from "@/lib/site";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-32 bg-navy text-white">
      <div className="mx-auto max-w-[1200px] px-6 sm:px-10 py-16 sm:py-20">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-10 gap-x-8 text-sm">
          <Column label="Read">
            <FLink href="/articles">Presence Journal</FLink>
            <FLink href="/about">Male Conditioning</FLink>
            <FLink href="/territories/sweat-odor">汗とにおい</FLink>
            <FLink href="/territories/skin-acne">肌と跡</FLink>
            <FLink href="/territories/face-impression">顔の印象</FLink>
            <FLink href="/territories/hair-loss">髪と自意識</FLink>
            <FLink href="/territories/beard-body-hair">髭と体毛</FLink>
            <FLink href="/territories/mind-awareness">心と余白</FLink>
          </Column>

          <Column label="Engage">
            <FLink href="/assessment">Recovery Assessment</FLink>
            <FLink href="/events">Quiet Gatherings</FLink>
            <FLink href="/concierge">Recovery Concierge</FLink>
            <FLink href="/stories">Recovery Stories</FLink>
            <FLink href="/shelf">Conditioning Rituals</FLink>
            <FLink href="/subscribe">Newsletter</FLink>
            <FLink href="/reflect">Reflect</FLink>
          </Column>

          <Column label="About">
            <FLink href="/about">Philosophy</FLink>
            <FLink href="/manifesto">Manifesto</FLink>
            <FLink href="/founder">Founder&apos;s Note</FLink>
            <FLink href="/disclosure">Affiliate Policy</FLink>
            <FExt href={`mailto:${site.email}`}>Contact</FExt>
            <FLink href="/feed.xml">Atom Feed</FLink>
          </Column>

          <Column label="Elsewhere">
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
