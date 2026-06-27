import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Recoveries with Animals — 犬と歩く。猫と過ごす。",
  description:
    "頑張る男性のためのリカバリー体験。動物と過ごす静かな時間で、心を整え、明日への活力に。保護犬と歩く朝、犬と過ごす休日、猫と過ごす90分。",
  alternates: { canonical: `${site.url}/animals` },
};

const HEAD: React.CSSProperties = {
  fontFamily:
    "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontWeight: 800,
  letterSpacing: "0.01em",
  fontFeatureSettings: '"palt" 1',
};

/* placeholder image block (swap for real photos in /public/media/animals/) */
function Ph({
  label,
  className = "",
  dark = false,
}: {
  label?: string;
  className?: string;
  dark?: boolean;
}) {
  return (
    <div
      aria-hidden
      className={`relative overflow-hidden ${className}`}
      style={{
        background: dark
          ? "linear-gradient(135deg,#1b2c20,#0e150d)"
          : "linear-gradient(135deg,#e7ede4,#cdd8c8)",
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <PawIcon className={dark ? "text-white/20" : "text-[#3d5638]/25"} />
      </div>
      {label && (
        <span className="absolute bottom-2 left-3 text-[10px] tracking-wide text-[#3d5638]/40">
          {label}
        </span>
      )}
    </div>
  );
}

const PROGRAMS = [
  {
    icon: "dog",
    name: "Quiet Walk",
    sub: "保護犬と歩く朝。",
    points: ["スマホはポケットへ", "会話は自由、沈黙も自由", "朝の空気を感じながらリセット"],
  },
  {
    icon: "coffee",
    name: "Coffee & Dogs",
    sub: "犬と過ごす静かな休日。",
    points: ["ドッグカフェでゆっくりと", "コーヒーを飲みながらリラックス", "自然と会話が生まれる時間"],
  },
  {
    icon: "cat",
    name: "Quiet Cats",
    sub: "猫と過ごす90分。",
    points: ["猫カフェや保護猫スペースで", "本を読んだり、考え事をしたり", "何もしない贅沢な時間"],
  },
];

const FEATURES = [
  { t: "少人数制", d: "少人数で落ち着いた時間をご提供" },
  { t: "動物ファースト", d: "提携団体と連携し動物の福祉を尊重" },
  { t: "定期開催", d: "週末・平日朝など定期的に開催" },
  { t: "コミュニティ", d: "同じ価値観の人とゆるくつながる" },
];

export default function AnimalsPage() {
  return (
    <div className="bg-white text-[#1f2a1d]">
      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden">
        <div className="grid lg:grid-cols-[1fr_1fr]">
          <div className="px-6 sm:px-10 lg:pl-16 pt-16 sm:pt-20 pb-14 flex flex-col justify-center order-2 lg:order-1">
            <p className="flex items-center gap-3 text-[12px] tracking-[0.2em] text-[#3d5638] font-medium mb-6">
              <span aria-hidden className="block w-8 h-px bg-[#85AB8B]" />
              Recoveries with Animals
            </p>
            <h1 className="text-[2.4rem] sm:text-[3.2rem] leading-[1.25]" style={HEAD}>
              犬と歩く。<br />猫と過ごす。<br />少しだけ、<br />
              <span className="text-[#3d5638]">自分を取り戻す。</span>
            </h1>
            <p className="mt-7 text-[14.5px] text-[#4b5b47] leading-[1.95] max-w-md">
              忙しい毎日の中で、置き去りにしてしまう「自分の時間」。
              動物と過ごす静かな時間が、心を整え、明日への活力になる。
            </p>
            <div className="mt-9">
              <Link
                href="/apply"
                className="inline-flex items-center gap-2 rounded-full bg-[#1f2a1d] hover:bg-[#2a3827] text-white text-sm font-semibold px-7 py-4 transition-colors"
              >
                プログラムに参加する <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
          <div className="relative min-h-[280px] lg:min-h-[560px] order-1 lg:order-2">
            <Ph className="absolute inset-0" />
            {/* badge */}
            <div className="absolute right-5 bottom-5 sm:right-8 sm:bottom-8 w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-[#16241a]/90 backdrop-blur-sm text-[#EDF1E8] flex flex-col items-center justify-center text-center px-4">
              <p className="text-[10.5px] leading-[1.6] text-[#C9D2C4] mb-3">
                頑張る男性のための
                <br />
                リカバリー体験
              </p>
              <div className="flex items-center gap-3">
                {[
                  { i: "waves", l: "整える" },
                  { i: "leaf", l: "つながる" },
                  { i: "heart", l: "回復する" },
                ].map((x) => (
                  <div key={x.l} className="flex flex-col items-center gap-1">
                    <MiniIcon name={x.i} />
                    <span className="text-[9px] text-[#9FB0A0]">{x.l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== とは ===== */}
      <section className="bg-white">
        <div className="mx-auto max-w-[1100px] px-6 sm:px-10 py-16 sm:py-24">
          <h2 className="text-center text-[1.5rem] sm:text-[1.9rem] flex items-center justify-center gap-4" style={HEAD}>
            <span aria-hidden className="block w-10 h-px bg-[#85AB8B]" />
            Recoveries with Animals とは？
            <span aria-hidden className="block w-10 h-px bg-[#85AB8B]" />
          </h2>
          <div className="mt-12 grid lg:grid-cols-[0.8fr_1.2fr] gap-10 items-center">
            <p className="text-[14.5px] text-[#4b5b47] leading-[2.2]">
              動物は何も求めません。
              <br />
              評価もしません、肩書きも知りません。
              <br />
              ただ隣を歩く。ただ隣にいる。
              <br />
              それだけで、少し呼吸が深くなる。
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                "ただ、歩く。",
                "ただ、過ごす。",
                "ただ、いまにいる。",
              ].map((cap) => (
                <div key={cap}>
                  <Ph className="aspect-[4/5] rounded-xl" />
                  <p className="mt-3 text-center text-[12.5px] text-[#4b5b47]">{cap}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== Program ===== */}
      <section className="bg-[#f4f6f2]">
        <div className="mx-auto max-w-[1100px] px-6 sm:px-10 py-16 sm:py-24">
          <h2 className="text-center text-[1.9rem] sm:text-[2.3rem] mb-12" style={HEAD}>
            Program
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {PROGRAMS.map((p) => (
              <div key={p.name} className="rounded-2xl bg-white p-5 shadow-sm flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <span className="grid place-items-center w-11 h-11 rounded-full bg-[#e7ede4] text-[#3d5638]">
                    <ProgIcon name={p.icon} />
                  </span>
                  <div>
                    <h3 className="logo-type text-lg text-[#1f2a1d]">{p.name}</h3>
                    <p className="text-[12px] text-[#6b7a66]">{p.sub}</p>
                  </div>
                </div>
                <Ph className="aspect-[16/10] rounded-xl mb-4" />
                <ul className="space-y-2 flex-1">
                  {p.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-2 text-[13px] text-[#4b5b47] leading-[1.7]">
                      <CheckIcon />
                      {pt}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/apply"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#f4f6f2] hover:bg-[#e7ede4] text-[#1f2a1d] text-[13px] font-semibold px-5 py-2.5 transition-colors w-fit"
                >
                  詳細を見る <span aria-hidden>→</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== こんな方へ + features + quote ===== */}
      <section className="bg-[#f4f6f2]">
        <div className="mx-auto max-w-[1100px] px-6 sm:px-10 pb-16 sm:pb-24">
          <div className="grid lg:grid-cols-[0.7fr_1.6fr_1fr] gap-8 items-stretch">
            <div className="bg-white rounded-2xl p-6">
              <h3 className="text-[15px] font-bold text-[#1f2a1d] mb-4">こんな方へ</h3>
              <ul className="space-y-3">
                {["頑張り続けている", "休み方が分からない", "一人の時間が欲しい", "犬や猫が好き", "少し疲れている"].map((t) => (
                  <li key={t} className="flex items-start gap-2 text-[13px] text-[#4b5b47] leading-[1.6]">
                    <CheckIcon />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 self-center">
              {FEATURES.map((f) => (
                <div key={f.t} className="text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-white grid place-items-center text-[#3d5638] mb-3">
                    <PawIcon className="w-6 h-6 text-[#3d5638]" />
                  </div>
                  <p className="text-[13px] font-bold text-[#1f2a1d]">{f.t}</p>
                  <p className="mt-1.5 text-[11.5px] text-[#6b7a66] leading-[1.7]">{f.d}</p>
                </div>
              ))}
            </div>
            <div className="relative rounded-2xl overflow-hidden min-h-[220px]">
              <Ph className="absolute inset-0" dark />
              <div className="absolute inset-0 flex items-center p-7">
                <p className="font-mincho text-white text-[1.05rem] leading-[1.9]">
                  整えるとは、
                  <br />
                  何かを足すことではなく、
                  <br />
                  余計なものを引くこと。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Closing CTA ===== */}
      <section className="relative overflow-hidden bg-[#16241a] text-[#EDF1E8]">
        <div className="mx-auto max-w-[1100px] px-6 sm:px-10 py-16 sm:py-20 grid lg:grid-cols-[1.4fr_1fr] gap-10 items-center">
          <div className="text-center lg:text-left">
            <h2 className="text-[2rem] sm:text-[2.6rem]" style={HEAD}>
              Quiet Vitality.
            </h2>
            <p className="mt-3 text-[#C9D2C4] text-sm">静かに、回復する。</p>
            <div className="mt-7">
              <Link
                href="/apply"
                className="inline-flex items-center gap-2 rounded-full bg-[#EDF1E8] hover:bg-white text-[#16241a] text-sm font-semibold px-7 py-3.5 transition-colors"
              >
                プログラムに参加する <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
          <div>
            <p className="text-[11px] tracking-[0.16em] text-[#85AB8B] font-medium mb-5 text-center lg:text-left">
              提携パートナー
            </p>
            <div className="flex items-center justify-center lg:justify-start gap-8 text-[#9FB0A0]">
              {[
                { i: "dog", l: "保護犬団体" },
                { i: "cat", l: "保護猫カフェ" },
                { i: "paw", l: "ドッグカフェ\nトレーナー" },
              ].map((x) => (
                <div key={x.l} className="flex flex-col items-center gap-2 text-center">
                  <ProgIcon name={x.i} />
                  <span className="text-[10.5px] leading-[1.5] whitespace-pre-line">{x.l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ───────── icons ───────── */
function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3d5638" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="mt-0.5 shrink-0">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
function PawIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <circle cx="6" cy="11" r="2" /><circle cx="10" cy="6.5" r="2" /><circle cx="14" cy="6.5" r="2" /><circle cx="18" cy="11" r="2" />
      <path d="M12 12c-3 0-5 2.2-5 4.4 0 1.7 1.4 2.6 3 2.6 1 0 1.5-.4 2-.4s1 .4 2 .4c1.6 0 3-.9 3-2.6 0-2.2-2-4.4-5-4.4z" />
    </svg>
  );
}
function MiniIcon({ name }: { name: string }) {
  const c = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true, className: "text-[#85AB8B]" };
  if (name === "waves") return (<svg {...c}><path d="M2 7c2-2 4-2 6 0s4 2 6 0 4-2 6 0" /><path d="M2 13c2-2 4-2 6 0s4 2 6 0 4-2 6 0" /><path d="M2 19c2-2 4-2 6 0s4 2 6 0 4-2 6 0" /></svg>);
  if (name === "leaf") return (<svg {...c}><path d="M11 20A7 7 0 0 1 4 13c0-5 6-9 16-9 0 9-4 16-9 16z" /><path d="M11 20c0-6 3-10 9-12" /></svg>);
  return (<svg {...c}><path d="M19 14c1.5-1.5 3-3.3 3-5.5A3.5 3.5 0 0 0 12 6 3.5 3.5 0 0 0 2 8.5C2 10.7 3.5 12.5 5 14l7 7z" /></svg>);
}
function ProgIcon({ name }: { name: string }) {
  const c = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": true };
  if (name === "coffee")
    return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 8h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" /><path d="M17 9h2a2 2 0 0 1 0 4h-2" /><path d="M7 3v2M11 3v2" /></svg>);
  if (name === "cat")
    return (<svg {...c}><path d="M4 4l2.5 4A8 8 0 0 1 12 6a8 8 0 0 1 5.5 2L20 4l.5 6.5A8 7 0 0 1 12 20a8 7 0 0 1-8.5-9.5z" /><circle cx="9" cy="12" r="1" fill="#fff" /><circle cx="15" cy="12" r="1" fill="#fff" /></svg>);
  // dog / paw default
  return (<svg {...c}><path d="M5 9c0-1 .5-3 2-3s2 2 2 3M15 9c0-1 .5-3 2-3s2 2 2 3" /><path d="M5 10c-2 1-3 3-3 5a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3c0-2-1-4-3-5a6 6 0 0 0-11 0z" /><circle cx="9.5" cy="14" r="1" fill="#fff" /><circle cx="14.5" cy="14" r="1" fill="#fff" /></svg>);
}
