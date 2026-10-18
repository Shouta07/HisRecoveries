"use client";

import Script from "next/script";
import { useEffect } from "react";
import { captureUtm, track } from "@/lib/analytics";

// Ships with the live GA4 tag so measurement works out of the box;
// override in Vercel via NEXT_PUBLIC_GA_ID if the ID ever changes.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-DWTE9DWQ0S";
const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

/**
 * Loads whichever analytics provider is configured via env, and captures
 * first-touch UTM attribution on mount. Nothing loads if no env is set,
 * so local/dev builds stay clean.
 */
export default function Analytics() {
  useEffect(() => {
    captureUtm();

    /* ── どの入口から来たかを、1回だけ送る ──────────────
       都市別ページを足していくと、検索から最初に着く面が
       トップとは限らなくなる。

       どの面から入った人が LINE のボタンを押しているのかが
       分からないと、どの都市のページを増やすかを決められない。

       1回の来訪につき1回。面を移るたびには送らない
       （率の分母が壊れる）。

       送るのは道のり（path）だけ。
       ?q= のような、相談の中身が入りうるものは落とす。 */
    try {
      const KEY = "hr_landed";
      if (!sessionStorage.getItem(KEY)) {
        sessionStorage.setItem(KEY, "1");
        track("site_landed", { path: window.location.pathname });
      }
    } catch {
      /* プライベートブラウズなどで sessionStorage が使えないことがある。
         計測のために、面の表示を止めない。 */
    }
  }, []);

  return (
    <>
      {GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}', { anonymize_ip: true });
            `}
          </Script>
        </>
      )}

      {PLAUSIBLE_DOMAIN && (
        <Script
          defer
          data-domain={PLAUSIBLE_DOMAIN}
          src="https://plausible.io/js/script.tagged-events.js"
          strategy="afterInteractive"
        />
      )}
    </>
  );
}
