"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";
import { site } from "@/lib/site";

// The finisher passes the place on — not their answers. UTM-tagged so
// /admin attribution can see shares that convert into new Checks.
const SHARE_URL = `${site.url}/?utm_source=share&utm_medium=social&utm_campaign=check_complete`;
const SHARE_TEXT =
  "誰にも言えない悩みを、ひとりで検索していた。His Recoveries は、その検索の先にある場所。";

export default function ShareCheck() {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${SHARE_TEXT}\n${SHARE_URL}`);
      setCopied(true);
      track("subscribe_click", { location: "check_complete_share", channel: "copy" });
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const threads = `https://www.threads.net/intent/post?text=${encodeURIComponent(
    `${SHARE_TEXT}\n${SHARE_URL}`
  )}`;
  const x = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    SHARE_TEXT
  )}&url=${encodeURIComponent(SHARE_URL)}`;

  return (
    <div className="mt-10 pt-8 border-t border-hair-line">
      <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-3">
        Pass it on
      </p>
      <p className="font-mincho text-[15px] text-ink/85 leading-[2.05]">
        この場所を、まだ言葉にできていない誰かに。
        あなたの観察の中身は、共有されません。
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <a
          href={threads}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            track("subscribe_click", {
              location: "check_complete_share",
              channel: "threads",
            })
          }
          className="text-[14.5px] tracking-[0.1em] text-ink border border-hair-line hover:border-gold hover:text-gold transition-colors px-4 py-2.5"
        >
          Threads で渡す
        </a>
        <a
          href={x}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            track("subscribe_click", {
              location: "check_complete_share",
              channel: "x",
            })
          }
          className="text-[14.5px] tracking-[0.1em] text-ink border border-hair-line hover:border-gold hover:text-gold transition-colors px-4 py-2.5"
        >
          X で渡す
        </a>
        <button
          type="button"
          onClick={onCopy}
          className="text-[14.5px] tracking-[0.1em] text-ink border border-hair-line hover:border-gold hover:text-gold transition-colors px-4 py-2.5"
        >
          {copied ? "コピーしました" : "リンクをコピー"}
        </button>
      </div>
    </div>
  );
}
