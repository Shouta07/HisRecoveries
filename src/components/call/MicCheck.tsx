"use client";

import { useEffect, useRef, useState } from "react";

// 入る前の確認。
//
// ══════════════════════════════════════════════════
// なぜ要るか
// ══════════════════════════════════════════════════
// 相手も実在の人で、時間は15分しかない。
// 「聞こえない」で最初の3分を使うと、払った時間の2割が消える。
// マイクの許可と、実際に音が入っているかを先に見る。
//
// ══════════════════════════════════════════════════
// iPhone の Safari
// ══════════════════════════════════════════════════
// getUserMedia も AudioContext も、画面を押したあとでしか動かない。
// だから自動では始めない。「マイクを確かめる」を押してから始める。
// AudioContext は suspended で作られることがあるので resume を呼ぶ。
//
// ══════════════════════════════════════════════════
// 声を残さない
// ══════════════════════════════════════════════════
// 音の大きさだけを見て、録音はしない。
// 確認が終わったらトラックを止める（マイクの表示を消す）。

type State = "idle" | "asking" | "ok" | "denied" | "error";

export default function MicCheck({ onReady }: { onReady: () => void }) {
  const [state, setState] = useState<State>("idle");
  const [level, setLevel] = useState(0);
  const [heard, setHeard] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);

  // 画面を離れるときは、必ず止める。
  // 止め忘れると、マイクが使われたままの表示が残る。
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      void ctxRef.current?.close();
    };
  }, []);

  async function start() {
    setState("asking");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
        video: false,
      });
      streamRef.current = stream;

      // Safari は webkitAudioContext のことがある。
      const Ctx =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctx) {
        // 音の大きさは見られないが、許可は取れている。
        setState("ok");
        return;
      }
      const ctx = new Ctx();
      ctxRef.current = ctx;
      // iPhone では suspended で作られることがある。
      if (ctx.state === "suspended") await ctx.resume();

      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      src.connect(analyser);
      const buf = new Uint8Array(analyser.frequencyBinCount);

      const tick = () => {
        analyser.getByteTimeDomainData(buf);
        let peak = 0;
        for (const v of buf) peak = Math.max(peak, Math.abs(v - 128));
        const n = Math.min(1, peak / 40);
        setLevel(n);
        if (n > 0.18) setHeard(true);
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
      setState("ok");
    } catch (e) {
      const name = e instanceof Error ? e.name : "";
      setState(name === "NotAllowedError" || name === "SecurityError" ? "denied" : "error");
    }
  }

  function done() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    void ctxRef.current?.close();
    onReady();
  }

  return (
    <div className="rounded-card border border-line bg-paper p-5 shadow-card sm:p-6">
      <p className="text-[15.5px] font-black text-slate">入る前に、音を確かめます</p>
      <p className="mt-2 text-[13px] leading-[1.8] text-steel">
        相手も実在の人で、時間は決まっています。
        「聞こえない」で最初の数分を使わないように、先に見ておきます。
      </p>

      {state === "idle" && (
        <button
          type="button"
          onClick={start}
          className="mt-5 inline-flex min-h-[52px] w-full items-center justify-center rounded-pill bg-brand px-6 text-[15px] font-bold text-paper shadow-card"
        >
          マイクを確かめる
        </button>
      )}

      {state === "asking" && (
        <p className="mt-5 text-[13.5px] text-steel">マイクの使用を許可してください…</p>
      )}

      {state === "denied" && (
        <div className="mt-5 rounded-soft bg-mist px-4 py-3.5">
          <p className="text-[13.5px] font-bold leading-[1.8] text-slate">
            マイクが許可されていません。
          </p>
          <p className="mt-1.5 text-[12.5px] leading-[1.8] text-steel">
            iPhone は「設定 → Safari → マイク」、
            パソコンはアドレスバーの鍵のところから許可できます。
            許可したら、もう一度押してください。
          </p>
          <button
            type="button"
            onClick={start}
            className="mt-3 inline-flex min-h-[44px] items-center text-[13.5px] font-bold text-brand underline decoration-line underline-offset-4"
          >
            もう一度確かめる
          </button>
        </div>
      )}

      {state === "error" && (
        <div className="mt-5 rounded-soft bg-mist px-4 py-3.5">
          <p className="text-[13.5px] leading-[1.8] text-steel">
            マイクを開けませんでした。ほかのアプリが使っていないか確かめて、
            もう一度お試しください。
          </p>
          <button
            type="button"
            onClick={start}
            className="mt-3 inline-flex min-h-[44px] items-center text-[13.5px] font-bold text-brand underline decoration-line underline-offset-4"
          >
            もう一度確かめる
          </button>
        </div>
      )}

      {state === "ok" && (
        <>
          <div className="mt-5">
            <p className="text-[12px] font-bold text-steel">何か話してみてください</p>
            <div
              className="mt-2 h-3 w-full overflow-hidden rounded-pill bg-mist"
              role="meter"
              aria-label="マイクの入力"
              aria-valuenow={Math.round(level * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <span
                className="block h-full rounded-pill bg-brand transition-[width] duration-75"
                style={{ width: `${Math.round(level * 100)}%` }}
              />
            </div>
            <p className="mt-2 text-[12.5px] leading-[1.7] text-steel">
              {heard ? "声が入っています。" : "まだ音が入っていません。"}
            </p>
          </div>

          <button
            type="button"
            onClick={done}
            className="mt-5 inline-flex min-h-[54px] w-full items-center justify-center rounded-pill bg-brand px-6 text-[15.5px] font-bold text-paper shadow-card"
          >
            通話を開始する <span aria-hidden className="ml-1.5">→</span>
          </button>
          {!heard && (
            <p className="mt-2.5 text-[12px] leading-[1.7] text-steel">
              音が入っていなくても進めます。入ってから直すこともできます。
            </p>
          )}
        </>
      )}

      <p className="mt-5 border-t border-line pt-4 text-[11.5px] leading-[1.75] text-steel">
        ここで声は保存していません。確認が終わるとマイクは止まります。
      </p>
    </div>
  );
}
