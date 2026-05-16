"use client";

import { useState, FormEvent } from "react";

type Wish = "reply" | "no-reply" | "anonymous" | "penname";

type FormState = {
  subject: string;
  body: string;
  wishes: Set<Wish>;
  penname: string;
  consent: boolean;
  email: string;
};

const MAX_BODY = 3000;

const initial: FormState = {
  subject: "",
  body: "",
  wishes: new Set(),
  penname: "",
  consent: false,
  email: "",
};

type Status = "idle" | "sending" | "sent" | "error";

export default function LettersClient({
  endpoint,
  fallbackEmail,
}: {
  endpoint: string;
  fallbackEmail: string;
}) {
  const [s, setS] = useState<FormState>(initial);
  const [status, setStatus] = useState<Status>("idle");

  const toggleWish = (w: Wish) => {
    setS((prev) => {
      const ws = new Set(prev.wishes);
      if (ws.has(w)) ws.delete(w);
      else ws.add(w);
      return { ...prev, wishes: ws };
    });
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (s.body.trim().length < 20) {
      setStatus("error");
      return;
    }

    if (endpoint) {
      setStatus("sending");
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            subject: s.subject || "（無題）",
            body: s.body,
            wishes: Array.from(s.wishes),
            penname: s.penname,
            consent: s.consent,
            email: s.wishes.has("reply") ? s.email : "",
          }),
        });
        if (!res.ok) throw new Error("send failed");
        setStatus("sent");
      } catch {
        setStatus("error");
      }
    } else {
      // mailto fallback
      const subject = s.subject || "Letters: お便り";
      const body = [
        s.body,
        "",
        "---",
        `希望: ${Array.from(s.wishes).join(", ") || "未指定"}`,
        s.penname ? `ペンネーム: ${s.penname}` : "",
        s.consent
          ? "公開可否: 匿名で記事に使うことに同意します"
          : "公開可否: 公開しないでください",
      ]
        .filter(Boolean)
        .join("\n");
      const url = `mailto:${fallbackEmail}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;
      window.location.href = url;
      setStatus("sent");
    }
  }

  if (status === "sent") {
    return (
      <div className="bg-paper border border-hair-line p-8 sm:p-12">
        <p className="font-mincho text-[1.0625rem] leading-[2.1] text-ink">
          お便り、受け取りました。
          <br />
          数日のうちに、目を通します。
          <br />
          返信ができるかは、約束できません。
          <br />
          それでも、書いて送ってくれたこと、ありがとうございました。
        </p>
        <p className="mt-6 logo-type text-sm text-navy">— Nagi</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div>
        <label className="block text-sm text-ink mb-2" htmlFor="subject">
          件名（任意）
        </label>
        <input
          id="subject"
          type="text"
          value={s.subject}
          onChange={(e) => setS((p) => ({ ...p, subject: e.target.value }))}
          className="w-full bg-paper border border-hair-line p-3 text-sm text-ink focus:outline-none focus:border-gold"
        />
      </div>

      <div>
        <label className="block text-sm text-ink mb-2" htmlFor="body">
          本文
        </label>
        <textarea
          id="body"
          rows={12}
          required
          value={s.body}
          onChange={(e) =>
            setS((p) => ({ ...p, body: e.target.value.slice(0, MAX_BODY) }))
          }
          className="w-full bg-paper border border-hair-line p-4 text-[0.9375rem] leading-[1.95] text-ink focus:outline-none focus:border-gold"
          placeholder="..."
        />
        <p className="mt-2 text-xs text-sub-gray text-right">
          {s.body.length} / {MAX_BODY}
        </p>
      </div>

      <fieldset>
        <legend className="block text-sm text-ink mb-3">希望（複数可）</legend>
        <div className="space-y-2">
          <CheckLabel
            checked={s.wishes.has("reply")}
            onChange={() => toggleWish("reply")}
          >
            返信を希望する
          </CheckLabel>
          <CheckLabel
            checked={s.wishes.has("no-reply")}
            onChange={() => toggleWish("no-reply")}
          >
            返信は不要、ただ伝えたかった
          </CheckLabel>
          <CheckLabel
            checked={s.wishes.has("anonymous")}
            onChange={() => toggleWish("anonymous")}
          >
            匿名でいい
          </CheckLabel>
          <CheckLabel
            checked={s.wishes.has("penname")}
            onChange={() => toggleWish("penname")}
          >
            ペンネームを使いたい
          </CheckLabel>
        </div>

        {s.wishes.has("penname") && (
          <input
            type="text"
            value={s.penname}
            onChange={(e) => setS((p) => ({ ...p, penname: e.target.value }))}
            className="mt-4 w-full bg-paper border border-hair-line p-3 text-sm text-ink focus:outline-none focus:border-gold"
            placeholder="ペンネーム"
          />
        )}
      </fieldset>

      <fieldset>
        <legend className="block text-sm text-ink mb-3">公開可否</legend>
        <CheckLabel
          checked={s.consent}
          onChange={() => setS((p) => ({ ...p, consent: !p.consent }))}
        >
          この手紙の一部を、匿名で記事や Letters Issue に使うことに同意する
        </CheckLabel>
        <p className="mt-3 text-xs text-sub-gray">
          同意なき公開はしません。
        </p>
      </fieldset>

      {s.wishes.has("reply") && (
        <div>
          <label className="block text-sm text-ink mb-2" htmlFor="email">
            メールアドレス（返信希望の場合のみ）
          </label>
          <input
            id="email"
            type="email"
            value={s.email}
            onChange={(e) => setS((p) => ({ ...p, email: e.target.value }))}
            className="w-full bg-paper border border-hair-line p-3 text-sm text-ink focus:outline-none focus:border-gold"
          />
        </div>
      )}

      {status === "error" && (
        <p className="text-sm text-red-700">
          本文が短すぎるか、送信に失敗しました。20 文字以上書いて、もう一度お試しください。
        </p>
      )}

      <div className="pt-6 border-t border-hair-line flex flex-wrap items-center gap-x-6 gap-y-3">
        <button type="submit" className="btn-gold" disabled={status === "sending"}>
          {status === "sending" ? "送っています…" : "静かに送る"}
          {status !== "sending" && <span aria-hidden>→</span>}
        </button>
        <p className="text-xs text-sub-gray">
          スパム対策のため、短すぎる本文は受け取れません。
        </p>
      </div>
    </form>
  );
}

function CheckLabel({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: () => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer text-sm text-ink">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mt-1 accent-gold"
      />
      <span className="leading-[1.7]">{children}</span>
    </label>
  );
}
