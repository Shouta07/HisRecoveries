"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { decide, type Used } from "@/lib/koi/dispatch";
import { mask } from "@/lib/koi/mask";
import { track } from "@/lib/analytics";
import KoiFace from "@/components/koi/KoiFace";
import SituationCardView from "@/components/koi/SituationCard";
import type { SituationCard } from "@/lib/koi/card";

/* ══════════════════════════════════════════════════
   恋亀と話す部屋
   ══════════════════════════════════════════════════

   ── 本物の鍵は、ここに来ない ────────────────────
   /api/koi/session が、使い捨ての鍵とつなぎ先を返す。
   ここが持つのはそれだけ。人格も道具もサーバーが決める。

   ── 道具の呼び出しは、必ず判定を通す ────────────
   恋亀が道具を呼んでも、そのまま実行しない。
   dispatch.ts の decide() が、通していい呼び出しかを見る。

     知らない道具 / 知らない引数
     本名らしい呼び名 / 連絡先が入った呼び名
     相手の気持ちを当てる書き方
     2つめのEP / 2度目の「人に聞く」

   ここを抜けると、会話の勢いで記録が書き換わる。

   ── 画面の判定は、表示のため ────────────────────
   ここでも decide() を通すが、それは「何が起きたか」を出すため。
   ブラウザは書き換えられるので、通ったかどうかを画面の言うとおりにしない。

   実際に書くのは /api/koi/act で、そちらでもう一度 decide() を通す。
   画面を書き換えても、サーバーで止まる。

   ── 誰のものかは、鍵で決める ────────────────────
   会員登録が無いので、話す人の鍵（t...）が本人の証拠。
   呼び出しのたびに鍵を送り、サーバーがその鍵の記録だけを触る。

   ── 終わりを決めておく ──────────────────────────
   つなぎっぱなしにされると、そのぶん課金が走る。
   サーバーが返す上限（分）で、こちらから切る。 */

type Line = { who: "koi" | "me"; say: string };
type Note = { ok: boolean; text: string };

type Phase = "idle" | "connecting" | "live" | "ended" | "error";

export default function VoiceRoom({ talker }: { talker: string }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [leftSec, setLeftSec] = useState<number | null>(null);
  /* 終わったあとに出す、状況の1枚。
     話している最中は出さない（読みながら話せない）。 */
  const [card, setCard] = useState<SituationCard | null>(null);
  const [wrapping, setWrapping] = useState(false);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const micRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const usedRef = useRef<Used>({});
  /* まとめるときに使う会話。state だと、切る瞬間に古いものを掴む */
  const linesRef = useRef<Line[]>([]);

  /* 話し終わったら、1枚にまとめる。
     話している最中は出さない（読みながら話せない）。
     2往復に満たないものは、整理しても何も出ないので呼ばない。 */
  const wrap = useCallback(async () => {
    const said = linesRef.current;
    if (said.length < 2 || wrapping) return;
    setWrapping(true);
    try {
      const r = await fetch("/api/koi/wrap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ talker, lines: said }),
      });
      const j = await r.json().catch(() => ({}));
      if (j.card) {
        setCard(j.card as SituationCard);
        track("koi_card_made", {});
        if (typeof j.dropped === "number" && j.dropped > 0) {
          // 捨てたものは黙って消さない
          setNotes((xs) => [
            ...xs,
            { ok: false, text: `話していないことが ${j.dropped} 件あったので、入れていません` },
          ]);
        }
      } else if (j.error) {
        setNotes((xs) => [...xs, { ok: false, text: j.error }]);
      }
    } catch {
      setNotes((xs) => [...xs, { ok: false, text: "いま整理できませんでした" }]);
    } finally {
      setWrapping(false);
    }
  }, [talker, wrapping]);

  const stop = useCallback((why: Phase = "ended") => {
    pcRef.current?.close();
    pcRef.current = null;
    micRef.current?.getTracks().forEach((t) => t.stop());
    micRef.current = null;
    setLeftSec(null);
    setPhase((p) => (p === "error" ? p : why));
    // ふつうに終わったときだけ、1枚にまとめる
    if (why === "ended") void wrap();
  }, [wrap]);

  // 画面を離れたら必ず切る。残すとマイクが開いたままになる
  useEffect(() => () => stop("ended"), [stop]);

  /** 恋亀から届いた出来事を1つ処理する */
  const onEvent = useCallback((raw: string) => {
    let e: Record<string, unknown>;
    try {
      e = JSON.parse(raw);
    } catch {
      return;
    }
    const type = String(e.type ?? "");

    // 話した言葉。こちらの声も、恋亀の声も、文字で出す
    if (type === "conversation.item.input_audio_transcription.completed") {
      const t = String(e.transcript ?? "").trim();
      if (t) {
        linesRef.current = [...linesRef.current, { who: "me", say: t }];
        setLines(linesRef.current);
      }
      return;
    }
    if (type === "response.audio_transcript.done") {
      const t = String(e.transcript ?? "").trim();
      if (t) {
        linesRef.current = [...linesRef.current, { who: "koi", say: t }];
        setLines(linesRef.current);
      }
      return;
    }

    /* 道具を呼ばれた。実行しないで、判定だけ通す。
       通ったものも、いまは保存しない（上のコメント）。 */
    if (type === "response.function_call_arguments.done") {
      const name = String(e.name ?? "");
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(String(e.arguments ?? "{}"));
      } catch {
        /* 壊れていれば、判定が弾く */
      }
      const d = decide({ name, args }, usedRef.current);
      const seen = { ...usedRef.current };
      usedRef.current[name] = (usedRef.current[name] ?? 0) + 1;
      track("koi_tool_decided", { tool: name, ok: d.ok ? "1" : "0" });

      if (!d.ok) {
        setNotes((xs) => [...xs, { ok: false, text: `${name} を止めました：${d.why}` }]);
        return;
      }

      /* 通ったものだけ、サーバーへ渡す。
         サーバーがもう一度 decide() を通してから書く。
         こちらの「通った」は、あくまで表示用。 */
      void (async () => {
        try {
          const r = await fetch("/api/koi/act", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ talker, name, args: d.args, used: seen }),
          });
          const j = await r.json().catch(() => ({}));
          setNotes((xs) => [
            ...xs,
            j.ok
              ? { ok: true, text: `${name} を残しました` }
              : j.needsConfirm
                ? { ok: false, text: `${name} は、本人の確認が要ります` }
                : { ok: false, text: `${name} は残せませんでした：${j.why ?? ""}` },
          ]);
        } catch {
          setNotes((xs) => [...xs, { ok: false, text: `${name} を残せませんでした` }]);
        }
      })();
      return;
    }

    if (type === "error") {
      setError("途中で聞こえなくなりました。もう一度つないでみてください。");
      setPhase("error");
      stop("error");
    }
  }, [stop, talker]);

  async function start() {
    if (phase !== "idle" && phase !== "ended" && phase !== "error") return;
    setPhase("connecting");
    setError(null);
    setLines([]);
    linesRef.current = [];
    setNotes([]);
    setCard(null);
    usedRef.current = {};

    try {
      // 1. 使い捨ての鍵をもらう
      const r = await fetch("/api/koi/session", { method: "POST" });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.secret) {
        setError(j.error ?? "いまつなげません。");
        setPhase("error");
        return;
      }

      // 2. マイクを借りる。断られたら、そう言う
      let mic: MediaStream;
      try {
        mic = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        setError("マイクが使えませんでした。ブラウザの設定で許可してください。");
        setPhase("error");
        return;
      }
      micRef.current = mic;

      // 3. つなぐ
      const pc = new RTCPeerConnection();
      pcRef.current = pc;
      pc.ontrack = (ev) => {
        if (audioRef.current) audioRef.current.srcObject = ev.streams[0];
      };
      mic.getTracks().forEach((t) => pc.addTrack(t, mic));

      const dc = pc.createDataChannel("oai-events");
      dc.onmessage = (ev) => onEvent(String(ev.data));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdp = await fetch(`${j.connectUrl}?model=${encodeURIComponent(j.model)}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${j.secret}`,
          "Content-Type": "application/sdp",
        },
      });
      if (!sdp.ok) {
        setError("つなげませんでした。少し時間をおいてお試しください。");
        setPhase("error");
        stop("error");
        return;
      }
      await pc.setRemoteDescription({ type: "answer", sdp: await sdp.text() });

      setPhase("live");
      track("koi_call_started", {});

      // 4. 終わりを決めておく。つなぎっぱなしにしない
      const max = Number(j.maxMinutes) > 0 ? Number(j.maxMinutes) : 15;
      setLeftSec(max * 60);
    } catch {
      setError("つなげませんでした。少し時間をおいてお試しください。");
      setPhase("error");
      stop("error");
    }
  }

  // 残り時間。0になったら、こちらから切る
  useEffect(() => {
    if (phase !== "live" || leftSec === null) return;
    if (leftSec <= 0) {
      stop("ended");
      return;
    }
    const id = window.setTimeout(() => setLeftSec((s) => (s === null ? null : s - 1)), 1000);
    return () => window.clearTimeout(id);
  }, [phase, leftSec, stop]);

  const mm = leftSec === null ? null : String(Math.floor(leftSec / 60)).padStart(2, "0");
  const ss = leftSec === null ? null : String(leftSec % 60).padStart(2, "0");

  return (
    <div className="flex flex-col gap-5">
      {/* 恋亀の声。見えないが、ここから出る */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} autoPlay className="hidden" />

      <div className="flex items-center gap-3 rounded-card border border-line bg-paper p-4 shadow-card">
        <KoiFace size={44} alive={phase === "live"} />
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-black text-slate">
            {phase === "live"
              ? "話せます"
              : phase === "connecting"
                ? "つないでいます…"
                : phase === "ended"
                  ? "終わりました"
                  : "恋亀と話す"}
          </p>
          <p className="mt-0.5 text-[12.5px] leading-[1.7] text-steel">
            {phase === "live" && mm
              ? `のこり ${mm}:${ss}`
              : "思っていることを、そのまま話してください。"}
          </p>
        </div>
        {phase === "live" ? (
          <button
            type="button"
            onClick={() => stop("ended")}
            className="min-h-[44px] shrink-0 rounded-pill border border-line bg-paper px-5 text-[13.5px] font-bold text-steel"
          >
            終わる
          </button>
        ) : (
          <button
            type="button"
            onClick={start}
            disabled={phase === "connecting"}
            className="min-h-[44px] shrink-0 rounded-pill bg-brand px-5 text-[14px] font-bold text-paper disabled:bg-line disabled:text-steel"
          >
            {phase === "connecting" ? "…" : "話す"}
          </button>
        )}
      </div>

      {error && (
        <p className="rounded-soft border border-line bg-mist px-4 py-3 text-[13.5px] leading-[1.8] text-slate">
          {error}
        </p>
      )}

      {/* 終わったあとの1枚。話した結果がここに出る。
          JSONは出さない（読むのは、読んで分かる形のほう）。 */}
      {wrapping && (
        <p className="rounded-card border border-line bg-paper px-4 py-3.5 text-[13.5px] leading-[1.8] text-steel">
          話したことを、まとめています…
        </p>
      )}
      {card && <SituationCardView card={card} />}

      {/* 話した言葉。伏せ字をかけてから出す */}
      {lines.length > 0 && (
        <ul className="flex flex-col gap-2.5 rounded-card bg-mist px-3 py-4 sm:px-4">
          {lines.map((t, i) => (
            <li
              key={`${i}-${t.say.slice(0, 8)}`}
              className={`flex ${t.who === "me" ? "justify-end" : "justify-start"}`}
            >
              <div className="flex max-w-[86%] items-end gap-2">
                {t.who === "koi" && <KoiFace size={30} alive={false} className="-mb-1" />}
                <p
                  className={`rounded-card px-3.5 py-2.5 text-[13.5px] leading-[1.75] ${
                    t.who === "me"
                      ? "rounded-br-[4px] bg-brand font-bold text-paper"
                      : "rounded-bl-[4px] bg-paper text-slate shadow-card"
                  }`}
                >
                  {/* 伏せ字をかけてから出す。
                      mask() は { text, found } を返すので、
                      そのまま置くと画面に出ない（型で止まった）。 */}
                  {mask(t.say).text}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* 道具の判定。何を通して、何を止めたか */}
      {notes.length > 0 && (
        <div className="rounded-card border border-line bg-paper p-4">
          <p className="text-[12px] font-bold text-steel">記録の動き</p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {notes.map((n, i) => (
              <li
                key={`${i}-${n.text.slice(0, 10)}`}
                className="flex items-start gap-2 text-[12.5px] leading-[1.7]"
              >
                <span aria-hidden className="mt-[2px] shrink-0 font-black text-brand">
                  {n.ok ? "✓" : "—"}
                </span>
                <span className="min-w-0 text-steel">{n.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
