"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";
import { redact } from "@/lib/ask/redact";

// 体験のお申し込み。
//
// ══════════════════════════════════════════════════
// 書いたものを、消さない
// ══════════════════════════════════════════════════
// 保存先が無いとき、API は 503 を返す（受け付けたと嘘をつかない）。
// そのとき画面が「お預かりできません」で終わると、
// 書いた文はそこで消える。書いた時間が丸ごと無駄になる。
//
// 503 のときは、同じ内容をメールで送るボタンを出す。
// 本文は書いたものから組み立てるので、もう一度書かなくていい。
//
// ══════════════════════════════════════════════════
// 選ばせてから断らない
// ══════════════════════════════════════════════════
// 回答者が揃っていない向きの人も、申し込めるようにしてある。
// その人には「順番待ちでお預かりしました」と返る（API が決める）。
//
// 画面側で先に弾くと、その向きの人が何人来たのかが分からない。
//
// ══════════════════════════════════════════════════
// 確かめたいことは、任意にする
// ══════════════════════════════════════════════════
// 必須にすると、ここで書けない人が全員離れる。
// 空でも申し込める。中身はあとでメールで聞ける。

type Props = {
  /** 保存できないときに送る先 */
  to: string;
  /** 確かめたいことの上限 */
  topicMax: number;
  /** 保存できないときの案内 */
  fallbackNote: string;
};

export default function TrialForm({ to, topicMax, fallbackNote }: Props) {
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [topic, setTopic] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "fallback">("idle");
  const [message, setMessage] = useState("");
  const [masked, setMasked] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const ready = Boolean(email.trim()) && Boolean(gender);

  /* ══════════════════════════════════════════════
     メールの道でも、伏せ字をかける
     ══════════════════════════════════════════════
     画面には「こちらに届く前に伏せ字にしています」と書いてある。
     API を通る道では、サーバーが redact してから保存するので本当。

     ところがメールの道は、本人の手元から直接送られる。
     サーバーを通らないので、最初は伏せ字がかからないまま
     電話番号とSNSの名前がそのまま本文に入っていた。
     画面に書いてある約束が、片方の道で嘘になっていた。

     同じ redact を、ここでもかける。
     伏せたものは下に出す（黙って消すと文の意味が変わる）。 */
  const mailMasked = topic.trim() ? redact(topic.trim()) : null;

  /** 保存できなかったときの、メールの下書き */
  function mailHref(): string {
    const lines = [
      "タシカメの体験をお願いします。",
      "",
      `わたし: ${gender === "male" ? "男性" : "女性"}`,
      "",
      "確かめたいこと:",
      mailMasked?.text || "（このメールに返信する形で書きます）",
    ];
    const q = new URLSearchParams({
      subject: "体験のお申し込み",
      body: lines.join("\n"),
    });
    return `mailto:${to}?${q.toString().replace(/\+/g, "%20")}`;
  }

  async function send() {
    if (state !== "idle" || !ready) return;
    setState("sending");
    setError(null);
    try {
      const r = await fetch("/api/trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, gender, topic }),
      });
      const j = await r.json().catch(() => ({}));

      // 保存先が無い。書いたものを捨てずに、別の道を出す
      if (r.status === 503) {
        setState("fallback");
        return;
      }
      if (!r.ok) {
        setError(j.error ?? "お預かりできませんでした");
        setState("idle");
        return;
      }
      track("trial_booked", { intake: j.intake ?? "trial" });
      setMessage(j.message ?? "お申し込みを受け付けました。");
      setMasked(Array.isArray(j.redacted) ? j.redacted : []);
      setState("done");
    } catch {
      // つながらないときも、書いたものを捨てない
      setState("fallback");
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-card border border-ok bg-ok-tint px-5 py-5">
        <p className="text-[14.5px] font-bold leading-[1.85]">{message}</p>
        {masked.length > 0 && (
          <p className="mt-3 text-[12.5px] leading-[1.8] text-steel">
            書いていただいた中の{masked.join("・")}は、こちらに届く前に伏せ字にしています。
          </p>
        )}
        <p className="mt-3 text-[12.5px] leading-[1.8] text-steel">
          メールが届かないときは、迷惑メールのほうもご確認ください。
        </p>
      </div>
    );
  }

  if (state === "fallback") {
    return (
      <div className="rounded-card border border-line bg-mist px-5 py-5">
        <p className="text-[14px] leading-[1.85] text-slate">{fallbackNote}</p>
        <a
          href={mailHref()}
          onClick={() => track("trial_mailto", {})}
          className="mt-4 flex min-h-[54px] items-center justify-center rounded-pill bg-slate px-6 text-[15px] font-bold text-paper"
        >
          メールで送る <span aria-hidden className="ml-1.5">→</span>
        </a>
        <p className="mt-3 text-[11.5px] leading-[1.75] text-steel">
          書いていただいた内容は、メールの本文に入ります。もう一度書く必要はありません。
        </p>
        {mailMasked && mailMasked.findings.length > 0 && (
          <p className="mt-2 text-[11.5px] leading-[1.75] text-steel">
            {mailMasked.findings.map((f) => f.label).join("・")}
            は、本文に入る前に伏せ字にしています。
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* どちらの回答者に渡すかが決まるので、ここは必須 */}
      <fieldset>
        <legend className="text-[12.5px] font-bold text-steel">あなた</legend>
        <div className="mt-2.5 flex gap-2.5">
          {([
            ["male", "男性"],
            ["female", "女性"],
          ] as const).map(([v, label]) => (
            <button
              key={v}
              type="button"
              onClick={() => setGender(v)}
              aria-pressed={gender === v}
              className={`min-h-[52px] flex-1 rounded-pill border text-[15px] font-bold transition-colors ${
                gender === v
                  ? "border-brand bg-brand text-paper"
                  : "border-line bg-paper text-steel"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <label className="block text-[12.5px] font-bold text-steel" htmlFor="trial-email">
          お返事を送るメールアドレス
        </label>
        <input
          id="trial-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="mt-2 min-h-[52px] w-full rounded-pill border border-line bg-paper px-5 text-[15px] text-slate outline-none transition-colors placeholder:text-steel/70 focus:border-brand focus:ring-2 focus:ring-brand/30"
        />
      </div>

      <div>
        <label className="block text-[12.5px] font-bold text-steel" htmlFor="trial-topic">
          確かめたいこと（書かなくても申し込めます）
        </label>
        <textarea
          id="trial-topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value.slice(0, topicMax))}
          rows={4}
          placeholder="送ろうとしている文、迷っている場面など"
          className="mt-2 w-full rounded-soft border border-line bg-paper px-4 py-3.5 text-[15px] leading-[1.85] text-slate outline-none transition-colors placeholder:text-steel/70 focus:border-brand focus:ring-2 focus:ring-brand/30"
        />
        <p className="mt-1.5 text-right text-[11.5px] tabular-nums text-steel">
          {topic.length} / {topicMax}
        </p>
      </div>

      <button
        type="button"
        onClick={send}
        disabled={state === "sending" || !ready}
        className="inline-flex min-h-[54px] items-center justify-center rounded-pill bg-brand px-6 text-[15.5px] font-bold text-paper shadow-card transition-opacity hover:opacity-90 disabled:bg-line disabled:text-steel disabled:shadow-none"
      >
        {state === "sending" ? "送っています…" : "体験を申し込む"}
      </button>

      {error && <p className="text-[13px] leading-[1.8] text-slate">{error}</p>}

      <p className="text-[11.5px] leading-[1.8] text-steel">
        電話番号・メールアドレス・SNSのアカウント名・住所が書かれていた場合は、
        こちらに届く前に伏せ字にしています。メールアドレスは、お返事を送るためだけに使います。
      </p>
    </div>
  );
}
