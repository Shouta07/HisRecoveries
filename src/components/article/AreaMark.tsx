import { complexById } from "@/lib/complexes";

// 分野の印。
//
// ── なぜ置くか ────────────────────────────────
// 一覧が文字だけだと、55件が同じ見た目で縦に並ぶ。
// 目が引っかかる場所がないので、読むのではなく流すことになる。
//
// ── なぜ写真ではないのか ────────────────────────
// 記事に写真は1枚もない。無いものを埋めるために素材を買うと、
// 「実体験と取材で書く」と言っている面に、他人の写真が並ぶ。
// 人物の写真は特に置けない（このサイトでは加工もしない）。
//
// ── なぜこの形か ──────────────────────────────
// 飾りではなく、分野の識別子として置く。色は complexes.ts の
// accent をそのまま使う（サイトの分野色と同じ）。
// 2回見れば「この色と形は薄毛の話」と分かる。それが目的で、
// 絵として上手く見せることは目的ではない。線は1色、塗りなし。

const PATHS: Record<string, React.ReactNode> = {
  // 人の形
  impression: (
    <>
      <circle cx="12" cy="8.5" r="3.6" />
      <path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7" />
    </>
  ),
  // 頭と、抜けていく線
  hair: (
    <>
      <path d="M5 14a7 7 0 0 1 14 0" />
      <path d="M8 10.5V5.5M12 9.5V4.5M16 10.5V5.5" />
    </>
  ),
  // 肌の面と、点
  skin: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="9.8" cy="10" r="1.2" />
      <circle cx="14.4" cy="14.2" r="1" />
    </>
  ),
  // 顔の輪郭
  face: (
    <>
      <ellipse cx="12" cy="12" rx="6.4" ry="8" />
      <path d="M8.8 10.2h2.2M13 10.2h2.2M10 15.4c1.3.9 2.7.9 4 0" />
    </>
  ),
  // 毛と、そのライン
  "body-hair": (
    <>
      <path d="M7 7.5v3.5M12 6.5v4.5M17 7.5v3.5" />
      <path d="M5.5 14.5c2 3.2 11 3.2 13 0" />
    </>
  ),
  // 内側の揺れ
  mind: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M6.6 13c1.8-3.2 3.5 3.2 5.4 0s3.6 3.2 5.4 0" />
    </>
  ),
};

export default function AreaMark({
  areaId,
  className = "",
  size = 26,
}: {
  areaId: string;
  className?: string;
  size?: number;
}) {
  const path = PATHS[areaId];
  const accent = complexById(areaId)?.accent ?? "#5E6E76";
  if (!path) return null;

  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={accent}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {path}
    </svg>
  );
}
