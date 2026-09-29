"use client";

import { useState } from "react";
import Link from "next/link";
import MicCheck from "@/components/call/MicCheck";
import CallRoom from "@/components/call/CallRoom";
import AfterCall from "@/components/call/AfterCall";

// 通話までの3歩。
//
//   1 音を確かめる
//   2 話す
//   3 振り返る
//
// 途中で増やさない。時間が決まっている商品なので、
// 入る前の画面が長いほど、話せる時間が短くなる。

export default function CallFlow({
  token,
  responder,
  planName,
  minutes,
}: {
  token: string;
  responder?: string;
  planName: string;
  minutes: number;
}) {
  const [step, setStep] = useState<"check" | "live" | "after">("check");

  return (
    <div>
      {step === "check" && (
        <>
          <p className="text-[12.5px] font-bold text-steel">
            {planName} / {minutes}分
          </p>
          <div className="mt-3">
            <MicCheck onReady={() => setStep("live")} />
          </div>
          <p className="mt-5 text-[12px] leading-[1.8] text-steel">
            相手の名前も連絡先も出ません。こちらの連絡先も相手には渡りません。
            <Link
              href="/safety"
              className="ml-1 font-bold text-brand underline decoration-line underline-offset-4"
            >
              安心・安全
            </Link>
          </p>
        </>
      )}

      {step === "live" && (
        <CallRoom token={token} responder={responder} onDone={() => setStep("after")} />
      )}

      {step === "after" && <AfterCall token={token} responder={responder} />}
    </div>
  );
}
