import { CITIES } from "../voice";
import { CITY_CODE } from "./cities";

/* ══════════════════════════════════════════════════
   地図は、旅程を作る道具ではない
   ══════════════════════════════════════════════════

   ── 何に使うか ──────────────────────────────────
   「空港から宿まで、どう行く」。
   初めて一人で行く人の、いちばん最初の不安。

   そこに地図を1枚だけ出す。
   出発地と目的地の2点。それだけ。

   ── 何に使わないか ──────────────────────────────
   旅程の自動生成はやらない。最初に決めたことで、
   始めた瞬間に競合が旅行メディアと Google 本体になる。
   そこでは勝てない。

   だから、経由地を受け取らない形にしてある。
   2点までしか渡せないので、行程は組み立てられない。
   「やらない」と書くだけだと、いつか足される。

   ── 鍵も費用も要らない ──────────────────────────
   使うのは Maps URLs。ただのリンクで、APIの鍵が要らない。

     Embed API   鍵が要る
     Routes API  鍵が要る。経路の計算に課金される
     Maps URLs   鍵なし。無料。携帯ではアプリが開く

   経路を「作る」のではなく、本人が確かめる窓を開けるだけなので、
   いちばん軽いもので足りる。
   鍵を持たないということは、止まる場所が1つ減るということ。

   ── 個人の情報を、URLに載せない ──────────────────
   宿の名前や予約番号をURLに入れると、履歴にも、
   共有したときの文字列にも残る。
   出すのは街区まで（スクンビット）。建物名は入れない。 */

export type MapPoint = {
  /** 画面に出す名前。スクンビット、スワンナプーム空港 */
  label: string;
};

/**
 * Google マップの経路リンク。
 *
 * 受け取るのは2点だけ。経由地は受け取らない（行程を組ませない）。
 * 戻り値はただのURL。こちらのサーバーは1回も呼ばれない。
 */
export function routeLink(city: string, from: MapPoint, to: MapPoint): string {
  const q = (p: MapPoint) => encodeURIComponent(`${p.label} ${city}`);
  return `https://www.google.com/maps/dir/?api=1&origin=${q(from)}&destination=${q(to)}&travelmode=transit`;
}

/** その場所を、地図で見るだけのリンク */
export function placeLink(city: string, p: MapPoint): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.label} ${city}`)}`;
}

/**
 * URLに載せてはいけないもの。
 *
 * 宿の名前・部屋番号・予約番号・便名。
 * 履歴にも、共有したときの文字列にも残る。
 */
const PRIVATE = [
  /ホテル/, /hotel/i, /ホステル/, /hostel/i, /ゲストハウス/,
  /[0-9]{3,}/, /予約/, /確認番号/, /便/, /[A-Z]{2}\d{2,4}\b/,
];

export function assertPublicPoint(p: MapPoint, where: string): MapPoint {
  const hit = PRIVATE.find((re) => re.test(p.label));
  if (hit) {
    throw new Error(
      `${where} の「${p.label}」に、URLへ載せられないものが入っています（${hit}）。` +
        `宿の名前や番号ではなく、街区まで（スクンビット）にしてください`,
    );
  }
  return p;
}

/* ── 公開の前に止めること ───────────────────────── */
{
  /* ── 鍵を持たないこと ──────────────────────────
     鍵を使う口（Embed / Routes / Places）を呼び始めた瞬間に、
     費用と、止まる場所が増える。
     このファイルの中に、鍵を読む行が無いことを見る。 */
  const src = routeLink("バンコク", { label: "スワンナプーム空港" }, { label: "スクンビット" });
  if (/key=|API_KEY|apiKey/.test(src)) {
    throw new Error("地図のリンクに、APIの鍵が入っています。Maps URLs は鍵なしで動きます");
  }
  if (!src.startsWith("https://www.google.com/maps/")) {
    throw new Error(`地図のリンクが、Googleマップのものになっていません（${src}）`);
  }

  /* ── 経由地を受け取らないこと ──────────────────
     旅程の自動生成はやらないと決めた。
     「やらない」と書くだけだと、いつか足される。
     2点しか渡せない形を、ここで固定する。 */
  if (/waypoints/.test(src)) {
    throw new Error("地図のリンクに経由地が入っています。旅程は組み立てません（2点まで）");
  }
  if (routeLink.length !== 3) {
    throw new Error(
      `経路リンクが ${routeLink.length} 個の引数を取っています` +
        `（都市・出発・到着の3つまで。経由地を足さないこと）`,
    );
  }

  /* ── 対応している都市だけ ──────────────────────
     地図は都市を選ばないので、ここだけ勝手に広がれる。
     広がると「対応は3都市」と書いている1画面目が嘘になる。 */
  for (const c of CITIES) {
    if (!CITY_CODE[c]) throw new Error(`都市「${c}」が、地図から見て未対応です`);
  }

  /* ── 個人の情報を止めること ──────────────────── */
  for (const bad of ["Aホテル301号室", "予約番号 12345", "TG641"]) {
    let stopped = false;
    try {
      assertPublicPoint({ label: bad }, "見本");
    } catch {
      stopped = true;
    }
    if (!stopped) throw new Error(`「${bad}」が、地図のURLに載せられる扱いになっています`);
  }
  assertPublicPoint({ label: "スクンビット" }, "見本");
  assertPublicPoint({ label: "スワンナプーム空港" }, "見本");
}
