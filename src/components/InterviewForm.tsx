"use client";

import { useState } from "react";
import { QUESTIONS, CONSENT_VERSION, makeTicket } from "@/lib/interview";
import { track } from "@/lib/analytics";

// 取材のフォーム。
//
// ── 同意を最後に置かない ────────────────────────
// 約束（何を載せる／載せない）はページ側で先に全部出してある。
// ここのチェックは、その確認であって、初出ではない。
//
// ── 受付番号を先に作る ────────────────────────────
// 送ってから採番すると、通信が途中で切れたときに
// 本人の手元に何も残らない。押す前に作って、送信後に大きく出す。
//
// ── 送れなかったときに、書いたものを消さない ─────────────
// この画面に書く内容は、書くのに時間がかかる種類のもの。
// 失敗したら入力はそのまま残し、もう一度押せる状態にする。

const LABEL = "mt-7 block";

export default function InterviewForm() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [ticket, setTicket] = useState("");

  const filled = QUESTIONS.some((q) => (values[q.id] ?? "").trim());
  const canSend = consent && filled && state !== "sending";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSend) return;
    setState("sending");
    const t = ticket || makeTicket(Math.random);
    setTicket(t);
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          consent: true,
          consentVersion: CONSENT_VERSION,
          ticket: t,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      track("interview_submit", { answered: QUESTIONS.filter((q) => values[q.id]).length });
      setState("done");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="mt-10 border border-asagi bg-hakuji px-5 py-7 sm:px-7">
        <p className="text-[16px] font-bold text-sumi">ありがとうございます。届きました。</p>
        <p className="mt-4 text-[14.5px] leading-[1.95] text-keshizumi">
          受付番号です。控えておいてください。
          あとから取り消したくなったときは、この番号だけをお知らせいただければ消せます。
          理由は聞きません。
        </p>
        <p className="mt-4 select-all border border-shironezu bg-shironeri px-4 py-3 text-center text-[22px] font-bold tabular-nums tracking-[0.18em] text-sumi">
          {ticket}
        </p>
        <p className="mt-4 text-[13px] leading-[1.9] text-ainezu">
          こちらからご連絡することはありません（連絡先をいただいていないので、できません）。
          いただいた内容が順番の見直しにつながったときは、更新記録に書きます。
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-10">
      {QUESTIONS.map((q) => (
        <label key={q.id} className={LABEL}>
          <span className="text-[15.5px] font-bold leading-[1.7] text-sumi">
            {q.q}
            {!q.required && <span className="ml-2 text-[12.5px] font-normal text-ainezu">任意</span>}
          </span>
          <span className="mt-1.5 block text-[13px] leading-[1.85] text-ainezu">{q.hint}</span>
          <textarea
            rows={4}
            value={values[q.id] ?? ""}
            onChange={(e) => setValues((v) => ({ ...v, [q.id]: e.target.value }))}
            className="mt-2.5 w-full border border-shironezu bg-hakuji px-3.5 py-3 text-[15px] leading-[1.9] text-sumi outline-none transition-colors focus:border-asagi"
          />
        </label>
      ))}

      <label className="mt-9 flex items-start gap-3 border-t border-shironezu pt-7">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 accent-[#2F6F79]"
        />
        <span className="text-[14.5px] leading-[1.9] text-keshizumi">
          上に書いてある扱いを読みました。この内容で送ります。
        </span>
      </label>

      <button
        type="submit"
        disabled={!canSend}
        className="mt-6 border border-asagi bg-asagi px-6 py-3 text-[15px] font-bold text-shironeri transition-colors hover:bg-transparent hover:text-asagi disabled:cursor-not-allowed disabled:border-shironezu disabled:bg-shironezu disabled:text-ainezu"
      >
        {state === "sending" ? "送っています…" : "送る"}
      </button>

      {!consent && filled && (
        <p className="mt-3 text-[13px] text-ainezu">送る前に、上のチェックをお願いします。</p>
      )}
      {state === "error" && (
        <p className="mt-4 border-l-2 border-asagi pl-4 text-[14px] leading-[1.9] text-keshizumi">
          送れませんでした。書いた内容はそのまま残してあるので、もう一度押してみてください。
          それでも送れないときは、お手数ですがしばらく時間を置いてください。
        </p>
      )}
    </form>
  );
}
