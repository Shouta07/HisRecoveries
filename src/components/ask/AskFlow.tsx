"use client";

import { Fragment, useState } from "react";
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
import { add as rememberAsk } from "@/lib/myasks";

// 相談を出す。
//
// ── 12タップを4タップに削った ────────────────────
// 前の版は カテゴリ → 本文 → 状況3つ → 宛先3つ → 確認 → 送信 で、
// 実測 12タップ・7画面だった。
// 「30秒で聞いてみる」と書いておいて、1行の質問に12タップは嘘になる。
//
// 必須にしていたもののうち、本当に無いと配れないのは
// カテゴリ と 本文 だけ。ほかは既定値で足りる。
//   宛先  女性・5人（変えたい人だけ開く）
//   状況  自分の年代・相手の年代・関係（任意。開かなければ未回答で出す）
//
// 減らしたのは画面であって、集める項目ではない。
// 畳んだ中身は、開けば前と同じものが全部ある。
//
// ── 伏せ字を、書いている横で見せる ────────────────
// 「送信後に安全に処理します」では、本人は何が起きたか分からない。
// 消えていくのが見えれば、次から書かなくなる。
//
// ── 人名は、こちらで勝手に消さない ────────────────
// 機械では見分けられない。消すかどうかは本人が決める。

const STEPS = 2;

export default function AskFlow() {
  const router = useRouter();
  const seeded = useSearchParams().get("c");
  const pre = isCategoryId(seeded) ? seeded : null;

  const [i, setI] = useState(pre ? 1 : 0);
  const [cat, setCat] = useState<CategoryId | null>(pre);
  const [isAb, setIsAb] = useState(false);
  const [text, setText] = useState("");
  const [a, setA] = useState("");
  const [b, setB] = useState("");

  // 既定値を入れておく。変えたい人だけ開く。
  const [panelAge, setPanelAge] = useState<PanelAge>("any");
  const [panelAttrs, setPanelAttrs] = useState<AttrId[]>([]);
  const [panelSize, setPanelSize] = useState<PanelSize>(5);
  const [askerAge, setAskerAge] = useState<AgeBand | null>(null);
  const [otherAge, setOtherAge] = useState<AgeBand | null>(null);
  const [relation, setRelation] = useState<RelationId | null>(null);

  const [openWho, setOpenWho] = useState(false);
  const [openMore, setOpenMore] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preview = redact(isAb ? `${a}\n${b}` : text);
  const nameWarn = mayContainName(isAb ? `${a}\n${b}` : text);
  const filled = isAb ? Boolean(a.trim() && b.trim()) : text.trim().length >= 10;

  const whoLabel = [
    PANEL_AGES.find((p) => p.id === panelAge)?.label ?? "女性",
    ...panelAttrs.map(attrLabel),
    `${panelSize}人`,
  ].join(" · ");

  async function send() {
    if (!filled || sending) return;
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
      if (cat) rememberAsk({ token: json.token, category: cat, size: panelSize });
      router.replace(`/ask/${json.token}?new=1`);
    } catch {
      setError("通信できませんでした。もう一度お試しください。");
      setSending(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[560px] px-5 pb-16 pt-5 sm:px-8">
      <Progress step={i + 1} of={STEPS} />

      <button
        type="button"
        onClick={() => (i === 0 ? router.push("/") : setI(0))}
        className="mt-4 inline-flex min-h-[44px] items-center text-[13.5px] text-ash transition-colors hover:text-void"
      >
        ← {i === 0 ? "やめる" : "カテゴリを変える"}
      </button>

      <div key={i} className="motion-safe:animate-hr-rise mt-4">
        {/* ── 1. 何について ── */}
        {i === 0 && (
          <>
            <Ask>何について聞く？</Ask>
            <div className="mt-6 grid grid-cols-2 gap-2.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setCat(c.id);
                    setI(1);
                  }}
                  className="flex min-h-[84px] flex-col justify-center rounded-card border border-rule bg-card p-4 text-left shadow-card transition-shadow hover:shadow-card-hover"
                >
                  <span className="text-[15px] font-bold leading-[1.45]">{c.label}</span>
                  <span className="mt-1.5 text-[11.5px] leading-[1.6] text-ash">{c.hint}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* ── 2. 書いて、送る ── */}
        {i === 1 && cat && (
          <>
            <Ask>{isAb ? "AとBを書いて。" : "何を聞きたい？"}</Ask>

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
                rows={6}
                autoFocus
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={getCategory(cat).placeholder}
                className={`mt-4 ${inputClass}`}
              />
            ) : (
              <div className="mt-4 flex flex-col gap-3">
                {([["A", a, setA], ["B", b, setB]] as const).map(([l, v, set]) => (
                  <label key={l} className="block">
                    <Label>{l}</Label>
                    <textarea
                      rows={3}
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
              <p className="mt-3 rounded-soft bg-lime/30 px-3.5 py-2.5 text-[13px] leading-[1.8] text-void">
                {preview.findings.map((f) => f.label).join("、")}
                を見つけました。回答者には伏せて渡します。
              </p>
            )}
            {nameWarn && (
              <p className="mt-2.5 rounded-soft bg-bone-soft px-3.5 py-2.5 text-[13px] leading-[1.8] text-ash">
                名前らしいものがあります。消すかどうかはご自身で決めてください。
              </p>
            )}

            {/* 宛先。既定のまま送れる。変えたい人だけ開く */}
            <div className="mt-6 rounded-card border border-rule bg-card shadow-card">
              <button
                type="button"
                onClick={() => setOpenWho(!openWho)}
                aria-expanded={openWho}
                className="flex min-h-[56px] w-full items-center justify-between gap-3 px-4 text-left"
              >
                <span className="min-w-0">
                  <span className="block text-[12px] text-ash">誰に聞く</span>
                  <span className="mt-0.5 block truncate text-[14.5px] font-bold">{whoLabel}</span>
                </span>
                <span className="shrink-0 rounded-pill bg-bone-soft px-3 py-1.5 text-[12px] font-bold text-ash">
                  {openWho ? "閉じる" : "変える"}
                </span>
              </button>

              {openWho && (
                <div className="border-t border-rule px-4 pb-5 pt-4">
                  <Label>年代</Label>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {PANEL_AGES.map((p) => (
                      <Chip key={p.id} on={panelAge === p.id} onClick={() => setPanelAge(p.id)}>
                        {p.label}
                      </Chip>
                    ))}
                  </div>

                  <div className="mt-5">
                    <Label>近い条件</Label>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {ATTRS_OPEN.map((x) => (
                        <Chip
                          key={x.id}
                          on={panelAttrs.includes(x.id)}
                          onClick={() =>
                            setPanelAttrs((prev) =>
                              prev.includes(x.id)
                                ? prev.filter((y) => y !== x.id)
                                : [...prev, x.id],
                            )
                          }
                        >
                          {x.label}
                        </Chip>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5">
                    <Label>人数</Label>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {PANEL_SIZES_OPEN.map((n) => (
                        <Chip key={n} on={panelSize === n} onClick={() => setPanelSize(n)}>
                          {n}人
                        </Chip>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 状況。任意。開かなければ未回答のまま送る */}
            <div className="mt-3 rounded-card border border-rule bg-card shadow-card">
              <button
                type="button"
                onClick={() => setOpenMore(!openMore)}
                aria-expanded={openMore}
                className="flex min-h-[52px] w-full items-center justify-between gap-3 px-4 text-left"
              >
                <span className="text-[14px] text-ash">
                  状況も伝える
                  <span className="ml-2 text-[12px]">任意</span>
                </span>
                <span className="shrink-0 text-[12px] font-bold text-ash">
                  {openMore ? "閉じる" : "開く"}
                </span>
              </button>

              {openMore && (
                <div className="border-t border-rule px-4 pb-5 pt-4">
                  {(
                    [
                      ["あなたの年代", askerAge, setAskerAge],
                      ["相手の年代", otherAge, setOtherAge],
                    ] as const
                  ).map(([label, val, set]) => (
                    <div key={label} className="mb-5">
                      <Label>{label}</Label>
                      <div className="mt-2.5 flex flex-wrap gap-2">
                        {AGE_BANDS.map((x) => (
                          <Chip key={x} on={val === x} onClick={() => set(val === x ? null : x)}>
                            {x}
                          </Chip>
                        ))}
                      </div>
                    </div>
                  ))}
                  <Label>いまの関係</Label>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {RELATIONS.map((r) => (
                      <Chip
                        key={r.id}
                        on={relation === r.id}
                        onClick={() => setRelation(relation === r.id ? null : r.id)}
                      >
                        {r.label}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {error && (
              <p className="mt-5 rounded-soft border border-void px-4 py-3 text-[14px] leading-[1.8]">
                {error}
              </p>
            )}

            <div className="mt-7">
              <Action onClick={send} disabled={!filled || sending}>
                {sending ? "送っています…" : `${panelSize}人に聞く`}
              </Action>
            </div>
            <div className="mt-4">
              <Note>
                登録は要りません。いまは無料です。
                相手を特定できることは書かないでください。
              </Note>
            </div>
          </>
        )}
      </div>

      {/* 確認画面は置かない。
          1行の質問に確認を挟むと、そこで半分が帰る。
          伏せ字は書いている横で見えているので、送る前に分かる。 */}
      <Fragment />
    </div>
  );
}
