// Lightweight, provider-agnostic analytics + attribution layer.
// Page-view tracking is handled by whichever provider script is loaded
// (GA4 / Plausible). This module adds first-touch UTM attribution and a
// single track() entry point for conversion events.

export type ConversionEvent =
  | "gathering_apply" // クリック: Quiet Gatherings 応募
  | "affiliate_click" // クリック: アフィリエイト送客
  | "subscribe_click" // クリック: ニュースレター購読
  | "reflect_complete"; // 完了: 整理フロー(Reflect)

type Props = Record<string, string | number | boolean | undefined>;

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

const STORAGE_KEY = "hr_first_touch";

/**
 * Capture first-touch UTM parameters once per session. Stored in
 * sessionStorage so they can be attached to later conversion events —
 * this is what lets us attribute a Gatherings apply back to Threads.
 */
export function captureUtm(): void {
  if (typeof window === "undefined") return;
  try {
    if (sessionStorage.getItem(STORAGE_KEY)) return; // first-touch only
    const params = new URLSearchParams(window.location.search);
    const hasUtm = UTM_KEYS.some((k) => params.has(k));

    const data: Record<string, string> = {
      landing_path: window.location.pathname,
      first_seen: new Date().toISOString(),
    };
    UTM_KEYS.forEach((k) => {
      const v = params.get(k);
      if (v) data[k] = v;
    });

    // Infer source from referrer when no explicit UTM is present
    if (!hasUtm && document.referrer) {
      try {
        const ref = new URL(document.referrer);
        if (ref.hostname !== window.location.hostname) {
          data.referrer_host = ref.hostname;
          if (/threads\.net$/.test(ref.hostname)) data.utm_source = "threads";
          else if (/(twitter|x)\.com$/.test(ref.hostname)) data.utm_source = "x";
          else if (/instagram\.com$/.test(ref.hostname))
            data.utm_source = "instagram";
        }
      } catch {
        /* ignore malformed referrer */
      }
    }

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* sessionStorage unavailable (private mode etc.) — skip silently */
  }
}

export function getAttribution(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

/**
 * Fire a conversion event to every analytics provider that is present.
 * Attribution (first-touch UTM) is merged in automatically.
 */
export function track(event: ConversionEvent, props: Props = {}): void {
  if (typeof window === "undefined") return;

  const payload: Props = { ...getAttribution(), ...props };
  // strip undefined for cleaner payloads
  Object.keys(payload).forEach(
    (k) => payload[k] === undefined && delete payload[k]
  );

  const w = window as unknown as {
    gtag?: (...args: unknown[]) => void;
    plausible?: (name: string, opts?: { props?: Props }) => void;
    dataLayer?: unknown[];
  };

  if (typeof w.gtag === "function") {
    w.gtag("event", event, payload);
  }
  if (typeof w.plausible === "function") {
    w.plausible(event, { props: payload });
  }
  if (Array.isArray(w.dataLayer)) {
    w.dataLayer.push({ event, ...payload });
  }
}
