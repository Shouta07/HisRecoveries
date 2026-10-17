/* ══════════════════════════════════════════════════
   誰が、誰に聞くのか
   ══════════════════════════════════════════════════

   ── 旅版で、ここが全部変わった ──────────────────
   マチアプ版は「相談する人から見た異性」に聞いていた。
   開いている向き（男性からの相談だけ）を、ここが持っていた。

   旅版は、性別で絞らない。
   聞く相手を決めるのは、性別ではなく「行ったばかりかどうか」。

   ── 在住者には聞かない ──────────────────────────
   いちばん大事な線。

   在住者は、その街に慣れている。
   「あそこは普通に歩けるよ」と言う。それは本当だが、
   初めて一人で来た人が感じる怖さとは、別の話。

   聞きたいのは「初めて行った人が、実際どうだったか」。
   だから、直近90日以内に、一人で行った人だけに聞く。

   90日より前だと、値段も店も変わっている。
   一人で行っていないと、不安の質が違う（連れがいた）。

   ── 同性に聞く、は別の軸 ────────────────────────
   女性の一人旅は、安全への不安が強い。
   「この宿のエリア、夜ひとりで歩けた？」は、
   同性に聞きたい人が多い。

   ただし、性別で相手を縛るのではなく、
   絞り込みの1つとして置く（都市／帰国からの日数／同性）。
   選ばなければ、性別は問わない。 */

export type Gender = "male" | "female";

export const GENDER_LABEL: Record<Gender, string> = {
  male: "男性",
  female: "女性",
};

/* ══════════════════════════════════════════════════
   行ったばかり、の線
   ══════════════════════════════════════════════════ */

/** 帰国から何日以内の人に聞けるか */
export const FRESH_DAYS = 90;

/** その人の旅が、まだ「行ったばかり」か */
export function isFresh(daysSinceReturn: number): boolean {
  return daysSinceReturn >= 0 && daysSinceReturn <= FRESH_DAYS;
}

/**
 * 「行ったばかりの人に確カメる」の◯◯。
 *
 * 画面はここから引く。直書きすると、線を変えた日に
 * そこだけ古いまま残る（マチアプ版で実際に起きた）。
 */
export function advisorWord(): string {
  return "行ったばかりの人";
}

/** 短く言う場所（ボタン・札）で使う */
export function advisorShort(): string {
  return "行った人";
}

/**
 * 誰に聞けるのかを、1文で書いたもの。
 *
 * 「経験者」ではないことを、ここで言い切る。
 * 誰が答えるのか分からないものに、値段は付かない。
 */
export function advisorRule(): string {
  return `同じ都市に、${FRESH_DAYS}日以内に、一人で行った日本人です。在住の方やガイドの方は入っていません。`;
}

/* ══════════════════════════════════════════════════
   絞り込み
   ══════════════════════════════════════════════════ */

export type Filter = {
  /** どの都市へ行った人か */
  city: string;
  /** 帰国から何日以内か。FRESH_DAYS が上限 */
  withinDays: number;
  /** 同性にだけ聞くか。未指定なら問わない */
  sameGenderAs?: Gender;
};

export function filterLabel(f: Filter): string {
  const parts = [f.city, `${f.withinDays}日以内に行った人`];
  if (f.sameGenderAs) parts.push(`${GENDER_LABEL[f.sameGenderAs]}だけ`);
  return parts.join("・");
}

/* ══════════════════════════════════════════════════
   いま、確カメるを開けているか
   ══════════════════════════════════════════════════

   答える人が0人のあいだは、開かない。

   マチアプ版は「月3回、実在する異性に確カメられる」と
   書いたまま、回答者が0人だった。買った人が最初に使おうとして
   止まる形になっていた。同じことを繰り返さない。

   都市ごとに、答える人が MIN_ANSWERERS 人そろって初めて開く。
   そろうまでは、画面に「受付前」と出す。 */

export const MIN_ANSWERERS = 3;

/** 環境変数で、都市ごとに開ける。例: ASK_OPEN_CITIES="バンコク,台北" */
const OPEN = (process.env.ASK_OPEN_CITIES ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export function askOpen(city: string): boolean {
  return OPEN.includes(city);
}

export const anyAskOpen = OPEN.length > 0;

/** まだ開いていないときの、断り。開いたらひとりでに消える */
export function notYetNote(): string | null {
  if (anyAskOpen) return null;
  return `確カメるは、${advisorWord()}がそろった都市から順にはじめます。`;
}

/* ── 公開の前に止めること ───────────────────────── */
{
  /* 言い方が1つであること。
     性別で分岐すると、直書きしている場所と必ず食い違う。 */
  if (!advisorWord().includes("行った")) {
    throw new Error(`聞く相手の呼び方が「${advisorWord()}」になっています（行ったばかりの人です）`);
  }
  /* 在住者・プロを呼び込まないこと。
     そこを混ぜると、聞きたかったものと別のものが返る。 */
  for (const w of ["在住", "ガイド", "添乗", "プロ", "専門家"]) {
    if (advisorWord().includes(w) || advisorShort().includes(w)) {
      throw new Error(`聞く相手に「${w}」が入っています。初めて一人で行った人の実感を聞く場所です`);
    }
  }
  /* 決まりの文に、3つの条件が全部書いてあること。
     1つでも抜けると、誰が答えるのか分からなくなる。 */
  {
    const r = advisorRule();
    for (const [re, what] of [
      [/同じ都市/, "どの都市か"],
      [new RegExp(`${FRESH_DAYS}日`), "いつまでか"],
      [/一人で/, "一人で行ったか"],
    ] as const) {
      if (!re.test(r)) throw new Error(`聞く相手の決まりに、${what}が書かれていません（${r}）`);
    }
    if (!/在住/.test(r)) {
      throw new Error(`聞く相手の決まりに、在住者が入っていないことが書かれていません（${r}）`);
    }
  }

  /* 線が、ゆるみすぎていないこと。
     90日を超えると、値段も店も変わっている。
     短すぎると、答える人が集まらない。 */
  if (FRESH_DAYS > 120) {
    throw new Error(`行ったばかりの線が ${FRESH_DAYS} 日です。値段も店も変わっています`);
  }
  if (FRESH_DAYS < 30) {
    throw new Error(`行ったばかりの線が ${FRESH_DAYS} 日です。答える人が集まりません`);
  }
  if (isFresh(FRESH_DAYS + 1)) throw new Error("線を越えた人が、行ったばかりになっています");
  if (!isFresh(0)) throw new Error("帰国した当日の人が、行ったばかりになっていません");

  /* 答える人がそろう前に、開かないこと。
     ここが1人だと、1人の答えが「行った人の声」として出る。 */
  if (MIN_ANSWERERS < 3) {
    throw new Error(`開ける人数が ${MIN_ANSWERERS} 人です。少ない答えを総意として出せません`);
  }

  /* 開いていないなら、断りが出ること。
     出ていないと、使えないものを売ることになる。 */
  if (!anyAskOpen && !notYetNote()) {
    throw new Error("どの都市も開いていないのに、断りが出ていません");
  }
  if (anyAskOpen && notYetNote()) {
    throw new Error("開いているのに、断りが残っています");
  }
}
