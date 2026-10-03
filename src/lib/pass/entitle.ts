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

/** 月額。Stripe の Price ID は環境変数で持つ（コードに書かない） */
export const PASS_YEN = 1980;

/** 月に、女性3人へ確カメられる回数 */
export const HUMAN_PER_MONTH = 1;
/** 1回に何人へ届くか */
export const PANEL_SIZE = 3;
/** 回答者1人あたりの報酬 */
export const PANEL_REWARD = 250;

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
 * 音声の、1分あたりの見込み原価（円）。
 *
 * ══════════════════════════════════════════════════
 * 調べた（2026-10）。［要確認］は外した
 * ══════════════════════════════════════════════════
 * OpenAI Realtime API の speech-to-speech。
 * 行き帰りを混ぜた1分あたりで、
 *
 *   gpt-realtime-mini   $0.02〜0.05／分
 *   gpt-realtime（フル） $0.05〜0.15／分
 *
 * $1=¥150 として、mini が ¥3〜8、フルが ¥8〜22。
 * 仮に置いていた ¥8 は、mini の高いほうとほぼ同じだった。
 * mini を使う前提で、¥8 のまま据え置く。
 *
 * ── フルに変えるなら、分数も一緒に変えること ──────
 * 下の確認が、限界利益率50%を守っている。
 * 音声に使えるのは月 ¥475 までなので、
 *
 *   mini（¥8/分）  月50分 → 限界利益率 53.8%  通る
 *   フル（¥22/分） 月50分 → 限界利益率 17.2%  止まる
 *   フル（¥22/分） 月21分 → ちょうど50%
 *
 * ［要確認］為替は $1=¥150 の概算。
 * 実際の請求が出たら、1か月ぶんを見てここを直す。
 * トークン単価なので、話し方（相づちの多さ）でも動く。
 */
export const VOICE_COST_PER_MIN = 8;

/**
 * どの音声モデルを前提に、上の原価を置いているか。
 *
 * ここと REALTIME_MODEL（lib/koi/session.ts）がずれると、
 * 採算の計算だけ mini のまま、実際はフルを呼ぶ、が起きる。
 */
export const VOICE_MODEL_ASSUMED = "gpt-realtime-mini";

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

/* ── 公開の前に止めること ───────────────────────── */
{
  /* 採算が合っていること。
     上限を上げるのは簡単だが、上げた瞬間に赤字になることがある。
     上げたらここで止まる。 */
  const fee = Math.round(PASS_YEN * 0.036);
  const refund = Math.round(PASS_YEN * 0.03);
  const misc = 10;
  const human = PANEL_SIZE * PANEL_REWARD * HUMAN_USE_RATE * HUMAN_PER_MONTH;
  const voice = VOICE_MINUTES_PER_MONTH * VOICE_COST_PER_MIN;
  const variable = fee + refund + misc + human + voice;
  const margin = (PASS_YEN - variable) / PASS_YEN;

  if (margin < PASS_MARGIN_FLOOR) {
    throw new Error(
      `月額の限界利益率が ${(margin * 100).toFixed(1)}% です（${Math.round(
        PASS_MARGIN_FLOOR * 100,
      )}% 以上）。` +
        `音声の上限 ${VOICE_MINUTES_PER_MONTH}分（¥${voice}）か、` +
        `確カメるの回数（¥${Math.round(human)}）を見直してください`,
    );
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
