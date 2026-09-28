// 結果のリング。
//
// ── 見た瞬間に1つだけ分かるようにする ──────────────
// 棒グラフを2本並べると、読み比べる手間が生まれる。
// 「4 / 5 送ってOK」を1つの円で言い切る。
//
// ── 色に意味を持たせる ────────────────────────────
// 良い側だけ緑。残りは灰色。緑を2つ置くと、どちらが良いのか消える。
//
// ── 文字に ok を使わない ──────────────────────────
// #16A34A は白地で 3.16:1 しかない。線として引くのはよいが、
// 文字にすると AA に届かない。文字は ok-text（4.54:1）を使う。

export default function Donut({
  n,
  of,
  label,
  positive = true,
  percent = false,
  size = 132,
}: {
  n: number;
  of: number;
  label: string;
  /** 良い側か。false なら灰色で描く */
  positive?: boolean;
  /** 「4 / 5」ではなく「80%」で出す */
  percent?: boolean;
  size?: number;
}) {
  const safeOf = Math.max(1, of);
  const ratio = Math.min(1, Math.max(0, n / safeOf));
  const stroke = Math.round(size * 0.075);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="#E4E9F0"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={positive ? "#16A34A" : "#C3CAD6"}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${c * ratio} ${c}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p
            className={`font-black tabular-nums leading-none ${
              positive ? "text-slate" : "text-steel"
            }`}
            style={{ fontSize: Math.round(size * 0.3) }}
          >
            {percent ? Math.round(ratio * 100) : n}
            <span
              className={positive ? "text-steel" : "text-steel"}
              style={{ fontSize: Math.round(size * 0.145) }}
            >
              {percent ? "%" : ` /${of}`}
            </span>
          </p>
          <p
            className={`mt-1.5 text-center font-bold leading-[1.3] ${
              positive ? "text-ok-text" : "text-steel"
            }`}
            style={{ fontSize: Math.round(size * 0.105) }}
          >
            {label}
          </p>
        </div>
      </div>

      {/* 読み上げには、円ではなく文で渡す */}
      <span className="sr-only">
        {of}人のうち{n}人が「{label}」
      </span>
    </div>
  );
}
