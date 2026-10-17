import { CITIES } from "../voice";
import { codeOf } from "./cities";

/* ══════════════════════════════════════════════════
   旅の記録。何が積み上がったか
   ══════════════════════════════════════════════════

   ── 「次にやること」だけだと、宿題帳になる ──────
   準備の画面は、放っておくと未完了リストになる。
   パスポート、保険、eSIM、両替、配車アプリ、空港からの行き方。
   並べれば並べるほど、行くのが面倒になる。

   逆にする。済んだことを、時間の順に積む。
   「ここまで来た」が見えるから、残りが怖くなくなる。

   ── 旅程の形にする ──────────────────────────────
   準備 → 出発 → 現地 → 帰国。
   路線図のように、縦の線でつなぐ。

   これは飾りではない。旅には必ずこの順番があるので、
   いま自分がどこにいるかが、線を見れば分かる。

   ── 日付を、主役にする ──────────────────────────
   記録は、日付と対になって初めて記録になる。
   「宿を決めた」だけだと予定表だが、
   「10/14 宿を決めた」になると、過ぎた時間が見える。

   ── 旅のあとも消さない ──────────────────────────
   帰国後の行は、次の旅のときにいちばん役に立つ。
   「両替は明洞がよかった」は、半年後の自分への手紙になる。
   そして、行ったばかりの人として答えるときの元にもなる。 */

/** 旅程のどこか */
export type Leg = "prep" | "depart" | "there" | "back";

export const LEG_LABEL: Record<Leg, string> = {
  prep: "準備",
  depart: "出発",
  there: "現地",
  back: "帰国",
};

/** 旅程の順番。線はこの順で引く */
export const LEGS: Leg[] = ["prep", "depart", "there", "back"];

export type LogItem = {
  /** 10/14 */
  date: string;
  leg: Leg;
  /** 何が済んだか。短く */
  what: string;
  /** まだ済んでいない、次の1つ。1つの旅に1つだけ */
  isNext?: boolean;
};

export type TripLog = {
  city: string;
  code: string | null;
  items: LogItem[];
};

/** 旅程の段ごとに分ける。画面はこの形で出す */
export function byLeg(items: LogItem[]): { leg: Leg; items: LogItem[] }[] {
  return LEGS.map((leg) => ({ leg, items: items.filter((x) => x.leg === leg) })).filter(
    (g) => g.items.length > 0,
  );
}

/** 済んだ数。急かさないので、残りは数えない */
export function doneCount(items: LogItem[]): number {
  return items.filter((x) => !x.isNext).length;
}

/* ══════════════════════════════════════════════════
   トップに出す見本
   ══════════════════════════════════════════════════ */

export const DEMO_LOG: TripLog = {
  city: "バンコク",
  code: codeOf("バンコク"),
  items: [
    { date: "10/14", leg: "prep", what: "宿を決めた（スクンビット）" },
    { date: "10/18", leg: "prep", what: "eSIMを買った" },
    { date: "10/22", leg: "prep", what: "海外旅行保険に入った" },
    { date: "10/26", leg: "prep", what: "空港→宿の移動手段を決める", isNext: true },
    { date: "10/29", leg: "depart", what: "バンコクへ" },
    { date: "10/30", leg: "there", what: "夜、ひとりで屋台まで歩けた" },
    { date: "11/1", leg: "back", what: "帰国。両替は空港より街中がよかった" },
  ],
};

/* ── 公開の前に止めること ───────────────────────── */
{
  /* 旅程が4つであること。
     増やすと、本人にどの段にいるかを選ばせることになる。 */
  if (LEGS.length !== 4) {
    throw new Error(`旅程が ${LEGS.length} 段あります（準備・出発・現地・帰国の4つ）`);
  }
  if (new Set(LEGS).size !== LEGS.length) throw new Error("旅程の段が重なっています");

  /* 段の名前が、採点に読めないこと。 */
  for (const v of Object.values(LEG_LABEL)) {
    for (const w of ["未", "遅", "不足", "残り", "要"]) {
      if (v.includes(w)) throw new Error(`旅程の段「${v}」が、足りないものに読めます`);
    }
  }

  {
    const items = DEMO_LOG.items;

    /* 都市が、対応している3つの中にあること。 */
    if (!(CITIES as readonly string[]).includes(DEMO_LOG.city)) {
      throw new Error(`見本の都市「${DEMO_LOG.city}」が、対応都市にありません`);
    }
    if (!DEMO_LOG.code) throw new Error("見本に、空港の記号がありません");

    /* ── 済んだことが、次にやることより多いこと ──────
       ここがこの画面の全部。
       未完了のほうが多いと、宿題帳に戻る。 */
    const next = items.filter((x) => x.isNext).length;
    if (doneCount(items) <= next) {
      throw new Error("見本で、済んだことが次にやることより少ないです（宿題帳になっています）");
    }
    /* 次にやることは、1つだけ。
       2つ以上あると、どれからやるかをまた考えることになる。 */
    if (next > 1) {
      throw new Error(`見本に、次にやることが ${next} 個あります（1つだけ）`);
    }

    /* ── 帰国後の行があること ────────────────────
       旅のあとも消さないのが、この製品の芯。
       半年後の自分と、次に行く人のために残る。 */
    if (!items.some((x) => x.leg === "back")) {
      throw new Error("見本に、帰国後の行がありません（旅のあとも残るのが芯です）");
    }
    /* 現地の行があること。
       準備だけだと、持ち物リストと区別が付かない。 */
    if (!items.some((x) => x.leg === "there")) {
      throw new Error("見本に、現地の行がありません（持ち物リストと区別が付きません）");
    }

    /* 日付が、旅程の順に並んでいること。
       線でつなぐので、前後すると読めない。 */
    const order = items.map((x) => LEGS.indexOf(x.leg));
    for (let i = 1; i < order.length; i += 1) {
      if (order[i] < order[i - 1]) {
        throw new Error(`見本の${LEG_LABEL[items[i].leg]}が、前の段より先に出ています`);
      }
    }
    for (const x of items) {
      if (!/^\d{1,2}\/\d{1,2}$/.test(x.date)) {
        throw new Error(`見本の日付「${x.date}」が、月／日の形になっていません`);
      }
      if (x.what.length > 30) {
        throw new Error(`見本の「${x.what}」が ${x.what.length} 字あります（30字まで）`);
      }
    }

    /* 急かす言い方が入っていないこと。 */
    const flat = items.map((x) => x.what).join("");
    for (const w of ["急", "早く", "まだ", "遅れ", "間に合"]) {
      if (flat.includes(w)) throw new Error(`見本に「${w}」が入っています。急かさないでください`);
    }
  }
}
