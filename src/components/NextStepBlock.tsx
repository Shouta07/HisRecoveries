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
  const bg = isDark ? "bg-zinc-900 text-white" : "bg-white";
  const eye = isDark ? "text-zinc-500" : "text-zinc-400";
  const text = isDark ? "text-zinc-400" : "text-zinc-500";
  const primaryClass = isDark
    ? "inline-flex items-center justify-center gap-2 rounded-full bg-white text-zinc-900 text-[15px] font-bold px-6 py-3.5 hover:bg-zinc-200 transition-colors"
    : "inline-flex items-center justify-center gap-2 rounded-full bg-zinc-900 text-white text-[15px] font-bold px-6 py-3.5 hover:bg-zinc-700 transition-colors";
  const secondaryClass = isDark
    ? "inline-flex items-center justify-center gap-2 rounded-full border border-zinc-600 text-white text-[15px] font-bold px-6 py-3.5 hover:border-zinc-400 transition-colors"
    : "inline-flex items-center justify-center gap-2 rounded-full bg-zinc-100 text-zinc-900 text-[15px] font-bold px-6 py-3.5 hover:bg-zinc-200 transition-colors";

  return (
    <section className={bg}>
      <div className="mx-auto max-w-[1000px] px-6 sm:px-10 py-16 sm:py-24 text-center">
        <p className={`text-[13.5px] font-bold tracking-[0.08em] uppercase ${eye}`}>
          {eyebrow}
        </p>
        <h2
          className={`mt-3 text-[1.5rem] sm:text-[2rem] font-bold leading-[1.35] ${
            isDark ? "text-white" : "text-zinc-900"
          }`}
        >
          {title}
        </h2>
        <p className={`mt-4 text-[15px] leading-[2] max-w-[34rem] mx-auto ${text}`}>
          {body}
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
          <ActionButton
            action={primary}
            className={primaryClass}
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
