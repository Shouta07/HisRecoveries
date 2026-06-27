"use client";

import { useState } from "react";
import { complexes } from "@/lib/complexes";
import { site } from "@/lib/site";

const ACCENT = "#3d5638";

export default function ApplyForm() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [agreed, setAgreed] = useState(false);

  const canSubmit = name.trim() && contact.trim() && agreed;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    const subject = encodeURIComponent("参加申し込み — His Recoveries");
    const body = encodeURIComponent(
      [
        `お名前: ${name}`,
        `ご連絡先: ${contact}`,
        `気になる悩み: ${topic || "未選択"}`,
        "",
        "ご相談内容:",
        message || "（未記入）",
        "",
        "── 秘密保持への同意 ──",
        "本申し込みにあたり、秘密保持に同意しました。",
      ].join("\n")
    );
    window.location.href = `mailto:${site.company.email}?subject=${subject}&body=${body}`;
  }

  const field =
    "w-full rounded-2xl border border-[#1f2a1d]/15 bg-white px-4 py-3 text-[15px] text-[#1f2a1d] outline-none focus:border-[#3d5638] transition-colors";
  const label = "block text-[13px] font-semibold text-[#1f2a1d] mb-2";

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
          お預かりするお名前・連絡先・悩みに関する情報は、本プログラムの選考と運営の目的に限り、
          厳重に管理します。第三者へ販売・提供することはありません。選考の過程で知り得た双方の情報は、
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
            秘密保持に同意します。（同意がない場合はお申し込みいただけません）
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full rounded-full text-white text-[15px] font-semibold px-7 py-4 transition-colors disabled:cursor-not-allowed"
        style={{ backgroundColor: canSubmit ? "#1f2a1d" : "#9aa79a" }}
      >
        {agreed ? "申し込む" : "秘密保持に同意すると送信できます"}
      </button>

      <p className="text-[11.5px] text-[#6b7a66] leading-[1.8]">
        ※ 完全招待制・選考制です。お申し込み後、対話を経てご招待をお送りします。
        本プログラムは医療行為ではありません。診断・治療は連携する医療機関が行います。
      </p>
    </form>
  );
}
