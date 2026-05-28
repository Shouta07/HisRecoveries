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
          className="mt-5 inline-flex items-center gap-2 text-[12px] sm:text-[13px] tracking-[0.1em] text-navy border-b border-gold pb-0.5 hover:text-gold transition-colors"
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
            <stop offset="0%" stopColor="#DDCBA8" />
            <stop offset="100%" stopColor="#B59E7C" />
          </linearGradient>
          <radialGradient id="avatar-warm" cx="70%" cy="30%" r="55%">
            <stop offset="0%" stopColor="#E8D7B1" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#DDCBA8" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100" height="100" fill="url(#avatar-bg)" />
        <rect width="100" height="100" fill="url(#avatar-warm)" />
        <g transform="translate(50 50)" fill="none" stroke="#9F7944">
          <circle r="34" strokeWidth="0.6" strokeOpacity="0.4" />
          <circle r="24" strokeWidth="0.6" strokeOpacity="0.55" />
          <circle r="14" strokeWidth="0.6" strokeOpacity="0.75" />
          <circle r="4" fill="#9F7944" fillOpacity="0.8" stroke="none" />
        </g>
        <line
          x1="50"
          y1="14"
          x2="50"
          y2="86"
          stroke="#3D2E1F"
          strokeWidth="0.4"
          strokeOpacity="0.22"
        />
        <line
          x1="0"
          y1="62"
          x2="100"
          y2="62"
          stroke="#9F7944"
          strokeWidth="0.5"
          strokeOpacity="0.45"
        />
      </svg>
    </div>
  );
}
