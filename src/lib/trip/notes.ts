import { dbAdminEnabled, dbSelect } from "../db";
import { CITIES } from "../voice";
import { FRESH_DAYS, MIN_ANSWERERS } from "../who";
import { LEG_LABEL, LEGS, type Leg } from "./log";

/* ══════════════════════════════════════════════════
   行った人が残したこと
   ══════════════════════════════════════════════════

   ── こちらは、書かない ──────────────────────────
   「各国の情報を発信する」はやらない。
   やると、この製品がいちばん否定している側に回る。

   ペルソナの定義にこう書いてある。
     ブログは古く、SNSは慣れた人の投稿ばかりで
     自分に合わないと感じている

   こちらが書けば、その「古いブログ」になる。

   ── 貯まったものを、開くだけ ────────────────────
   帰国後に残った1行が、そのまま次の人への情報になる。

     両替は空港より街中がよかった        11/1
     スクンビットは夜も人通りがあった     10/30

   これは1次情報で、90日以内で、一人旅の視点。
   既存のブログにもSNSにも無いのは、この3つが揃っているところ。

   ── 書いた人を、商品にしない ────────────────────
   名前も、顔も、肩書きも持たない。
   持つのは「いつの旅か」と「旅程のどこか」だけ。

   誰が言ったかで重みを付け始めると、
   旅の上手い人のアカウントを育てる場所になる。
   それは SNS で、こちらがやることではない。

   ── 少ないうちは、出さない ──────────────────────
   1件や2件を「行った人の声」として出すと、
   それは「みんなこう言っている」になる。
   who.ts と同じ線（MIN_ANSWERERS）で止める。

   ── こちらが書いた文を、混ぜない ────────────────
   ここに1行でも自分で書くと、どれが実感でどれが編集なのか、
   読む人には分からなくなる。
   分からなくなった時点で、全部が旅行メディアの文になる。 */

export type Note = {
  id: string;
  city: string;
  /** 旅程のどこの話か */
  leg: Leg;
  /** 残した1行。そのまま出す。こちらで直さない */
  text: string;
  /** 帰国から何日たった人の話か */
  daysAgo: number;
};

export type CityNotes = {
  city: string;
  /** 出せる状態か。MIN_ANSWERERS に満たなければ false */
  shown: boolean;
  total: number;
  /** 旅程の段ごと。shown が false なら空 */
  groups: { leg: Leg; items: Note[] }[];
};

type Row = { id: string; city: string; leg: string; text: string; days_ago: number };

function isLeg(x: string): x is Leg {
  return (LEGS as string[]).includes(x);
}

/**
 * その都市に、行った人が残したもの。
 *
 * 新しい順。90日より前のものは出さない
 * （値段も店も変わっている。who.ts と同じ線）。
 */
export async function notesOf(city: string): Promise<CityNotes | null> {
  if (!(CITIES as readonly string[]).includes(city)) return null;
  const empty: CityNotes = { city, shown: false, total: 0, groups: [] };
  if (!dbAdminEnabled) return empty;

  const rows = await dbSelect<Row>(
    `trip_notes?city=eq.${encodeURIComponent(city)}` +
      `&days_ago=lte.${FRESH_DAYS}&select=id,city,leg,text,days_ago` +
      `&order=days_ago.asc&limit=200`,
  );
  const items: Note[] = rows
    .filter((r) => isLeg(r.leg) && r.text?.trim())
    .map((r) => ({
      id: r.id,
      city: r.city,
      leg: r.leg as Leg,
      text: r.text.trim(),
      daysAgo: r.days_ago,
    }));

  if (items.length < MIN_ANSWERERS) {
    return { city, shown: false, total: items.length, groups: [] };
  }
  return {
    city,
    shown: true,
    total: items.length,
    groups: LEGS.map((leg) => ({ leg, items: items.filter((x) => x.leg === leg) })).filter(
      (g) => g.items.length > 0,
    ),
  };
}

/** まだ出せないときに、画面へ出す言葉 */
export function notYetLine(n: CityNotes): string {
  if (n.total === 0) {
    return `${n.city}は、まだ誰も残していません。帰ってきた方から順に増えます。`;
  }
  return `${n.city}は、まだ${n.total}件です。${MIN_ANSWERERS}件になったら開きます。`;
}

/* ── 公開の前に止めること ───────────────────────── */
{
  /* ── こちらが書いた文を、持たないこと ────────────
     見本の一覧を置くと、それは「こちらが書いた旅行情報」になる。
     架空の人の実感を出すのは、架空の回答者を出していたのと同じ。

     このファイルに、文字列の一覧が無いことを見る。 */
  if (typeof (globalThis as Record<string, unknown>).DEMO_NOTES !== "undefined") {
    throw new Error("行った人が残したことに、見本を持っています。こちらは書きません");
  }

  /* 少ないうちは出さないこと。who.ts と同じ線を使う。
     別の数字を持つと、片方だけ緩められる。 */
  if (MIN_ANSWERERS < 3) {
    throw new Error(`出せる件数が ${MIN_ANSWERERS} 件です。少ない実感を総意として出せません`);
  }

  /* 90日より前のものを出さないこと。
     値段も店も変わっている。 */
  if (FRESH_DAYS > 120) {
    throw new Error(`${FRESH_DAYS}日前のものまで出しています。値段も店も変わっています`);
  }

  /* 旅程の段が、記録と同じ語彙であること。
     別に持つと、記録から情報へ移すときに落ちる。 */
  for (const l of LEGS) {
    if (!LEG_LABEL[l]) throw new Error(`旅程の段「${l}」に、名前がありません`);
  }

  /* まだ出せないときの言葉が、2通りあること。
     0件と、1〜2件は違う。「まだ0件です」は冷たい。 */
  const zero = notYetLine({ city: CITIES[0], shown: false, total: 0, groups: [] });
  const few = notYetLine({ city: CITIES[0], shown: false, total: 2, groups: [] });
  if (zero === few) throw new Error("0件と、少しあるときの言葉が同じです");
  if (!zero.includes("まだ誰も")) throw new Error("0件のときに、まだ誰もいないことを言っていません");
  if (!few.includes(String(MIN_ANSWERERS))) {
    throw new Error("少しあるときに、何件で出るのかを言っていません");
  }
}
