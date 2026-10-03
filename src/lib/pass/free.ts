import { PERIODS, perMonth } from "./periods";
import { HUMAN_PER_MONTH } from "./entitle";

/* ══════════════════════════════════════════════════
   無料でできること
   ══════════════════════════════════════════════════

   ── 「1回だけ無料」をやめた ─────────────────────
   1回で終わる体験では、この製品の良さが出ない。

   良さは「貯まると便利になる」ところにある。
     1人目を入れる → 整理される
     2人目を入れる → 並んで見える
     記録がたまる  → 前回の続きから話せる

   1回だと、1人目の1枚しか見えない。
   それは「AIに相談した」と同じ体験で、ほかと区別が付かない。

   ── 2人・10記録にした理由 ───────────────────────
   2人     1人だと「並ぶ」が体験できない。3人だと有料の理由が消える
   10記録  2〜3日に1回話すとして約1か月ぶん。1人5記録。
           「貯まると便利」が分かるのに、ぎりぎり足りる量

   ── 原価 ────────────────────────────────────────
   記録1件につき、整理のAIを1回呼ぶ（約¥20）。
   10記録で¥200。人判断は無料では使えないので¥0。
   1人あたり¥200の1回きりで、月ごとには増えない。

   有料化が10%でも、有料1人あたりの獲得原価は¥2,000。
   月の粗利が¥1,069〜2,003なので、1〜2か月で戻る。

   ── 止めるときに、消さない ──────────────────────
   上限に当たっても、入れたものは消さない。見られなくもしない。
   止めるのは「これ以上増やすこと」だけ。

   消すと、戻ってきた人が何も無い状態から始めることになる。
   それは退会と同じで、課金の理由にはならない。 */

/** 無料で管理できる相手の数 */
export const FREE_PEOPLE = 2;

/** 無料でためられる記録の数（相手ぜんぶ合わせて） */
export const FREE_RECORDS = 10;

/** 記録1件あたりの、整理のAIの原価（円） */
export const RECORD_COST = 20;

export type Usage = { people: number; records: number };

/** いま、何に当たっているか */
export type Wall = "people" | "records" | "human" | null;

/**
 * 新しく相手を足せるか。
 *
 * 有料なら、いつでも足せる。
 */
export function canAddPerson(u: Usage, paid: boolean): boolean {
  return paid || u.people < FREE_PEOPLE;
}

/** 新しく記録を残せるか */
export function canAddRecord(u: Usage, paid: boolean): boolean {
  return paid || u.records < FREE_RECORDS;
}

/** いま当たっている壁。無ければ null */
export function wallOf(u: Usage, paid: boolean, want: "person" | "record" | "human"): Wall {
  if (paid) return null;
  if (want === "human") return "human";
  if (want === "person" && !canAddPerson(u, paid)) return "people";
  if (want === "record" && !canAddRecord(u, paid)) return "records";
  return null;
}

/* ══════════════════════════════════════════════════
   壁に当たったときに出す言葉
   ══════════════════════════════════════════════════

   ── 押し売りにしない ────────────────────────────
   「今だけ」「残りわずか」は書かない。
   そのとき本人がやろうとしていたことを、そのまま言う。

   3人目を足そうとした人には「3人目も、まとめますか」。
   「上限に達しました」ではない。あちらは機械の言い方。

   ── 閉じられること ──────────────────────────────
   「あとで」を必ず出す。閉じられない画面にしない。 */

export type Upsell = {
  title: string;
  body: string;
  /** 有料にすると、何ができるようになるか */
  unlocks: string[];
  cta: string;
  /** 買わない道。必ずある */
  later: string;
};

/* ══════════════════════════════════════════════════
   並べるのは3つまで
   ══════════════════════════════════════════════════
   ここは5つ並べていた。
     3人目から先も、まとめて管理
     記録の上限なし
     複数人を並べて見る
     実在する異性に確カメる（月1回）   ← 月3回になったのに、ここだけ古い
     電話など、会員だけのお願い

   壁に当たった人が読むのは、いちばん長くて3行。
   5つ並べると、どれも読まれないまま「あとで」が押される。

   読む人が知りたいのは「いま止まったことが、どうなるか」。
   止まったこと（人数・記録）を1つ目に置いて、あと2つだけ。

   ── 回数を、直書きしない ────────────────────────
   月1回のまま残っていた。トップの「月3回」と食い違う。
   買う直前にいちばん大事な数字が違っていると、それだけで止まる。
   entitle.ts の HUMAN_PER_MONTH から作る。下の判定でも見る。 */
const UNLOCKS = [
  `人数も記録も、上限なし（無料は${FREE_PEOPLE}人・${FREE_RECORDS}記録）`,
  "前回の続きから、AIに相談できる",
  `月${HUMAN_PER_MONTH}回、実在する異性に確カメる`,
];

export function upsellFor(wall: Wall): Upsell | null {
  if (!wall) return null;
  if (wall === "people") {
    return {
      title: `${FREE_PEOPLE + 1}人目も、まとめますか。`,
      body: `この続きを、タシカメに覚えてもらう。`,
      unlocks: UNLOCKS,
      cta: "プランを見る",
      later: "あとで",
    };
  }
  if (wall === "records") {
    return {
      title: "記録が、たまってきました。",
      body: `この続きを、タシカメに覚えてもらう。`,
      unlocks: UNLOCKS,
      cta: "この続きを残す",
      later: "あとで",
    };
  }
  return {
    title: "人に確カメるのは、Pass からです。",
    body: "この続きを、タシカメに覚えてもらう。",
    unlocks: UNLOCKS,
    cta: "Pass に入る",
    later: "あとで",
  };
}

/** 無料の人の画面に、小さく出す今の使用量 */
export function usageLine(u: Usage): string {
  return `無料プラン　${Math.min(u.people, FREE_PEOPLE)} / ${FREE_PEOPLE}人　${Math.min(u.records, FREE_RECORDS)} / ${FREE_RECORDS}記録`;
}

/* ── 公開の前に止めること ───────────────────────── */
{
  /* 1人では、並ぶところが体験できない。
     3人以上にすると、有料にする理由が消える。 */
  if (FREE_PEOPLE < 2) {
    throw new Error(`無料が${FREE_PEOPLE}人です。1人だと、並ぶところが体験できません`);
  }
  if (FREE_PEOPLE > 2) {
    throw new Error(`無料が${FREE_PEOPLE}人です。3人以上だと、有料にする理由が消えます`);
  }
  // 記録は、貯まると便利だと分かる量が要る。
  if (FREE_RECORDS < FREE_PEOPLE * 3) {
    throw new Error(
      `無料の記録が${FREE_RECORDS}件です（1人あたり3件は要ります）`,
    );
  }

  /* 無料の原価が、いちばん安いプランの月の粗利を超えないこと。
     超えると、1人も有料にならなかった月に持ち出しになる。 */
  {
    const freeCost = FREE_RECORDS * RECORD_COST;
    const cheapest = Math.min(...PERIODS.map((p) => perMonth(p)));
    const gross = cheapest - (cheapest * 0.066 + 10 + 750 + 20);
    if (freeCost > gross) {
      throw new Error(
        `無料の原価 ¥${freeCost} が、いちばん安いプランの月の粗利 ¥${Math.round(gross)} を超えています`,
      );
    }
  }

  /* 上限に当たったとき、入れたものを消さないこと。
     止めるのは「増やすこと」だけ。
     消すと、戻ってきた人が何も無い状態から始めることになる。 */
  {
    const full: Usage = { people: FREE_PEOPLE, records: FREE_RECORDS };
    if (canAddPerson(full, false)) throw new Error("無料で、上限を超えて相手を足せます");
    if (canAddRecord(full, false)) throw new Error("無料で、上限を超えて記録を足せます");
    // 有料なら、どちらも足せること。
    if (!canAddPerson(full, true) || !canAddRecord(full, true)) {
      throw new Error("有料なのに、上限に当たっています");
    }
  }

  /* 人に確カメるのは、無料では使えないこと。
     ここを開けると、原価の読めない無料になる。 */
  if (wallOf({ people: 0, records: 0 }, false, "human") !== "human") {
    throw new Error("無料で、人に確カメられます");
  }
  if (wallOf({ people: 0, records: 0 }, true, "human") !== null) {
    throw new Error("有料なのに、人に確カメられません");
  }

  /* 出す言葉が、押し売りになっていないこと。
     「上限に達しました」のような機械の言い方もしない。 */
  for (const w of ["people", "records", "human"] as const) {
    const u = upsellFor(w);
    if (!u) throw new Error(`${w} の壁に、出す言葉がありません`);
    for (const bad of ["今だけ", "残りわずか", "お得", "キャンペーン", "上限に達しました"]) {
      const flat = u.title + u.body;
      if (flat.includes(bad)) {
        throw new Error(`${w} の言葉に「${bad}」が入っています`);
      }
    }
    // 閉じられること。買わない道が必ずあること。
    if (!u.later) throw new Error(`${w} の画面に、あとでにする道がありません`);
    // 何ができるようになるかが、書いてあること。
    if (u.unlocks.length === 0) throw new Error(`${w} に、何ができるようになるかがありません`);
    /* 並べるのは3つまで。
       壁に当たった人が読むのは、いちばん長くて3行。
       5つ並べると、どれも読まれないまま「あとで」が押される。 */
    if (u.unlocks.length > 3) {
      throw new Error(`${w} に、できるようになることが ${u.unlocks.length} 個あります（3つまで）`);
    }
    /* 主コピーが、全部の壁で同じであること。
       壁ごとに言い方が変わると、買うものが違うように読める。 */
    if (!u.body.includes("この続きを、タシカメに覚えてもらう")) {
      throw new Error(`${w} の主コピーが、ほかの壁と違います（${u.body}）`);
    }
  }

  /* 確カメるの回数が、いまの設定と合っていること。
     ここは「月1回」のまま残っていて、トップの「月3回」と
     食い違っていた。買う直前にいちばん大事な数字が違うと、
     それだけで止まる。 */
  {
    const line = UNLOCKS.find((t) => t.includes("確カメ"));
    if (!line) throw new Error("できるようになることに、確カメるが入っていません");
    if (!line.includes(`月${HUMAN_PER_MONTH}回`)) {
      throw new Error(`壁の言葉「${line}」が、月${HUMAN_PER_MONTH}回になっていません`);
    }
  }

  // 壁が無いときは、何も出さないこと。
  if (upsellFor(null) !== null) {
    throw new Error("壁に当たっていないのに、課金の画面が出ます");
  }
  if (wallOf({ people: 0, records: 0 }, false, "person") !== null) {
    throw new Error("1人も入れていないのに、壁に当たっています");
  }

  // 使用量の表示に、いまの数と上限の両方が出ること。
  {
    const line = usageLine({ people: 1, records: 4 });
    if (!line.includes(`1 / ${FREE_PEOPLE}`) || !line.includes(`4 / ${FREE_RECORDS}`)) {
      throw new Error(`使用量の表示が足りません（${line}）`);
    }
  }
  // 上限を超えて数えないこと（3 / 2人 と出ない）。
  {
    const line = usageLine({ people: 99, records: 99 });
    if (!line.includes(`${FREE_PEOPLE} / ${FREE_PEOPLE}`)) {
      throw new Error(`使用量が上限を超えて出ています（${line}）`);
    }
  }
}
