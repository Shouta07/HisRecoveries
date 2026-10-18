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
/* ══════════════════════════════════════════════════
   送ってよいイベント
   ══════════════════════════════════════════════════

   ── 大半を消した ────────────────────────────────
   ここには80個ほど並んでいた。前の商品のもの。
   診断の各段、回答者の登録、通話の開始と終了、
   パスの消化、A/B の共有、動画の再生。

   どれも、その仕組みごと無くなっている。
   送る側のコードも1つを除いて残っていなかったので、
   「許可されているが、誰も送らないイベント」が79個あった。

   一覧が長いと、何を見て判断しているのかが分からなくなる。

   ── Webで測れるのは、2つだけ ────────────────────
   いまの流れは、途中から Web の外へ出る。

     Web          ここまでは測れる
     LINE         測れない（送ったかどうかは、こちらに届いて初めて分かる）
     Stripe       測れない（管理画面で見る）
     Google Meet  測れない

   だから Web 側は2つに絞る。
     site_landed     どの入口から来たか
     line_cta_click  LINEのボタンが押されたか

   ── クリックを、相談が届いたことにしない ──────────
   いちばんやってはいけないのがこれ。

   ボタンが押された数と、実際に LINE が届いた数は違う。
   押して、友だち追加して、何も書かずに閉じる人がいる。
   そこが落ちているのかどうかを知りたいのに、
   同じ数字にしてしまうと、永久に分からない。

   だから line_cta_click は「押された」までの意味しか持たない。
   届いた数は、運営者が手元で数える（docs/運用メモ.md）。

   ── 相談の中身は、送らない ──────────────────────
   行き先も日程も相談内容も、ここには入れない。
   送るのは、押された場所（props.where）だけ。 */
export const CONVERSION_EVENTS = [
  /* どの入口ページから来たか。1回の来訪につき1回（props: path）。
     都市別ページを足したときに、どこから来ているかを見る。 */
  "site_landed",

  /* LINEのボタンが押された（props: where＝hero / been / pricing / city / final）。
     押されただけ。相談が届いたことにはしない。 */
  "line_cta_click",
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
/**
 * 計測を止めるための鍵（/app の設定から切り替える）。
 *
 * /app の記録そのものは端末の外に出ないので、そこに切るものは無い。
 * 実際に外へ出ているのは、この匿名の行動計測だけ。
 * だから「オフにできます」と書くなら、切れるのはここでなければ嘘になる。
 */
const OPT_OUT_KEY = "hr_no_stats";

export function statsEnabled(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(OPT_OUT_KEY) !== "1";
  } catch {
    return true;
  }
}

export function setStatsEnabled(on: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (on) window.localStorage.removeItem(OPT_OUT_KEY);
    else window.localStorage.setItem(OPT_OUT_KEY, "1");
  } catch {
    /* 保存できない環境では、設定だけ諦める */
  }
}

export function track(event: ConversionEvent, props: Props = {}): void {
  if (typeof window === "undefined") return;
  if (!statsEnabled()) return;

  const attribution = getAttribution();
  const payload: Props = { ...attribution, ...props };
  Object.keys(payload).forEach(
    (k) => payload[k] === undefined && delete payload[k]
  );

  const w = window as unknown as {
    gtag?: (...args: unknown[]) => void;
    plausible?: (name: string, opts?: { props?: Props }) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  };

  /* ── 広告の成果として送る口を、閉じた ──────────────
     ここで purchase_paid を Google 広告と Meta へ
     「購入」として送り直していた。

     いまは Web 上で購入が起きない。
     お支払いは、LINEで対応できることを確かめたあと、
     個別にお送りするリンクで行う。

     Web 側に購入のイベントが無いので、送る先も要らない。
     残しておくと、次に誰かが「購入イベントを足そう」と思ったときに、
     押されただけのクリックを購入として媒体へ送ってしまう。 */
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
