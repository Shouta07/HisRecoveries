// 選択肢の整理。
//
// 診断が出すのは「順番」だが、順番だけでは動けない。
// 「STEP 1は清潔感です」と言われても、次に何を選ぶかが残る。
// ここは、その1歩を選べる形に落とすためのデータと絞り込み。
//
// ── ランキングにしない ────────────────────────────
// 「おすすめ1位」は書かない。書けるのは「あなたの条件だと、これは入る／
// これは入らない」だけ。だから出力は順位ではなく、
//   ① 条件に合ったもの（安い順）
//   ② 条件から外れたもの（外した理由つき）
// の2つになる。外したものを隠さないのが、この形のいちばん大事なところ。
// 隠すと「選択肢を整理した」ではなく「選択肢を絞って見せた」になる。
//
// ── 段階 ────────────────────────────────────
//   self … 買わずにできる（やり方を変える）
//   buy  … 物を買って変える
//   pro  … 人に頼む（非医療）
//   care … 医療の領域。費用は書かず、勧めもしない。
//          「そこに選択肢がある」ことと「何を確認できるか」だけを書く
//
// ── 金額 ────────────────────────────────────
// すべて「月あたりの目安の幅」。実額の調査はまだしていない。
// 取材100人が終わったら、中央値に置き換える（そこが実額表になる）。
//
// ── 書かないこと ──────────────────────────────
// 効果、改善の保証、商品名・ブランド名、医療の費用、
// 「〜すべき」という書き方。書けるのは、やることと条件だけ。

import type { AreaId } from "./check";
import { assertNoPromoWords } from "./monetization";

export type Tier = "self" | "buy" | "pro" | "care";

export const TIER_LABEL: Record<Tier, string> = {
  self: "買わずにやる",
  buy: "物を替える",
  pro: "人に頼む",
  care: "医療の領域",
};

export type Option = {
  id: string;
  area: AreaId;
  tier: Tier;
  /** 何をするか。名詞ではなく動詞で書く */
  label: string;
  /** 具体。1〜2文。効果は書かない */
  what: string;
  /** 月あたりの費用の目安（円）。care は 0 のまま使わない */
  costMin: number;
  costMax: number;
  /** 1日にかかる時間（分）。続くかどうかはここで決まる */
  minutesPerDay: number;
  /** 変化を確かめるまでの目安（週） */
  weeks: number;
  /** 向いている人 */
  fitsWhen: string;
  /** まだ早い条件。売っていない側にしか書けない部分 */
  notYet?: string;
};

// ── 選択肢 ────────────────────────────────────

export const OPTIONS: Option[] = [
  // 清潔感・第一印象
  {
    id: "imp-self-1",
    area: "impression",
    tier: "self",
    label: "爪・眉・襟足を、決めた曜日に整える",
    what: "曜日を決めて、爪切りと眉のはみ出しと襟足を同じ日にやる。思い立ったときにやると続かないので、日を固定する。",
    costMin: 0,
    costMax: 0,
    minutesPerDay: 3,
    weeks: 2,
    fitsWhen: "手をつけていない項目が3つ以上ある",
  },
  {
    id: "imp-buy-1",
    area: "impression",
    tier: "buy",
    label: "いちばん着る服を1枚、サイズの合うものに替える",
    what: "枚数を増やさず、着る頻度の高い1枚だけを入れ替える。肩幅と着丈が合っているかだけを見る。",
    costMin: 3000,
    costMax: 12000,
    minutesPerDay: 0,
    weeks: 1,
    fitsWhen: "服のサイズが体に合っていない自覚がある",
    notYet: "手入れ（爪・眉・髪）が先。服だけ替えても揃わない",
  },
  {
    id: "imp-pro-1",
    area: "impression",
    tier: "pro",
    label: "美容室で、切り方の指名ではなく相談から入る",
    what: "「いつも通り」をやめて、顔まわりをどうしたいかを言葉にして相談する。同じ人に続けて頼むほうが精度が上がる。",
    costMin: 4000,
    costMax: 8000,
    minutesPerDay: 0,
    weeks: 4,
    fitsWhen: "自分で整える範囲では届かないと感じている",
  },

  // 髪
  {
    id: "hair-self-1",
    area: "hair",
    tier: "self",
    label: "同じ条件で、つむじと生え際を月1回撮る",
    what: "同じ場所・同じ明るさ・同じ角度で撮って残す。比べる基準がないと、変化しているかどうかを判断できない。",
    costMin: 0,
    costMax: 0,
    minutesPerDay: 1,
    weeks: 12,
    fitsWhen: "気になり始めたが、進んでいるのか分からない",
  },
  {
    id: "hair-self-2",
    area: "hair",
    tier: "self",
    label: "洗い方と乾かし方を変える",
    what: "洗う回数ではなく、すすぎの時間と、乾かすまでの放置時間を見直す。頭皮を濡れたままにしない。",
    costMin: 0,
    costMax: 0,
    minutesPerDay: 5,
    weeks: 4,
    fitsWhen: "かゆみ・においが気になる",
    notYet: "生え際の後退そのものは、洗い方では動かない",
  },
  {
    id: "hair-buy-1",
    area: "hair",
    tier: "buy",
    label: "シャンプーを、頭皮の状態で選び直す",
    what: "髪ではなく頭皮の状態（脂っぽい・乾く・かゆい）で選ぶ。合わなければ替える前提で、1本ずつ試す。",
    costMin: 1500,
    costMax: 4000,
    minutesPerDay: 0,
    weeks: 8,
    fitsWhen: "頭皮の状態に心当たりがある",
    notYet: "薄毛そのものへの対処としては、期待する場所が違う",
  },
  {
    id: "hair-care-1",
    area: "hair",
    tier: "care",
    label: "医療機関で、いまの状態を確認する",
    what: "進行するタイプかどうかは、見た目だけでは判断できません。確認できるのは現在地であって、行くかどうかは別の判断です。行かない選択も同じだけ正当です。",
    costMin: 0,
    costMax: 0,
    minutesPerDay: 0,
    weeks: 1,
    fitsWhen: "人に指摘された／短期間で変化した自覚がある",
    notYet: "気になり始めたばかりで、写真の記録がまだ1枚もない段階",
  },

  // 肌
  {
    id: "skin-self-1",
    area: "skin",
    tier: "self",
    label: "荒れの種類を、炎症・乾燥・摩擦で分ける",
    what: "赤く盛り上がっているのか、粉をふくのか、こすれる場所に出るのか。原因が違えばやることも違うので、まず分ける。",
    costMin: 0,
    costMax: 0,
    minutesPerDay: 2,
    weeks: 2,
    fitsWhen: "何をしても良くならないと感じている",
  },
  {
    id: "skin-buy-1",
    area: "skin",
    tier: "buy",
    label: "洗顔のあとに塗るものを、1つだけ決める",
    what: "種類を増やさず、1本だけ決めて毎日続ける。何本も揃えるより、続くかどうかのほうが先。",
    costMin: 1000,
    costMax: 4000,
    minutesPerDay: 2,
    weeks: 6,
    fitsWhen: "洗いっぱなしになっている",
  },
  {
    id: "skin-buy-2",
    area: "skin",
    tier: "buy",
    label: "日中に使う日焼け止めを1本決める",
    what: "跡を増やさないための手当て。すでにある跡を消すためのものではない。",
    costMin: 1000,
    costMax: 3000,
    minutesPerDay: 1,
    weeks: 12,
    fitsWhen: "跡（色素沈着）が気になっている",
  },
  {
    id: "skin-care-1",
    area: "skin",
    tier: "care",
    label: "医療機関で、種類を判断してもらう",
    what: "炎症が続いている場合、市販品で対処する範囲を超えていることがあります。判断できるのは医師で、こちらではありません。",
    costMin: 0,
    costMax: 0,
    minutesPerDay: 0,
    weeks: 1,
    fitsWhen: "痛みがある／同じ場所に繰り返し出る／3ヶ月以上続いている",
    notYet: "セルフケアを一度も揃えていない段階",
  },

  // 顔まわり
  {
    id: "face-self-1",
    area: "face",
    tier: "self",
    label: "寝る時刻を1つ決める",
    what: "起きる時刻より、寝る時刻のほうが動かしやすい。顔まわりは睡眠の影響がいちばん早く出る場所。",
    costMin: 0,
    costMax: 0,
    minutesPerDay: 0,
    weeks: 3,
    fitsWhen: "「疲れて見える」と言われることがある",
  },
  {
    id: "face-self-2",
    area: "face",
    tier: "self",
    label: "朝と夜で、同じ条件の写真を2週間撮る",
    what: "むくみが時間帯によるものか、常時のものかを切り分ける。切り分かるまでは、手をかける場所が決まらない。",
    costMin: 0,
    costMax: 0,
    minutesPerDay: 1,
    weeks: 2,
    fitsWhen: "むくみが気になる",
  },
  {
    id: "face-pro-1",
    area: "face",
    tier: "pro",
    label: "撮られ方を、人に教わる",
    what: "光の向きと顎の角度で、写真の印象は大きく変わる。顔そのものを変えるより先に触れる部分。",
    costMin: 8000,
    costMax: 25000,
    minutesPerDay: 0,
    weeks: 1,
    fitsWhen: "写真に写った自分に違和感がある",
    notYet: "睡眠とむくみの切り分けが済んでいない",
  },

  // ヒゲ・体毛
  {
    id: "bh-self-1",
    area: "body-hair",
    tier: "self",
    label: "剃る前と後の手順を1つずつ足す",
    what: "負担の多くは、剃る回数ではなく剃り方から来る。温める・滑らせる・冷やす、のどれか1つを足す。",
    costMin: 0,
    costMax: 0,
    minutesPerDay: 3,
    weeks: 3,
    fitsWhen: "カミソリ負けや埋没毛がある",
  },
  {
    id: "bh-self-2",
    area: "body-hair",
    tier: "self",
    label: "整える／減らす／そのまま、のどれで行くか決める",
    what: "目的を決めないと、道具も頻度も選べない。「そのまま」も同じだけ正当な選択で、減らすことが上位互換ではない。",
    costMin: 0,
    costMax: 0,
    minutesPerDay: 0,
    weeks: 1,
    fitsWhen: "何をすればいいか決まっていない",
  },
  {
    id: "bh-buy-1",
    area: "body-hair",
    tier: "buy",
    label: "道具を、肌の状態に合わせて替える",
    what: "刃の枚数ではなく、肌が荒れるかどうかで選ぶ。合わない道具のまま頻度を上げると負担が増える。",
    costMin: 3000,
    costMax: 15000,
    minutesPerDay: 0,
    weeks: 4,
    fitsWhen: "毎日剃るのが負担になっている",
  },
  {
    id: "bh-pro-1",
    area: "body-hair",
    tier: "pro",
    label: "非医療のサロンで、範囲を決めて試す",
    what: "全身ではなく、いちばん負担の大きい1か所から。回数と総額を先に確認してから決める。",
    costMin: 5000,
    costMax: 20000,
    minutesPerDay: 0,
    weeks: 12,
    fitsWhen: "「減らす」と決めていて、続ける前提がある",
    notYet: "整える／減らす／そのまま、をまだ決めていない",
  },

  // 睡眠・習慣
  {
    id: "mind-self-1",
    area: "mind",
    tier: "self",
    label: "平日と休日の起床時刻の差を、2時間以内にする",
    what: "睡眠時間の合計より、時刻のばらつきのほうが動かしやすく、体感も早い。",
    costMin: 0,
    costMax: 0,
    minutesPerDay: 0,
    weeks: 3,
    fitsWhen: "寝る時刻・起きる時刻がばらばら",
  },
  {
    id: "mind-self-2",
    area: "mind",
    tier: "self",
    label: "週2回、20分歩く時間を予定に入れる",
    what: "運動としてではなく、予定として入れる。カレンダーに入っていないものは続かない。",
    costMin: 0,
    costMax: 0,
    minutesPerDay: 20,
    weeks: 8,
    fitsWhen: "体を動かす習慣がほとんどない",
  },
  {
    id: "mind-pro-1",
    area: "mind",
    tier: "pro",
    label: "ジムを、通える距離で選ぶ",
    what: "設備ではなく、家か職場から何分かで選ぶ。続かない理由のほとんどは距離。",
    costMin: 3000,
    costMax: 12000,
    minutesPerDay: 30,
    weeks: 12,
    fitsWhen: "自分だけでは続かなかった経験がある",
    notYet: "睡眠の時刻がまだ整っていない",
  },
];

// ── 絞り込み ──────────────────────────────────

// 並べる軸を、あとから崩せないようにしておく。
//
// 送客を始めると、ここに「キャンペーン中」「お得」を足したくなる圧が必ずかかる。
// 1つ入った時点で、この一覧は比較表ではなく広告になる。
// 読み込んだ時点で落ちるようにして、判断を残さない。
//
// 軸そのものも欠けさせない。費用・手間・期間・向いている人の4つが
// 揃っていない選択肢は、比べるための行になっていない。
for (const o of OPTIONS) {
  assertNoPromoWords([o.label, o.what, o.fitsWhen, o.notYet ?? ""], `選択肢 ${o.id}`);
  if (!o.fitsWhen.trim()) {
    throw new Error(`選択肢 ${o.id}: 「向いている人」が空です。書けないなら載せません`);
  }
  if (o.tier !== "care" && o.weeks <= 0) {
    throw new Error(`選択肢 ${o.id}: 確かめるまでの期間が入っていません`);
  }
}

/** 診断の回答から取れる条件 */
export type Constraints = {
  /** 1ヶ月に使える金額（円）。undefined なら制限しない */
  budget?: number;
  /** 1日に使える時間（分）。undefined なら制限しない */
  minutes?: number;
  /** いつまでに確かめたいか（週）。undefined なら制限しない */
  weeks?: number;
};

export type Sorted = {
  /** 条件に合ったもの。安い順・手間の少ない順 */
  fits: Option[];
  /** 条件から外れたもの。理由つきで必ず出す */
  out: { option: Option; reason: string }[];
};

/**
 * 条件で選択肢を仕分ける。
 *
 * 落としたものを隠さないのが要点。隠すと「整理した」ではなく
 * 「絞って見せた」になり、比較にならない。
 */
export function sortOptions(area: AreaId, c: Constraints): Sorted {
  const all = OPTIONS.filter((o) => o.area === area);
  const fits: Option[] = [];
  const out: { option: Option; reason: string }[] = [];

  for (const o of all) {
    // 医療は費用も時間も書かないので、条件で落とさない。
    // 「いまはやらなくていい」の判断は本人と医師がするもので、
    // 予算で機械的に外していいものではない。
    if (o.tier === "care") {
      fits.push(o);
      continue;
    }
    if (c.budget !== undefined && o.costMin > c.budget) {
      out.push({ option: o, reason: `月${c.budget.toLocaleString()}円の範囲に収まらない` });
      continue;
    }
    if (c.minutes !== undefined && o.minutesPerDay > c.minutes) {
      out.push({ option: o, reason: `1日${c.minutes}分では続けにくい` });
      continue;
    }
    if (c.weeks !== undefined && o.weeks > c.weeks) {
      out.push({ option: o, reason: `確かめるのに${o.weeks}週かかる（期限に間に合わない）` });
      continue;
    }
    fits.push(o);
  }

  // 買わずにできるものを先に、次に安い順。
  // 高いものを上に置かないことを、実装で担保しておく。
  const rank = (o: Option) => (o.tier === "self" ? 0 : o.tier === "buy" ? 1 : o.tier === "pro" ? 2 : 3);
  fits.sort((a, b) => rank(a) - rank(b) || a.costMin - b.costMin);

  return { fits, out };
}

/** 費用の表示。0円は「0円」と書く（「無料」と書くと安く見せる言い方になる） */
export function costLabel(o: Option): string {
  if (o.tier === "care") return "費用は施設によって幅があります";
  if (o.costMax === 0) return "0円";
  if (o.costMin === o.costMax) return `月 ${o.costMin.toLocaleString()}円`;
  return `月 ${o.costMin.toLocaleString()}〜${o.costMax.toLocaleString()}円`;
}
