"use client";

import { useState } from "react";
import { complexes } from "@/lib/complexes";
import { site } from "@/lib/site";

const ACCENT = "#3d5638";

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
    const subject = encodeURIComponent("予約登録 — His Recoveries");
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
        "本予約登録にあたり、秘密保持に同意しました。",
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
          _subject: "予約登録 — His Recoveries",
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
    "w-full rounded-2xl border border-[#1f2a1d]/15 bg-white px-4 py-3 text-[16px] text-[#1f2a1d] outline-none focus:border-[#3d5638] transition-colors";
  const label = "block text-[13px] font-semibold text-[#1f2a1d] mb-2";

  // ── Success state — completes entirely on-site ──
  if (status === "success") {
    return (
      <div className="rounded-[1.6rem] border border-[#1f2a1d]/12 bg-[#f4f6f2] p-8 sm:p-10 text-center">
        <div className="mx-auto mb-5 grid place-items-center w-14 h-14 rounded-full bg-[#16241a] text-[#EDF1E8]">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h2 className="text-[1.4rem] font-bold text-[#1f2a1d] mb-3" style={{ fontFamily: "var(--font-shippori), serif" }}>
          ご予約登録を受け付けました。
        </h2>
        <p className="text-[14px] text-[#4b5b47] leading-[1.95] max-w-md mx-auto">
          いただいた内容を確認のうえ、3営業日を目処にご連絡先へ日程調整のご案内をお送りします。
          ご相談・印象診断は匿名のまま。すべて完全守秘義務のもとで扱います。
        </p>
        <p className="mt-5 text-[12px] text-[#6b7a66]">
          ※ 本パッケージは医療行為を含みません。
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
        <p className="mt-1.5 text-[11.5px] text-[#6b7a66] leading-[1.7]">
          実名・顔写真は不要です。ニックネームと、連絡のつくメールアドレスだけで構いません。
        </p>
      </div>

      <div>
        <label className={label} htmlFor="ap-contact">
          ご連絡先（メール / LINE 等） <span style={{ color: ACCENT }}>*</span>
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
          <option value="印象診断セッション（¥22,000）">印象診断セッション（¥22,000・パッケージ申込で全額充当）</option>
          <option value="血液コンディション・チェックの案内（準備中）">血液コンディション・チェックの案内を受けたい（準備中）</option>
          <option value="Recover｜取り戻す（目安 ¥150,000〜）">Recover｜取り戻す（悩みから・目安 ¥150,000〜）</option>
          <option value="Refine｜深める（目安 ¥150,000〜）">Refine｜深める（もう一段・目安 ¥150,000〜）</option>
          <option value="ギフト（大切な人へ贈る）">ギフト（大切な人へ贈る）</option>
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
          <option value="急ぎ（7日以内）">急ぎ（7日以内・大事な日が近い）</option>
          <option value="1ヶ月以内">1ヶ月以内</option>
          <option value="時期は未定">時期は未定・まず相談したい</option>
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

      {/* NDA / confidentiality — mandatory */}
      <div className="rounded-2xl border border-[#1f2a1d]/15 bg-[#f4f6f2] p-5">
        <p className="text-[13px] font-semibold text-[#1f2a1d] mb-2">
          秘密保持について（必須）
        </p>
        <p className="text-[12.5px] text-[#4b5b47] leading-[1.9]">
          お預かりするお名前・連絡先・悩みに関する情報は、本プログラムのご案内と運営の目的に限り、
          厳重に管理します。第三者へ販売・提供することはありません。ご相談の過程で知り得た双方の情報は、
          相互に秘密として扱います。
        </p>
        <label className="mt-4 flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 w-5 h-5 accent-[#3d5638] shrink-0"
            required
          />
          <span className="text-[13.5px] font-medium text-[#1f2a1d] leading-[1.7]">
            秘密保持に同意します。（同意がない場合はご登録いただけません）
          </span>
        </label>
      </div>

      {status === "error" && (
        <p className="text-[13px] text-[#a3402f] bg-[#f7ece9] border border-[#a3402f]/20 rounded-xl px-4 py-3">
          送信に失敗しました。通信環境をご確認のうえ、もう一度お試しください。
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full rounded-full text-white text-[15px] font-semibold px-7 py-4 transition-colors disabled:cursor-not-allowed"
        style={{ backgroundColor: canSubmit ? "#1f2a1d" : "#9aa79a" }}
      >
        {status === "submitting"
          ? "送信中…"
          : agreed
          ? "無料相談を送る"
          : "秘密保持に同意すると送信できます"}
      </button>

      <p className="text-[11.5px] text-[#6b7a66] leading-[1.8]">
        ※ 無料相談を受付中です。目安：3営業日以内に一次のご連絡をします。
        本パッケージは医療行為を含みません。
      </p>
    </form>
  );
}
