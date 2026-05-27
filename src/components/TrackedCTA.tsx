"use client";

import { track, ConversionEvent } from "@/lib/analytics";

type Props = {
  href: string;
  event: ConversionEvent;
  eventProps?: Record<string, string | number | boolean>;
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
};

/**
 * An outbound conversion link that fires a tracked event on click.
 * External hrefs open in a new tab with safe rel.
 */
export default function TrackedCTA({
  href,
  event,
  eventProps,
  className,
  children,
  ariaLabel,
}: Props) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={className}
      aria-label={ariaLabel}
      onClick={() => track(event, eventProps)}
    >
      {children}
    </a>
  );
}
