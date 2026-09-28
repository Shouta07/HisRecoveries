// タシカメ。His Recoveries の公式キャラクター。
//
// ── なぜ SVG で描くか ──────────────────────────────
// いただいたボードにある3Dのレンダリングは、画像ファイルとして
// リポジトリにありません。ボードから切り出すと、合成用の一枚絵から
// 抜いたものになり、解像度も背景も使い物になりません。
//
// ここで起こしているのは、ボードの ICON USAGE にある線画のマークです。
// 小さく置く場所（吹き出しの主、空の画面、読み込み中）は、
// 3Dのレンダリングより線画のほうが素直に効きます。
//
// 3Dのほうを使う場所（トップの主役、キャラクター紹介）は、
// 画像ファイルをいただいてから差し込みます。
//
// ── 表情を持たせる ────────────────────────────────
// ボードにある6つのうち、線画で意味が壊れずに描けるものだけ持ちます。
//   ふつう / 考える / 聞きに行く / 報告する / のんびり
// 「驚く」は線画だと記号が増えて読みにくくなるので入れていません。

export type Mood = "normal" | "thinking" | "going" | "report" | "idle";

/**
 * タシカメのマーク。
 *
 * tone
 *   light  明るい地の上（線が黒）
 *   dark   黒い地の上（線が白）
 *   brand  青い面の上（線が白）
 */
export default function Tashikame({
  mood = "normal",
  tone = "light",
  size = 56,
  className = "",
  label,
}: {
  mood?: Mood;
  tone?: "light" | "dark" | "brand";
  size?: number;
  className?: string;
  /** 読み上げ用。飾りのときは省く */
  label?: string;
}) {
  const stroke = tone === "light" ? "#0F172A" : "#FFFFFF";
  const fill = tone === "dark" ? "#0F172A" : tone === "brand" ? "#2563EB" : "#FFFFFF";

  return (
    <svg
      viewBox="0 0 100 92"
      width={size}
      height={(size * 92) / 100}
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      fill="none"
      stroke={stroke}
      strokeWidth={4}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* 甲羅を背負った丸い体。左右非対称にして、置物に見えないようにする */}
      <path
        d="M49 4C71 4 88.5 18.5 91.5 39C94.5 59.5 84 78 62 84C40 90 16 81 9 61.5C2 42 12 17 29 8.5C35.5 5.2 42 4 49 4Z"
        fill={fill}
      />
      <Face mood={mood} stroke={stroke} />
    </svg>
  );
}

function Face({ mood, stroke }: { mood: Mood; stroke: string }) {
  // 目。開いているときは縦長の楕円、閉じているときは弧。
  const open = (
    <>
      <ellipse cx="35" cy="41" rx="3.4" ry="6.6" fill={stroke} stroke="none" />
      <ellipse cx="62" cy="39" rx="3.4" ry="6.6" fill={stroke} stroke="none" />
    </>
  );
  const closed = (
    <>
      <path d="M32 44c3-4 7-4 10 0" />
      <path d="M58 42c3-4 7-4 10 0" />
    </>
  );

  if (mood === "idle") {
    return (
      <>
        {closed}
        <path d="M44 60h8" />
      </>
    );
  }

  if (mood === "thinking") {
    return (
      <>
        <ellipse cx="37" cy="43" rx="3.6" ry="6.4" fill={stroke} stroke="none" />
        <path d="M58 42c3-4 7-4 10 0" />
        {/* 口を少しずらす。考えているときの、決めきれていない顔 */}
        <path d="M42 61c3-2.5 6 2.5 9 0" />
      </>
    );
  }

  // 小道具（板・効果線）は描かない。
  // viewBox の外に出て欠けた四角に見えるうえ、
  // 小さく置く場所では線が増えるほど読めなくなる。
  // ボードの ICON USAGE も頭だけなので、そちらに合わせる。
  if (mood === "going") {
    return (
      <>
        {open}
        {/* 口を横に開く。出かける顔 */}
        <path d="M43 59c3.5 3.5 7 3.5 10.5 0" />
      </>
    );
  }

  if (mood === "report") {
    return (
      <>
        {open}
        {/* 少し得意げ。報告する顔 */}
        <path d="M42 58c4 5 8 5 12 0" />
      </>
    );
  }

  return (
    <>
      {open}
      <path d="M40 58c2.5 2.5 5.5 2.5 8 0" />
    </>
  );
}
