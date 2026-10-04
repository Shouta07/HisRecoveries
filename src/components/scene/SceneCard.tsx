"use client";

import { useState } from "react";
import Link from "next/link";
import { MIN_SHOWN, type Scene } from "@/lib/scene/problems";
import type { SceneResult, Tally } from "@/lib/scene/store";
import { GENDER_LABEL, type Gender } from "@/lib/who";
import { track } from "@/lib/analytics";

/* ══════════════════════════════════════════════════
   1場面。選んでから、分布を見せる
   ══════════════════════════════════════════════════

   ── 順番を変えない ──────────────────────────────
   立場を選ぶ → 手を選ぶ → 分布が出る。

   分布を先に見せると、多数派に引っ張られる。
   そうなると、集まった答えが「前の人の答え」になって、
   数が増えるほど意味が無くなる。

   口（/api/scene）にも分布だけを取る道は置いていない。

   ── 正解を出さない ──────────────────────────────
   選んだあとに出るのは、点数でも採点でもなく、
   同じ場面を見た人がどう分かれたか。

   「あなたの答えは◯◯でした」も書かない。
   選んだものに印を付けるだけ。 */

/** 端末が持つ使い捨ての印。本人を指さない */
function voterId(): string {
  const KEY = "tashikame.scene.voter";
  try {
    const had = window.localStorage.getItem(KEY);
    if (had && /^[A-Za-z0-9]{8,64}$/.test(had)) return had;
    const made = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((n) => n.toString(36))
      .join("")
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 24);
    window.localStorage.setItem(KEY, made);
    return made;
  } catch {
    /* 端末が覚えてくれないとき（プライベートウィンドウなど）は、
       その場かぎりの印にする。答えられないよりはよい。 */
    return Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((n) => n.toString(36))
      .join("")
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 24);
  }
}

function Bar({ n, total }: { n: number; total: number }) {
  const w = total > 0 ? Math.round((n / total) * 100) : 0;
  return (
    <span aria-hidden className="mt-1.5 block h-1.5 w-full overflow-hidden rounded-pill bg-mist">
      <span className="block h-full rounded-pill bg-brand" style={{ width: `${w}%` }} />
    </span>
  );
}

/**
 * 分布。
 *
 * 割合（%）では出さない。「5人のうち3人」で出す。
 * 3人中2人でも 67% になるので、数えた人数が見えないと嘘に近い。
 */
function Dist({ scene, t, label, picked }: {
  scene: Scene;
  t: Tally;
  label: string;
  picked: string;
}) {
  if (!t.shown) {
    return (
      <div className="rounded-card border border-line bg-paper p-4">
        <p className="text-[12px] font-black text-steel">{label}</p>
        <p className="mt-1.5 text-[13px] leading-[1.8] text-steel">
          {t.total === 0
            ? "まだ誰も答えていません。"
            : `まだ${t.total}人です。${MIN_SHOWN}人になったら、どう分かれたかを出します。`}
        </p>
      </div>
    );
  }
  return (
    <div className="rounded-card border border-line bg-paper p-4">
      <p className="text-[12px] font-black text-steel">
        {label}　{t.total}人
      </p>
      <ul className="mt-2.5 flex flex-col gap-2.5">
        {scene.choices.map((c) => {
          const n = t.counts[c.id] ?? 0;
          return (
            <li key={c.id}>
              {/* 折り返させない。
                  長い選択肢（お礼と一緒に、次の誘いまで入れて送る）だと、
                  flex-wrap が人数を次の行へ落として、
                  行ごとに人数の位置が揃わなくなっていた。
                  文のほうを中で折る。 */}
              <span className="flex items-baseline justify-between gap-x-3">
                <span
                  className={`min-w-0 text-[13px] leading-[1.6] ${
                    c.id === picked ? "font-black text-slate" : "text-steel"
                  }`}
                >
                  {c.text}
                  {c.id === picked && (
                    <span className="ml-1.5 rounded-pill bg-brand-tint px-1.5 py-0.5 text-[10px] font-bold text-brand-deep">
                      あなた
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-[12.5px] font-bold tabular-nums text-steel">
                  {t.total}人中 {n}人
                </span>
              </span>
              <Bar n={n} total={t.total} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function SceneCard({ scene }: { scene: Scene }) {
  const [gender, setGender] = useState<Gender | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [result, setResult] = useState<SceneResult | null>(null);
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);

  async function pick(choiceId: string) {
    if (!gender || sending) return;
    setSending(true);
    setFailed(null);
    setPicked(choiceId);
    try {
      const res = await fetch("/api/scene", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sceneId: scene.id,
          choiceId,
          gender,
          voter: voterId(),
        }),
      });
      const j = (await res.json().catch(() => null)) as
        | { result?: SceneResult; error?: string }
        | null;
      if (!res.ok || !j?.result) {
        setFailed(j?.error ?? "いまは集計できませんでした。");
        return;
      }
      setResult(j.result);
      track("scene_answered", { scene: scene.id, choice: choiceId });
    } catch {
      setFailed("いまは集計できませんでした。");
    } finally {
      setSending(false);
    }
  }

  const other: Gender = gender === "female" ? "male" : "female";

  return (
    <div className="flex flex-col gap-6">
      {/* ── 場面 ─────────────────────────────── */}
      <div className="rounded-card border border-line bg-paper p-5 shadow-card">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="rounded-pill bg-mist px-2 py-0.5 text-[10.5px] font-bold text-steel">
            {scene.app}
          </span>
          <span className="text-[12px] font-bold text-steel">{scene.stage}</span>
        </div>
        <div className="mt-3 flex flex-col gap-1">
          {scene.setup.map((line) => (
            <p key={line} className="text-[16px] font-bold leading-[1.8] text-slate">
              {line}
            </p>
          ))}
        </div>
      </div>

      {/* ── 1. 立場 ──────────────────────────── */}
      {/* 分けないと、男性が男性の答えを「異性の反応」として読む */}
      <div>
        <p className="text-[12px] font-black text-steel">1. あなたは</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {(["male", "female"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGender(g)}
              aria-pressed={gender === g}
              disabled={Boolean(result)}
              className={`min-h-[52px] rounded-card border text-[14.5px] font-bold transition-colors disabled:opacity-60 ${
                gender === g ? "border-brand bg-brand text-paper" : "border-line bg-paper text-slate"
              }`}
            >
              {GENDER_LABEL[g]}
            </button>
          ))}
        </div>
      </div>

      {/* ── 2. 手 ────────────────────────────── */}
      <div>
        <p className="text-[12px] font-black text-steel">2. あなたなら、どうする？</p>
        <ul className="mt-2 flex flex-col gap-2">
          {scene.choices.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => pick(c.id)}
                disabled={!gender || sending || Boolean(result)}
                aria-pressed={picked === c.id}
                className={`flex min-h-[56px] w-full items-center gap-3 rounded-card border px-4 py-3 text-left text-[14.5px] font-bold leading-[1.6] transition-colors disabled:opacity-60 ${
                  picked === c.id
                    ? "border-brand bg-brand-tint text-slate"
                    : "border-line bg-paper text-slate"
                }`}
              >
                <span
                  aria-hidden
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-black uppercase ${
                    picked === c.id ? "bg-brand text-paper" : "bg-mist text-steel"
                  }`}
                >
                  {c.id}
                </span>
                <span className="min-w-0">{c.text}</span>
              </button>
            </li>
          ))}
        </ul>
        {!gender && (
          <p className="mt-2 text-[12px] leading-[1.7] text-steel">
            先に、どちらの立場かを選んでください。
          </p>
        )}
      </div>

      {/* ── 3. どう分かれたか ─────────────────── */}
      {failed && (
        <p className="rounded-soft bg-mist px-4 py-3.5 text-[13px] leading-[1.8] text-steel">
          {failed}
        </p>
      )}

      {result && gender && picked && (
        <div className="flex flex-col gap-3">
          <p className="text-[15px] font-black leading-[1.7] text-slate">
            同じ場面を見た人は、こう分かれました。
          </p>
          <Dist
            scene={scene}
            t={result.opposite}
            label={`${GENDER_LABEL[other]}`}
            picked={picked}
          />
          <Dist
            scene={scene}
            t={result.same}
            label={`${GENDER_LABEL[gender]}`}
            picked={picked}
          />
          {/* ここで正解を言わない。言った時点で、採点の道具になる */}
          <p className="text-[13px] leading-[1.9] text-steel">
            どれが正しいかは出しません。実際に受け取る人が、どう分かれたかだけです。
          </p>
          <Link
            href="/koi"
            className="mt-1 flex min-h-[54px] items-center justify-center rounded-pill bg-brand px-6 text-[15.5px] font-bold text-paper shadow-card"
          >
            自分の場面でやってみる <span aria-hidden className="ml-2">&rarr;</span>
          </Link>
        </div>
      )}
    </div>
  );
}
