"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { track } from "@/lib/analytics";

type Answers = {
  category: string | null;
  before: string;
  did: string;
  changed: string;
  consent: "yes" | "no" | null;
  email: string;
};

const initial: Answers = {
  category: null,
  before: "",
  did: "",
  changed: "",
  consent: null,
  email: "",
};

const categories = [
  { value: "hair", label: "髪" },
  { value: "skin", label: "肌" },
  { value: "sweat", label: "汗" },
  { value: "odor", label: "匂い" },
  { value: "beard", label: "ヒゲ" },
  { value: "body", label: "体型" },
  { value: "confidence", label: "自信" },
  { value: "other", label: "その他" },
];

const STORAGE_KEY = "hr_story_v1";

export default function SubmitStoryClient() {
  const [answers, setAnswers] = useState<Answers>(initial);
  const [done, setDone] = useState(false);

  useEffect(() => {
    track("story_start");
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
    }
    track("story_submitted", {
      category: answers.category ?? "unanswered",
      consent: answers.consent ?? "unanswered",
      before_length: answers.before.length,
      did_length: answers.did.length,
      changed_length: answers.changed.length,
      has_email: answers.email.trim().length > 0,
    });
    setDone(true);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  };

  if (done) {
    return (
      <div className="bg-paper border border-hair-line p-8 sm:p-12 text-center">
        <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold">
          Story Received
        </p>
        <p className="mt-8 font-mincho text-2xl sm:text-3xl leading-[1.55] text-ink">
          共有ありがとうございます。
        </p>
        <p className="mt-7 font-mincho text-[15px] leading-[2.05] text-sub-gray max-w-[30rem] mx-auto">
          あなたの記録が、
          次に悩む誰かの助けになります。
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/stories"
            className="text-sm tracking-[0.12em] text-ink border border-ink/40 hover:border-gold hover:text-gold-bright transition-colors px-6 py-3.5"
          >
            Recovery Stories を見る
          </Link>
          <Link
            href="/"
            className="text-sm tracking-[0.12em] text-ink border border-ink/40 hover:border-gold hover:text-gold-bright transition-colors px-6 py-3.5"
          >
            トップへ戻る
          </Link>
        </div>
        <button
          type="button"
          onClick={reset}
          className="mt-10 text-xs text-sub-gray hover:text-ink transition-colors"
        >
          ← もう一通、書く
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
      <Question n={1} label="悩みのカテゴリ">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {categories.map((opt) => {
            const selected = answers.category === opt.value;
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
                  name="category"
                  value={opt.value}
                  checked={selected}
                  onChange={() => set("category", opt.value)}
                  className="sr-only"
                />
                <span className="text-sm">{opt.label}</span>
              </label>
            );
          })}
        </div>
      </Question>

      <Question
        n={2}
        label="以前、どんなことで悩んでいましたか？"
        hint="どんな状態だったか、どんな場面で気になったか"
      >
        <textarea
          value={answers.before}
          onChange={(e) => set("before", e.currentTarget.value.slice(0, 2000))}
          rows={5}
          maxLength={2000}
          className="w-full bg-paper border border-hair-line p-4 text-sm leading-[1.95] text-ink focus:outline-none focus:border-gold"
        />
      </Question>

      <Question n={3} label="何をしましたか？" hint="医療、生活の工夫、何でも">
        <textarea
          value={answers.did}
          onChange={(e) => set("did", e.currentTarget.value.slice(0, 2000))}
          rows={5}
          maxLength={2000}
          className="w-full bg-paper border border-hair-line p-4 text-sm leading-[1.95] text-ink focus:outline-none focus:border-gold"
        />
      </Question>

      <Question n={4} label="その後、何が変わりましたか？">
        <textarea
          value={answers.changed}
          onChange={(e) =>
            set("changed", e.currentTarget.value.slice(0, 2000))
          }
          rows={5}
          maxLength={2000}
          className="w-full bg-paper border border-hair-line p-4 text-sm leading-[1.95] text-ink focus:outline-none focus:border-gold"
        />
      </Question>

      <Question n={5} label="匿名掲載してもよいですか？">
        <div className="grid grid-cols-2 gap-2 max-w-[20rem]">
          {(
            [
              { value: "yes", label: "はい" },
              { value: "no", label: "いいえ" },
            ] as const
          ).map((opt) => {
            const selected = answers.consent === opt.value;
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
                  name="consent"
                  value={opt.value}
                  checked={selected}
                  onChange={() => set("consent", opt.value)}
                  className="sr-only"
                />
                <span className="text-sm">{opt.label}</span>
              </label>
            );
          })}
        </div>
      </Question>

      <Question n={6} label="メールアドレス（任意）">
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
          記録を共有する
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
