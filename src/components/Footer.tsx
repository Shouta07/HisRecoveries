import Link from "next/link";
import { site } from "@/lib/site";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-40 bg-navy text-white">
      <div className="mx-auto max-w-[1200px] px-6 sm:px-10 py-20 sm:py-24">
        <p className="font-mincho text-white text-[1.0625rem] sm:text-xl leading-[2] max-w-[28rem]">
          後ろから来る人の、
          <br />
          半歩先にだけ届けばいい。
        </p>

        <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-y-12 gap-x-8 text-sm">
          <FooterColumn label="Read">
            <FooterLink href="/articles">記事</FooterLink>
            <FooterLink href="/articles/category/philosophy">
              哲学・思想
            </FooterLink>
            <FooterLink href="/articles/category/hyperhidrosis">
              多汗症
            </FooterLink>
            <FooterLink href="/articles/category/acne">ニキビ</FooterLink>
            <FooterLink href="/articles/category/bromhidrosis">
              ワキガ
            </FooterLink>
            <FooterLink href="/articles/category/face">顔</FooterLink>
          </FooterColumn>

          <FooterColumn label="Gather">
            <FooterLink href="/events">Events</FooterLink>
          </FooterColumn>

          <FooterColumn label="About">
            <FooterLink href="/about">このメディアについて</FooterLink>
            <FooterLink href="/subscribe">Subscribe</FooterLink>
            <FooterExternalLink href={`mailto:${site.email}`}>
              連絡
            </FooterExternalLink>
            <FooterLink href="/feed.xml">Atom Feed</FooterLink>
          </FooterColumn>

          <FooterColumn label="Elsewhere">
            <FooterExternalLink href={site.social.threads}>
              Threads
            </FooterExternalLink>
            <FooterExternalLink href={site.social.x}>X</FooterExternalLink>
            <FooterExternalLink href={site.social.note}>
              note
            </FooterExternalLink>
            <FooterExternalLink href={site.social.substack}>
              Substack
            </FooterExternalLink>
          </FooterColumn>
        </div>

        <div className="mt-20 pt-10 border-t border-white/15">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <p className="logo-type text-3xl sm:text-4xl text-white tracking-wider">
                {site.name}
              </p>
              <p className="mt-2 text-[10px] tracking-[0.3em] text-gold uppercase">
                — {site.tagline} —
              </p>
            </div>
            <p className="logo-type text-[10px] tracking-[0.3em] text-gold uppercase">
              Observed — not proclaimed.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-white/55">
            <span>© {year} {site.name}</span>
            <span aria-hidden>·</span>
            <Link
              href="/privacy"
              className="hover:text-white transition-colors"
            >
              プライバシーポリシー
            </Link>
            <span aria-hidden>·</span>
            <Link
              href="/legal"
              className="hover:text-white transition-colors"
            >
              特定商取引法に基づく表記
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-5">
        {label}
      </p>
      <ul className="space-y-3 text-[13px] text-white/85">{children}</ul>
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link href={href} className="hover:text-gold-bright transition-colors">
        {children}
      </Link>
    </li>
  );
}

function FooterExternalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
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
