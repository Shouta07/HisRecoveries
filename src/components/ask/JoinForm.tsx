"use client";

import { useState } from "react";
import {
  RESPONDER_AGES, ATTRS, AREAS, CATEGORIES,
  type ResponderAge, type AttrId, type Area, type CategoryId,
} from "@/lib/ask/model";
import { AttributeChip, Action, FieldLabel, Note, inputClass } from "@/components/brand/kit";
import { track } from "@/lib/analytics";

// 回答者の登録。
//
// ── 募集要項にしない ──────────────────────────────
// 時給・シフト・ノルマの話にすると、副業の募集になる。
// ここで渡すのは仕事ではなく、「あなたの感覚が誰かの判断材料になる」という話。
//
// ── 聞くことを増やさない ──────────────────────────
// 年代・属性・連絡先・一言。それだけ。
// 履歴書のような画面にすると、いちばん来てほしい普通の人が帰る。
//
// ── やめ方を先に書く ──────────────────────────────
// 登録の前に、やめ方と「相手から連絡は来ない」ことを書く。
// 後ろに置くと、不安なまま登録することになる。

export default function JoinForm() {
  const [age, setAge] = useState<ResponderAge | null>(null);
  const [attrs, setAttrs] = useState<AttrId[]>([]);
  const [area, setArea] = useState<Area | null>(null);
  const [specialties, setSpecialties] = useState<CategoryId[]>([]);
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const canSend = Boolean(age) && email.trim() !== "" && consent && state !== "sending";

  async function send() {
    setState("sending");
    setError(null);
    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age, attrs, area, specialties, email: email.trim(), note, consent: true,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "送れませんでした");
        setState("error");
        return;
      }
      track("join_submitted", { age: age ?? "none", attrs: attrs.length, spec: specialties.length });
      setState("done");
    } catch {
      setError("通信できませんでした。もう一度お試しください。");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="border-l-2 border-slate pl-6">
        <p className="text-[24px] font-black leading-[1.4] sm:text-[30px]">
          ありがとうございます。
        </p>
        <p className="mt-5 max-w-[28em] text-[15.5px] leading-[2] text-steel">
          いただいた内容を確認したうえで、こちらからご連絡します。
          確認が終わるまでは、相談は届きません。
        </p>
        <p className="mt-5 max-w-[28em] text-[15.5px] leading-[2] text-steel">
          やめたくなったら、届いたメールに「やめます」とだけ返してください。
          理由は聞きません。
        </p>
      </div>
    );
  }

  return (
    <div>
      <div>
        <FieldLabel>年代</FieldLabel>
        <div className="mt-3 flex flex-wrap gap-2">
          {RESPONDER_AGES.map((a) => (
            <AttributeChip key={a.id} on={age === a.id} onClick={() => setAge(a.id)}>
              {a.label}
            </AttributeChip>
          ))}
        </div>
        <div className="mt-3">
          <Note>相談した人に見えるのは、この年代だけです。</Note>
        </div>
      </div>

      <div className="mt-12">
        <FieldLabel>当てはまるもの（任意）</FieldLabel>
        <div className="mt-3 flex flex-wrap gap-2">
          {ATTRS.map((a) => (
            <AttributeChip
              key={a.id}
              on={attrs.includes(a.id)}
              onClick={() =>
                setAttrs((prev) =>
                  prev.includes(a.id) ? prev.filter((x) => x !== a.id) : [...prev, a.id],
                )
              }
            >
              {a.label}
            </AttributeChip>
          ))}
        </div>
        <div className="mt-3">
          <Note>
            近い立場の人に聞きたい、という相談があります。選ばなくても登録できます。
          </Note>
        </div>
      </div>

      <div className="mt-12">
        <FieldLabel>お住まいの地域（任意）</FieldLabel>
        <div className="mt-3 flex flex-wrap gap-2">
          {AREAS.map((a) => (
            <AttributeChip key={a} on={area === a} onClick={() => setArea(area === a ? null : a)}>
              {a}
            </AttributeChip>
          ))}
        </div>
        <div className="mt-3">
          <Note>都道府県より粗い単位にしています。市区町村は聞きません。</Note>
        </div>
      </div>

      <div className="mt-12">
        <FieldLabel>答えやすい話題（任意）</FieldLabel>
        <div className="mt-3 flex flex-wrap gap-2">
          {CATEGORIES.filter((c) => c.id !== "other").map((c) => (
            <AttributeChip
              key={c.id}
              on={specialties.includes(c.id)}
              onClick={() =>
                setSpecialties((prev) =>
                  prev.includes(c.id) ? prev.filter((x) => x !== c.id) : [...prev, c.id],
                )
              }
            >
              {c.label}
            </AttributeChip>
          ))}
        </div>
        <div className="mt-3">
          <Note>選んだ話題の相談が、優先的に届きます。選ばなくても登録できます。</Note>
        </div>
      </div>

      <div className="mt-12">
        <FieldLabel>依頼を送るメールアドレス</FieldLabel>
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={`mt-3 ${inputClass}`}
        />
        <div className="mt-3">
          <Note>
            相談した人には渡りません。渡す仕組み自体を作っていません。
            こちらから依頼をお送りするためだけに使います。
          </Note>
        </div>
      </div>

      <div className="mt-12">
        <FieldLabel>一言（任意）</FieldLabel>
        <textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 300))}
          placeholder="どこでこのページを知ったか、など。空欄でも構いません。"
          className={`mt-3 ${inputClass}`}
        />
      </div>

      <label className="mt-12 flex cursor-pointer items-start gap-3 border-t border-line pt-8">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 h-5 w-5 shrink-0 accent-[#0A0A0A]"
        />
        <span className="text-[14px] leading-[1.9] text-steel">
          18歳以上です。上に書かれている扱いに同意します。
          登録後も、メール1通でいつでもやめられることを確認しました。
        </span>
      </label>

      {error && (
        <p className="mt-6 border-l-2 border-slate pl-4 text-[14.5px] leading-[1.9] text-slate">
          {error}
        </p>
      )}

      <div className="mt-8">
        <Action onClick={send} disabled={!canSend}>
          {state === "sending" ? "送っています…" : "登録する"}
        </Action>
      </div>
    </div>
  );
}
