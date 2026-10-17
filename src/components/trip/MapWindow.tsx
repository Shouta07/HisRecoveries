import { routeLink, assertPublicPoint, type MapPoint } from "@/lib/trip/map";

/* 地図を、1つの疑問のために開く窓。
 *
 * ══════════════════════════════════════════════════
 * 埋め込まない。リンクにする
 * ══════════════════════════════════════════════════
 * iframe で地図を埋めると、APIの鍵が要る。鍵が要ると、
 * 費用と、止まる場所が1つ増える。
 *
 * リンクなら鍵が要らず、携帯では Google マップのアプリが開く。
 * 現地で開くのはアプリのほうなので、そちらのほうが近い。
 *
 * ══════════════════════════════════════════════════
 * 旅程は組み立てない
 * ══════════════════════════════════════════════════
 * 出発地と目的地の2点だけ。経由地は受け取らない
 * （lib/trip/map.ts が、引数の数ごと止めている）。
 *
 * ここは「空港から宿まで、どう行く」に答える窓で、
 * 1日の回り方を作る道具ではない。
 */
export default function MapWindow({
  city,
  from,
  to,
}: {
  city: string;
  from: MapPoint;
  to: MapPoint;
}) {
  // 宿の名前や番号がURLへ載らないこと。街区までにする
  assertPublicPoint(from, "地図の出発地");
  assertPublicPoint(to, "地図の到着地");

  return (
    <a
      href={routeLink(city, from, to)}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-card border border-line bg-paper px-4 py-3.5 shadow-card transition-shadow hover:shadow-card-hover"
    >
      {/* 地図の記号。絵は置かない（読み込みが増えるだけ） */}
      <span
        aria-hidden
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-soft bg-mist"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-brand" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 3 3 5.5v15L9 18l6 3 6-2.5v-15L15 6 9 3Z" />
          <path d="M9 3v15M15 6v15" />
        </svg>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13.5px] font-bold leading-[1.5] text-slate">
          {from.label} → {to.label}
        </span>
        <span className="mt-0.5 block text-[11.5px] leading-[1.5] text-steel">
          Googleマップで行き方を見る
        </span>
      </span>
      <span aria-hidden className="shrink-0 text-[13px] text-steel">↗</span>
    </a>
  );
}
