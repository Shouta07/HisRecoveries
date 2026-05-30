"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArticleSummary, formatDate } from "@/lib/articleTypes";
import { categoryLabel } from "@/lib/site";
import { track } from "@/lib/analytics";

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

const territoryToCategories: Record<string, string[]> = {
  "sweat-odor": ["hyperhidrosis", "bromhidrosis"],
  "skin-acne": ["acne"],
  "face-impression": ["face"],
  "mind-awareness": ["philosophy"],
  "hair-loss": [],
  "beard-body-hair": [],
};

const triedKeywords: Record<string, string[]> = {
  nothing: [],
  lifestyle: ["生活", "工夫", "服装", "インナー", "睡眠"],
  otc: ["市販", "ドラッグストア", "塗り薬", "デオドラント"],
  clinic: ["皮膚科", "保険", "処方", "受診", "医療機関", "塩化アルミニウム"],
  aesthetic: ["美容医療", "ボトックス", "ボツリヌス", "ミラドライ", "注射", "施術"],
  surgery: ["手術", "剪除", "吸引"],
};

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

function matchArticles(articles: ArticleSummary[], a: Answers): ArticleSummary[] {
  let scoped = articles;

  // Q1 territory → category filter
  if (a.q1 && a.q1 !== "multiple" && a.q1 !== "skip") {
    const cats = territoryToCategories[a.q1] ?? [];
    if (cats.length > 0) {
      const inCategory = scoped.filter((art) => cats.includes(art.category));
      // If category has zero matches, fall back to all so the user sees something
      if (inCategory.length > 0) scoped = inCategory;
    }
  }

  // Score by Q3 tried-level + Q5 freeform text
  const triedKws = a.q3 ? triedKeywords[a.q3] ?? [] : [];
  const freeKws = a.q5
    .trim()
    .split(/\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 2);

  const scored = scoped.map((art) => {
    const haystack = `${art.title} ${art.excerpt} ${(art.keywords ?? []).join(
      " "
    )}`;
    let score = 0;
    triedKws.forEach((kw) => {
      if (haystack.includes(kw)) score += 2;
    });
    freeKws.forEach((kw) => {
      if (haystack.includes(kw)) score += 3;
    });
    return { art, score };
  });

  scored.sort((x, y) => {
    if (y.score !== x.score) return y.score - x.score;
    return x.art.publishedAt < y.art.publishedAt ? 1 : -1;
  });

  return scored.map((s) => s.art).slice(0, 8);
}

export default function ReflectClient({
  articles,
}: {
  articles: ArticleSummary[];
}) {
  const [answers, setAnswers] = useState<Answers>(initial);
  const [done, setDone] = useState(false);

  const set = <K extends keyof Answers>(key: K, value: Answers[K]) =>
    setAnswers((a) => ({ ...a, [key]: value }));

  const reset = () => {
    setAnswers(initial);
    setDone(false);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  };

  const matched = useMemo(
    () => (done ? matchArticles(articles, answers) : []),
    [articles, answers, done]
  );

  const territory = answers.q1;
  const territoryLink =
    territory && territory !== "multiple" && territory !== "skip"
      ? `/territories/${territory}`
      : "/territories";

  if (done) {
    return (
      <ResultPanel
        answers={answers}
        matched={matched}
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
        label="（任意）気になっている言葉を、自由に書いてください。"
        hint="該当する記録の絞り込みに使われます。送信はされません。例: 「夏」「鏡」「手術」"
      >
        <textarea
          value={answers.q5}
          onChange={(e) => set("q5", e.target.value.slice(0, 500))}
          maxLength={500}
          rows={3}
          className="w-full bg-paper border border-hair-line p-4 text-sm leading-[1.9] text-ink focus:outline-none focus:border-gold"
          placeholder="..."
        />
      </Question>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-6 border-t border-hair-line">
        <button
          type="button"
          onClick={() => {
            setDone(true);
            track("reflect_complete", {
              territory: answers.q1 ?? "skip",
              tried: answers.q3 ?? "skip",
              has_keyword: answers.q5.trim().length > 0,
            });
            if (typeof window !== "undefined") window.scrollTo({ top: 0 });
          }}
          className="btn-gold"
        >
          近い記録を探す
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
  matched,
  territoryLink,
  onReset,
}: {
  answers: Answers;
  matched: ArticleSummary[];
  territoryLink: string;
  onReset: () => void;
}) {
  const t = answers.q1 ? territoryLabels[answers.q1] : "ある領域";
  const time = answers.q2 ? q2Labels[answers.q2] : null;
  const tried = answers.q3 ? q3Labels[answers.q3] : null;
  const wish = answers.q4 ? q4Labels[answers.q4] : null;

  return (
    <div className="space-y-12">
      <div className="bg-paper border border-hair-line p-6 sm:p-9">
        <p className="text-xs text-sub-gray mb-4">観察</p>
        <p className="font-mincho text-[1.0625rem] leading-[2.1] text-ink">
          いま、あなたは
          <span className="font-bold text-ink">{t}</span>
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
        <p className="mt-5 font-mincho text-sub-gray text-sm leading-[2]">
          診断ではありません。
          急がず、必要なら何度でも、ここに戻ってきてください。
        </p>
      </div>

      <section aria-labelledby="matched">
        <h2 id="matched" className="text-lg font-bold mb-6">
          あなたに近い記録 — {matched.length} 件
        </h2>
        {matched.length === 0 ? (
          <div className="bg-paper border border-hair-line p-6 sm:p-8 text-sm text-sub-gray leading-[2]">
            この条件に近い記録は、まだありません。
            <br />
            関連する地形図を読んでみてください。
          </div>
        ) : (
          <ul className="space-y-4">
            {matched.map((a) => (
              <li
                key={a.slug}
                className="bg-paper border border-hair-line hover:border-gold transition-colors"
              >
                <Link href={`/articles/${a.slug}`} className="block p-5 sm:p-6 group">
                  <p className="text-xs text-sub-gray">
                    {categoryLabel(a.category)}
                    <span className="mx-2">·</span>
                    {formatDate(a.publishedAt)}
                    <span className="mx-2">·</span>
                    {a.readingMinutes} min
                  </p>
                  <h3 className="mt-2 text-lg font-bold leading-[1.55] text-ink group-hover:text-ink transition-colors">
                    {a.title}
                  </h3>
                  {a.excerpt && (
                    <p className="mt-2 text-sm leading-[1.85] text-sub-gray line-clamp-2">
                      {a.excerpt}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3 text-sm">
        <h2 className="text-base font-bold">ほかの入口</h2>
        <ul className="space-y-3">
          <li>
            <Link
              href={territoryLink}
              className="text-ink border-b border-gold pb-0.5 hover:text-gold transition-colors"
            >
              → この領域の地形図を読む
            </Link>
          </li>
          <li>
            <Link
              href="/subscribe"
              className="text-ink border-b border-gold pb-0.5 hover:text-gold transition-colors"
            >
              → ときどき、便りを受け取る
            </Link>
          </li>
        </ul>
      </section>

      <div className="pt-8 border-t border-hair-line">
        <button
          type="button"
          onClick={onReset}
          className="text-sm text-sub-gray hover:text-ink transition-colors"
        >
          ← もう一度、整理する
        </button>
      </div>
    </div>
  );
}
