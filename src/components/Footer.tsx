import Link from "next/link";
import { site } from "@/lib/site";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-32 bg-cream-deep text-ink border-t border-hair-line">
      <div className="mx-auto max-w-[1200px] px-6 sm:px-10 py-16 sm:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-10 gap-x-8 text-sm">
          <Column label="読みもの">
            <FLink href="/articles">記録</FLink>
            <FLink href="/territories">悩みの章</FLink>
            <FLink href="/recoveries">回復の物語</FLink>
          </Column>

          <Column label="道具">
            <FLink href="/shelf">整える道具の棚</FLink>
            <FLink href="/disclosure">広告・アフィリエイト方針</FLink>
          </Column>

          <Column label="つながる">
            <FExt href={site.social.threads}>Threads</FExt>
            <FExt href={site.social.substack}>Substack</FExt>
          </Column>
        </div>

        <div className="mt-16 pt-8 border-t border-hair-line flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="logo-type text-2xl text-ink">{site.name}</p>
            <p className="mt-1 font-mincho text-xs text-sub-gray">
              {site.tagline}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-sub-gray">
            <span>© {year} {site.name}</span>
            <span aria-hidden>·</span>
            <Link href="/privacy" className="hover:text-ink transition-colors">
              プライバシーポリシー
            </Link>
            <span aria-hidden>·</span>
            <Link href="/legal" className="hover:text-ink transition-colors">
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
      <p className="logo-type italic text-[11px] tracking-[0.3em] uppercase text-gold mb-4">
        {label}
      </p>
      <ul className="space-y-2.5 text-[13px] text-ink/80">{children}</ul>
    </div>
  );
}

function FLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="hover:text-gold transition-colors">
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
        className="hover:text-gold transition-colors"
      >
        {children}
      </a>
    </li>
  );
}
