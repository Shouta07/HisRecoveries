"use client";

import { useState } from "react";
import { site } from "@/lib/site";

const FORMSPREE_ID = process.env.NEXT_PUBLIC_FORMSPREE_ID ?? "xnjkvzgk";
const ENDPOINT = FORMSPREE_ID ? `https://formspree.io/f/${FORMSPREE_ID}` : "";

type Status = "idle" | "submitting" | "success" | "error";

const ROLES = [
  "メイクアップアーティスト",
  "スタイリスト",
  "フォトグラファー",
  "美容師・バーバー",
  "サロン経営",
  "ヨガ・トレーナー・生活習慣",
  "医療（クリニック・看護）",
  "婚活・仲人",
  "その他",
];

const WAYS = [
  { key: "取材", label: "取材を受ける（露出・被リンク）" },
  { key: "チーム参画", label: "提供チームに参画する（お仕事として）" },
  { key: "キュレーション", label: "記事を紹介してほしい（キュレーション掲載）" },
];

export default function PartnerForm() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [role, setRole] = useState("");
  const [links, setLinks] = useState("");
  const [ways, setWays] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const canSubmit = !!(name.trim() && contact.trim()) && status !== "submitting";

  function toggleWay(k: string) {
    setWays((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));
  }

  function mailtoFallback() {
    const subject = encodeURIComponent("現場のプロの方から — His Recoveries");
    const body = encodeURIComponent(
      [
        `お名前・活動名: ${name}`,
        `ご連絡先: ${contact}`,
        `ご職種: ${role || "未選択"}`,
        `関わり方: ${ways.join("・") || "未選択"}`,
        `活動リンク: ${links || "（未記入）"}`,
        "",
        "メッセージ:",
        message || "（未記入）",
      ].join("\n")
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
          "お名前・活動名": name,
          ご連絡先: contact,
          email: contact,
          ご職種: role || "未選択",
          関わり方: ways.join("・") || "未選択",
          活動リンク: links || "（未記入）",
          メッセージ: message || "（未記入）",
          _subject: "現場のプロの方から — His Recoveries",
        }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  const field =
    "w-full rounded-2xl border border-[#1f2a1d]/15 bg-white px-4 py-3 text-[15px] text-[#1f2a1d] outline-none focus:border-[#3d5638] transition-colors";
  const label = "block text-[14.5px] font-semibold text-[#1f2a1d] mb-2";

  if (status === "success") {
    return (
      <div className="rounded-[1.6rem] border border-[#1f2a1d]/12 bg-[#f4f6f2] p-8 sm:p-10 text-center">
        <div className="mx-auto mb-5 grid place-items-center w-14 h-14 rounded-full bg-[#16241a] text-[#EDF1E8]">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h2 className="text-[1.4rem] font-bold text-[#1f2a1d] mb-3" style={{ fontFamily: "var(--font-shippori), serif" }}>
          ありがとうございます。
        </h2>
        <p className="text-[15px] text-[#4b5b47] leading-[1.95] max-w-md mx-auto">
          いただいた内容を拝見し、数日以内にご連絡します。まずはお話を聞かせてください。
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className={label} htmlFor="pf-name">お名前・活動名 <span className="text-[#3d5638]">*</span></label>
        <input id="pf-name" className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="活動名でも構いません" required />
      </div>
      <div>
        <label className={label} htmlFor="pf-contact">ご連絡先（メール等） <span className="text-[#3d5638]">*</span></label>
        <input id="pf-contact" className={field} value={contact} onChange={(e) => setContact(e.target.value)} placeholder="you@example.com" required />
      </div>
      <div>
        <label className={label} htmlFor="pf-role">ご職種</label>
        <select id="pf-role" className={field} value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">選択してください（任意）</option>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
      <div>
        <span className={label}>関わり方（複数選択可）</span>
        <div className="space-y-2.5">
          {WAYS.map((w) => (
            <label key={w.key} className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={ways.includes(w.key)} onChange={() => toggleWay(w.key)} className="mt-0.5 w-5 h-5 accent-[#3d5638] shrink-0" />
              <span className="text-[15px] text-[#3a423a] leading-[1.6]">{w.label}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className={label} htmlFor="pf-links">活動リンク（SNS・サイト・ポートフォリオ）</label>
        <input id="pf-links" className={field} value={links} onChange={(e) => setLinks(e.target.value)} placeholder="https://..." />
      </div>
      <div>
        <label className={label} htmlFor="pf-message">ひとこと（任意）</label>
        <textarea id="pf-message" className={`${field} min-h-[110px] resize-y`} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="共感したこと、やってみたいこと、なんでも。" />
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full rounded-full text-white text-[15px] font-semibold px-7 py-4 transition-colors disabled:cursor-not-allowed"
        style={{ backgroundColor: canSubmit ? "#1f2a1d" : "#9aa79a" }}
      >
        {status === "submitting" ? "送信中…" : "送る"}
      </button>
      {status === "error" && (
        <p className="text-[14px] text-[#b4453c]">送信に問題が発生しました。お手数ですが {site.company.email} まで直接お送りください。</p>
      )}
    </form>
  );
}
