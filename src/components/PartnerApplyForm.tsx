"use client";

// 提携申し込みフォーム（B2B・決裁者向け）。/partner LP 専用。
// 送信は Formspree、未設定時は mailto フォールバック。個人プロ向けの
// PartnerForm とは別物（施設・院長・エリアなど B2B 項目）。
import { useState } from "react";
import { site } from "@/lib/site";

const FORMSPREE_ID = process.env.NEXT_PUBLIC_FORMSPREE_ID ?? "xnjkvzgk";
const ENDPOINT = FORMSPREE_ID ? `https://formspree.io/f/${FORMSPREE_ID}` : "";

type Status = "idle" | "submitting" | "success" | "error";

const CATEGORIES = [
  "美容皮膚科",
  "AGA・薄毛クリニック",
  "医療脱毛",
  "脱毛サロン",
  "眉毛・アイブロウ",
  "メンズ美容・エステ",
  "ジム・トレーニング",
  "その他",
];

export default function PartnerApplyForm() {
  const [facility, setFacility] = useState("");
  const [person, setPerson] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("");
  const [area, setArea] = useState("");
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const canSubmit = !!(facility.trim() && person.trim() && email.trim()) && status !== "submitting";

  function mailtoFallback() {
    const subject = encodeURIComponent("提携申し込み — His Recoveries Partner");
    const body = encodeURIComponent(
      [
        `施設名: ${facility}`,
        `ご担当者: ${person}`,
        `役職: ${role || "（未記入）"}`,
        `メール: ${email}`,
        `カテゴリ: ${category || "未選択"}`,
        `エリア: ${area || "（未記入）"}`,
        `施設URL: ${url || "（未記入）"}`,
        "",
        "メッセージ:",
        message || "（未記入）",
      ].join("\n"),
    );
    window.location.href = `mailto:${site.company.email}?subject=${subject}&body=${body}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
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
          施設名: facility,
          ご担当者: person,
          役職: role || "（未記入）",
          email,
          カテゴリ: category || "未選択",
          エリア: area || "（未記入）",
          施設URL: url || "（未記入）",
          メッセージ: message || "（未記入）",
          _subject: "提携申し込み — His Recoveries Partner",
        }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  const field =
    "w-full rounded-2xl border border-[#1f2a1d]/12 bg-white px-4 py-3 text-[15px] text-[#1f2a1d] outline-none focus:border-[#3d5638] transition-colors";
  const label = "block text-[13px] font-semibold text-[#1f2a1d] mb-2";

  if (status === "success") {
    return (
      <div className="rounded-[1.6rem] border border-[#1f2a1d]/10 bg-white p-8 sm:p-10 text-center">
        <div className="mx-auto mb-5 grid place-items-center w-14 h-14 rounded-full bg-[#16241a] text-[#EDF1E8]">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h2 className="text-[1.4rem] font-bold text-[#1f2a1d] mb-3">受け付けました。</h2>
        <p className="text-[14px] text-[#4b5b47] leading-[1.95] max-w-md mx-auto">
          エリア・カテゴリの空き状況を確認のうえ、担当より2営業日以内にご連絡します。
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={label} htmlFor="pa-facility">施設名 <span className="text-[#3d5638]">*</span></label>
          <input id="pa-facility" className={field} value={facility} onChange={(e) => setFacility(e.target.value)} placeholder="◯◯クリニック / ◯◯サロン" required />
        </div>
        <div>
          <label className={label} htmlFor="pa-person">ご担当者名 <span className="text-[#3d5638]">*</span></label>
          <input id="pa-person" className={field} value={person} onChange={(e) => setPerson(e.target.value)} placeholder="山田 太郎" required />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={label} htmlFor="pa-role">役職</label>
          <input id="pa-role" className={field} value={role} onChange={(e) => setRole(e.target.value)} placeholder="院長 / 決裁ご担当" />
        </div>
        <div>
          <label className={label} htmlFor="pa-email">メール <span className="text-[#3d5638]">*</span></label>
          <input id="pa-email" type="email" className={field} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@clinic.jp" required />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={label} htmlFor="pa-category">カテゴリ</label>
          <select id="pa-category" className={field} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">選択してください</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="pa-area">エリア</label>
          <input id="pa-area" className={field} value={area} onChange={(e) => setArea(e.target.value)} placeholder="東京都渋谷区 など" />
        </div>
      </div>
      <div>
        <label className={label} htmlFor="pa-url">施設サイトURL</label>
        <input id="pa-url" className={field} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
      </div>
      <div>
        <label className={label} htmlFor="pa-message">ひとこと（任意）</label>
        <textarea id="pa-message" className={`${field} min-h-[100px] resize-y`} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="取り扱いメニュー・ご質問など" />
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full rounded-full text-white text-[15px] font-semibold px-7 py-4 transition-colors disabled:cursor-not-allowed"
        style={{ backgroundColor: canSubmit ? "#16241A" : "#9aa79a" }}
      >
        {status === "submitting" ? "送信中…" : "無料で提携を申し込む"}
      </button>
      <p className="text-[11.5px] text-[#6b7a66] leading-[1.8] text-center">
        送信いただいても、掲載が確約されるものではありません。空き状況をご案内します。
      </p>
      {status === "error" && (
        <p className="text-[12.5px] text-[#b4453c] text-center">送信に問題が発生しました。お手数ですが {site.company.email} まで直接お送りください。</p>
      )}
    </form>
  );
}
