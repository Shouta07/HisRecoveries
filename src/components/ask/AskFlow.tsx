"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CATEGORIES, RELATIONS, AGE_BANDS, PANEL_AGES, PANEL_SIZES_OPEN, ATTRS_OPEN,
  category as getCategory, isCategoryId, attrLabel,
  type CategoryId, type AgeBand, type RelationId, type PanelAge, type PanelSize, type AttrId,
} from "@/lib/ask/model";
import { redact, mayContainName } from "@/lib/ask/redact";
import {
  BigAsk as Ask, Choice, AttributeChip as Chip, Action, Note, FieldLabel as Label,
  Progress, inputClass,
} from "@/components/brand/kit";
import { track } from "@/lib/analytics";

// 相談を出す。
//
// ── 30秒〜1分で出せること ────────────────────────
// 自由入力は1つだけ。ほかは押すだけにする。
// ここを長くすると、いちばん聞きたい人ほど途中でやめる。
//
// ── 伏せ字を、送る前に見せる ──────────────────────
// 「送信後に安全に処理します」では、本人は何が起きたか分からない。
// 書いている横で消えていくのが見えれば、次から書かなくなる。
//
// ── 人名は、こちらで勝手に消さない ────────────────
// 機械では見分けられないので、消すかどうかは本人が決める。
// 黙って消すと、文の意味が変わる。

const STEPS = 5;

export default function AskFlow() {
  const router = useRouter();
  // トップでカテゴリを押してきた人には、同じ問いをもう一度見せない。
  const seeded = useSearchParams().get("c");
  const pre = isCategoryId(seeded) ? seeded : null;

  const [i, setI] = useState(pre ? 1 : 0);
  const [cat, setCat] = useState<CategoryId | null>(pre);
  const [isAb, setIsAb] = useState(false);
  const [text, setText] = useState("");
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [askerAge, setAskerAge] = useState<AgeBand | null>(null);
  const [otherAge, setOtherAge] = useState<AgeBand | null>(null);
  const [relation, setRelation] = useState<RelationId | null>(null);
  const [panelAge, setPanelAge] = useState<PanelAge>("any");
  const [panelAttrs, setPanelAttrs] = useState<AttrId[]>([]);
  const [panelSize, setPanelSize] = useState<PanelSize>(3);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preview = redact(isAb ? `${a}\n${b}` : text);
  const nameWarn = mayContainName(isAb ? `${a}\n${b}` : text);
  const filled = isAb ? a.trim() && b.trim() : text.trim().length >= 10;

  async function send() {
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: cat, isAb, body: text, optionA: a, optionB: b,
          askerAge, otherAge, relation, panelAge, panelAttrs, panelSize,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "送れませんでした");
        setSending(false);
        return;
      }
      track("ask_submitted", { category: cat ?? "none", size: panelSize, ab: isAb });
      router.replace(`/ask/${json.token}?new=1`);
    } catch {
      setError("通信できませんでした。もう一度お試しください。");
      setSending(false);
    }
  }

  const back = () => (i === 0 ? router.push("/") : setI(i - 1));

  return (
    <div className="mx-auto w-full max-w-[560px] px-5 pb-16 pt-6 sm:px-8">
      <Progress step={i + 1} of={STEPS} />

      <button
        type="button"
        onClick={back}
        className="mt-4 inline-flex min-h-[44px] items-center text-[13.5px] text-ash transition-colors hover:text-void"
      >
        ← {i === 0 ? "やめる" : "ひとつ戻る"}
      </button>

      <div key={i} className="motion-safe:animate-hr-rise mt-5">
        {/* 1. 何について聞きたい？ */}
        {i === 0 && (
          <>
            <Ask>何について聞きたい？</Ask>
            <div className="mt-8 flex flex-col gap-2.5">
              {CATEGORIES.map((c) => (
                <Choice
                  key={c.id}
                  on={cat === c.id}
                  onClick={() => {
                    setCat(c.id);
                    setI(1);
                  }}
                >
                  <span className="min-w-0">
                    <span className="block font-bold">{c.label}</span>
                    <span className="mt-0.5 block text-[12.5px] leading-[1.7] text-ash">
                      {c.hint}
                    </span>
                  </span>
                </Choice>
              ))}
            </div>
          </>
        )}

        {/* 2. 内容 */}
        {i === 1 && cat && (
          <>
            <Ask>{isAb ? "AとBを書いてください。" : "聞きたいことを書いてください。"}</Ask>

            <div className="mt-5 flex gap-2">
              <Chip on={!isAb} onClick={() => setIsAb(false)}>
                ひとつ見てもらう
              </Chip>
              <Chip on={isAb} onClick={() => setIsAb(true)}>
                AとBを比べる
              </Chip>
            </div>

            {!isAb ? (
              <textarea
                rows={7}
                autoFocus
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={getCategory(cat).placeholder}
                className={`mt-5 ${inputClass}`}
              />
            ) : (
              <div className="mt-5 flex flex-col gap-4">
                {([["A", a, setA], ["B", b, setB]] as const).map(([l, v, set]) => (
                  <label key={l} className="block">
                    <Label>{l}</Label>
                    <textarea
                      rows={4}
                      value={v}
                      onChange={(e) => set(e.target.value)}
                      placeholder={`${l} の内容`}
                      className={`mt-1.5 ${inputClass}`}
                    />
                  </label>
                ))}
              </div>
            )}

            {/* 伏せ字は、書いている横で見せる */}
            {preview.findings.length > 0 && (
              <p className="mt-4 border-l border-void pl-3.5 text-[13px] leading-[1.9] text-bodytext">
                {preview.findings.map((f) => f.label).join("、")}
                を見つけました。回答者には伏せた形で渡します。
              </p>
            )}
            {nameWarn && (
              <p className="mt-3 border-l border-rule pl-3.5 text-[13px] leading-[1.9] text-ash">
                名前らしいものが含まれているかもしれません。
                こちらでは判断できないので、消すかどうかはご自身で決めてください。
              </p>
            )}

            <div className="mt-6">
              <Action onClick={() => setI(2)} disabled={!filled}>
                次へ
              </Action>
            </div>
            <div className="mt-4">
              <Note>
                相手を特定できることは書かないでください。
                写真や画面の画像は、いまは受け付けていません。
              </Note>
            </div>
          </>
        )}

        {/* 3. 状況 */}
        {i === 2 && (
          <>
            <Ask>状況を教えてください。</Ask>
            <div className="mt-2">
              <Note>回答する人が判断するのに使います。3つだけです。</Note>
            </div>

            <div className="mt-7">
              <Label>あなたの年代</Label>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {AGE_BANDS.map((x) => (
                  <Chip key={x} on={askerAge === x} onClick={() => setAskerAge(x)}>
                    {x}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="mt-7">
              <Label>相手の年代</Label>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {AGE_BANDS.map((x) => (
                  <Chip key={x} on={otherAge === x} onClick={() => setOtherAge(x)}>
                    {x}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="mt-7">
              <Label>いまの関係</Label>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {RELATIONS.map((r) => (
                  <Chip key={r.id} on={relation === r.id} onClick={() => setRelation(r.id)}>
                    {r.label}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-2">
              <Action onClick={() => setI(3)}>次へ</Action>
              <button
                type="button"
                onClick={() => setI(3)}
                className="min-h-[44px] text-[13.5px] text-ash transition-colors hover:text-void"
              >
                答えずに進む
              </button>
            </div>
          </>
        )}

        {/* 4. 誰に聞くか */}
        {i === 3 && (
          <>
            <Ask>誰に聞きますか？</Ask>
            <div className="mt-7 flex flex-col gap-2.5">
              {PANEL_AGES.map((p) => (
                <Choice key={p.id} on={panelAge === p.id} onClick={() => setPanelAge(p.id)}>
                  {p.label}
                </Choice>
              ))}
            </div>

            {/* 年齢以外の条件。ここがこの製品の中心。
                「誰か女性に聞いた」と「気になっている相手に近い人に聞いた」は別物。 */}
            <div className="mt-8">
              <Label>近い条件があれば</Label>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {ATTRS_OPEN.map((a) => (
                  <Chip
                    key={a.id}
                    on={panelAttrs.includes(a.id)}
                    onClick={() =>
                      setPanelAttrs((prev) =>
                        prev.includes(a.id) ? prev.filter((x) => x !== a.id) : [...prev, a.id],
                      )
                    }
                  >
                    {a.label}
                  </Chip>
                ))}
              </div>
              <div className="mt-3">
                <Note>
                  選ばなくても構いません。条件を足すほど、集まるまでに時間がかかります。
                </Note>
              </div>
            </div>

            <div className="mt-8">
              <Label>何人に聞きますか</Label>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {PANEL_SIZES_OPEN.map((n) => (
                  <Chip key={n} on={panelSize === n} onClick={() => setPanelSize(n)}>
                    {n}人
                  </Chip>
                ))}
              </div>
              <div className="mt-3">
                <Note>
                  いまは登録している女性メンバーが少ないため、3人と5人だけ受け付けています。
                </Note>
              </div>
            </div>

            <div className="mt-8">
              <Action onClick={() => setI(4)}>次へ</Action>
            </div>
          </>
        )}

        {/* 5. 確認して送る */}
        {i === 4 && cat && (
          <>
            <Ask>これで送ります。</Ask>

            <div className="mt-7 border-l border-void pl-4">
              <Label>{getCategory(cat).label}</Label>
              <p className="mt-2 whitespace-pre-wrap text-[15px] leading-[1.95] text-void">
                {isAb ? `A: ${redact(a).text}\nB: ${redact(b).text}` : preview.text}
              </p>
            </div>

            <dl className="mt-7 divide-y divide-rule border-y border-rule text-[14px]">
              {[
                ["聞く相手", PANEL_AGES.find((p) => p.id === panelAge)?.label ?? ""],
                ["条件", panelAttrs.length ? panelAttrs.map(attrLabel).join("・") : "指定なし"],
                ["人数", `${panelSize}人`],
                ["あなたの年代", askerAge ?? "未回答"],
                ["相手の年代", otherAge ?? "未回答"],
                ["関係", RELATIONS.find((r) => r.id === relation)?.label ?? "未回答"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-4 py-2.5">
                  <dt className="text-ash">{k}</dt>
                  <dd className="text-void">{v}</dd>
                </div>
              ))}
            </dl>

            {error && (
              <p className="mt-5 border-l border-void pl-3.5 text-[14px] leading-[1.9] text-void">
                {error}
              </p>
            )}

            <div className="mt-8">
              <Action onClick={send} disabled={sending}>
                {sending ? "送っています…" : "女性に聞く"}
              </Action>
            </div>
            <div className="mt-4">
              <Note>
                いまは無料です（招待した女性メンバーによるベータ中のため）。
                登録は要りません。結果を見るためのリンクを、次の画面でお渡しします。
              </Note>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
