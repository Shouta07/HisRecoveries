"use client";

import Tashikame from "./Tashikame";

// 質問の例が流れる帯。
//
// ── これが何のサービスか、いちばん早く伝える ────────
// 説明を3行読ませるより、「このLINE、重い？」が流れているほうが速い。
// 使う場面が具体的なので、自分のことだと気づいてもらえる。
//
// ── 実績に見せない ────────────────────────────────
// ここに並ぶのは「聞けることの例」であって、
// 誰かが実際に聞いた相談ではない。見出しで「たとえば」と断る。
// 実際に流れている相談は、下の LiveMarket が実データで出す。
//
// ── 動きを止めたい人には止める ────────────────────
// prefers-reduced-motion のときは流さない。
// 流れていなくても、例が並んでいれば用は足りる。

const QUESTIONS = [
  "このLINE、重い？",
  "写真、AとBどっち？",
  "明日、誘っていい？",
  "既読スルー、脈なし？",
  "この服、どう見える？",
  "プロフィール、痛くない？",
  "返信、早すぎ？",
  "この店、初デートであり？",
  "連絡の頻度、多い？",
  "そろそろ告白していい？",
];

function Row({ reverse = false }: { reverse?: boolean }) {
  // 同じ並びを2つ繋げて、半分ずらす。切れ目が見えなくなる。
  const items = [...QUESTIONS, ...QUESTIONS];
  return (
    <div
      className="flex w-max gap-3 motion-safe:animate-marquee"
      style={{
        animationDuration: reverse ? "46s" : "38s",
        animationDirection: reverse ? "reverse" : "normal",
      }}
    >
      {items.map((q, i) => (
        <span
          key={`${q}-${i}`}
          className="inline-flex shrink-0 items-center gap-2 rounded-pill border border-line bg-paper px-4 py-2.5 text-[14px] font-bold text-slate shadow-card"
        >
          {i % 4 === 0 && <Tashikame size={20} />}
          {q}
        </span>
      ))}
    </div>
  );
}

export default function Ticker() {
  return (
    <div aria-label="聞けることの例" className="overflow-hidden">
      <Row />
      <div className="mt-3">
        <Row reverse />
      </div>
    </div>
  );
}
