"use client";

// 提携申し込みフォーム（B2B・決裁者向け）。/partner LP 専用。
// 送信は Formspree、未設定時は mailto フォールバック。個人プロ向けの
// PartnerForm とは別物（施設・院長・エリアなど B2B 項目）。
import { useState } from "react";
import { site } from "@/lib/site";

const FORMSPREE_ID = process.env.NEXT_PUBLIC_FORMSPREE_ID ?? "xnjkvzgk";
const ENDPOINT = FORMSPREE_ID ? `https://formspree.io/f/${FORMSPREE_ID}` : "";

type Status = "idle" | "submitting" | "success" | "error";

// パートナー種別は2系統: 体験を届けるプロ / 送客を受ける提携施設。
const PRO_ROLES = [
  "メイクアップアーティスト",
  "スタイリスト",
  "フォトグラファー",
  "美容師・バーバー",
  "トレーナー・パーソナル",
  "栄養士・食事指導",
  "カウンセラー・メンタル",
  "その他（プロ）",
];
const FACILITY_TYPES = [
  "美容皮膚科",
  "AGA・薄毛クリニック",
  "医療脱毛",
  "脱毛サロン",
  "眉毛・アイブロウ",
  "メンズ美容・エステ",
  "ジム・トレーニング",
  "その他（施設）",
];

export default function PartnerApplyForm() {
  const [facility, setFacility] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("");
  const [area, setArea] = useState("");
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const canSubmit = !!(facility.trim() && email.trim()) && status !== "submitting";

  function mailtoFallback() {
    const subject = encodeURIComponent("提携申し込み — His Recoveries Partner");
    const body = encodeURIComponent(
      [
        `お名前・屋号・施設名: ${facility}`,
        `メール: ${email}`,
        `パートナー種別: ${category || "未選択"}`,
        `役職・肩書き: ${role || "（未記入）"}`,
        `エリア: ${area || "（未記入）"}`,
        `サイト・SNS: ${url || "（未記入）"}`,
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
          "お名前・屋号・施設名": facility,
          email,
          パートナー種別: category || "未選択",
          "役職・肩書き": role || "（未記入）",
          エリア: area || "（未記入）",
          "サイト・SNS": url || "（未記入）",
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
    "w-full rounded-2xl border border-[#1F1E1B]/12 bg-white px-4 py-3 text-[15px] text-[#1F1E1B] outline-none focus:border-[#8A6A3B] transition-colors";
  const label = "block text-[14.5px] font-bold text-[#1F1E1B] mb-2";

  if (status === "success") {
    return (
      <div className="rounded-[1.6rem] border border-[#1F1E1B]/10 bg-white p-8 sm:p-10 text-center">
        <div className="mx-auto mb-5 grid place-items-center w-14 h-14 rounded-full bg-[#2C3A2E] text-[#F3F0EA]">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h2 className="text-[1.4rem] font-bold text-[#1F1E1B] mb-3">受け付けました。</h2>
        <p className="text-[15px] text-[#45443E] leading-[1.95] max-w-md mx-auto">
          エリア・カテゴリの空き状況を確認のうえ、担当より2営業日以内にご連絡します。
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={label} htmlFor="pa-facility">お名前・屋号・施設名 <span className="text-[#8A6A3B]">*</span></label>
          <input id="pa-facility" className={field} value={facility} onChange={(e) => setFacility(e.target.value)} placeholder="活動名・屋号・施設名でも可" required />
        </div>
        <div>
          <label className={label} htmlFor="pa-email">メール <span className="text-[#8A6A3B]">*</span></label>
          <input id="pa-email" type="email" className={field} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.jp" required />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={label} htmlFor="pa-category">パートナー種別</label>
          <select id="pa-category" className={field} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">選択してください</option>
            <optgroup label="体験を届けるプロ">
              {PRO_ROLES.map((c) => <option key={c} value={c}>{c}</option>)}
            </optgroup>
            <optgroup label="提携する施設">
              {FACILITY_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
            </optgroup>
          </select>
        </div>
        <div>
          <label className={label} htmlFor="pa-role">役職・肩書き</label>
          <input id="pa-role" className={field} value={role} onChange={(e) => setRole(e.target.value)} placeholder="院長 / 代表 / フリーランス 等" />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={label} htmlFor="pa-area">エリア</label>
          <input id="pa-area" className={field} value={area} onChange={(e) => setArea(e.target.value)} placeholder="東京都渋谷区 など" />
        </div>
        <div>
          <label className={label} htmlFor="pa-url">サイト・SNS・ポートフォリオ</label>
          <input id="pa-url" className={field} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
        </div>
      </div>
      <div>
        <label className={label} htmlFor="pa-message">ひとこと（任意）</label>
        <textarea id="pa-message" className={`${field} min-h-[100px] resize-y`} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="取り扱いメニュー・ご質問など" />
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full rounded-full text-white text-[15px] font-bold px-7 py-4 transition-colors disabled:cursor-not-allowed"
        style={{ backgroundColor: canSubmit ? "#2C3A2E" : "#5E6A70" }}
      >
        {status === "submitting" ? "送信中…" : "無料で提携を申し込む"}
      </button>
      <p className="text-[12.5px] text-[#5E6A70] leading-[1.8] text-center">
        まずは、ご相談から。エリアの空き状況をご案内します。無理な勧誘は一切ありません。
      </p>
      {status === "error" && (
        <p className="text-[14px] text-[#b4453c] text-center">送信に問題が発生しました。お手数ですが {site.company.email} まで直接お送りください。</p>
      )}
    </form>
  );
}
