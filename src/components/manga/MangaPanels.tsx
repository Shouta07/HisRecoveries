import Reveal from "@/components/Reveal";

/**
 * 縦読み漫画LP のコマ群。
 *
 * 実写・写植の漫画画像は持たないため、コマはすべてインライン SVG の
 * ライン画＋網点（スクリーントーン）で組み、His Recoveries の抑制された
 * エディトリアル・トーンに合わせている。
 *
 * 物語は「悩み（モノクロ）→ 出会い → 伴走 → 半歩進めた（緑＝回復）」の
 * 起承転結。色の入り方そのものが回復の進行を表す。
 */

const INK = "#1f2a1d";
const GREEN = "#3d5638";
const SOFT = "#85AB8B";

/* ── 共有の SVG 定義（網点・速線） ─────────────────────── */
function Defs() {
  return (
    <defs>
      {/* 網点（スクリーントーン）— 不安・影の表現 */}
      <pattern id="tone" width="7" height="7" patternUnits="userSpaceOnUse">
        <rect width="7" height="7" fill="transparent" />
        <circle cx="1.6" cy="1.6" r="1.1" fill={INK} fillOpacity="0.16" />
      </pattern>
      <pattern id="toneDense" width="5" height="5" patternUnits="userSpaceOnUse">
        <circle cx="1.3" cy="1.3" r="1" fill={INK} fillOpacity="0.26" />
      </pattern>
      {/* 緑の網点 — 回復側のコマ用 */}
      <pattern id="toneGreen" width="7" height="7" patternUnits="userSpaceOnUse">
        <circle cx="1.6" cy="1.6" r="1.2" fill={GREEN} fillOpacity="0.14" />
      </pattern>
      <radialGradient id="glow" cx="50%" cy="38%" r="62%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="glowGreen" cx="50%" cy="34%" r="66%">
        <stop offset="0%" stopColor={SOFT} stopOpacity="0.55" />
        <stop offset="100%" stopColor={SOFT} stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

/* 集中線 / 速線 */
function SpeedLines({ cx, cy, color = INK }: { cx: number; cy: number; color?: string }) {
  const lines = Array.from({ length: 28 }, (_, i) => {
    const a = (i / 28) * Math.PI * 2;
    const r1 = 70 + (i % 3) * 14;
    const r2 = 240;
    return (
      <line
        key={i}
        x1={cx + Math.cos(a) * r1}
        y1={cy + Math.sin(a) * r1}
        x2={cx + Math.cos(a) * r2}
        y2={cy + Math.sin(a) * r2}
        stroke={color}
        strokeOpacity={0.13}
        strokeWidth={i % 2 ? 1 : 2}
      />
    );
  });
  return <g>{lines}</g>;
}

/* 汗マーク */
function Sweat({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <path
      d={`M ${x} ${y} c ${5 * s} ${7 * s} ${5 * s} ${12 * s} 0 ${12 * s} c ${-5 * s} 0 ${-5 * s} ${-5 * s} 0 ${-12 * s} z`}
      fill="#cfe0d4"
      stroke={GREEN}
      strokeWidth={1.2}
    />
  );
}

/* ── コマ枠 ────────────────────────────────────────── */
function Frame({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden border-2 border-[#1f2a1d] bg-[#fbfaf6] shadow-[6px_6px_0_0_rgba(31,42,29,0.12)] ${className}`}
    >
      {children}
    </div>
  );
}

/* ナレーション枠（角の断ち切り箱） */
function Narration({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <div
      className={`pointer-events-none absolute top-3 ${
        align === "left" ? "left-3" : "right-3"
      } max-w-[78%] border border-[#1f2a1d] bg-[#fbfaf6]/95 px-3 py-2`}
    >
      <p className="font-mincho text-[12.5px] sm:text-[13.5px] leading-[1.7] text-[#1f2a1d] whitespace-pre-line">
        {children}
      </p>
    </div>
  );
}

/* 吹き出し */
function Bubble({
  children,
  className = "",
  tail = "bl",
}: {
  children: React.ReactNode;
  className?: string;
  tail?: "bl" | "br" | "tl" | "tr";
}) {
  const tailPos: Record<string, string> = {
    bl: "left-6 -bottom-2",
    br: "right-6 -bottom-2",
    tl: "left-6 -top-2",
    tr: "right-6 -top-2",
  };
  return (
    <div
      className={`absolute rounded-[1.4rem] border-2 border-[#1f2a1d] bg-white px-4 py-2.5 ${className}`}
    >
      <span
        aria-hidden
        className={`absolute ${tailPos[tail]} h-4 w-4 rotate-45 border-2 border-[#1f2a1d] bg-white ${
          tail.startsWith("b") ? "border-l-0 border-t-0" : "border-r-0 border-b-0"
        }`}
      />
      <span className="relative block font-mincho text-[13px] sm:text-[14.5px] font-semibold leading-[1.55] text-[#1f2a1d]">
        {children}
      </span>
    </div>
  );
}

/* 章番号 */
function Beat({ n, label }: { n: string; label: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-[#16241a] font-mono text-[13px] font-bold text-[#EDF1E8]">
        {n}
      </span>
      <span className="font-mono text-[11px] tracking-[0.18em] text-[#3d5638] uppercase">
        {label}
      </span>
    </div>
  );
}

/* 共通の座った人物（うつむき・肩をすぼめる） */
function FigureHunched({ color = INK }: { color?: string }) {
  return (
    <g stroke={color} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* 頭 */}
      <circle cx="0" cy="-54" r="22" fill="#fbfaf6" />
      {/* うつむいた前髪の影 */}
      <path d="M -18 -60 q 18 -18 36 0" fill={color} fillOpacity={0.12} stroke="none" />
      {/* 肩・胴（すぼめる） */}
      <path d="M -34 16 q -2 -42 34 -48 q 36 6 34 48" fill="#fbfaf6" />
      {/* 腕（体の前で組む） */}
      <path d="M -22 -6 q 22 16 44 0" />
    </g>
  );
}

/* 共通の立ち姿（伸び・開いた姿勢） */
function FigureStanding({ color = GREEN }: { color?: string }) {
  return (
    <g stroke={color} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="0" cy="-86" r="22" fill="#fbfaf6" />
      {/* 胴 */}
      <path d="M 0 -64 L 0 14" />
      {/* 肩〜腕（やや開く） */}
      <path d="M 0 -52 L -30 -10" />
      <path d="M 0 -52 L 30 -18" />
      {/* 脚 */}
      <path d="M 0 14 L -18 70" />
      <path d="M 0 14 L 20 70" />
    </g>
  );
}

/* ════════════════════════════════════════════════════
   コマ 01 — 起：会議室、汗とにおいが気になる
   ════════════════════════════════════════════════════ */
function Scene1() {
  return (
    <Frame>
      <svg viewBox="0 0 600 380" className="block w-full" role="img" aria-label="会議室の机で、汗とにおいを気にしてうつむく男性">
        <Defs />
        <rect width="600" height="380" fill="url(#tone)" />
        <SpeedLines cx={300} cy={150} />
        {/* 机 */}
        <rect x="120" y="250" width="360" height="14" fill={INK} fillOpacity={0.85} />
        <rect x="150" y="264" width="14" height="90" fill={INK} fillOpacity={0.7} />
        <rect x="436" y="264" width="14" height="90" fill={INK} fillOpacity={0.7} />
        <rect x="190" y="232" width="80" height="20" fill="url(#toneDense)" stroke={INK} strokeWidth={1.5} />
        {/* 人物 */}
        <g transform="translate(300,232)">
          <FigureHunched />
        </g>
        {/* 汗 */}
        <Sweat x={258} y={168} s={1.1} />
        <Sweat x={344} y={176} s={0.9} />
        <Sweat x={336} y={150} s={0.7} />
        {/* 緊張の縦線 */}
        {[270, 282, 318, 330].map((x) => (
          <line key={x} x1={x} y1={150} x2={x} y2={185} stroke={INK} strokeOpacity={0.25} strokeWidth={1.5} />
        ))}
      </svg>
      <Narration>朝の会議。{"\n"}まだ何も始まっていないのに、{"\n"}もう、背中が湿っている。</Narration>
      <Bubble className="right-4 bottom-6" tail="br">
        （また、においが<br />気になってる……）
      </Bubble>
    </Frame>
  );
}

/* ════════════════════════════════════════════════════
   コマ 02 — 承：距離をとってしまう
   ════════════════════════════════════════════════════ */
function Scene2() {
  return (
    <Frame>
      <svg viewBox="0 0 600 380" className="block w-full" role="img" aria-label="人と半歩の距離をとってしまう男性">
        <Defs />
        <rect width="600" height="380" fill="#fbfaf6" />
        <rect x="300" y="0" width="300" height="380" fill="url(#tone)" />
        {/* 相手（手を差し出す） */}
        <g transform="translate(180,210)">
          <g stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.55}>
            <circle cx="0" cy="-86" r="20" fill="#fbfaf6" />
            <path d="M 0 -66 L 0 20" />
            <path d="M 0 -52 L 46 -34" />
            <path d="M 0 -52 L -26 -14" />
            <path d="M 0 20 L -16 84" />
            <path d="M 0 20 L 18 84" />
          </g>
        </g>
        {/* 自分（半歩引く） */}
        <g transform="translate(420,214)">
          <FigureStanding color={INK} />
        </g>
        {/* 距離の矢印 */}
        <line x1="250" y1="320" x2="372" y2="320" stroke={INK} strokeWidth={1.5} strokeDasharray="5 5" />
        <text x="311" y="312" textAnchor="middle" className="font-mono" fontSize="13" fill={INK} fillOpacity={0.7}>
          半歩
        </text>
      </svg>
      <Narration>近づかれると、{"\n"}つい半歩、引いてしまう。</Narration>
      <Bubble className="left-4 bottom-6" tail="bl">
        誘いも、{"\n"}いつからか断る側に。
      </Bubble>
    </Frame>
  );
}

/* ════════════════════════════════════════════════════
   コマ 03 — 承：深夜、ひとりで検索する
   ════════════════════════════════════════════════════ */
function Scene3() {
  return (
    <Frame>
      <svg viewBox="0 0 600 380" className="block w-full" role="img" aria-label="深夜にひとりスマホで検索する男性">
        <Defs />
        <rect width="600" height="380" fill={INK} fillOpacity={0.9} />
        <rect width="600" height="380" fill="url(#toneDense)" />
        {/* スマホの光 */}
        <ellipse cx="300" cy="210" rx="150" ry="120" fill="url(#glow)" opacity={0.5} />
        <rect x="276" y="196" width="48" height="78" rx="7" fill="#fbfaf6" stroke={INK} strokeWidth={2} />
        <line x1="286" y1="214" x2="314" y2="214" stroke={INK} strokeOpacity={0.5} strokeWidth={2} />
        <line x1="286" y1="226" x2="308" y2="226" stroke={INK} strokeOpacity={0.4} strokeWidth={2} />
        {/* 顔（光に照らされる輪郭だけ） */}
        <path
          d="M 300 70 q 40 0 44 56 q 2 40 -44 52 q -46 -12 -44 -52 q 4 -56 44 -56 z"
          fill="none"
          stroke="#fbfaf6"
          strokeOpacity={0.85}
          strokeWidth={2.5}
        />
        <text x="300" y="332" textAnchor="middle" className="font-mono" fontSize="15" fill="#fbfaf6" fillOpacity={0.7}>
          02:14
        </text>
      </svg>
      <div className="pointer-events-none absolute top-3 left-3 max-w-[80%] border border-white/40 bg-[#1f2a1d]/70 px-3 py-2">
        <p className="font-mincho text-[12.5px] sm:text-[13.5px] leading-[1.7] text-white/90 whitespace-pre-line">
          「ワキガ 手術」「多汗症 治る」。{"\n"}検索しては、そっと消す。{"\n"}誰にも言えないまま、10年。
        </p>
      </div>
    </Frame>
  );
}

/* ════════════════════════════════════════════════════
   コマ 04 — 転：静かな招待。色が入りはじめる
   ════════════════════════════════════════════════════ */
function Scene4() {
  return (
    <Frame className="border-[#3d5638]">
      <svg viewBox="0 0 600 380" className="block w-full" role="img" aria-label="His Recoveries の静かな招待。新芽の意匠">
        <Defs />
        <rect width="600" height="380" fill="#f1f5ee" />
        <rect width="600" height="380" fill="url(#toneGreen)" />
        <ellipse cx="300" cy="180" rx="220" ry="170" fill="url(#glowGreen)" />
        {/* カード / 招待状 */}
        <g transform="translate(300,196)">
          <rect x="-150" y="-92" width="300" height="184" rx="8" fill="#fbfaf6" stroke={GREEN} strokeWidth={2.5} />
          {/* 新芽 */}
          <g stroke={GREEN} strokeWidth={3} fill="none" strokeLinecap="round">
            <path d="M 0 44 L 0 -8" />
            <path d="M 0 6 q -30 -6 -34 -38 q 30 2 34 38" fill={SOFT} fillOpacity={0.45} />
            <path d="M 0 -4 q 30 -8 34 -42 q -30 2 -34 42" fill={SOFT} fillOpacity={0.3} />
          </g>
          <text x="0" y="74" textAnchor="middle" className="logo-type" fontSize="17" fill={GREEN} letterSpacing="2">
            His Recoveries
          </text>
        </g>
      </svg>
      <Narration align="left">
        ある夜、{"\n"}流れてきた一行。{"\n"}「半歩先からの記録。」
      </Narration>
      <Bubble className="right-4 bottom-6 !border-[#3d5638]" tail="br">
        完全招待制・完全匿名。{"\n"}……顔も、名前も、いらない？
      </Bubble>
    </Frame>
  );
}

/* ════════════════════════════════════════════════════
   コマ 05 — 転：専属が、隣で並走する
   ════════════════════════════════════════════════════ */
function Scene5() {
  return (
    <Frame className="border-[#3d5638]">
      <svg viewBox="0 0 600 380" className="block w-full" role="img" aria-label="専属担当と並んで光のほうへ歩く">
        <Defs />
        <rect width="600" height="380" fill="#eef3ea" />
        <ellipse cx="430" cy="150" rx="200" ry="180" fill="url(#glowGreen)" />
        {/* 道 */}
        <path d="M 40 360 L 560 220" stroke={GREEN} strokeOpacity={0.3} strokeWidth={3} />
        <path d="M 40 380 L 560 250" stroke={GREEN} strokeOpacity={0.15} strokeWidth={3} />
        {/* 5つのマーカー */}
        {[0, 1, 2, 3, 4].map((i) => {
          const x = 110 + i * 95;
          const y = 352 - i * 27;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="11" fill="#fbfaf6" stroke={GREEN} strokeWidth={2} />
              <text x={x} y={y + 4} textAnchor="middle" className="font-mono" fontSize="10" fill={GREEN}>
                {`0${i + 1}`}
              </text>
            </g>
          );
        })}
        {/* 二人で並んで */}
        <g transform="translate(250,232) scale(0.86)">
          <FigureStanding color={INK} />
        </g>
        <g transform="translate(320,236) scale(0.86)">
          <FigureStanding color={GREEN} />
        </g>
      </svg>
      <Narration align="left">
        診断は連携医療機関。{"\n"}原因 → 中立に並べる → 医療連携 →{"\n"}伴走 → 卒業。隠さず、順番どおりに。
      </Narration>
      <Bubble className="left-4 bottom-6 !border-[#3d5638]" tail="bl">
        ひとりで{"\n"}背負わなくて、いい。
      </Bubble>
    </Frame>
  );
}

/* ════════════════════════════════════════════════════
   コマ 06 — 結：半歩、進めた（フルカラー＝緑）
   ════════════════════════════════════════════════════ */
function Scene6() {
  return (
    <Frame className="border-[#3d5638]">
      <svg viewBox="0 0 600 400" className="block w-full" role="img" aria-label="光のなかで顔を上げ、手を挙げる男性">
        <Defs />
        <rect width="600" height="400" fill="#e8f0e4" />
        <rect width="600" height="400" fill="url(#toneGreen)" />
        <SpeedLines cx={300} cy={180} color={SOFT} />
        <ellipse cx="300" cy="170" rx="190" ry="180" fill="url(#glowGreen)" />
        {/* 顔を上げ、手を挙げる */}
        <g transform="translate(300,250)">
          <g stroke={GREEN} strokeWidth={3.4} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="0" cy="-118" r="24" fill="#fbfaf6" />
            <path d="M 0 -94 L 0 14" />
            {/* 挙げた手 */}
            <path d="M 0 -78 L 40 -132" />
            <path d="M 0 -78 L -28 -36" />
            <path d="M 0 14 L -18 92" />
            <path d="M 0 14 L 20 92" />
          </g>
        </g>
      </svg>
      <Narration align="left">数ヶ月後。{"\n"}避けていたグレーのシャツで、{"\n"}会議室で、手を挙げていた。</Narration>
      <Bubble className="right-4 bottom-8 !border-[#3d5638]" tail="br">
        （あ、{"\n"}半歩、進めた。）
      </Bubble>
    </Frame>
  );
}

/* ════════════════════════════════════════════════════
   公開コンポーネント
   ════════════════════════════════════════════════════ */
const SCENES = [
  { beat: { n: "01", label: "Morning" }, el: <Scene1 />, lead: "言えない、から始まった。" },
  { beat: { n: "02", label: "Distance" }, el: <Scene2 />, lead: "" },
  { beat: { n: "03", label: "Alone" }, el: <Scene3 />, lead: "" },
  { beat: { n: "04", label: "The Invitation" }, el: <Scene4 />, lead: "そして、色が入りはじめる。" },
  { beat: { n: "05", label: "Walking Together" }, el: <Scene5 />, lead: "" },
  { beat: { n: "06", label: "Half a Step" }, el: <Scene6 />, lead: "" },
];

export default function MangaPanels() {
  return (
    <div className="mx-auto max-w-[640px] space-y-12 sm:space-y-16">
      {SCENES.map((s, i) => (
        <Reveal key={s.beat.n} delay={i === 0 ? 0 : 80}>
          <div>
            <Beat n={s.beat.n} label={s.beat.label} />
            {s.lead && (
              <p className="mb-5 font-mincho text-[17px] sm:text-[19px] font-semibold leading-[1.7] text-[#1f2a1d]">
                {s.lead}
              </p>
            )}
            {s.el}
          </div>
        </Reveal>
      ))}
    </div>
  );
}
