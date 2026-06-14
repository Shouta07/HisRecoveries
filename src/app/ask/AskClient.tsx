"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const TERRITORIES = [
  { value: "", label: "選ばない" },
  { value: "sweat-odor", label: "汗・におい" },
  { value: "skin-acne", label: "肌・ニキビ跡" },
  { value: "hair-loss", label: "薄毛・AGA" },
  { value: "beard-body-hair", label: "髭・体毛" },
  { value: "face-impression", label: "顔の印象" },
  { value: "mind-awareness", label: "心と自意識" },
];

export default function AskClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const presetTerritory = sp.get("territory") ?? "";
  const presetFeeling = sp.get("feeling") ?? "";

  const [question, setQuestion] = useState("");
  const [context, setContext] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [territory, setTerritory] = useState(presetTerritory);
  const [email, setEmail] = useState("");
  const [consentReply, setConsentReply] = useState(true);
  const [consentPublish, setConsentPublish] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (question.trim().length < 8) {
      setError("問いを 8 文字以上で書いてください。");
      return;
    }
    if (!email.trim()) {
      setError("返信のためのメールアドレスをご入力ください。");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          context: context || undefined,
          ageRange: ageRange || undefined,
          territory: territory || undefined,
          feeling: presetFeeling || undefined,
          email,
          consentReply,
          consentPublish,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "送信に失敗しました");
      router.push("/ask/complete");
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : "送信に失敗しました");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-8">
      <label className="block">
        <span className="logo-type italic text-[11px] tracking-[0.3em] uppercase text-gold">
          問い（必須）
        </span>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value.slice(0, 800))}
          rows={4}
          placeholder="いまの言葉のままで構いません。"
          className="mt-3 w-full bg-paper border border-hair-line text-ink px-5 py-4 font-mincho text-[15px] leading-[1.95] focus:outline-none focus:border-gold resize-y"
        />
        <p className="mt-2 text-[11px] text-sub-gray text-right">
          {question.length} / 800
        </p>
      </label>

      <label className="block">
        <span className="logo-type italic text-[11px] tracking-[0.3em] uppercase text-gold">
          いまの場面（任意）
        </span>
        <input
          type="text"
          value={context}
          onChange={(e) => setContext(e.target.value.slice(0, 400))}
          placeholder="例：夏の電車で、人との距離が気になる"
          className="mt-3 w-full bg-paper border border-hair-line text-ink px-4 py-3 font-mincho text-[14.5px] focus:outline-none focus:border-gold"
        />
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <label className="block">
          <span className="logo-type italic text-[11px] tracking-[0.3em] uppercase text-gold">
            おおよその年代（任意）
          </span>
          <input
            type="text"
            value={ageRange}
            onChange={(e) => setAgeRange(e.target.value.slice(0, 40))}
            placeholder="例：30代前半"
            className="mt-3 w-full bg-paper border border-hair-line text-ink px-4 py-3 font-mincho text-[14.5px] focus:outline-none focus:border-gold"
          />
        </label>

        <label className="block">
          <span className="logo-type italic text-[11px] tracking-[0.3em] uppercase text-gold">
            領域（任意）
          </span>
          <select
            value={territory}
            onChange={(e) => setTerritory(e.target.value)}
            className="mt-3 w-full bg-paper border border-hair-line text-ink px-4 py-3 font-mincho text-[14.5px] focus:outline-none focus:border-gold"
          >
            {TERRITORIES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="logo-type italic text-[11px] tracking-[0.3em] uppercase text-gold">
          返信先メールアドレス（必須）
        </span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value.slice(0, 200))}
          placeholder="you@example.com"
          autoComplete="email"
          className="mt-3 w-full bg-paper border border-hair-line text-ink px-4 py-3 font-mincho text-[15px] focus:outline-none focus:border-gold"
        />
        <p className="mt-2 text-[11px] text-sub-gray leading-[1.95]">
          編集者があなたの問いを読み、数日以内に返事を書きます。
          メールアドレスは返信のためにのみ使い、回答本文と一緒に第三者へ開示しません。
        </p>
      </label>

      <fieldset className="space-y-3 pt-2 border-t border-hair-line">
        <label className="flex items-start gap-3 text-[13.5px] text-ink leading-[1.95]">
          <input
            type="checkbox"
            checked={consentReply}
            onChange={(e) => setConsentReply(e.target.checked)}
            className="mt-1.5 accent-gold"
          />
          <span>
            編集者からの返信を受け取ることに同意します。（推奨）
          </span>
        </label>
        <label className="flex items-start gap-3 text-[13.5px] text-ink leading-[1.95]">
          <input
            type="checkbox"
            checked={consentPublish}
            onChange={(e) => setConsentPublish(e.target.checked)}
            className="mt-1.5 accent-gold"
          />
          <span>
            匿名化のうえ、編集者の観察と共に Recovery Q&amp;A
            に掲載されることに同意します。（任意）
            <br />
            <span className="text-sub-gray text-[12px]">
              個人を特定する情報・固有名詞は事前に編集が除去します。掲載前にあなたに確認するわけではない点をご了承ください。
            </span>
          </span>
        </label>
      </fieldset>

      {error && <p className="text-[12px] text-red-600">{error}</p>}

      <div className="flex flex-col sm:flex-row items-stretch gap-3 sm:gap-4">
        <button
          type="submit"
          disabled={submitting}
          className="btn-gold justify-center disabled:opacity-50"
        >
          {submitting ? "送信中…" : "問いを置く"}
          {!submitting && <span aria-hidden>→</span>}
        </button>
      </div>

      <p className="mt-6 text-[11px] text-sub-gray leading-[2]">
        ※ 個別の症状や治療の判断は、医療機関にご相談ください。Recovery Q&amp;A は
        医療行為・診断・受診勧奨を行うものではありません。
      </p>
    </form>
  );
}
