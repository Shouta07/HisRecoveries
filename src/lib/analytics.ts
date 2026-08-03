// Lightweight, provider-agnostic analytics + attribution layer.
// Page-view tracking is handled by whichever provider script is loaded
// (GA4 / Plausible). This module adds first-touch UTM attribution and a
// single track() entry point for conversion events.

/**
 * 送ってよいイベントの一覧。
 *
 * 以前はこの型と /api/event 側の許可リストが別々に書かれていて、
 * 片方に足しただけのイベントが全部 400 で捨てられていた。
 * 計測を足したつもりで何も記録されていない、がいちばん高くつくので、
 * 一覧をここに1本化し、型もサーバの検証もここから導く。
 */
export const CONVERSION_EVENTS = [
  "gathering_apply", // クリック: Quiet Gatherings 応募
  "affiliate_click", // クリック: アフィリエイト送客
  "subscribe_click", // クリック: ニュースレター購読
  "reflect_complete", // 完了: 整理フロー(Reflect)
  "hero_cta_click", // クリック: ヒーロー CTA
  "assessment_start", // 開始: Recovery Assessment
  "assessment_complete", // 完了: Recovery Assessment
  "article_cta_click", // クリック: 記事下 CTA
  "story_start", // 開始: Story 投稿フォーム
  "story_submitted", // 完了: Story 投稿
  "membership_subscribe_click", // クリック: Recovery Letters 購読

  // ── 市場検証（6領域のどれが勝てるかを見極めるための3点計測） ──
  // すべて props.market に領域ID（impression/hair/skin/face/body-hair/mind）を持たせる。
  "market_select", // 需要: 診断で「この悩みがある」と選ばれた
  "market_view", // 関心: その領域の記事・ピラーを読んだ
  "market_consult_click", // 意向: その領域の文脈から相談へ進んだ

  // ── ゴール起点 ──
  "goal_select", // 目的の日を選んだ（props: goal, days）
  "goal_step_done", // ロードマップの1ステップを完了（props: goal, step）

  // ── 診断ファネル（/check）──
  // 記事 → 診断 → 結果 → 次、の各段を1つずつ計測する。
  // どこで落ちているか分からないまま投稿を増やしても、率は動かない。
  "check_open", // 診断ページへの導線をクリック（props: from）
  "check_start", // 1問目に答えた
  "check_abandon", // 途中で離脱（props: at＝何問目まで）
  "check_complete", // 結果に到達（props: first, untouched, detailed）
  "check_detail_start", // 任意の13問へ進んだ（精度を上げる側を選んだ）
  "check_article_click", // 結果から記事へ（props: area, slug）
] as const;

export type ConversionEvent = (typeof CONVERSION_EVENTS)[number];

/** サーバ側の検証用。/api/event はこれだけを受け付ける */
export function isConversionEvent(x: unknown): x is ConversionEvent {
  return typeof x === "string" && (CONVERSION_EVENTS as readonly string[]).includes(x);
}

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
 * Also forwards a stripped copy to /api/event so it lands in our own DB
 * for the /admin/insights dashboard.
 */
export function track(event: ConversionEvent, props: Props = {}): void {
  if (typeof window === "undefined") return;

  const attribution = getAttribution();
  const payload: Props = { ...attribution, ...props };
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

  // Best-effort post to our own DB. Fire-and-forget.
  try {
    fetch("/api/event", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Attribution": JSON.stringify(attribution),
      },
      body: JSON.stringify({
        event,
        props: { ...props }, // attribution is sent via header
        path: window.location.pathname,
      }),
      keepalive: true,
    }).catch(() => {
      /* ignore */
    });
  } catch {
    /* ignore */
  }
}
