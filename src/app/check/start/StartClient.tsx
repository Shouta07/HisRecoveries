"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { CheckQuestion } from "@/lib/checkQuestions";

type Section = { id: string; label: string };
type Responses = Record<string, string | string[] | number>;

const STORAGE_KEY = "hr_check_v1";

type Props = {
  sections: Section[];
  questions: CheckQuestion[];
};

export default function StartClient({ sections, questions }: Props) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [responses, setResponses] = useState<Responses>({});
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [showContact, setShowContact] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Restore from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw) as {
        index?: number;
        responses?: Responses;
        email?: string;
        name?: string;
      };
      if (data.responses) setResponses(data.responses);
      if (typeof data.index === "number") setIndex(data.index);
      if (data.email) setEmail(data.email);
      if (data.name) setName(data.name);
    } catch {
      /* ignore */
    }
  }, []);

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ index, responses, email, name })
      );
    } catch {
      /* ignore */
    }
  }, [index, responses, email, name]);

  const currentQuestion = questions[index];
  const currentSection = useMemo(
    () => sections.find((s) => s.id === currentQuestion?.section),
    [sections, currentQuestion]
  );
  const progress = ((index + 1) / questions.length) * 100;

  const isAnswered = useCallback(
    (q: CheckQuestion): boolean => {
      const v = responses[q.id];
      if (q.kind === "multi") return Array.isArray(v) && v.length > 0;
      if (q.kind === "text") return typeof v === "string" && v.trim().length > 0;
      return v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0);
    },
    [responses]
  );

  const canProceed = !currentQuestion?.required || isAnswered(currentQuestion);

  function setAnswer(qid: string, value: string | string[] | number) {
    setResponses((prev) => ({ ...prev, [qid]: value }));
  }

  function next() {
    setError("");
    if (currentQuestion?.required && !canProceed) {
      setError("お手数ですが、選択してから次へお進みください。");
      return;
    }
    if (index < questions.length - 1) {
      setIndex(index + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setShowContact(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function prev() {
    if (showContact) {
      setShowContact(false);
      return;
    }
    if (index > 0) {
      setIndex(index - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function submit() {
    setError("");
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("レポートをお送りするためのメールアドレスをご入力ください。");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, responses }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "送信に失敗しました");
      localStorage.removeItem(STORAGE_KEY);
      router.push("/check/complete");
    } catch (e) {
      setError(e instanceof Error ? e.message : "送信に失敗しました");
      setSubmitting(false);
    }
  }

  if (showContact) {
    return (
      <div className="mx-auto max-w-[680px] px-6 sm:px-10 pt-14 sm:pt-20 pb-24">
        <header className="mb-10">
          <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold">
            Final · Contact
          </p>
          <h1 className="mt-5 font-mincho text-2xl sm:text-3xl text-ink leading-[1.45]">
            レポートの送り先を、教えてください。
          </h1>
          <p className="mt-5 font-mincho text-[14px] text-sub-gray leading-[2]">
            編集者があなたの 30 問を読み、24 時間以内に PDF を返します。
          </p>
        </header>

        <label className="block mb-6">
          <span className="text-[11px] tracking-[0.1em] uppercase text-sub-gray">
            メールアドレス（必須）
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="mt-2 w-full bg-paper border border-hair-line text-ink px-4 py-3 font-mincho text-[15px] focus:outline-none focus:border-gold"
            autoComplete="email"
          />
        </label>

        <label className="block mb-8">
          <span className="text-[11px] tracking-[0.1em] uppercase text-sub-gray">
            お名前 / ペンネーム（任意）
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="どう呼べばいいですか"
            className="mt-2 w-full bg-paper border border-hair-line text-ink px-4 py-3 font-mincho text-[15px] focus:outline-none focus:border-gold"
            autoComplete="name"
          />
        </label>

        <p className="text-[12px] text-sub-gray leading-[2] mb-8">
          回答内容は、編集者と提携する顧客理解の運用以外には使われません。
          匿名化された統計のみ、Recovery Data として共有される可能性があります。
        </p>

        {error && (
          <p className="text-[12px] text-red-600 mb-6">{error}</p>
        )}

        <div className="flex flex-col sm:flex-row items-stretch gap-3 sm:gap-4">
          <button
            type="button"
            onClick={prev}
            disabled={submitting}
            className="text-sm tracking-[0.12em] text-ink border border-ink/40 hover:border-gold hover:text-gold transition-colors px-6 py-3.5 disabled:opacity-50"
          >
            戻る
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="btn-gold justify-center disabled:opacity-50"
          >
            {submitting ? "送信中…" : "観察を送る"}
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="mx-auto max-w-[720px] px-6 sm:px-10 pt-10 sm:pt-14 pb-24">
      {/* Progress + breadcrumb */}
      <div className="mb-10">
        <div className="flex items-baseline justify-between gap-4">
          <p className="logo-type italic text-[11px] tracking-[0.3em] uppercase text-gold">
            {currentSection?.label}
          </p>
          <p className="text-[11px] tracking-[0.06em] text-sub-gray">
            {index + 1} / {questions.length}
          </p>
        </div>
        <div className="mt-3 h-px bg-hair-line w-full">
          <div
            className="h-px bg-gold transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <fieldset className="mb-12">
        <legend className="font-mincho text-xl sm:text-[1.625rem] text-ink leading-[1.5]">
          {currentQuestion.prompt}
          {currentQuestion.required && (
            <span className="ml-2 text-[12px] text-sub-gray align-middle">
              必須
            </span>
          )}
        </legend>
        {currentQuestion.hint && (
          <p className="mt-4 text-[13px] text-sub-gray leading-[1.95]">
            {currentQuestion.hint}
          </p>
        )}

        <div className="mt-8">
          {currentQuestion.kind === "single" && (
            <SingleField
              q={currentQuestion}
              value={responses[currentQuestion.id] as string | undefined}
              onChange={(v) => setAnswer(currentQuestion.id, v)}
            />
          )}
          {currentQuestion.kind === "multi" && (
            <MultiField
              q={currentQuestion}
              value={(responses[currentQuestion.id] as string[]) ?? []}
              onChange={(v) => setAnswer(currentQuestion.id, v)}
            />
          )}
          {currentQuestion.kind === "scale" && (
            <ScaleField
              q={currentQuestion}
              value={responses[currentQuestion.id] as number | undefined}
              onChange={(v) => setAnswer(currentQuestion.id, v)}
            />
          )}
          {currentQuestion.kind === "text" && (
            <TextField
              q={currentQuestion}
              value={(responses[currentQuestion.id] as string) ?? ""}
              onChange={(v) => setAnswer(currentQuestion.id, v)}
            />
          )}
        </div>
      </fieldset>

      {error && <p className="mb-5 text-[12px] text-red-600">{error}</p>}

      <div className="flex flex-col sm:flex-row items-stretch gap-3 sm:gap-4">
        <button
          type="button"
          onClick={prev}
          disabled={index === 0}
          className="text-sm tracking-[0.12em] text-ink border border-ink/40 hover:border-gold hover:text-gold transition-colors px-6 py-3.5 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          戻る
        </button>
        <button
          type="button"
          onClick={next}
          className="btn-gold justify-center"
        >
          {index === questions.length - 1 ? "観察を完了する" : "次へ"}
          <span aria-hidden>→</span>
        </button>
      </div>

      <p className="mt-10 text-[11px] text-sub-gray leading-[2]">
        回答はブラウザ内に自動保存されます。
        途中でも{" "}
        <Link
          href="/check"
          className="underline underline-offset-4 decoration-hair-line hover:decoration-gold transition-colors"
        >
          Recovery Check の説明
        </Link>{" "}
        に戻れます。
      </p>
    </div>
  );
}

// ── field components ──────────────────────────────────────

function SingleField({
  q,
  value,
  onChange,
}: {
  q: Extract<CheckQuestion, { kind: "single" }>;
  value: string | undefined;
  onChange: (v: string) => void;
}) {
  return (
    <ul className="space-y-3">
      {q.options.map((opt) => {
        const selected = value === opt.value;
        return (
          <li key={opt.value}>
            <button
              type="button"
              onClick={() => onChange(opt.value)}
              className={`w-full text-left px-5 py-4 border transition-colors font-mincho text-[15px] ${
                selected
                  ? "border-gold bg-paper text-ink"
                  : "border-hair-line bg-paper/40 text-ink/85 hover:border-gold/60"
              }`}
              aria-pressed={selected}
            >
              {opt.label}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function MultiField({
  q,
  value,
  onChange,
}: {
  q: Extract<CheckQuestion, { kind: "multi" }>;
  value: string[];
  onChange: (v: string[]) => void;
}) {
  function toggle(v: string) {
    if (value.includes(v)) onChange(value.filter((x) => x !== v));
    else onChange([...value, v]);
  }
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {q.options.map((opt) => {
        const selected = value.includes(opt.value);
        return (
          <li key={opt.value}>
            <button
              type="button"
              onClick={() => toggle(opt.value)}
              className={`w-full text-left px-4 py-3.5 border transition-colors font-mincho text-[14.5px] ${
                selected
                  ? "border-gold bg-paper text-ink"
                  : "border-hair-line bg-paper/40 text-ink/85 hover:border-gold/60"
              }`}
              aria-pressed={selected}
            >
              {selected && <span className="text-gold mr-2">✓</span>}
              {opt.label}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function ScaleField({
  q,
  value,
  onChange,
}: {
  q: Extract<CheckQuestion, { kind: "scale" }>;
  value: number | undefined;
  onChange: (v: number) => void;
}) {
  const items = Array.from({ length: q.max - q.min + 1 }, (_, i) => q.min + i);
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        {items.map((n) => {
          const selected = value === n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={`flex-1 aspect-square sm:max-w-[80px] border font-mincho text-lg sm:text-xl transition-colors ${
                selected
                  ? "border-gold bg-paper text-ink"
                  : "border-hair-line bg-paper/40 text-ink/85 hover:border-gold/60"
              }`}
              aria-pressed={selected}
            >
              {n}
            </button>
          );
        })}
      </div>
      {q.labels && (
        <div className="mt-3 flex items-baseline justify-between text-[11px] text-sub-gray tracking-[0.06em]">
          <span>{q.labels.left}</span>
          <span>{q.labels.right}</span>
        </div>
      )}
    </div>
  );
}

function TextField({
  q,
  value,
  onChange,
}: {
  q: Extract<CheckQuestion, { kind: "text" }>;
  value: string;
  onChange: (v: string) => void;
}) {
  const max = q.maxLength ?? 1000;
  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, max))}
        placeholder={q.hint ?? "書ける範囲で構いません"}
        className="w-full min-h-[160px] bg-paper border border-hair-line text-ink px-5 py-4 font-mincho text-[15px] leading-[2] focus:outline-none focus:border-gold resize-y"
      />
      <p className="mt-2 text-[11px] text-sub-gray text-right">
        {value.length} / {max}
      </p>
    </div>
  );
}
