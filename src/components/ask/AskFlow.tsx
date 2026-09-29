"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CATEGORIES, RELATIONS, AGE_BANDS, PANEL_AGES, ATTRS_OPEN,
  category as getCategory, isCategoryId, attrLabel,
  type CategoryId, type AgeBand, type RelationId, type PanelAge, type AttrId,
} from "@/lib/ask/model";
import {
  sellable, plan as getPlan, isSellable, allowsTargeting, DEFAULT_PLAN, ENTRY_PLAN, type PlanId,
} from "@/lib/ask/plans";
import { redact, mayContainName } from "@/lib/ask/redact";
import {
  BigAsk as Ask, Choice, AttributeChip as Chip, Action, Note, FieldLabel as Label,
  Progress, inputClass,
} from "@/components/brand/kit";
import AskAssist from "@/components/ask/AskAssist";
import AvailableNow from "@/components/ask/AvailableNow";
import { track } from "@/lib/analytics";
import { add as rememberAsk, cleanThreadLabel, type Thread } from "@/lib/myasks";
import Continue from "@/components/ask/Continue";
import { isStepId, step as getStep } from "@/lib/ask/journey";

// 相談を出す。
//
// ── 流れ ──────────────────────────────────────────
//   1 何を聞きたいか選ぶ
//   2 質問を書く
//   3 誰に聞くか選ぶ ＋ 料金確認
//   → Stripe で支払う
//   → 回答者へ届く
//
// 料金確認の画面を置くのは、有料だから。
// いくら払うのか分からないまま決済画面に飛ぶのは、押した人が驚く。
// ただし確認は1枚だけ。同じことを2回聞かない。
//
// ── 減らしたのは画面であって、集める項目ではない ──
// 必須は カテゴリ と 本文 だけ。ほかは既定値で足りる。
//   宛先  女性・プランの人数（条件を指定できるプランなら選べる）
//   状況  自分の年代・相手の年代・関係（任意。開かなければ未回答で出す）
//
// ── 金額はサーバーが決める ────────────────────────
// ここから送るのはプランIDだけ。金額は送らない。
// 送れる形にすると、1円で Checkout を作られる。
//
// ── 伏せ字を、書いている横で見せる ────────────────
// 「送信後に安全に処理します」では、本人は何が起きたか分からない。
// 消えていくのが見えれば、次から書かなくなる。
//
// ── 人名は、こちらで勝手に消さない ────────────────
// 機械では見分けられない。消すかどうかは本人が決める。
//
// ── AIにも聞いたか ────────────────────────────────
// 検証したいのは「ChatGPT が無料で使えるのに、それでも払うか」の1点。
// だから1問だけ、任意で聞く。答えなくても先へ進める。

const STEPS = 3;

/** 買えるプランだけ。受付前のものを選ばせない */
const BUYABLE = sellable();

/** 条件を指定できるいちばん安いプラン。指定したくなった人の行き先 */
const TARGET_PLAN: PlanId =
  ([...BUYABLE].sort((a, b) => a.yen - b.yen).find((p) => p.targeting) ?? BUYABLE[0]).id;

export default function AskFlow() {
  const router = useRouter();
  const params = useSearchParams();
  const seeded = params.get("c");
  const pre = isCategoryId(seeded) ? seeded : null;
  const seededPlan = params.get("plan");

  const [i, setI] = useState(pre ? 1 : 0);
  const [cat, setCat] = useState<CategoryId | null>(pre);
  const [planId, setPlanId] = useState<PlanId>(isSellable(seededPlan) ? seededPlan : DEFAULT_PLAN);
  const [isAb, setIsAb] = useState(false);
  const [text, setText] = useState("");
  const [a, setA] = useState("");
  const [b, setB] = useState("");

  const [panelAge, setPanelAge] = useState<PanelAge>("any");
  const [panelAttrs, setPanelAttrs] = useState<AttrId[]>([]);
  const [askerAge, setAskerAge] = useState<AgeBand | null>(null);
  const [otherAge, setOtherAge] = useState<AgeBand | null>(null);
  const [relation, setRelation] = useState<RelationId | null>(null);
  const [askedAi, setAskedAi] = useState<boolean | null>(null);

  // ヒーローの「うまく書けない」から来たら、最初から開いておく。
  const [assist, setAssist] = useState(params.get("assist") === "1");
  // 恋愛のどこで悩んでいるか。トップから来たときは決まっている。
  const seededStep = params.get("step");
  const [stepId] = useState(isStepId(seededStep) ? seededStep : null);
  // 同じ相手についての相談をまとめる。相手の情報は持たない。
  const [thread, setThread] = useState<string | null>(null);
  const [threadLabel, setThreadLabel] = useState("");
  const [openMore, setOpenMore] = useState(false);
  const [openPlan, setOpenPlan] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const p = getPlan(planId);
  const canTarget = allowsTargeting(planId);

  const preview = redact(isAb ? `${a}\n${b}` : text);
  const nameWarn = mayContainName(isAb ? `${a}\n${b}` : text);
  const filled = isAb ? Boolean(a.trim() && b.trim()) : text.trim().length >= 10;

  // 指定できないプランに戻したときは、指定も消す。
  // 残しておくと、画面には出ていない条件が付いたまま送られる。
  function choosePlan(next: PlanId) {
    if (next === planId) return;
    track("plan_selected", { plan: next, from: "flow" });
    setPlanId(next);
    if (!allowsTargeting(next)) {
      setPanelAge("any");
      setPanelAttrs([]);
    }
    setOpenPlan(false);
  }

  function toStep(n: number) {
    setI(n);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }

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
          askerAge, otherAge, relation, panelAge, panelAttrs, askedAi,
          // 恋愛のどの段階か。相手の情報ではないので保存してよい。
          step: stepId,
          // 金額は送らない。プランIDだけ。
          plan: planId,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (res.status === 422) track("ask_blocked", { category: cat ?? "none" });
        setError(json.error ?? "送れませんでした");
        setSending(false);
        return;
      }

      track("ask_submitted", { category: cat ?? "none", plan: planId, ab: isAb });
      if (cat) {
        rememberAsk({
          token: json.token,
          category: cat,
          size: p.answers,
          step: stepId ?? undefined,
          // まとまりのラベルは端末の中だけ。サーバーには送らない。
          thread: cleanThreadLabel(thread ?? undefined),
        });
      }

      // 支払いへ。作れなかったときは相談の画面へ送る。
      // そこに「お支払いへ進む」と、進めない理由が出る。
      track("checkout_started", { plan: planId });
      const pay = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: json.token, plan: planId }),
      });
      const payJson = await pay.json().catch(() => ({}));
      if (pay.ok && typeof payJson.url === "string") {
        window.location.assign(payJson.url);
        return;
      }
      track("checkout_blocked", { plan: planId, why: String(payJson.error ?? pay.status) });
      router.replace(`/ask/${json.token}?new=1`);
    } catch {
      setError("通信できませんでした。もう一度お試しください。");
      setSending(false);
    }
  }

  const backLabel = i === 0 ? "やめる" : i === 1 ? "選びなおす" : "書きなおす";

  return (
    <div className="mx-auto w-full max-w-[560px] px-5 pb-16 pt-5 sm:px-8">
      <Progress step={i + 1} of={STEPS} />

      <button
        type="button"
        onClick={() => (i === 0 ? router.push("/") : toStep(i - 1))}
        className="mt-4 inline-flex min-h-[44px] items-center text-[13.5px] text-steel transition-colors hover:text-brand"
      >
        ← {backLabel}
      </button>

      <div key={i} className="motion-safe:animate-hr-rise mt-4">
        {/* ── 1. 何について ── */}
        {i === 0 && (
          <>
            <Ask>何に迷ってる？</Ask>

            {/* 2回目からは、ゼロから説明させない */}
            <Continue
              onPick={(t: Thread) => {
                setThread(t.id);
                setThreadLabel(t.label);
              }}
            />

            {thread && (
              <p className="mt-3 rounded-soft bg-brand-tint px-3.5 py-2.5 text-[12.5px] leading-[1.75] text-slate">
                「{threadLabel}」の続きとして相談します。
                前回までの相談は、回答する方には渡していません。
              </p>
            )}

            {stepId && (
              <p className="mt-3 text-[12.5px] text-steel">
                {getStep(stepId).label}の段階として受け取ります。
              </p>
            )}

            <div className="mt-6 grid grid-cols-2 gap-2.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setCat(c.id);
                    toStep(1);
                  }}
                  className="flex min-h-[84px] flex-col justify-center rounded-card border border-line bg-paper p-4 text-left shadow-card transition-shadow hover:shadow-card-hover"
                >
                  <span className="text-[15px] font-bold leading-[1.45]">{c.label}</span>
                  <span className="mt-1.5 text-[11.5px] leading-[1.6] text-steel">{c.hint}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* ── 2. 質問を書く ── */}
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
              <p className="mt-3 rounded-soft bg-brand-tint px-3.5 py-2.5 text-[13px] leading-[1.8] text-slate">
                {preview.findings.map((f) => f.label).join("、")}
                を見つけました。回答者には伏せて渡します。
              </p>
            )}
            {nameWarn && (
              <p className="mt-2.5 rounded-soft bg-mist px-3.5 py-2.5 text-[13px] leading-[1.8] text-steel">
                名前らしいものがあります。消すかどうかはご自身で決めてください。
              </p>
            )}

            {/* うまく書けない人の逃げ道。
                全員に自分で言語化させると、書ける人しか通れない。 */}
            {!isAb &&
              (assist ? (
                <AskAssist
                  onClose={() => setAssist(false)}
                  onDone={(t) => {
                    setText((prev) => (prev.trim() ? `${prev}\n${t}` : t));
                    setAssist(false);
                  }}
                />
              ) : (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="text-[13.5px] text-steel">うまく書けない？</span>
                  <button
                    type="button"
                    onClick={() => {
                      setAssist(true);
                      track("assist_opened", { from: cat ?? "none" });
                    }}
                    className="inline-flex min-h-[44px] items-center rounded-pill border border-brand bg-paper px-4 text-[13.5px] font-bold text-brand shadow-card transition-shadow hover:shadow-card-hover"
                  >
                    一緒に整理する
                  </button>
                </div>
              ))}

            {/* 状況。任意。開かなければ未回答のまま送る */}
            <div className="mt-6 rounded-card border border-line bg-paper shadow-card">
              <button
                type="button"
                onClick={() => setOpenMore(!openMore)}
                aria-expanded={openMore}
                className="flex min-h-[52px] w-full items-center justify-between gap-3 px-4 text-left"
              >
                <span className="text-[14px] text-steel">
                  状況も伝える
                  <span className="ml-2 text-[12px]">任意</span>
                </span>
                <span className="shrink-0 text-[12px] font-bold text-steel">
                  {openMore ? "閉じる" : "開く"}
                </span>
              </button>

              {openMore && (
                <div className="border-t border-line px-4 pb-5 pt-4">
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

            <div className="mt-7">
              <Action onClick={() => toStep(2)} disabled={!filled}>
                誰に聞くか選ぶ
              </Action>
            </div>
            <div className="mt-4">
              <Note>相手を特定できることは書かないでください。</Note>
            </div>
          </>
        )}

        {/* ── 3. 誰に聞くか ＋ 料金確認 ── */}
        {i === 2 && cat && (
          <>
            <Ask>誰に聞く？</Ask>

            {canTarget ? (
              <>
                <div className="mt-6">
                  <Label>年代</Label>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {PANEL_AGES.map((x) => (
                      <Chip key={x.id} on={panelAge === x.id} onClick={() => setPanelAge(x.id)}>
                        {x.label}
                      </Chip>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
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

                {/* 条件を変えるたびに、いま答えられる人数が動く。
                    0人のまま買わせない。一人ひとりのカードは出さない
                    （条件を変えて叩くと個人が絞り込めてしまう）。 */}
                <AvailableNow age={panelAge} attrs={panelAttrs} need={p.answers} />
              </>
            ) : (
              <div className="mt-6 rounded-card border border-line bg-paper p-5 shadow-card">
                <p className="text-[14.5px] font-bold">女性 {p.answers}人</p>
                <p className="mt-2.5 text-[13.5px] leading-[1.85] text-steel">
                  {p.name}では、こちらで相手に近い方を選んでお願いします。
                  年代や条件をご自身で選びたい場合は、{getPlan(TARGET_PLAN).name}へ。
                </p>
                <button
                  type="button"
                  onClick={() => choosePlan(TARGET_PLAN)}
                  className="mt-4 inline-flex min-h-[48px] items-center justify-center rounded-pill border border-brand bg-paper px-5 text-[14px] font-bold text-brand shadow-card transition-shadow hover:shadow-card-hover"
                >
                  {getPlan(TARGET_PLAN).name}（¥{getPlan(TARGET_PLAN).yen.toLocaleString()}）にする
                </button>
              </div>
            )}

            {/* ── 料金確認 ── */}
            <div className="mt-8 rounded-card border border-brand bg-paper shadow-card">
              <div className="border-b border-line px-5 py-4">
                <p className="text-[12px] font-bold text-steel">お支払い内容</p>
                <div className="mt-2.5 flex items-baseline justify-between gap-3">
                  <p className="min-w-0 text-[15.5px] font-black leading-[1.5]">{p.name}</p>
                  <p className="shrink-0 text-[28px] font-black tabular-nums leading-none">
                    ¥{p.yen.toLocaleString()}
                  </p>
                </div>
                <p className="mt-2 text-[12px] text-steel">税込 / 1回のみ。月額はありません。</p>
              </div>

              <button
                type="button"
                onClick={() => setOpenPlan(!openPlan)}
                aria-expanded={openPlan}
                className="flex min-h-[48px] w-full items-center justify-between gap-3 px-5 text-left"
              >
                <span className="text-[13.5px] text-steel">プランを変える</span>
                <span className="shrink-0 text-[12px] font-bold text-brand">
                  {openPlan ? "閉じる" : "見る"}
                </span>
              </button>

              {openPlan && (
                <div className="flex flex-col gap-2 border-t border-line px-5 py-4">
                  {BUYABLE.map((x) => (
                    <Choice key={x.id} on={planId === x.id} onClick={() => choosePlan(x.id)}>
                      <span className="min-w-0">
                        <span className="block text-[15px] font-bold">
                          {x.name}
                          <span className="ml-2 tabular-nums">¥{x.yen.toLocaleString()}</span>
                        </span>
                        <span className="mt-1 block text-[12.5px] leading-[1.6] opacity-70">
                          {x.tagline}
                        </span>
                      </span>
                    </Choice>
                  ))}
                </div>
              )}
            </div>

            {/* 任意の1問。答えなくても進める */}
            <div className="mt-5 rounded-card border border-line bg-mist p-4">
              <p className="text-[13.5px] font-bold">
                AIにも聞きましたか？
                <span className="ml-2 text-[12px] font-normal text-steel">任意</span>
              </p>
              <div className="mt-3 flex gap-2">
                <Chip on={askedAi === true} onClick={() => setAskedAi(askedAi === true ? null : true)}>
                  聞いた
                </Chip>
                <Chip
                  on={askedAi === false}
                  onClick={() => setAskedAi(askedAi === false ? null : false)}
                >
                  聞いていない
                </Chip>
              </div>
            </div>

            {error && (
              <p className="mt-5 rounded-soft border border-slate px-4 py-3 text-[14px] leading-[1.8]">
                {error}
              </p>
            )}

            <div className="mt-7">
              <Action onClick={send} disabled={sending}>
                {sending ? "お支払いへ進みます…" : `¥${p.yen.toLocaleString()} を支払って聞く`}
              </Action>
            </div>
            <div className="mt-4">
              <Note>
                次の画面でカード情報を入力します（Stripe）。
                お支払いのあとに、回答者への募集を始めます。
              </Note>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
