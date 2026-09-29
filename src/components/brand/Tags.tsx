"use client";

import Script from "next/script";
import { statsEnabled } from "@/lib/analytics";

// 広告と解析のタグ。
//
// ── なぜ要るか ────────────────────────────────────
// track() は gtag と fbq があれば呼ぶ作りになっていたのに、
// それを読み込むところが無かった。つまり媒体には成果が1件も
// 渡っていない。媒体は受け取った成果で配信を寄せるので、
// 渡さないかぎり、出稿を増やしても効率は上がらない。
//
// ── 入れた鍵の分だけ動く ──────────────────────────
// 環境変数が無いものは読み込まない。空のタグを置かない。
//   NEXT_PUBLIC_GA_ID                     GA4（G-…）
//   NEXT_PUBLIC_GOOGLE_ADS_ID             Google 広告（AW-…）
//   NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL 購入のラベル（AW-…/… の後ろ）
//   NEXT_PUBLIC_META_PIXEL_ID             Meta ピクセル
//
// ── 断った人には入れない ──────────────────────────
// statsEnabled() が false なら何も読み込まない。
// 読み込んでから送らない、では意味がない（読み込みで足が付く）。
//
// ── 鍵はリポジトリに置かない ──────────────────────
// どれも公開値だが、環境ごとに違う。Vercel の環境変数に入れる。

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";
export const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID ?? "";
export const META_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";

export default function Tags() {
  if (!statsEnabled()) return null;

  const google = [GA_ID, ADS_ID].filter(Boolean);

  return (
    <>
      {google.length > 0 && (
        <>
          <Script
            id="gtag-src"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${google[0]}`}
          />
          <Script id="gtag-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              ${google.map((id) => `gtag('config', '${id}');`).join("\n              ")}
            `}
          </Script>
        </>
      )}

      {META_ID && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
            n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
            document,'script','https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${META_ID}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}
    </>
  );
}
