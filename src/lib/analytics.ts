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
  "affiliate_click", // クリック: アフィリエイト送客
  "hero_cta_click", // クリック: ヒーロー CTA
  "article_cta_click", // クリック: 記事下 CTA

  // ── 市場検証（6領域のどれが勝てるかを見極めるための3点計測） ──
  // すべて props.market に領域ID（impression/hair/skin/face/body-hair/mind）を持たせる。

  // ── ゴール起点 ──

  // ── 診断ファネル（/check）──
  // 記事 → 診断 → 結果 → 次、の各段を1つずつ計測する。
  // どこで落ちているか分からないまま投稿を増やしても、率は動かない。
  // 保存・共有されたリンク（?r=）から結果を開いた。答えてはいない。
  // check_complete と混ぜると、1回共有されるたびに完了が増えて率が壊れる。
  // ここが伸びていれば、結果が人に渡っているということ。

  // ── 取材 ──
  // 街頭ではなく、診断を終えた直後に置いている。
  // ここが伸びるかどうかで、取材の入口として成立しているかが分かる。

  // ── 行動（RECOVER）──
  // 追いたいのは「診断した人のうち、何人が実際に動いたか」。
  // 外したときも送る。送らないと、動いた数が実際より多く出る。
  // 満足度。1〜4。「やったか」だけでは次に何を勧めるかが決まらない。
  // 一度使った人が、トップから続きに戻った。
  // ここが動くかどうかで、再訪が「読み物」ではなく「道具」として
  // 起きているかが分かる。

  // ── v2（Relationship Companion / /app）──
  // §22 のKPIに直接対応させる。PVは追わない。
  // 記録したか、続いているか、どの段階で止まるか。
  // ── トップページ → /app の導線 ──
  // 追いたいのは「着地した人のうち、何人が最初の1件を残したか」。
  // 滞在時間もPVも追わない。

  // 記録の入口と出口を別々に取る。
  // 始めた数と終えた数が分かれていないと、どこで止まるかが出ない。

  // ── 「女性に聞く」──
  // 追うのは「着地した人のうち、何人が相談を出し、何人が回答を受け取ったか」。
  // 滞在時間もPVも追わない。
  "ask_submitted", // 相談を出した（props: category, plan, ab）
  "ask_blocked", // 扱えない内容で止まった（props: category）— 何を止めているかを見る
  "ask_result_viewed", // 結果を開いた（props: answered, of）
  "respond_opened", // 回答者がリンクを開いた
  "respond_submitted", // 回答者が回答を出した
  "helpful_marked", // 相談者が回答に「役に立った」を付けた（props: helpful）
  "join_submitted", // 回答者として登録した（props: age, attrs＝選んだ属性の数）

  // ── 有料化（Stripe）──
  // 検証したいのは1点だけ。
  // 「ChatGPT が無料で使える時代に、実在の人の反応に金を払うか」。
  // だから無料の利用者数は見ない。見るのは下の5つだけ。
  //   Checkout開始率  plan_viewed → checkout_started
  //   決済完了率      checkout_started → purchase_paid
  //   プラン別購入率  purchase_paid の props.plan の分布
  //   再購入率        purchase_paid の props.nth が 2 以上の割合
  //   返金率          purchase_refunded / purchase_paid
  // ── 6分野のどれが勝てるか（記事側の検証）──
  // すべて props.market に領域ID（impression/hair/skin/face/body-hair/mind）を持たせる。
  "market_select", // 需要: その悩みがあると選ばれた
  "market_view", // 関心: その領域の記事を読んだ
  "market_consult_click", // 意向: その領域の文脈から相談へ進んだ

  // 購入までの分母。1回の来訪につき1回だけ送る（props: path）。
  // これが無いと、率の分母が広告の管理画面のクリック数しか無くなり、
  // 「出稿を増やすか止めるか」を自分の数字で決められない。
  "site_landed",
  "plan_viewed", // 料金を見た（props: from＝どこから）
  "plan_selected", // プランを選び直した（props: plan, from）
  "checkout_started", // 決済画面へ送った（props: plan）
  "checkout_blocked", // 決済を開始できなかった（props: plan, why）— 法令・設定の不足を見る
  "checkout_abandoned", // 決済画面から戻ってきた（props: plan）
  // 支払い済みの画面に到達した。確定は Webhook 側なので、
  // ここは「利用者が完了まで進んだ」の意味に限る（props: plan, nth）
  "purchase_paid",
  "purchase_refunded", // 返金された（props: plan）

  // ── 届くまで・そのあと ──
  // いちばん知りたいのは「結果を見た人が、次に何を選ぶか」。
  // 押し売りにしないぶん、ここが伸びるかどうかで
  // 次の商品が要るものかどうかが分かる。
  "live_opened", // 届くまでの画面を開いた（props: plan）
  "live_completed", // 全員そろうまで見ていた（props: n）
  "next_step_picked", // 結果のあとに次を選んだ（props: step）
  // 道のりの段を押して、その場で場面を開いた（props: step）。
  // ここが伸びてCTAが伸びないなら、見せている場面が弱い。
  "step_opened",
  "assist_opened", // うまく書けない、から整理へ入った（props: from）
  "starter_used", // 書き出しを押して入力欄を埋めた（props: category）
  "outcome_recorded", // その後どうなったかを教えてもらった（props: outcome）
  "assist_done", // 整理して質問ができた（props: n＝答えた設問数）
  "talk_waitlist", // 話す商品の順番待ちに登録した
  // 声で話す商品。決済から通話までの、どこで落ちるかを見る。
  "call_joined", // 通話に入れた（props: plan）
  "call_ended", // 通話が終わった（props: plan, reason）
  "call_rated", // 終わったあとの振り返りを出した（props: rating）
  // 5回パス。買った回数のうち、何回目で離れるかを見る。
  "pass_used", // 1回ぶんを使った（props: remaining）
  "pass_empty", // 使い切った画面を見た
  "responder_available", // 回答者が「今、答えられる」を切り替えた（props: on）
  // 案件を自分で取った。ここが伸びないなら、配る仕組みが要る。
  "invite_claimed",
  // 集まらなかったときに何を選んだか。供給が足りない度合いが出る。
  "shortfall_picked", // 足りないときの選択（props: choice, got, of）

  // ── 広がり ──
  // 相談する側は人に言わない（使う瞬間が恥ずかしい瞬間なので）。
  // 言えるのは A/B の結果だけ。回答する側は言える。
  // どちらがどれだけ回るかを、別々に見る。
  "share_created", // A/B の共有リンクを作った
  "share_sent", // 実際に渡した（props: how）
  "share_opened", // 共有された側が開いた
  "invite_opened", // 紹介リンクから回答者の登録を開いた
  "invite_joined", // 紹介から登録した

  // ── 恋愛プロセスとして続いているか ──
  // 単発の相談の集合ではなく、同じ相手について続けて使われているか。
  // ここが伸びないなら、道具箱のままということ。
  "step_picked", // いまどこで悩んでいるかを選んだ（props: step）
  "continue_picked", // 前回の続きとして相談した（props: n＝何回目）
  "thread_started", // 同じ相手としてまとめ始めた
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

  if (typeof w.gtag === "function") {
    w.gtag("event", event, payload);
    // 購入だけは、媒体が成果として読める形でもう一度送る。
    // 独自名のイベントは媒体の最適化に使われない。
    if (event === "purchase_paid") {
      const label = process.env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL;
      const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
      if (adsId && label) {
        w.gtag("event", "conversion", {
          send_to: `${adsId}/${label}`,
          value: props.value,
          currency: "JPY",
          transaction_id: props.token ?? undefined,
        });
      }
    }
  }
  if (event === "purchase_paid" && typeof w.fbq === "function") {
    w.fbq("track", "Purchase", { value: props.value, currency: "JPY" });
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
