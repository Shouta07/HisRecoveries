"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  OPEN_CATEGORIES, RELATIONS, AGE_BANDS, PANEL_AGES, ATTRS_OPEN,
  category as getCategory, isCategoryId, attrLabel,
  type CategoryId, type AgeBand, type RelationId, type PanelAge, type AttrId,
} from "@/lib/ask/model";
import {
  plan as getPlan, isSellable, allowsTargeting, priceOf, DEFAULT_PLAN, ENTRY_PLAN,
  type PlanId,
} from "@/lib/ask/plans";
import { redact, mayContainName } from "@/lib/ask/redact";
import {
  BigAsk as Ask, Choice, AttributeChip as Chip, Action, Note, FieldLabel as Label,
  Progress, inputClass,
} from "@/components/brand/kit";
import AskAssist from "@/components/ask/AskAssist";
import AvailableNow from "@/components/ask/AvailableNow";
import { track } from "@/lib/analytics";
import { isSensitive, passCost, CONSENT, PASS_COST } from "@/lib/ask/sensitive";
import { add as rememberAsk, cleanThreadLabel, type Thread } from "@/lib/myasks";
import Continue from "@/components/ask/Continue";
import { isStepId, step as getStep } from "@/lib/ask/journey";
import { WAIT_MINUTES } from "@/lib/ask/shortfall";
import Yen from "@/components/brand/Yen";

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

export default function AskFlow() {
  const router = useRouter();
  const params = useSearchParams();
  const seeded = params.get("c");
  // 受付を止めたカテゴリへのリンクが残っていても、そこから始めない。
  const pre =
    isCategoryId(seeded) && OPEN_CATEGORIES.some((c) => c.id === seeded) ? seeded : null;
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
  // 前回の続きから。ケースの鍵が来ていれば、そのケースにぶら下げる
  const seededCase = params.get("case");
  const [stepId] = useState(isStepId(seededStep) ? seededStep : null);

  // 言いにくい相談か。2回分を使い、受けると決めた女性にだけ届く。
  const sensitive = isSensitive(cat);
  const cost = passCost(cat);

  // 押す直前に「何を相談するのか」を見せる。
  // 自分が書いたものが、そのまま出てくる形にする（ここで足さない）。
  const summary = (isAb ? `${a.trim()} と ${b.trim()} のどちらか` : text.trim())
    .split("\n")[0]
    .slice(0, 60);

  // 持っている5回パスの残り。無ければ null。
  // 鍵はこの端末にだけ置く（会員登録が無いので、ここが持ち主の証）。
  const [pass, setPass] = useState<{ token: string; remaining: number } | null>(null);
  useEffect(() => {
    let live = true;
    try {
      const t = localStorage.getItem("hr_pass");
      if (!t) return;
      void fetch(`/api/pass/${t}`, { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => {
          if (live && j && typeof j.remaining === "number") {
            setPass({ token: t, remaining: j.remaining });
          }
        })
        .catch(() => {});
    } catch {
      // localStorage が使えない端末。パス無しとして進む
    }
    return () => {
      live = false;
    };
  }, []);
  // 同じ相手についての相談をまとめる。相手の情報は持たない。
  const [thread, setThread] = useState<string | null>(null);
  const [threadLabel, setThreadLabel] = useState("");
  const [openMore, setOpenMore] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const p = getPlan(planId);
  const canTarget = allowsTargeting(planId);
  // 金額も人数も、プランから引き直す。画面に数字を直書きしない。
  const total = priceOf(planId);
  const answers = p.answers;

  const preview = redact(isAb ? `${a}\n${b}` : text);
  const nameWarn = mayContainName(isAb ? `${a}\n${b}` : text);
  const filled = isAb ? Boolean(a.trim() && b.trim()) : text.trim().length >= 10;

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
          // 5回パスを持っているなら、その鍵。
          // サーバーが残りを確かめて、あれば1回使う。
          // 残りが無ければ使わない（この画面の数字は信じない）。
          pass: pass?.token ?? null,
          // 前回の続きなら、そのケースの鍵。
          // 無ければサーバー側で1つ作る（相手ごとに1つ）。
          case: seededCase,
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
          size: answers,
          step: stepId ?? undefined,
          // まとまりのラベルは端末の中だけ。サーバーには送らない。
          thread: cleanThreadLabel(thread ?? undefined),
        });
      }

      // パスの1回ぶんで済んだなら、決済の画面は出さない。
      // 迷うたびにカードの画面を出すと、そこで止まる。
      if (json.used) {
        if (typeof json.remaining === "number") {
          setPass((prev) => (prev ? { ...prev, remaining: json.remaining } : prev));
        }
        track("pass_used", { remaining: Number(json.remaining ?? 0) });
        router.replace(`/ask/${json.token}?new=1`);
        return;
      }

      // 持っていないなら、ここで初めて決済へ。
      // 作れなかったときは相談の画面へ送る（進めない理由がそこに出る）。
      track("checkout_started", { plan: planId, value: total });
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
            <Ask>いま、何を決めようとしてる？</Ask>

            {/* 広告や投稿から、ここへ直接来る人がいる。
                トップを読んでいないので、誰が読むのかと、いくらかを
                1行だけ置く。ここが無いと、値段を知らないまま
                3画面目まで進むことになる。 */}
            <ul className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] font-bold text-steel">
              <li>実在の女性{getPlan(DEFAULT_PLAN).answers}人が読みます</li>
              <li aria-hidden className="text-line">|</li>
              <li><Yen yen={getPlan(ENTRY_PLAN).yen} />から</li>
              <li aria-hidden className="text-line">|</li>
              <li>匿名</li>
            </ul>

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
              {OPEN_CATEGORIES.map((c) => (
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
                <AvailableNow age={panelAge} attrs={panelAttrs} need={answers} />
              </>
            ) : null}

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

            {/* ── ここまで無料。何を相談するのかが決まってから、値段の話をする ── */}
            <div className="mt-8 rounded-card border border-brand bg-paper shadow-card">
              <div className="border-b border-line px-5 py-4">
                <p className="text-[12px] font-bold text-steel">相談内容をまとめました</p>
                <p className="mt-2 text-[15px] font-bold leading-[1.7] text-slate">
                  {summary || "今回確認したいこと"}
                </p>
                <p className="mt-2 text-[12.5px] text-steel">
                  {getCategory(cat).label}
                  {canTarget && panelAge !== "any" && ` / ${panelAge}の女性`}
                </p>
              </div>

              {/* 何が返るか。押す直前にもう一度出す */}
              <dl className="divide-y divide-line text-[13px] leading-[1.75]">
                {[
                  ["読む人", `実在の女性 ${answers}人`],
                  [
                    "返るもの",
                    "第一印象、良いところ、気になったところ、そう感じた理由、直し方、そのまま使える修正文、次にやること",
                  ],
                  ["追加料金", "なし。往復のやりとりは付きません"],
                  [
                    "届かないとき",
                    `${WAIT_MINUTES}分たっても届かなければ、条件を広げて待つか、使った1回分を戻すかを選べます`,
                  ],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-3 px-5 py-3">
                    <dt className="w-[5.5em] shrink-0 font-bold text-steel">{k}</dt>
                    <dd className="min-w-0 flex-1 text-slate">{v}</dd>
                  </div>
                ))}
              </dl>

              {/* 持っている人には、決済の画面を出さない */}
              <div className="border-t border-line bg-mist px-5 py-4">
                {sensitive && (
                  <div className="mb-4 rounded-soft border border-line bg-paper px-4 py-3.5">
                    <p className="text-[12.5px] font-bold text-slate">
                      この相談は、受けると決めた女性にだけ届きます
                    </p>
                    <p className="mt-1.5 text-[12px] leading-[1.8] text-steel">{CONSENT}</p>
                    <p className="mt-2 text-[12px] leading-[1.8] text-steel">
                      返す前にこちらが目を通すので、{PASS_COST}回分を使います。
                    </p>
                  </div>
                )}
                {pass && pass.remaining >= cost ? (
                  <>
                    <p className="text-[13.5px] font-bold leading-[1.7] text-slate">
                      この相談に、確かめる{cost}回分を使います。
                    </p>
                    <p className="mt-1.5 text-[12.5px] tabular-nums text-steel">
                      残り {pass.remaining}回 → {pass.remaining - cost}回
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-[13.5px] font-bold leading-[1.7] text-slate">
                      この相談は「確かめる」{cost}回分で確認できます。
                    </p>
                    <p className="mt-2 flex flex-wrap items-baseline gap-x-2 text-[13.5px]">
                      <span className="font-bold text-slate">{p.name}</span>
                      <span className="text-[22px] font-black leading-none">
                        <Yen yen={p.yen} />
                      </span>
                    </p>
                    <p className="mt-1.5 text-[12.5px] leading-[1.75] text-steel">
                      {p.uses
                        ? `この相談のあと、あと${p.uses - 1}回ぶんは別の迷いにも使えます。月額はありません。自動更新もしません。`
                        : "税込 / 1回のみ。月額はありません。"}
                    </p>
                  </>
                )}
              </div>
            </div>

            {error && (
              <p className="mt-5 rounded-soft border border-slate px-4 py-3 text-[14px] leading-[1.8]">
                {error}
              </p>
            )}

            <div className="mt-7">
              <Action onClick={send} disabled={sending}>
                {sending
                  ? "進んでいます…"
                  : pass && pass.remaining > 0
                    ? `${cost}回分を使って確かめる`
                    : `${p.uses ?? 1}回分を持って、この相談を出す`}
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
