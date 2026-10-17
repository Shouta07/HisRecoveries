import { CITIES } from "@/lib/voice";
import { codeOf } from "@/lib/trip/cities";

/* ══════════════════════════════════════════════════
   行ける範囲を、1枚の地図で出す
   ══════════════════════════════════════════════════

   ── 世界地図にしなかった ────────────────────────
   世界地図を描くと、世界のどこでも行けるように見える。
   実際に行けるのは3都市。

   地図は「どこへ行こうか」を考えさせる道具でもある。
   この製品は、行くと決めたあとだけを引き受けると決めた。
   行き先を選ばせる絵を置くと、看板と食い違う。

   だから、日本と3都市だけを出す。
   余白が広いのは、できないことが多いから。そこを隠さない。

   ── 絵を読み込まない ────────────────────────────
   画像ではなく、点と線で描く。
   4つの点と3本の弧だけなので、SVG で足りる。

   地図の画像を置くと、読み込みが増えるうえ、
   出典と権利の話が付いてくる（地図には著作権がある）。
   点と線なら、こちらのものになる。

   ── 位置は、実際の経度と緯度から ────────────────
   それらしく置くのではなく、本当の座標から出す。
   見る人のうち何人かは、位置がおかしければ気づく。

     東京     139.7E 35.7N
     ソウル   127.0E 37.6N
     台北     121.6E 25.0N
     バンコク 100.5E 13.8N

   東経95〜145度、北緯5〜45度の枠に収めている。 */

type Spot = { name: string; lon: number; lat: number };

const HOME: Spot = { name: "東京", lon: 139.7, lat: 35.7 };

const SPOT: Record<string, Spot> = {
  ソウル: { name: "ソウル", lon: 127.0, lat: 37.6 },
  台北: { name: "台北", lon: 121.6, lat: 25.0 },
  バンコク: { name: "バンコク", lon: 100.5, lat: 13.8 },
};

/* 枠は、中身にぴったり合わせてある。
   ブラウザで getBBox を取って測った値。
     x 8.6（バンコクの点）〜102.0（東京の名前の右端）
     y 9.6（ソウルの記号）〜65.8（バンコクの名前の下）

   最初は手で計算して枠を決めたが、緯度の掛け算を間違えていて、
   下に3割ほど空白が残っていた。地図は実測で合わせる。 */

/** 経度・緯度を、枠の中の位置に直す */
const W = 100;
const H = 78;
function at(s: Spot): { x: number; y: number } {
  return {
    x: ((s.lon - 95) / 50) * W,
    y: ((45 - s.lat) / 40) * H,
  };
}

/** 2点を結ぶ弧。飛行機の航路に見えるよう、上へふくらませる */
function arc(a: { x: number; y: number }, b: { x: number; y: number }): string {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  // 距離に応じて、ふくらみを変える。短い線まで大きく曲げると不自然
  const lift = Math.min(len * 0.22, 14);
  return `M ${a.x} ${a.y} Q ${mx} ${my - lift} ${b.x} ${b.y}`;
}

export default function RouteMap() {
  const home = at(HOME);

  return (
    <figure className="m-0">
      <svg
        viewBox="7 7 97 62"
        className="h-auto w-full"
        role="img"
        aria-label={`東京から、${CITIES.join("・")}の3都市へ`}
      >
        {/* 航路。点線にする。実線だと、定期便の路線図に見える */}
        {CITIES.map((c) => {
          const s = SPOT[c];
          if (!s) return null;
          return (
            <path
              key={`line-${c}`}
              d={arc(home, at(s))}
              fill="none"
              className="stroke-line"
              strokeWidth={0.7}
              strokeDasharray="2 2.4"
              strokeLinecap="round"
            />
          );
        })}

        {/* 出発地。中が空いた丸。ここは行き先ではない */}
        <circle
          cx={home.x}
          cy={home.y}
          r={2.1}
          className="fill-paper stroke-steel"
          strokeWidth={1}
        />
        <text
          x={home.x + 4}
          y={home.y + 1.2}
          className="fill-steel"
          fontSize={4}
          fontWeight={700}
        >
          {HOME.name}
        </text>

        {/* 行ける3都市。塗りつぶした点と、空港の記号 */}
        {CITIES.map((c) => {
          const s = SPOT[c];
          if (!s) return null;
          const p = at(s);
          // バンコクだけ左端に近いので、名前を右に出すと枠からはみ出る
          const right = p.x < W * 0.6;
          return (
            <g key={`spot-${c}`}>
              <circle cx={p.x} cy={p.y} r={2.4} className="fill-brand" />
              <text
                x={right ? p.x + 4 : p.x - 4}
                y={p.y - 1}
                textAnchor={right ? "start" : "end"}
                className="fill-brand"
                fontSize={4.2}
                fontWeight={900}
                letterSpacing={0.6}
              >
                {codeOf(c)}
              </text>
              <text
                x={right ? p.x + 4 : p.x - 4}
                y={p.y + 4}
                textAnchor={right ? "start" : "end"}
                className="fill-slate"
                fontSize={4}
                fontWeight={700}
              >
                {c}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-2 text-[11.5px] leading-[1.7] text-steel">
        いま行けるのは、この3都市だけです。余白は、まだできないところ。
      </figcaption>
    </figure>
  );
}
