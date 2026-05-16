"use client";

import { useState } from "react";
import Link from "next/link";

type Answers = {
  q1: string | null;
  q2: string | null;
  q3: string | null;
  q4: string | null;
  q5: string;
};

const initial: Answers = {
  q1: null,
  q2: null,
  q3: null,
  q4: null,
  q5: "",
};

const q1Options = [
  { value: "sweat-odor", label: "汗・におい・体臭" },
  { value: "skin-acne", label: "肌・ニキビ・肌の質感" },
  { value: "face-impression", label: "顔の印象・自信のなさ" },
  { value: "hair-loss", label: "髪・薄毛" },
  { value: "beard-body-hair", label: "髭・体毛" },
  { value: "mind-awareness", label: "心の動き・自意識" },
  { value: "multiple", label: "よく分からない、複数ある" },
  { value: "skip", label: "答えたくない" },
];

const q2Options = [
  { value: "recent", label: "最近、気づき始めた" },
  { value: "months", label: "数ヶ月から 1 年くらい" },
  { value: "years", label: "数年来、気になっている" },
  { value: "teen", label: "思春期からずっと" },
  { value: "long", label: "思い出せないくらい昔から" },
  { value: "skip", label: "答えたくない" },
];

const q3Options = [
  { value: "nothing", label: "ほぼ何も試していない" },
  { value: "lifestyle", label: "自分なりに調べて、生活で工夫している" },
  { value: "otc", label: "市販品を試したことがある" },
  { value: "clinic", label: "医療機関に行ったことがある" },
  { value: "aesthetic", label: "美容医療・施術を受けたことがある" },
  { value: "surgery", label: "手術を経験したことがある" },
  { value: "skip", label: "答えたくない" },
];

const q4Options = [
  { value: "organize", label: "情報を整理したい" },
  { value: "options", label: "選択肢を知りたい" },
  { value: "stories", label: "当事者の経験を読みたい" },
  { value: "language", label: "自分の状態を言語化したい" },
  { value: "presence", label: "ただ、誰かの記録に触れたい" },
  { value: "skip", label: "よく分からない" },
];

const territoryLabels: Record<string, string> = {
  "sweat-odor": "汗・におい",
  "skin-acne": "肌・ニキビ",
  "face-impression": "顔の印象・整え",
  "hair-loss": "薄毛・AGA",
  "beard-body-hair": "髭・体毛",
  "mind-awareness": "心と自意識",
  multiple: "複数の領域",
  skip: "（答えたくない）",
};

const q2Labels: Record<string, string> = {
  recent: "最近気づき始めた頃",
  months: "数ヶ月から 1 年ほど前",
  years: "数年来",
  teen: "思春期から",
  long: "ずっと昔から",
  skip: "（答えたくない）",
};

const q3Labels: Record<string, string> = {
  nothing: "まだほぼ何も試していない",
  lifestyle: "生活の工夫まで",
  otc: "市販品まで",
  clinic: "医療機関まで",
  aesthetic: "美容医療まで",
  surgery: "手術まで",
  skip: "（答えたくない）",
};

const q4Labels: Record<string, string> = {
  organize: "情報を整理したい",
  options: "選択肢を知りたい",
  stories: "当事者の経験を読みたい",
  language: "自分の状態を言語化したい",
  presence: "誰かの記録に静かに触れたい",
  skip: "迷っている",
};

export default function ReflectClient() {
  const [answers, setAnswers] = useState<Answers>(initial);
  const [done, setDone] = useState(false);

  const set = <K extends keyof Answers>(key: K, value: Answers[K]) =>
    setAnswers((a) => ({ ...a, [key]: value }));

  const reset = () => {
    setAnswers(initial);
    setDone(false);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  };

  const territory = answers.q1;
  const territoryLink =
    territory && territory !== "multiple" && territory !== "skip"
      ? `/territories/${territory}`
      : "/territories";

  if (done) {
    return (
      <ResultPanel
        answers={answers}
        territoryLink={territoryLink}
        onReset={reset}
      />
    );
  }

  return (
    <div className="space-y-12">
      <Question
        n={1}
        label="いま、気になっていることは、どの近くにありますか？"
        hint="複数ある場合は、いま一番近いものを"
      >
        <Options
          name="q1"
          options={q1Options}
          value={answers.q1}
          onChange={(v) => set("q1", v)}
        />
      </Question>

      <Question n={2} label="それは、いつから気になっていますか？">
        <Options
          name="q2"
          options={q2Options}
          value={answers.q2}
          onChange={(v) => set("q2", v)}
        />
      </Question>

      <Question
        n={3}
        label="これまでに、どの程度のことを試したことがありますか？"
      >
        <Options
          name="q3"
          options={q3Options}
          value={answers.q3}
          onChange={(v) => set("q3", v)}
        />
      </Question>

      <Question n={4} label="いま、最も近いのはどれですか？">
        <Options
          name="q4"
          options={q4Options}
          value={answers.q4}
          onChange={(v) => set("q4", v)}
        />
      </Question>

      <Question
        n={5}
        label="（任意）何か書き残したいことがあれば、自由に。"
        hint="書かなくても、進めます。送信はされません。"
      >
        <textarea
          value={answers.q5}
          onChange={(e) => set("q5", e.target.value.slice(0, 500))}
          maxLength={500}
          rows={5}
          className="w-full bg-paper border border-hair-line p-4 text-sm leading-[1.9] text-ink focus:outline-none focus:border-gold"
          placeholder="..."
        />
      </Question>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-6 border-t border-hair-line">
        <button
          type="button"
          onClick={() => {
            setDone(true);
            if (typeof window !== "undefined") window.scrollTo({ top: 0 });
          }}
          className="btn-gold"
        >
          観察を見る
          <span aria-hidden>→</span>
        </button>
        <button
          type="button"
          onClick={reset}
          className="text-sm text-sub-gray hover:text-navy transition-colors"
        >
          はじめから
        </button>
      </div>
    </div>
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
        <span className="logo-type text-gold text-sm tracking-widest">
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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <label
            key={opt.value}
            className={`flex items-center gap-3 cursor-pointer px-4 py-3 border transition-colors ${
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
            <span className="text-sm leading-[1.6]">{opt.label}</span>
          </label>
        );
      })}
    </div>
  );
}

function ResultPanel({
  answers,
  territoryLink,
  onReset,
}: {
  answers: Answers;
  territoryLink: string;
  onReset: () => void;
}) {
  const t = answers.q1 ? territoryLabels[answers.q1] : "ある領域";
  const time = answers.q2 ? q2Labels[answers.q2] : null;
  const tried = answers.q3 ? q3Labels[answers.q3] : null;
  const wish = answers.q4 ? q4Labels[answers.q4] : null;

  return (
    <div className="space-y-10">
      <div className="bg-paper border border-hair-line p-6 sm:p-10">
        <p className="text-xs text-sub-gray mb-5">観察</p>
        <p className="font-mincho text-[1.0625rem] leading-[2.1] text-ink">
          いま、あなたは
          <span className="font-bold text-navy">{t}</span>
          のあたりにいる、と読みました。
          {time && (
            <>
              <br />
              {time}から気になることがある。
            </>
          )}
          {tried && (
            <>
              <br />
              これまでに{tried}を試している。
            </>
          )}
          {wish && (
            <>
              <br />
              いまは「{wish}」と感じている。
            </>
          )}
        </p>
        <p className="mt-6 font-mincho text-sub-gray text-sm leading-[2]">
          診断ではありません。
          急がず、必要なら何度でも、ここに戻ってきてください。
        </p>
      </div>

      <div className="space-y-6">
        <h2 className="text-lg font-bold">あなたに近いかもしれない場所</h2>
        <ul className="space-y-4 text-sm">
          <li>
            <Link
              href={territoryLink}
              className="text-navy border-b border-gold pb-0.5 hover:text-gold transition-colors"
            >
              → この領域の地形図を読む
            </Link>
          </li>
          <li>
            <Link
              href="/articles"
              className="text-navy border-b border-gold pb-0.5 hover:text-gold transition-colors"
            >
              → 当事者の記録を読む
            </Link>
          </li>
          <li>
            <Link
              href="/letters"
              className="text-navy border-b border-gold pb-0.5 hover:text-gold transition-colors"
            >
              → 書きたくなったら、ここに
            </Link>
          </li>
          <li>
            <Link
              href="/subscribe"
              className="text-navy border-b border-gold pb-0.5 hover:text-gold transition-colors"
            >
              → ときどき、便りを受け取る
            </Link>
          </li>
        </ul>
      </div>

      <div className="pt-8 border-t border-hair-line">
        <button
          type="button"
          onClick={onReset}
          className="text-sm text-sub-gray hover:text-navy transition-colors"
        >
          ← もう一度、整理する
        </button>
      </div>
    </div>
  );
}
