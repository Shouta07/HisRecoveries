import Link from "next/link";
import { site } from "@/lib/site";

/**
 * Editor profile card — the Otonami "ご案内人" pattern adapted for an
 * editorial brand. Names the writer, shows a brief bio, links to /about.
 * The avatar is an abstract SVG monogram (no portrait, by brand rule).
 */
export default function EditorProfile() {
  return (
    <article className="grid grid-cols-[88px_1fr] sm:grid-cols-[112px_1fr] gap-5 sm:gap-7 items-start bg-paper border border-hair-line p-6 sm:p-8">
      <Avatar />
      <div>
        <p className="logo-type italic text-[10px] tracking-[0.4em] uppercase text-gold">
          Edited by
        </p>
        <h3 className="mt-2 font-mincho text-xl sm:text-2xl font-medium leading-[1.4] text-ink">
          {site.author}
        </h3>
        <p className="mt-3 text-[13px] sm:text-sm leading-[1.95] text-sub-gray max-w-[34rem]">
          {site.authorBio}
        </p>
        <Link
          href="/about"
          className="mt-5 inline-flex items-center gap-2 text-[12px] sm:text-[13px] tracking-[0.1em] text-ink border-b border-gold pb-0.5 hover:text-gold transition-colors"
        >
          About the Writer
          <span aria-hidden>→</span>
        </Link>
      </div>
    </article>
  );
}

function Avatar() {
  return (
    <div
      aria-hidden
      className="w-[88px] h-[88px] sm:w-[112px] sm:h-[112px] bg-cream-deep flex items-center justify-center"
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id="avatar-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#221C14" />
            <stop offset="100%" stopColor="#0E0C09" />
          </linearGradient>
          <radialGradient id="avatar-warm" cx="65%" cy="35%" r="55%">
            <stop offset="0%" stopColor="#D9B584" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#0E0C09" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100" height="100" fill="url(#avatar-bg)" />
        <rect width="100" height="100" fill="url(#avatar-warm)" />
        <g transform="translate(50 50)" fill="none" stroke="#D9B584">
          <circle r="34" strokeWidth="0.6" strokeOpacity="0.35" />
          <circle r="24" strokeWidth="0.6" strokeOpacity="0.5" />
          <circle r="14" strokeWidth="0.6" strokeOpacity="0.7" />
          <circle r="4" fill="#D9B584" fillOpacity="0.9" stroke="none" />
        </g>
        <line
          x1="50"
          y1="14"
          x2="50"
          y2="86"
          stroke="#E8DCBF"
          strokeWidth="0.4"
          strokeOpacity="0.18"
        />
        <line
          x1="0"
          y1="62"
          x2="100"
          y2="62"
          stroke="#B89169"
          strokeWidth="0.5"
          strokeOpacity="0.5"
        />
      </svg>
    </div>
  );
}
