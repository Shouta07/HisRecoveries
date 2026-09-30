import type { PlanId } from "@/lib/ask/plans";

// 料金カードのアイキャッチ。
//
// ══════════════════════════════════════════════════
// 写真を使わない
// ══════════════════════════════════════════════════
// 人物写真だと、載せた人が「答えてくれる女性」に見える。
// ここに出したいのは人ではなく、その商品で何が起きるか。
//   確かめる  男性が出したものを、女性が読んで返す
//   決める    声でやりとりする
//   試す      向かい合って、本番と同じことをやる
//
// 素材を買う必要が無く、重さも数KBで済む。
// 写真に差し替えたくなったら、この部品だけ書き換える。
//
// ══════════════════════════════════════════════════
// 顔を描かない
// ══════════════════════════════════════════════════
// 目鼻を描くと、その顔が誰なのかの話になる。
// 描くのは輪郭と、間に流れるものだけ。
//
// ══════════════════════════════════════════════════
// 色で、どちら側かを分ける
// ══════════════════════════════════════════════════
// 相談する側（男性）は青、答える側（女性）は赤。
// サイト全体で、この2色がその役目に使われている。

const INK = {
  him: "#94A3B8",
  himDeep: "#64748B",
  her: "#FF9DB1",
  herDeep: "#D91F45",
  brand: "#2563EB",
  brandSoft: "#BFD4FD",
  bg: "#EAF1FE",
  bg2: "#FFF1F4",
  paper: "#FFFFFF",
  line: "#C9D8F5",
};

/** 頭と肩。顔は描かない */
function Bust({
  x,
  y,
  r,
  fill,
  hair,
}: {
  x: number;
  y: number;
  r: number;
  fill: string;
  /** 髪の輪郭を後ろに置くか。左右の人を見分けるためだけのもの */
  hair?: string;
}) {
  return (
    <g>
      {hair && (
        <path
          d={`M${x - r * 1.45},${y + r * 1.5} a${r * 1.45},${r * 1.6} 0 1 1 ${r * 2.9},0 z`}
          fill={hair}
        />
      )}
      <circle cx={x} cy={y} r={r} fill={fill} />
      <path
        d={`M${x - r * 1.9},${y + r * 3.4} Q${x},${y + r * 1.15} ${x + r * 1.9},${y + r * 3.4} Z`}
        fill={fill}
      />
    </g>
  );
}

/** 時計。分数をそのまま出す */
function Clock({ x, y, r, label }: { x: number; y: number; r: number; label: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={INK.paper} stroke={INK.brand} strokeWidth="2.5" />
      <text
        x={x}
        y={y + r * 0.34}
        textAnchor="middle"
        fontSize={r * 0.92}
        fontWeight="900"
        fill={INK.brand}
      >
        {label}
      </text>
    </g>
  );
}

/** 声。間に流れているものを、弧で出す */
function Waves({ x, y, n, color }: { x: number; y: number; n: number; color: string }) {
  return (
    <g fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round">
      {Array.from({ length: n }, (_, i) => {
        const r = 9 + i * 8;
        return <path key={i} d={`M${x},${y - r} A${r},${r} 0 0 1 ${x},${y + r}`} />;
      })}
    </g>
  );
}

const SCENES: Record<PlanId, React.ReactNode> = {
  // 確かめる ── 出したものが、読まれて、返ってくる
  review: (
    <>
      <Bust x={52} y={56} r={14} fill={INK.him} />
      <Bust x={268} y={56} r={14} fill={INK.her} hair={INK.herDeep} />

      {/* 出したもの。画面に3行 */}
      <g transform="translate(118 26) rotate(-4)">
        <rect width="52" height="76" rx="8" fill={INK.paper} stroke={INK.line} strokeWidth="2" />
        <rect x="10" y="16" width="32" height="5" rx="2.5" fill={INK.brandSoft} />
        <rect x="10" y="28" width="26" height="5" rx="2.5" fill={INK.brandSoft} />
        <rect x="10" y="40" width="30" height="5" rx="2.5" fill={INK.brandSoft} />
      </g>

      {/* 返ってきたもの */}
      <g transform="translate(182 44)">
        <path
          d="M4 0h44a4 4 0 0 1 4 4v24a4 4 0 0 1-4 4H16l-9 9v-9H4a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4Z"
          fill={INK.bg2}
          stroke={INK.her}
          strokeWidth="2"
        />
        <rect x="11" y="11" width="30" height="4.5" rx="2.25" fill={INK.her} />
        <rect x="11" y="20" width="20" height="4.5" rx="2.25" fill={INK.her} />
      </g>

      {/* 何回ぶん持っているか */}
      <g>
        {[0, 1, 2, 3, 4].map((i) => (
          <circle key={i} cx={134 + i * 13} cy={112} r={4} fill={INK.brand} />
        ))}
      </g>
    </>
  ),

  // 決める（15分）── 声で、1つだけ決める
  call15: (
    <>
      <Bust x={58} y={58} r={16} fill={INK.him} />
      <Bust x={262} y={58} r={16} fill={INK.her} hair={INK.herDeep} />
      <Waves x={96} y={58} n={2} color={INK.himDeep} />
      {/* 右側は左右を反転させる。中心（x=160）で折り返すので translate(320 0) */}
      <g transform="translate(320 0) scale(-1 1)">
        <Waves x={96} y={58} n={2} color={INK.herDeep} />
      </g>
      <Clock x={160} y={58} r={27} label="15" />
      <text x="160" y="110" textAnchor="middle" fontSize="13" fontWeight="700" fill={INK.brand}>
        分
      </text>
    </>
  ),

  // 決める（30分）── 一通り決めきる。
  // 15分との違いは、数字と声の量だけで出す。
  // ここに「残るもの」の絵も足していたが、時計と重なって、
  // 何を見ればいいのか分からない絵になった。
  session: (
    <>
      <Bust x={52} y={58} r={16} fill={INK.him} />
      <Bust x={268} y={58} r={16} fill={INK.her} hair={INK.herDeep} />
      <Waves x={88} y={58} n={3} color={INK.himDeep} />
      <g transform="translate(320 0) scale(-1 1)">
        <Waves x={88} y={58} n={3} color={INK.herDeep} />
      </g>
      <Clock x={160} y={58} r={30} label="30" />
      <text x="160" y="112" textAnchor="middle" fontSize="13" fontWeight="700" fill={INK.brand}>
        分
      </text>
    </>
  ),

  // 試す ── 向かい合って、本番と同じことをやる
  mockdate: (
    <>
      <Bust x={104} y={42} r={17} fill={INK.him} />
      <Bust x={216} y={42} r={17} fill={INK.her} hair={INK.herDeep} />
      {/* 机。ここが「本番と同じ」であることの印。
          肩より広くしておく。狭いと、肩が机の外へはみ出して、
          向かい合って座っているように見えない */}
      <rect x="56" y="92" width="208" height="10" rx="5" fill={INK.brand} />
      <rect x="84" y="102" width="7" height="20" rx="3.5" fill={INK.brandSoft} />
      <rect x="229" y="102" width="7" height="20" rx="3.5" fill={INK.brandSoft} />
      {/* 飲みもの */}
      <g fill={INK.paper} stroke={INK.brand} strokeWidth="2.2">
        <path d="M137 76h16l-2 15h-12z" />
        <path d="M167 76h16l-2 15h-12z" />
      </g>
    </>
  ),
};

/**
 * 料金カードの上に敷く絵。
 *
 * ══════════════════════════════════════════════════
 * 地はCSS、絵はSVG
 * ══════════════════════════════════════════════════
 * 最初は地もSVGに入れて、幅いっぱいまで引き伸ばしていた（slice）。
 * カードの幅は画面によって 340px から 700px まで変わるので、
 * 広いところでは上下が切れて、頭が無くなった。
 *
 * 地はCSSで塗って、絵は縦横比を保ったまま中央に置く（meet）。
 * どの幅でも切れない。左右に余る分は、同じ色の地が続くだけ。
 *
 * 高さは固定。商品ごとに変えると、並べたときに頭がそろわない。
 */
export default function PlanArt({ id }: { id: PlanId }) {
  const scene = SCENES[id];
  if (!scene) return null;
  return (
    <div
      className="-mx-5 -mt-5 mb-4 overflow-hidden rounded-t-card sm:-mx-6 sm:-mt-6"
      style={{ background: INK.bg }}
    >
      <svg
        viewBox="0 0 320 128"
        role="img"
        aria-hidden
        preserveAspectRatio="xMidYMid meet"
        className="h-28 w-full sm:h-32"
      >
        {/* 地に赤みを差していたが、縁がはっきり出て、
            答える側の後ろに丸い染みがあるようにしか見えなかった。
            赤は人のほうだけで足りる */}
        {scene}
      </svg>
    </div>
  );
}

/* ── 公開の前に止めること ───────────────────────── */
{
  // 商品が増えたのに絵が無い、を防ぐ。
  // 1枚だけ絵の無いカードが混ざると、そこだけ手抜きに見える。
  for (const id of ["review", "call15", "session", "mockdate"] as PlanId[]) {
    if (!SCENES[id]) throw new Error(`商品「${id}」のアイキャッチがありません`);
  }
}
