/* ══════════════════════════════════════════════════
   行った国・地域を、地図に落とす
   ══════════════════════════════════════════════════

   ── 大陸の輪郭を描かなかった ────────────────────
   見本には、薄い灰色の世界地図が入っていた。

   海岸線を手で引くと、必ずどこかが嘘になる。
   それらしく描けば描くほど、合っていない形が
   「正確な地図」として読まれる。

   代わりに、緯線と経線だけを引いて、
   実際の緯度経度に点を打つ。

   線は本当に30度ごと。点は本当にその場所。
   描いていないものは、描いていないと分かる。

   ── 名前は、下の一覧が持つ ──────────────────────
   点のそばに15個の名前を置くと、東アジアで重なる。
   読めない字を並べるより、地図は点だけにして、
   名前はすぐ下の一覧（lib/been.ts）で読ませる。

   なので、ここは画面読み上げから外す（aria-hidden）。
   同じことを2回読み上げても、意味がない。

   ── 切り取る範囲 ────────────────────────────────
   経度 -140〜175、緯度 65〜-45。
   15か国が全部入って、空いている極地を捨てられる。
     x = 経度 + 140
     y = 65 - 緯度 */

/** 実際の緯度・経度。首都または国の中心 */
const PLACES: { lon: number; lat: number; name: string }[] = [
  { lon: 126.98, lat: 37.57, name: "韓国" },
  { lon: 121.57, lat: 25.03, name: "台湾" },
  { lon: 114.17, lat: 22.32, name: "香港" },
  { lon: 113.54, lat: 22.2, name: "マカオ" },
  { lon: 105.85, lat: 21.03, name: "ベトナム" },
  { lon: 101.69, lat: 3.14, name: "マレーシア" },
  { lon: 120.98, lat: 14.6, name: "フィリピン" },
  { lon: 151.21, lat: -33.87, name: "オーストラリア" },
  { lon: -98.6, lat: 39.8, name: "アメリカ" },
  { lon: -0.13, lat: 51.51, name: "イギリス" },
  { lon: 2.35, lat: 48.86, name: "フランス" },
  { lon: 77.21, lat: 28.61, name: "インド" },
  { lon: 36.82, lat: -1.29, name: "ケニア" },
  { lon: 31.24, lat: 30.04, name: "エジプト" },
  { lon: 100.5, lat: 13.76, name: "タイ" },
];

/** 出発地。ここだけ形を変える */
const HOME = { lon: 139.69, lat: 35.68, name: "日本" };

const X = (lon: number) => lon + 140;
const Y = (lat: number) => 65 - lat;

export default function WorldDots({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 315 110" className={className} aria-hidden>
      {/* 緯線・経線。30度ごと */}
      <g stroke="currentColor" strokeWidth={0.4} opacity={0.3}>
        {[60, 30, 0, -30].map((lat) => (
          <line key={`a${lat}`} x1={0} y1={Y(lat)} x2={315} y2={Y(lat)} />
        ))}
        {[-120, -90, -60, -30, 0, 30, 60, 90, 120, 150].map((lon) => (
          <line key={`o${lon}`} x1={X(lon)} y1={0} x2={X(lon)} y2={110} />
        ))}
      </g>

      {/* 赤道だけ、少し濃く */}
      <line
        x1={0}
        y1={Y(0)}
        x2={315}
        y2={Y(0)}
        stroke="currentColor"
        strokeWidth={0.7}
        opacity={0.5}
      />

      {/* 行ったところ */}
      <g>
        {PLACES.map((p) => (
          <circle key={p.name} cx={X(p.lon)} cy={Y(p.lat)} r={3.2} fill="#1F4B3A" opacity={0.85} />
        ))}
      </g>

      {/* 出発地。輪で描いて、点と区別する */}
      <circle
        cx={X(HOME.lon)}
        cy={Y(HOME.lat)}
        r={5}
        fill="none"
        stroke="#E9B949"
        strokeWidth={2}
      />
    </svg>
  );
}
