// Shared "次の半歩" block. Three CTAs configurable per page so each
// surface points at the most context-appropriate next step without
// duplicating layout/voice across recoveries / experts / services / etc.

import Link from "next/link";
import TrackedCTA from "./TrackedCTA";
import type { ConversionEvent } from "@/lib/analytics";
import { site } from "@/lib/site";

type Variant = "light" | "dark";

type Action = {
  href: string;
  label: string;
  /** "external" opens in a new tab and is rel=noopener; defaults to internal Link. */
  external?: boolean;
  /** track this click via analytics if provided */
  trackEvent?: string;
  trackProps?: Record<string, string | number | boolean | undefined>;
};

type Props = {
  eyebrow?: string;
  title?: string;
  body?: string;
  variant?: Variant;
  primary?: Action;
  secondary?: Action;
  tertiary?: Action;
};

const DEFAULTS = {
  eyebrow: "A Next Half-Step",
  title: "次の半歩",
  body: "自分の状態を観察したい方は Recovery Check へ。日曜日の手紙（Recoveries Letter）も、ここから受け取れます。",
  primary: { href: "/check", label: "Recovery Check を始める" } as Action,
  secondary: {
    href: `${site.social.substack}/subscribe`,
    label: "日曜日の手紙を受け取る",
    external: true,
    trackEvent: "membership_subscribe_click",
  } as Action,
};

function ActionButton({
  action,
  className,
  defaultLocation,
}: {
  action: Action;
  className: string;
  defaultLocation: string;
}) {
  const props =
    action.trackEvent
      ? {
          event: action.trackEvent as ConversionEvent,
          eventProps: { location: defaultLocation, ...(action.trackProps ?? {}) },
        }
      : null;
  if (action.external && props) {
    return (
      <TrackedCTA href={action.href} className={className} {...props}>
        {action.label}
        {" "}
        <span aria-hidden>→</span>
      </TrackedCTA>
    );
  }
  if (action.external) {
    return (
      <a
        href={action.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {action.label} <span aria-hidden>→</span>
      </a>
    );
  }
  if (props) {
    return (
      <TrackedCTA href={action.href} className={className} {...props}>
        {action.label} <span aria-hidden>→</span>
      </TrackedCTA>
    );
  }
  return (
    <Link href={action.href} className={className}>
      {action.label} <span aria-hidden>→</span>
    </Link>
  );
}

export default function NextStepBlock({
  eyebrow = DEFAULTS.eyebrow,
  title = DEFAULTS.title,
  body = DEFAULTS.body,
  variant = "light",
  primary = DEFAULTS.primary,
  secondary = DEFAULTS.secondary,
  tertiary,
}: Props) {
  const isDark = variant === "dark";
  const bg = isDark
    ? "border-t border-hair-line bg-navy text-cream"
    : "border-t border-hair-line bg-cream-deep";
  const eye = isDark ? "text-gold-bright" : "text-gold";
  const text = isDark ? "text-cream/85" : "text-ink/85";
  const secondaryClass = isDark
    ? "text-sm tracking-[0.12em] text-cream border border-cream/40 hover:border-gold-bright hover:text-gold-bright transition-colors px-6 py-3.5 text-center"
    : "text-sm tracking-[0.12em] text-ink border border-ink/40 hover:border-gold hover:text-gold transition-colors px-6 py-3.5 text-center";

  return (
    <section className={bg}>
      <div className="mx-auto max-w-[1000px] px-6 sm:px-10 py-14 sm:py-20 text-center">
        <p
          className={`logo-type italic text-[11px] tracking-[0.4em] uppercase ${eye}`}
        >
          {eyebrow}
        </p>
        <h2
          className={`mt-4 font-mincho text-xl sm:text-[1.7rem] leading-[1.5] ${
            isDark ? "text-cream" : "text-ink"
          }`}
        >
          {title}
        </h2>
        <p className={`mt-4 font-mincho text-[14px] leading-[2.05] max-w-[34rem] mx-auto ${text}`}>
          {body}
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
          <ActionButton
            action={primary}
            className="btn-gold justify-center"
            defaultLocation="next_step_primary"
          />
          <ActionButton
            action={secondary}
            className={secondaryClass}
            defaultLocation="next_step_secondary"
          />
          {tertiary && (
            <ActionButton
              action={tertiary}
              className={secondaryClass}
              defaultLocation="next_step_tertiary"
            />
          )}
        </div>
      </div>
    </section>
  );
}
