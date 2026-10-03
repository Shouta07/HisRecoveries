import { advisorWord } from "../who";
/* ══════════════════════════════════════════════════
   月額に、何がどれだけ含まれるか
   ══════════════════════════════════════════════════

   ── 青天井にしない ──────────────────────────────
   月額 ¥1,980 に「恋亀と話し放題」と「女性3人に確カメる」を
   両方入れると、使われるほど赤字になる。

   内訳（決済手数料3.6%・返金引当3%・雑費を引いたあと）

     全員が毎月「確カメる」を使う
       人件費 ¥750 → 粗利50%を守ると、音声に使えるのは月 ¥100
     半分が使う
       人件費 ¥375 → 音声に使えるのは月 ¥475

   音声は時間で金がかかる。上限が無いと、
   いちばん使う人がいちばん損をさせる形になる。

   ── 使い放題とは書かない ────────────────────────
   書かなければ守れる。書いてから絞ると、嘘になる。
   画面には「月◯分まで」と出す。

   ── 足りなくなったら、止めずに知らせる ────────────
   上限に当たった人を、途中で切らない。
   「今月はここまで」と伝えて、来月から戻る。
   会話の途中で切れるのがいちばん悪い。 */

/* ══════════════════════════════════════════════════
   値段
   ══════════════════════════════════════════════════

   ── ¥2,980 は、売り方ではなく採算が決めた ──────────
   ¥1,980 のままだと、恋亀との会話を入れた時点で
   限界利益率が 34.8% になる（下の確認が止める）。
   50% を守れる最低の価格が ¥2,980。

   ── β は「安くした」のではなく「まだ少ない」 ───────
   恋亀との会話は REALTIME_API_KEY が入るまで公開できない
   （src/lib/koi/gate.ts）。だから β に音声は含まれない。
   含まれないぶん安い、という順番。

   **「通常¥2,980を今だけ¥1,980」とは書かない。**
   一度も売っていない価格を通常価格として並べるのは、
   景品表示法の有利誤認（二重価格表示）に当たる。
   書くなら「先着100人は¥1,980。音声が入ったら¥2,980」。
   過去ではなく、これからの値段を言う。 */

/** 月額。Stripe の Price ID は環境変数で持つ（コードに書かない） */
export const PASS_YEN = 2980;

/** β（先着）の月額。音声を含まないぶん安い */
export const BETA_YEN = 1980;

/** β の枠。ここに達したら、新しい人は PASS_YEN になる */
export const BETA_SEATS = 100;

/**
 * β で入った人が、音声が入ったあとどうなるか。
 *
 * ここは金額がそのまま乗るので、決めたら画面にも必ず出す。
 * 「あとで決める」はできない。買う前に書いていないと、
 * 値上げした時点で「聞いてない」になる。
 *
 *   "keep"  …… 100人はずっと ¥1,980
 *               音声ありで利益率 34.8%。100人で月 ¥69,000
 *   "raise" …… 1か月前に知らせて ¥2,980 へ
 *               100人で月 ¥162,400。差は月 ¥93,400
 */
export type BetaAfterVoice = "keep" | "raise";
export const BETA_AFTER_VOICE: BetaAfterVoice = "raise";

/** 据え置くなら、β も音声ありの採算を通さないといけない */
const BETA_NEEDS_VOICE_MARGIN: Record<BetaAfterVoice, boolean> = {
  keep: true,
  raise: false,
};

/** 月に、女性3人へ確カメられる回数 */
export const HUMAN_PER_MONTH = 1;
/** 1回に何人へ届くか */
export const PANEL_SIZE = 3;
/**
 * 回答者1人あたりの報酬。
 *
 * ここが ¥250 で入っていた。実際に払っているのは ¥500 で
 * （src/lib/ask/plans.ts。「答える人の取り分は ¥500 のまま」）、
 * 下の採算の確認が、半額の原価で通っていた。
 *
 * 直した結果、¥1,980 に音声を入れると 34.8% になって止まる。
 * 止まるのが正しい。それがこの確認の役目。
 */
export const PANEL_REWARD = 500;

/**
 * 月に、恋亀と話せる分数。
 *
 * 2〜5分の会話を想定しているので、50分なら月10〜25回。
 * 「ちょっと話す」を妨げない range に置いてある。
 *
 * 増やすときは、下の確認が採算を見る。
 */
export const VOICE_MINUTES_PER_MONTH = 50;

/**
 * 音声の、1分あたりの見込み原価。
 *
 * ［要確認］この環境から料金表を見られないので、見込みで置いている。
 * 実際の値が分かったら、ここを直す。直すと下の確認が効く。
 */
export const VOICE_COST_PER_MIN = 8;

/** 「確カメる」を実際に使う人の割合の見込み。採算を見るときだけ使う */
const HUMAN_USE_RATE = 0.5;

/** 守りたい限界利益率 */
export const PASS_MARGIN_FLOOR = 0.5;

export type Used = {
  /** 今月、恋亀と話した分数 */
  voiceMinutes: number;
  /** 今月、女性3人へ確カメた回数 */
  humanRequests: number;
};

export type Allowance = {
  voiceLeft: number;
  humanLeft: number;
  voiceOver: boolean;
  humanOver: boolean;
};

export function allowance(used: Used): Allowance {
  const voiceLeft = Math.max(0, VOICE_MINUTES_PER_MONTH - used.voiceMinutes);
  const humanLeft = Math.max(0, HUMAN_PER_MONTH - used.humanRequests);
  return {
    voiceLeft,
    humanLeft,
    voiceOver: voiceLeft === 0,
    humanOver: humanLeft === 0,
  };
}

/** 上限に当たった人に出す言葉。止めるのではなく、知らせる */
export const VOICE_OVER =
  "今月は、ここまでにしとこか。来月また話そ。";
export const HUMAN_OVER =
  "今月のぶんは、もう使ってるみたい。来月からまた聞けるで。";

/** 月額に含まれるもの。画面に出す言葉 */
export const INCLUDED: string[] = [
  "恋亀と話す（月50分まで）",
  "前回の続きから話せる",
  "相手ごとの記録（EP）",
  "次にやることが1つ残る",
  `月${HUMAN_PER_MONTH}回、実在する${advisorWord()}${PANEL_SIZE}人に確カメる`,
];

/**
 * その値段で、限界利益率が足りているか。
 *
 * withVoice は、恋亀との会話を含むかどうか。β は含まない
 * （REALTIME_API_KEY が入るまで公開できない。src/lib/koi/gate.ts）。
 */
export function passMargin(yen: number, withVoice: boolean) {
  const fee = Math.round(yen * 0.036);
  const refund = Math.round(yen * 0.03);
  const misc = 10;
  const human = PANEL_SIZE * PANEL_REWARD * HUMAN_USE_RATE * HUMAN_PER_MONTH;
  const voice = withVoice ? VOICE_MINUTES_PER_MONTH * VOICE_COST_PER_MIN : 0;
  const variable = fee + refund + misc + human + voice;
  return { variable, margin: (yen - variable) / yen, human, voice };
}

/* ── 公開の前に止めること ───────────────────────── */
{
  /* 採算が合っていること。
     上限を上げるのは簡単だが、上げた瞬間に赤字になることがある。
     上げたらここで止まる。

     β も同じ確認を通す。安いほうを素通しにすると、
     「先着だから」で赤字の値段を出せてしまう。 */
  const checks: [string, number, boolean][] = [
    ["月額", PASS_YEN, true],
    ["β（音声なし）", BETA_YEN, false],
  ];
  // 据え置くなら、β は音声ありでも採算が合っていなければならない
  if (BETA_NEEDS_VOICE_MARGIN[BETA_AFTER_VOICE]) {
    checks.push(["β（音声が入ったあと・据え置き）", BETA_YEN, true]);
  }

  for (const [name, yen, withVoice] of checks) {
    const { margin, variable, human, voice } = passMargin(yen, withVoice);
    if (margin < PASS_MARGIN_FLOOR) {
      throw new Error(
        `${name} ¥${yen} の限界利益率が ${(margin * 100).toFixed(1)}% です` +
          `（${Math.round(PASS_MARGIN_FLOOR * 100)}% 以上）。変動費 ¥${variable}` +
          `（確カメる ¥${Math.round(human)} / 音声 ¥${voice}）。` +
          `値段か、音声の上限 ${VOICE_MINUTES_PER_MONTH}分か、` +
          `確カメるの回数 月${HUMAN_PER_MONTH}回を見直してください`,
      );
    }
  }

  // β のほうが高いのは、ただの書き間違い
  if (BETA_YEN >= PASS_YEN) {
    throw new Error(`β ¥${BETA_YEN} が、通常の月額 ¥${PASS_YEN} を下回っていません`);
  }

  // 使い放題と書かないこと。書かなければ守れる。
  for (const t of [...INCLUDED, VOICE_OVER, HUMAN_OVER]) {
    if (/使い放題|無制限|制限なし|いくらでも/.test(t)) {
      throw new Error(`月額の説明「${t}」が、使い放題になっています`);
    }
  }

  // 上限があることを、含まれるものの中に書くこと。
  // 書いていないと、当たったときに「聞いてない」になる。
  if (!INCLUDED.some((t) => t.includes(`${VOICE_MINUTES_PER_MONTH}分`))) {
    throw new Error("月額の説明に、話せる分数が書かれていません");
  }
  if (!INCLUDED.some((t) => t.includes(`月${HUMAN_PER_MONTH}回`))) {
    throw new Error("月額の説明に、確カメる回数が書かれていません");
  }

  // 上限に当たったときの言葉が、切る言い方になっていないこと。
  for (const t of [VOICE_OVER, HUMAN_OVER]) {
    if (/できません|停止|エラー|利用不可/.test(t)) {
      throw new Error(`上限の言葉「${t}」が、切る言い方になっています`);
    }
    // 来月戻ることを伝えること。終わったように見せない。
    if (!/来月/.test(t)) {
      throw new Error(`上限の言葉「${t}」に、来月戻ることが書かれていません`);
    }
  }

  // 数えかたが合っていること。
  {
    const a = allowance({ voiceMinutes: 10, humanRequests: 0 });
    if (a.voiceLeft !== VOICE_MINUTES_PER_MONTH - 10) throw new Error("残りの分数が合いません");
    if (a.humanLeft !== HUMAN_PER_MONTH) throw new Error("残りの回数が合いません");
    if (a.voiceOver || a.humanOver) throw new Error("まだ残っているのに、上限に当たっています");
  }
  {
    const a = allowance({ voiceMinutes: 999, humanRequests: 9 });
    if (a.voiceLeft !== 0 || a.humanLeft !== 0) throw new Error("残りが負になっています");
    if (!a.voiceOver || !a.humanOver) throw new Error("使い切ったのに、上限に当たっていません");
  }

  // 「確カメる」が月1回であること。
  // 増やすと人件費がそのぶん増えるので、採算の確認に必ず当てる。
  if (HUMAN_PER_MONTH < 1) throw new Error("確カメるが、月額に含まれていません");

  // パネルの人数が、売っているものと揃っていること。
  if (PANEL_SIZE !== 3) {
    throw new Error(`確カメる人数が ${PANEL_SIZE} 人です（3人）`);
  }
}
