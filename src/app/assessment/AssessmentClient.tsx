"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { track, getAttribution } from "@/lib/analytics";

type Answers = {
  concern: string | null;
  impact: number;
  tried: string | null;
  goal: string;
  email: string;
};

const initial: Answers = {
  concern: null,
  impact: 5,
  tried: null,
  goal: "",
  email: "",
};

const concerns = [
  { value: "hair", label: "髪" },
  { value: "skin", label: "肌" },
  { value: "sweat", label: "汗" },
  { value: "odor", label: "匂い" },
  { value: "beard", label: "ヒゲ" },
  { value: "body", label: "体型" },
  { value: "confidence", label: "自信" },
  { value: "other", label: "その他" },
];

const tried = [
  { value: "none", label: "まだ何もしていない" },
  { value: "research", label: "情報収集中" },
  { value: "product", label: "商品を試した" },
  { value: "clinic", label: "クリニック・サロンに行った" },
  { value: "ongoing", label: "継続中" },
];

const STORAGE_KEY = "hr_assessment_v1";

export default function AssessmentClient() {
  const [answers, setAnswers] = useState<Answers>(initial);
  const [done, setDone] = useState(false);

  // Fire assessment_start once per page load
  useEffect(() => {
    track("assessment_start");
  }, []);

  const set = <K extends keyof Answers>(key: K, value: Answers[K]) =>
    setAnswers((a) => ({ ...a, [key]: value }));

  const reset = () => {
    setAnswers(initial);
    setDone(false);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  };

  const submit = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ ...answers, submittedAt: new Date().toISOString() })
        );
      } catch {
        /* ignore */
      }
      // POST to our DB. Fire-and-forget; UX never blocks on this.
      try {
        fetch("/api/assessment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Attribution": JSON.stringify(getAttribution()),
          },
          body: JSON.stringify(answers),
          keepalive: true,
        }).catch(() => {
          /* ignore */
        });
      } catch {
        /* ignore */
      }
    }
    track("assessment_complete", {
      concern: answers.concern ?? "unanswered",
      impact: answers.impact,
      tried: answers.tried ?? "unanswered",
      has_goal: answers.goal.trim().length > 0,
      has_email: answers.email.trim().length > 0,
    });
    setDone(true);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  };

  if (done) {
    return (
      <div className="bg-paper border border-hair-line p-8 sm:p-12 text-center">
        <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold">
          Assessment Submitted
        </p>
        <p className="mt-8 font-mincho text-2xl sm:text-3xl leading-[1.55] text-ink">
          あなたの回復は、
          <br />
          ここから始まります。
        </p>
        <p className="mt-8 font-mincho text-[15px] leading-[2] text-sub-gray max-w-[28rem] mx-auto">
          いまの状態を整理することが、最初の整える行為です。
          次に何を読むか、いつ集まりに参加するか、
          ここから少しずつ。
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/reflect"
            className="text-sm tracking-[0.12em] text-ink border border-ink/40 hover:border-gold hover:text-gold-bright transition-colors px-6 py-3.5"
          >
            近い記録を読む
          </Link>
          <Link
            href="/events"
            className="text-sm tracking-[0.12em] text-ink border border-ink/40 hover:border-gold hover:text-gold-bright transition-colors px-6 py-3.5"
          >
            Quiet Gatherings を見る
          </Link>
        </div>
        <button
          type="button"
          onClick={reset}
          className="mt-10 text-xs text-sub-gray hover:text-ink transition-colors"
        >
          ← もう一度、整理する
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="space-y-12"
    >
      <Question n={1} label="今、一番気になっている悩みは？">
        <Options
          name="concern"
          options={concerns}
          value={answers.concern}
          onChange={(v) => set("concern", v)}
        />
      </Question>

      <Question
        n={2}
        label="その悩みは日常にどれくらい影響していますか？"
        hint="1（ほとんど気にならない）— 10（毎日強く影響している）"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="text-xs text-sub-gray w-4">1</span>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={answers.impact}
            onChange={(e) =>
              set("impact", Number(e.currentTarget.value))
            }
            className="flex-1 accent-gold"
          />
          <span className="text-xs text-sub-gray w-6 text-right">10</span>
          <span className="ml-3 logo-type italic text-base text-gold w-6 text-center">
            {answers.impact}
          </span>
        </div>
      </Question>

      <Question n={3} label="すでに何か対策しましたか？">
        <Options
          name="tried"
          options={tried}
          value={answers.tried}
          onChange={(v) => set("tried", v)}
        />
      </Question>

      <Question
        n={4}
        label="90 日後、どんな状態になっていたいですか？"
        hint="自由に。一文でも構いません"
      >
        <textarea
          value={answers.goal}
          onChange={(e) => set("goal", e.currentTarget.value.slice(0, 500))}
          rows={4}
          maxLength={500}
          className="w-full bg-paper border border-hair-line p-4 text-sm leading-[1.95] text-ink focus:outline-none focus:border-gold"
          placeholder="..."
        />
      </Question>

      <Question
        n={5}
        label="メールアドレス（任意）"
        hint="希望する方のみ。Recovery Letter（月 1-2 通）に登録します"
      >
        <input
          type="email"
          value={answers.email}
          onChange={(e) => set("email", e.currentTarget.value.slice(0, 200))}
          className="w-full bg-paper border border-hair-line px-4 py-3 text-sm text-ink focus:outline-none focus:border-gold"
          placeholder="you@example.com"
          autoComplete="email"
        />
      </Question>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-6 border-t border-hair-line">
        <button type="submit" className="btn-gold">
          回復を始める
          <span aria-hidden>→</span>
        </button>
        <button
          type="button"
          onClick={reset}
          className="text-sm text-sub-gray hover:text-ink transition-colors"
        >
          はじめから
        </button>
      </div>
    </form>
  );
}

function Question({
  n,
  label,
  hint,
  children,
}: {
  n: number;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset>
      <legend className="block">
        <span className="logo-type italic text-gold text-sm tracking-widest">
          Q{n}.
        </span>
        <span className="ml-3 text-base sm:text-lg font-bold leading-[1.7] text-ink">
          {label}
        </span>
        {hint && (
          <span className="block mt-2 text-xs text-sub-gray">{hint}</span>
        )}
      </legend>
      <div className="mt-5">{children}</div>
    </fieldset>
  );
}

function Options({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: { value: string; label: string }[];
  value: string | null;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <label
            key={opt.value}
            className={`flex items-center justify-center cursor-pointer px-3 py-3 border transition-colors text-center ${
              selected
                ? "border-gold bg-cream-deep/40 text-ink"
                : "border-hair-line bg-paper text-ink/85 hover:border-gold/60"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={selected}
              onChange={() => onChange(opt.value)}
              className="sr-only"
            />
            <span className="text-sm leading-[1.5]">{opt.label}</span>
          </label>
        );
      })}
    </div>
  );
}
