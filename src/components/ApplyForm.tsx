"use client";

import { useState } from "react";
import { complexes } from "@/lib/complexes";
import { site } from "@/lib/site";

const ACCENT = "#8A6A3B";

// Formspree form id (the hashid in formspree.io/f/XXXX). Ships with a working
// default so submissions complete on-site out of the box; override in Vercel
// via NEXT_PUBLIC_FORMSPREE_ID if the endpoint ever changes.
const FORMSPREE_ID = process.env.NEXT_PUBLIC_FORMSPREE_ID ?? "xnjkvzgk";
const ENDPOINT = FORMSPREE_ID ? `https://formspree.io/f/${FORMSPREE_ID}` : "";

type Status = "idle" | "submitting" | "success" | "error";

export default function ApplyForm() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [menu, setMenu] = useState("");
  const [timing, setTiming] = useState("");
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<Status>("idle");

  const canSubmit = !!(name.trim() && contact.trim() && agreed) && status !== "submitting";

  function mailtoFallback() {
    const subject = encodeURIComponent("無料相談 — His Recoveries");
    const body = encodeURIComponent(
      [
        `お名前: ${name}`,
        `ご連絡先: ${contact}`,
        `ご希望: ${menu || "未選択"}`,
        `希望時期: ${timing || "未選択"}`,
        `気になる悩み: ${topic || "未選択"}`,
        "",
        "ご相談内容:",
        message || "（未記入）",
        "",
        "── 秘密保持への同意 ──",
        "本相談にあたり、秘密保持に同意しました。",
      ].join("\n")
    );
    window.location.href = `mailto:${site.company.email}?subject=${subject}&body=${body}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    // No endpoint configured yet → keep working via mailto.
    if (!ENDPOINT) {
      mailtoFallback();
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          お名前: name,
          ご連絡先: contact,
          email: contact, // reply-to if it's an email address
          ご希望: menu || "未選択",
          希望時期: timing || "未選択",
          気になる悩み: topic || "未選択",
          ご相談内容: message || "（未記入）",
          秘密保持への同意: "同意済み",
          _subject: "無料相談 — His Recoveries",
        }),
      });
      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  const field =
    "w-full rounded-2xl border border-[#1F1E1B]/15 bg-white px-4 py-3 text-[16px] text-[#1F1E1B] outline-none focus:border-[#8A6A3B] transition-colors";
  const label = "block text-[14.5px] font-semibold text-[#1F1E1B] mb-2";

  // ── Success state — completes entirely on-site ──
  if (status === "success") {
    return (
      <div className="rounded-[1.6rem] border border-[#1F1E1B]/12 bg-[#F3F0EA] p-8 sm:p-10 text-center">
        <div className="mx-auto mb-5 grid place-items-center w-14 h-14 rounded-full bg-[#2C3A2E] text-[#F3F0EA]">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h2 className="text-[1.4rem] font-bold text-[#1F1E1B] mb-3" style={{ fontFamily: "var(--font-shippori), serif" }}>
          ご相談を受け付けました。
        </h2>
        <p className="text-[15px] text-[#45443E] leading-[1.95] max-w-md mx-auto">
          いただいた内容を確認のうえ、3営業日を目処にご連絡先へご返信します。
          まずは、合うかどうかを一緒に確かめるところから。合わないと思えば、正直にそうお伝えします。
        </p>
        <p className="mt-5 text-[13.5px] text-[#5E6A70]">
          ※ この時点で費用は発生しません。医療行為は含みません。
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className={label} htmlFor="ap-name">
          お名前 <span style={{ color: ACCENT }}>*</span>
        </label>
        <input
          id="ap-name"
          className={field}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="山田 太郎（ニックネーム可）"
          required
        />
        <p className="mt-1.5 text-[12.5px] text-[#5E6A70] leading-[1.7]">
          実名・顔写真は不要です。ニックネームと、連絡のつくメールアドレスだけで構いません。
        </p>
      </div>

      <div>
        <label className={label} htmlFor="ap-contact">
          ご連絡先（メール等） <span style={{ color: ACCENT }}>*</span>
        </label>
        <input
          id="ap-contact"
          className={field}
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="you@example.com"
          required
        />
      </div>

      <div>
        <label className={label} htmlFor="ap-menu">
          ご希望のメニュー
        </label>
        <select
          id="ap-menu"
          className={field}
          value={menu}
          onChange={(e) => setMenu(e.target.value)}
        >
          <option value="">選択してください（任意）</option>
          <option value="まずは相談だけ（無料）">まずは相談だけ（無料）</option>
          <option value="第一印象改善プラン（30日）について聞きたい">第一印象改善プラン（30日）について聞きたい</option>
          <option value="法人向け研修について聞きたい">法人向け研修について聞きたい</option>
        </select>
      </div>

      <div>
        <label className={label} htmlFor="ap-timing">
          ご希望の時期
        </label>
        <select
          id="ap-timing"
          className={field}
          value={timing}
          onChange={(e) => setTiming(e.target.value)}
        >
          <option value="">選択してください（任意）</option>
          <option value="1ヶ月後に、大事な日がある">1ヶ月後に、大事な日がある</option>
          <option value="2〜3ヶ月後に、大事な日がある">2〜3ヶ月後に、大事な日がある</option>
          <option value="特に予定はないが、整えたい">特に予定はないが、整えたい</option>
          <option value="時期は未定・まず相談したい">時期は未定・まず相談したい</option>
        </select>
      </div>

      <div>
        <label className={label} htmlFor="ap-topic">
          気になる悩み
        </label>
        <select
          id="ap-topic"
          className={field}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        >
          <option value="">選択してください（任意）</option>
          {complexes.map((c) => (
            <option key={c.id} value={c.ja}>
              {c.ja}
            </option>
          ))}
          <option value="その他・まだ言葉にできない">その他・まだ言葉にできない</option>
        </select>
      </div>

      <div>
        <label className={label} htmlFor="ap-message">
          ひとこと（任意）
        </label>
        <textarea
          id="ap-message"
          className={`${field} min-h-[120px] resize-y`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="いまの状況や、相談したいことがあれば。"
        />
      </div>

      {/* 秘密保持 — 必須同意 */}
      <div className="rounded-2xl border border-[#1F1E1B]/15 bg-[#F3F0EA] p-5">
        <p className="text-[14.5px] font-semibold text-[#1F1E1B] mb-2">
          秘密保持について（必須）
        </p>
        <p className="text-[14px] text-[#45443E] leading-[1.9]">
          お預かりするお名前・連絡先・悩みに関する情報は、ご相談への対応と運営の目的に限り、
          厳重に管理します。第三者へ販売・提供することはありません。ご相談の過程で知り得た双方の情報は、
          相互に秘密として扱います。
        </p>
        <label className="mt-4 flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 w-5 h-5 accent-[#8A6A3B] shrink-0"
            required
          />
          <span className="text-[15px] font-medium text-[#1F1E1B] leading-[1.7]">
            秘密保持に同意します。（同意がない場合は送信いただけません）
          </span>
        </label>
      </div>

      {status === "error" && (
        <p className="text-[14.5px] text-[#8C5A47] bg-[#F2EBE6] border border-[#8C5A47]/20 rounded-xl px-4 py-3">
          送信に失敗しました。通信環境をご確認のうえ、もう一度お試しください。
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full rounded-full text-white text-[15px] font-semibold px-7 py-4 transition-colors disabled:cursor-not-allowed"
        style={{ backgroundColor: canSubmit ? "#1F1E1B" : "#5E6A70" }}
      >
        {status === "submitting"
          ? "送信中…"
          : agreed
          ? "無料相談を送る"
          : "秘密保持に同意すると送信できます"}
      </button>

      <p className="text-[12.5px] text-[#5E6A70] leading-[1.8]">
        ※ ご相談は無料です。目安：3営業日以内に一次のご連絡をします。
        お取り扱いは第一印象改善プラン（30日）1本のみで、医療行為は含みません。
        費用はご相談のうえで個別にお見積りします。LINEはお申し込み後のご連絡に使います。
      </p>
    </form>
  );
}
