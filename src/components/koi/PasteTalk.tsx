"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";
import KoiFace from "@/components/koi/KoiFace";
import SituationCardView from "@/components/koi/SituationCard";
import type { SituationCard } from "@/lib/koi/card";

/* ══════════════════════════════════════════════════
   ChatGPT で話して、持ち帰る
   ══════════════════════════════════════════════════

   ── なぜ、こちらで喋らせないか ──────────────────
   声でつなぐと1人あたり月 ¥400 の原価が乗る。
   相談する人の多くは、もう ChatGPT を使っている。
   こちらの取り分は「会話」ではなく「残ること」。

   会話は向こうで、記録はこちらで。
   これで、鍵が1本も無くても今日から動く。

   ── 手間を2つに割らない ─────────────────────────
   「プロンプトをコピー」「会話を貼る」で2手ある。
   ここが増えるほど、途中で帰る人が増える。

   だから、
     プロンプトは1押しでコピーできる（選択させない）
     ChatGPT は別のタブで開く（この画面を失わせない）
     貼るところは、戻ってきたらすぐ目に入る位置に置く

   ── 貼ったものを、読めなくても捨てない ──────────
   読み方は handoff.ts が3通り持っている。
   どれでも読めなければ、全部を本人の発言として扱う。
   捨てると、貼り直させることになる。 */

type Props = {
  talker: string;
  /** ChatGPT に貼ってもらう文。サーバーで組み立てて渡す */
  prompt: string;
  /** 相手の呼び名。分かっているときだけ */
  who?: string;
  personId?: string;
};

const CHATGPT = "https://chatgpt.com/";

export default function PasteTalk({ talker, prompt, who, personId }: Props) {
  const [copied, setCopied] = useState(false);
  const [paste, setPaste] = useState("");
  const [sending, setSending] = useState(false);
  const [card, setCard] = useState<SituationCard | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [masked, setMasked] = useState<string[]>([]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      track("koi_prompt_copied", {});
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // クリップボードが使えない端末がある。選んでコピーしてもらう
      setNote("コピーできませんでした。下の文を選んでコピーしてください。");
    }
  }

  async function send() {
    if (sending || paste.trim().length < 20) return;
    setSending(true);
    setNote(null);
    setCard(null);
    try {
      const r = await fetch("/api/koi/wrap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ talker, paste, who, personId }),
      });
      const j = await r.json().catch(() => ({}));
      if (j.card) {
        setCard(j.card as SituationCard);
        setMasked(Array.isArray(j.masked) ? j.masked : []);
        track("koi_card_made", { from: "paste" });
        if (typeof j.dropped === "number" && j.dropped > 0) {
          setNote(`話していないことが ${j.dropped} 件あったので、入れていません。`);
        }
      } else {
        setNote(j.error ?? "いま整理できませんでした。");
      }
    } catch {
      setNote("いま整理できませんでした。少し時間をおいてお試しください。");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── 1. 持っていく ─────────────────────────── */}
      <div className="rounded-card border border-line bg-paper p-5 shadow-card">
        <div className="flex items-start gap-3">
          <KoiFace size={34} className="-mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-black leading-[1.4] text-slate">
              1. 恋亀を、ChatGPT に連れていく
            </p>
            <p className="mt-1 text-[12.5px] leading-[1.8] text-steel">
              {who
                ? `${who}との前回の続きが、この文に入っています。もう一度説明しなくて大丈夫です。`
                : "この文をコピーして、ChatGPT に貼るだけです。"}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
          <button
            type="button"
            onClick={copy}
            className="inline-flex min-h-[50px] flex-1 items-center justify-center rounded-pill bg-brand px-5 text-[14.5px] font-bold text-paper shadow-card"
          >
            {copied ? "コピーしました" : "恋亀の文をコピー"}
          </button>
          <a
            href={CHATGPT}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("koi_chatgpt_opened", {})}
            className="inline-flex min-h-[50px] flex-1 items-center justify-center rounded-pill border border-line bg-paper px-5 text-[13.5px] font-bold text-steel"
          >
            ChatGPT を開く <span aria-hidden className="ml-1.5">↗</span>
          </a>
        </div>

        {/* クリップボードが使えない端末のために、文そのものも置く */}
        <details className="mt-3">
          <summary className="cursor-pointer text-[12px] font-bold text-steel">
            文をそのまま見る
          </summary>
          <pre className="mt-2 max-h-[220px] overflow-auto whitespace-pre-wrap rounded-soft bg-mist px-3 py-3 text-[11.5px] leading-[1.7] text-steel">
            {prompt}
          </pre>
        </details>
      </div>

      {/* ── 2. 持って帰る ─────────────────────────── */}
      <div className="rounded-card border border-line bg-paper p-5 shadow-card">
        <p className="text-[15px] font-black leading-[1.4] text-slate">
          2. 話し終わったら、会話を貼る
        </p>
        <p className="mt-1 text-[12.5px] leading-[1.8] text-steel">
          ChatGPT の会話をまるごと選んで、ここに貼ってください。
          まとめなくて大丈夫です。こちらで整理します。
        </p>

        <textarea
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
          rows={6}
          placeholder="ここに貼る"
          className="mt-3 w-full rounded-soft border border-line bg-paper px-4 py-3.5 text-[14px] leading-[1.8] text-slate outline-none transition-colors placeholder:text-steel/70 focus:border-brand focus:ring-2 focus:ring-brand/30"
        />

        <button
          type="button"
          onClick={send}
          disabled={sending || paste.trim().length < 20}
          className="mt-3 inline-flex min-h-[52px] w-full items-center justify-center rounded-pill bg-brand px-6 text-[15.5px] font-bold text-paper shadow-card disabled:bg-line disabled:text-steel disabled:shadow-none"
        >
          {sending ? "整理しています…" : "整理する"}
        </button>

        <p className="mt-2.5 text-[11.5px] leading-[1.8] text-steel">
          電話番号・アカウント名・勤務先・学校・駅名は、こちらに届く前に伏せ字にします。
        </p>
      </div>

      {note && (
        <p className="rounded-soft border border-line bg-mist px-4 py-3.5 text-[13px] leading-[1.8] text-slate">
          {note}
        </p>
      )}

      {masked.length > 0 && (
        <p className="text-[12px] leading-[1.8] text-steel">
          {masked.join("・")}は、伏せ字にしてから整理しました。
        </p>
      )}

      {card && <SituationCardView card={card} />}
    </div>
  );
}
