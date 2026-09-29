import type { Step } from "@/lib/ask/journey";

// 道のりの各段の絵柄。
//
// ── 絵は画面側に置く ──────────────────────────────
// lib は「どの段があるか」だけを持つ。
// svg のパスを lib に置くと、言葉と絵柄が同じ場所で増えていって、
// 段を1つ足すたびに両方を書き足すことになる。
//
// ── 線だけにする ──────────────────────────────────
// 塗りの絵にすると、その段だけ目立つ。
// 出したいのは段の内容で、絵ではない。太さも色も5つで揃える。

const PATHS: Record<Step["icon"], string> = {
  // 自己紹介文。スマホの中に人がいる形
  profile: "M6 2h12v20H6zM12 10a2.2 2.2 0 1 0 0-4.4A2.2 2.2 0 0 0 12 10M8.4 16a3.6 3.6 0 0 1 7.2 0",
  // やりとり。吹き出しが2つ
  chat: "M3 6h12v8H8l-5 4zM17 9h4v8l-3-2h-5",
  // 電話
  call: "M6.5 3h3l1.5 4-2 1.5a12 12 0 0 0 6.5 6.5L17 13l4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4 6.2 2 2 0 0 1 6.5 3",
  // デート。グラスを2つ合わせる
  date: "M5 3h6l-2 7a3 3 0 0 1-2 0zM8 10v9M5.5 21h5M19 3h-6l2 7a3 3 0 0 0 2 0zM16 10v9M13.5 21h5",
  // 関係を進める
  heart: "M12 20s-7-4.4-7-9.2A4 4 0 0 1 12 8a4 4 0 0 1 7 2.8C19 15.6 12 20 12 20",
};

export default function StepIcon({ name }: { name: Step["icon"] }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
