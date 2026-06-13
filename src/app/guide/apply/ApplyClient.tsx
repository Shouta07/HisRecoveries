"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Format = "online" | "in_person";
type Preference = "weekday_day" | "weekday_eve" | "weekend";

const STORAGE_KEY = "hr_guide_apply_v1";

export default function ApplyClient() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [format, setFormat] = useState<Format>("online");
  const [preferences, setPreferences] = useState<Preference[]>([]);
  const [check, setCheck] = useState<"yes" | "no" | "maybe">("no");
  const [topic, setTopic] = useState("");
  const [budget, setBudget] = useState<string>("beta");
  const [extra, setExtra] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.name) setName(d.name);
      if (d.email) setEmail(d.email);
      if (d.format) setFormat(d.format);
      if (Array.isArray(d.preferences)) setPreferences(d.preferences);
      if (d.check) setCheck(d.check);
      if (d.topic) setTopic(d.topic);
      if (d.budget) setBudget(d.budget);
      if (d.extra) setExtra(d.extra);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          name,
          email,
          format,
          preferences,
          check,
          topic,
          budget,
          extra,
        })
      );
    } catch {
      /* ignore */
    }
  }, [name, email, format, preferences, check, topic, budget, extra]);

  function togglePref(p: Preference) {
    setPreferences((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  }

  async function submit() {
    setError("");
    if (!name.trim()) return setError("お名前（ペンネーム可）をご入力ください。");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return setError("メールアドレスをご入力ください。");
    if (!topic.trim())
      return setError("いま話したいことを、一行でも書いてください。");
    if (!preferences.length)
      return setError("希望の時間帯を一つ以上選んでください。");

    setSubmitting(true);
    try {
      const res = await fetch("/api/guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          format,
          preferences,
          check,
          topic,
          budget,
          extra,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "送信に失敗しました");
      localStorage.removeItem(STORAGE_KEY);
      router.push("/guide/complete");
    } catch (e) {
      setError(e instanceof Error ? e.message : "送信に失敗しました");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-[680px] px-6 sm:px-10 pt-12 sm:pt-20 pb-24">
      <header className="mb-10">
        <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold">
          Recovery Guide · Apply
        </p>
        <h1 className="mt-5 font-mincho text-2xl sm:text-3xl text-ink leading-[1.45]">
          90 分の時間を、申し込む。
        </h1>
        <p className="mt-5 font-mincho text-[14px] text-sub-gray leading-[2]">
          72 時間以内に、編集者から日程候補のメールをお送りします。
          支払いは、その後ご案内します。
        </p>
      </header>

      <Field label="お名前（ペンネーム可）">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="どう呼べばいいですか"
          autoComplete="name"
          className={input}
        />
      </Field>

      <Field label="メールアドレス">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          className={input}
        />
      </Field>

      <Field label="希望の形式">
        <div className="flex flex-col sm:flex-row gap-3">
          {(
            [
              { v: "online", l: "オンライン（Zoom 等）" },
              { v: "in_person", l: "都内対面" },
            ] as const
          ).map((o) => {
            const selected = format === o.v;
            return (
              <button
                key={o.v}
                type="button"
                onClick={() => setFormat(o.v)}
                className={`flex-1 px-4 py-3 border font-mincho text-[14.5px] transition-colors text-left ${
                  selected
                    ? "border-gold bg-paper text-ink"
                    : "border-hair-line bg-paper/40 text-ink/85 hover:border-gold/60"
                }`}
                aria-pressed={selected}
              >
                {o.l}
              </button>
            );
          })}
        </div>
      </Field>

      <Field
        label="希望の時間帯（複数可）"
        hint="該当する候補をすべて選んでください"
      >
        <div className="grid grid-cols-1 gap-3">
          {(
            [
              { v: "weekday_day", l: "平日の昼（10:00–17:00）" },
              { v: "weekday_eve", l: "平日の夜（19:00–22:00）" },
              { v: "weekend", l: "土日いずれか" },
            ] as const
          ).map((o) => {
            const selected = preferences.includes(o.v);
            return (
              <button
                key={o.v}
                type="button"
                onClick={() => togglePref(o.v)}
                className={`px-4 py-3 border font-mincho text-[14.5px] transition-colors text-left ${
                  selected
                    ? "border-gold bg-paper text-ink"
                    : "border-hair-line bg-paper/40 text-ink/85 hover:border-gold/60"
                }`}
                aria-pressed={selected}
              >
                {selected && <span className="text-gold mr-2">✓</span>}
                {o.l}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="Recovery Check は受けましたか">
        <div className="flex flex-col sm:flex-row gap-3">
          {(
            [
              { v: "yes", l: "受けた" },
              { v: "no", l: "まだ" },
              { v: "maybe", l: "わからない" },
            ] as const
          ).map((o) => {
            const selected = check === o.v;
            return (
              <button
                key={o.v}
                type="button"
                onClick={() => setCheck(o.v)}
                className={`flex-1 px-4 py-3 border font-mincho text-[14.5px] transition-colors text-left ${
                  selected
                    ? "border-gold bg-paper text-ink"
                    : "border-hair-line bg-paper/40 text-ink/85 hover:border-gold/60"
                }`}
                aria-pressed={selected}
              >
                {o.l}
              </button>
            );
          })}
        </div>
      </Field>

      <Field
        label="いま話したいこと"
        hint="一行で構いません。具体名ではなく、感覚で書いてください"
      >
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value.slice(0, 800))}
          placeholder="例：「整え方の優先順位を決められない」「クリニックを選ぶ前に整理したい」"
          className={`${input} min-h-[110px] resize-y`}
        />
        <p className="mt-1 text-[11px] text-sub-gray text-right">
          {topic.length} / 800
        </p>
      </Field>

      <Field label="参加プラン">
        <div className="grid grid-cols-1 gap-3">
          {(
            [
              {
                v: "beta",
                l: "β 価格 ¥9,800（先着 10 名）",
                hint: "先着が埋まり次第、通常価格に切り替わります",
              },
              {
                v: "regular",
                l: "通常 ¥30,000",
                hint: "β 枠を譲りたい場合はこちら",
              },
              {
                v: "undecided",
                l: "決めていない",
                hint: "日程連絡時に相談",
              },
            ] as const
          ).map((o) => {
            const selected = budget === o.v;
            return (
              <button
                key={o.v}
                type="button"
                onClick={() => setBudget(o.v)}
                className={`px-4 py-3 border font-mincho text-[14.5px] transition-colors text-left ${
                  selected
                    ? "border-gold bg-paper text-ink"
                    : "border-hair-line bg-paper/40 text-ink/85 hover:border-gold/60"
                }`}
                aria-pressed={selected}
              >
                <span className="block">{o.l}</span>
                <span className="block mt-1 text-[11.5px] text-sub-gray">
                  {o.hint}
                </span>
              </button>
            );
          })}
        </div>
      </Field>

      <Field
        label="その他、伝えておきたいこと（任意）"
        hint="健康上の留意点・話したくない領域・希望の場所など"
      >
        <textarea
          value={extra}
          onChange={(e) => setExtra(e.target.value.slice(0, 600))}
          className={`${input} min-h-[100px] resize-y`}
        />
        <p className="mt-1 text-[11px] text-sub-gray text-right">
          {extra.length} / 600
        </p>
      </Field>

      <p className="mt-2 mb-8 text-[12px] text-sub-gray leading-[2]">
        申し込み内容は編集者のみが読み、紹介・成果報酬を受け取る目的では使われません。
      </p>

      {error && <p className="mb-5 text-[12px] text-red-600">{error}</p>}

      <div className="flex flex-col sm:flex-row items-stretch gap-3 sm:gap-4">
        <Link
          href="/guide"
          className="text-sm tracking-[0.12em] text-ink border border-ink/40 hover:border-gold hover:text-gold transition-colors px-6 py-3.5 text-center"
        >
          戻る
        </Link>
        <button
          type="button"
          onClick={submit}
          disabled={submitting}
          className="btn-gold justify-center disabled:opacity-50"
        >
          {submitting ? "送信中…" : "申し込みを送る"}
          <span aria-hidden>→</span>
        </button>
      </div>
    </div>
  );
}

const input =
  "mt-2 w-full bg-paper border border-hair-line text-ink px-4 py-3 font-mincho text-[15px] leading-[1.65] focus:outline-none focus:border-gold";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block mb-7">
      <span className="text-[11px] tracking-[0.1em] uppercase text-sub-gray">
        {label}
      </span>
      <div className="mt-1">{children}</div>
      {hint && (
        <span className="block mt-1.5 text-[11px] text-sub-gray">{hint}</span>
      )}
    </label>
  );
}
