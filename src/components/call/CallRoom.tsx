"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type DailyIframe from "@daily-co/daily-js";
import type { DailyCall } from "@daily-co/daily-js";
import { clock, WARN_AT_MINUTES } from "@/lib/call/session";
import { track } from "@/lib/analytics";
import ReportButton from "@/components/call/ReportButton";

// 通話の画面。
//
// ══════════════════════════════════════════════════
// 残り時間は、サーバーの時計で数える
// ══════════════════════════════════════════════════
// 画面のカウントダウンは飾り。ブラウザの時計は変えられるし、
// タブを裏に回せば setInterval は遅れる。
//
// なので、こうする。
//   1 サーバーから ends_at と now をもらう
//   2 受け取った瞬間の差を「ずれ」として覚える
//   3 表示はそのずれを引いて出す
//   4 何秒かに一度、サーバーに聞き直す
// 切る判断は、聞き直した結果（status: completed）でする。
//
// ══════════════════════════════════════════════════
// 音だけ
// ══════════════════════════════════════════════════
// 映像は部屋の側でも券の側でも切ってある。ここでも要求しない。
// 相手の音は <audio> に流すだけ。顔の枠は作らない。
//
// ══════════════════════════════════════════════════
// 重いものは、入るときに読む
// ══════════════════════════════════════════════════
// 通話の SDK はそれなりの大きさがある。
// トップから読むと、通話しない人にも配られる。
// 入室を押したときに import() で読む。

type Snap = {
  status: string;
  remaining: number | null;
  endsAt: string | null;
  now: string;
  minutes: number;
  planName: string;
};

type Joined = Snap & { roomUrl: string; token: string; seconds: number };

/** サーバーに聞き直す間隔。切る判断はこちらの結果でする */
const POLL_MS = 10_000;

export default function CallRoom({
  token,
  responder,
  onDone,
}: {
  token: string;
  /** 答える側の鍵。相談した側は渡さない */
  responder?: string;
  onDone: () => void;
}) {
  const [phase, setPhase] = useState<"joining" | "live" | "over" | "error">("joining");
  const [error, setError] = useState<string | null>(null);
  const [left, setLeft] = useState<number | null>(null);
  const [muted, setMuted] = useState(false);
  const [otherHere, setOtherHere] = useState(false);
  const [warned, setWarned] = useState<number[]>([]);

  const callRef = useRef<DailyCall | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // サーバーの時計とのずれ（ミリ秒）。表示はここを引いて出す
  const skewRef = useRef(0);
  const endsRef = useRef<number | null>(null);
  const doneRef = useRef(false);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    callRef.current?.leave().catch(() => {});
    callRef.current?.destroy().catch(() => {});
    callRef.current = null;
    setPhase("over");
    onDone();
  }, [onDone]);

  // ── 入る ──
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`/api/call/${token}/join`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(responder ? { responder } : {}),
        });
        const json = (await res.json()) as Joined & { error?: string };
        if (!res.ok) throw new Error(json.error ?? "入室できませんでした");
        if (cancelled) return;

        // サーバーの時計とのずれを覚える。
        skewRef.current = Date.now() - new Date(json.now).getTime();
        endsRef.current = json.endsAt ? new Date(json.endsAt).getTime() : null;

        const mod = (await import("@daily-co/daily-js")) as unknown as {
          default: typeof DailyIframe;
        };
        const call = mod.default.createCallObject({
          // 音だけ。映像は要求しない
          audioSource: true,
          videoSource: false,
        });
        callRef.current = call;

        call.on("track-started", (ev) => {
          if (!ev || ev.track.kind !== "audio" || ev.participant?.local) return;
          const el = audioRef.current;
          if (!el) return;
          el.srcObject = new MediaStream([ev.track]);
          void el.play().catch(() => {});
          setOtherHere(true);
        });
        call.on("participant-left", () => setOtherHere(false));
        call.on("participant-joined", () => setOtherHere(true));
        // 券が切れた、部屋が消えた、など。どれも終わりとして扱う
        call.on("left-meeting", () => finish());
        call.on("error", () => finish());

        await call.join({ url: json.roomUrl, token: json.token, startVideoOff: true });
        if (cancelled) return;
        setPhase("live");
        track("call_joined", { plan: json.planName });
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
        setPhase("error");
      }
    })();

    return () => {
      cancelled = true;
      callRef.current?.leave().catch(() => {});
      callRef.current?.destroy().catch(() => {});
    };
  }, [token, responder, finish]);

  // ── 残り時間 ──
  // 表示は毎秒。切る判断はサーバーへ聞き直した結果でする。
  useEffect(() => {
    if (phase !== "live") return;

    const tickView = () => {
      const end = endsRef.current;
      if (end === null) return;
      const serverNow = Date.now() - skewRef.current;
      const s = Math.max(0, Math.floor((end - serverNow) / 1000));
      setLeft(s);
      // 知らせは1回ずつ
      for (const m of WARN_AT_MINUTES) {
        if (s <= m * 60 && s > m * 60 - 3 && !warned.includes(m)) {
          setWarned((w) => [...w, m]);
        }
      }
    };
    tickView();
    const view = window.setInterval(tickView, 1000);

    const ask = async () => {
      try {
        const res = await fetch(`/api/call/${token}`, { cache: "no-store" });
        if (!res.ok) return;
        const j = (await res.json()) as Snap;
        skewRef.current = Date.now() - new Date(j.now).getTime();
        endsRef.current = j.endsAt ? new Date(j.endsAt).getTime() : null;
        // 終わったかどうかは、ここだけが決める。
        if (j.status === "completed" || j.status === "no_show") finish();
      } catch {
        // 一時的に切れただけかもしれない。次の回で拾う
      }
    };
    const poll = window.setInterval(ask, POLL_MS);

    return () => {
      window.clearInterval(view);
      window.clearInterval(poll);
    };
  }, [phase, token, finish, warned]);

  // 画面の時計が 0 になったら、サーバーへ確かめに行く。
  // ここで勝手に切らない（時計を戻されたら切れなくなるため、
  // 逆に進められたら早く切れてしまうため）。
  useEffect(() => {
    if (phase !== "live" || left === null || left > 0) return;
    void fetch(`/api/call/${token}/end`, { method: "POST" })
      .then(() => finish())
      .catch(() => finish());
  }, [left, phase, token, finish]);

  async function toggleMute() {
    const call = callRef.current;
    if (!call) return;
    const next = !muted;
    call.setLocalAudio(!next);
    setMuted(next);
  }

  async function hangUp() {
    await fetch(`/api/call/${token}/end`, { method: "POST" }).catch(() => {});
    finish();
  }

  const warn = warned.includes(1) ? 1 : warned.includes(5) ? 5 : null;

  return (
    <div className="flex min-h-[70vh] flex-col">
      {/* 相手の音。顔の枠は作らない */}
      <audio ref={audioRef} autoPlay playsInline className="hidden" />

      {phase === "joining" && (
        <p className="text-[14.5px] leading-[1.9] text-steel">つないでいます…</p>
      )}

      {phase === "error" && (
        <div className="rounded-card border border-line bg-mist px-5 py-4">
          <p className="text-[14px] leading-[1.9] text-slate">{error}</p>
        </div>
      )}

      {phase === "live" && (
        <>
          <div className="flex flex-1 flex-col items-center justify-center py-10">
            <span
              aria-hidden
              className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-tint text-brand"
            >
              <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M5 21v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1" />
              </svg>
            </span>
            <p className="mt-4 text-[13px] font-bold text-steel">
              {otherHere ? "つながっています" : "相手を待っています"}
            </p>

            <p
              className="mt-7 text-[52px] font-black leading-none tabular-nums text-slate"
              aria-live="off"
            >
              {left === null ? "--:--" : clock(left)}
            </p>
            <p className="mt-2 text-[12.5px] text-steel">残り</p>

            {warn && (
              <p
                role="status"
                className="motion-safe:animate-hr-rise mt-6 max-w-[22em] rounded-card bg-mist px-4 py-3 text-center text-[13px] leading-[1.75] text-slate"
              >
                {warn === 5
                  ? "あと5分です。最後に聞きたいことを確かめましょう。"
                  : "あと1分で終了します。"}
              </p>
            )}
          </div>

          <div className="flex items-center justify-center gap-3 border-t border-line pt-5">
            <button
              type="button"
              onClick={toggleMute}
              aria-pressed={muted}
              className={`flex min-h-[56px] min-w-[56px] items-center justify-center rounded-full border text-[12px] font-bold ${
                muted ? "border-brand bg-brand text-paper" : "border-line bg-paper text-slate"
              }`}
            >
              {muted ? "ミュート中" : "ミュート"}
            </button>
            <button
              type="button"
              onClick={hangUp}
              className="inline-flex min-h-[56px] items-center justify-center rounded-pill bg-rose-fill px-8 text-[15px] font-bold text-paper shadow-card"
            >
              通話を終える
            </button>
            {/* 答える側にだけ出す。メニューの奥に入れない。
                何かあった瞬間に探させたら、出す口が無いのと同じ。
                録音していないぶん、ここで受ける */}
            {responder && (
              <ReportButton responder={responder} onDone={hangUp} />
            )}
          </div>
          <p className="mt-3 text-center text-[11.5px] leading-[1.7] text-steel">
            時間になると自動で終わります。録音はしていません。
          </p>
          {/* 線を、話している最中にも出しておく。
              買う前に1回出しただけだと、その場では思い出せない */}
          <p className="mt-1.5 text-center text-[11px] leading-[1.7] text-steel">
            この通話は、あなたと相手との関係についての相談です。
            答える女性本人への性的な言動はできません。
          </p>
        </>
      )}
    </div>
  );
}
