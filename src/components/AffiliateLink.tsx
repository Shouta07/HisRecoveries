"use client";

import { track } from "@/lib/analytics";

type Props = {
  href: string;
  product: string;
  className?: string;
  children: React.ReactNode;
};

/**
 * Outbound affiliate link. Uses rel="sponsored" per Google guidance,
 * tracks the click as an affiliate_click conversion (with first-touch
 * attribution), and always opens in a new tab.
 */
export default function AffiliateLink({
  href,
  product,
  className,
  children,
}: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="sponsored nofollow noopener noreferrer"
      className={className}
      onClick={() => track("affiliate_click", { product, url: href })}
    >
      {children}
    </a>
  );
}
