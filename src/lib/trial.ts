import { plan as getPlan, ENTRY_PLAN } from "./ask/plans";
import { ASKER_OPEN, GENDER_LABEL, advisorWord, opposite, type Gender } from "./who";
import { assertNotCheap, assertNotScary } from "./voice";

/* ══════════════════════════════════════════════════
   体験の予約
   ══════════════════════════════════════════════════

   ── なぜ要るか ──────────────────────────────────
   いま、相談する人の道はここで終わっている。

     トップ → /ask → 迷っていることを書く → 決済 → 止まる

   決済の口が開くまで、/ask は「いま受け付けられません」を出す。
   出しているのは正しい。書いたあとに止まるより、先に言うほうがいい。

   けれど、その画面から渡しているのは通話の順番待ちだけだった。
   通話は受付前の商品で、体制が整うまで開かない。
   つまり「来た人に渡せるもの」が1つも無い。

   文章の相談は、手でも届けられる。
   回答者は実在していて、読んでもらうこと自体は決済が要らない。
   だから、決済が開くまでのあいだは、ここで受ける。

   ── 中身を、売っている商品からそのまま引く ──────
   体験のために別の中身を考えない。
   いちばん軽い入口（ENTRY_PLAN）と同じものを、同じだけ返す。

   そうしておくと、
     体験した人が次に買うものが、体験と同じ形になる
     商品を組み直した日に、体験の説明だけ古くならない

   手で「女性1人が読みます」と書くと、answers を変えた日にずれる。

   ── 安さを売り文句にしない ──────────────────────
   お金がかからないのは事実なので書く。
   ただし見出しには置かない。置くと、安いから使う人が来る。
   見出しに置くのは、何が返ってくるかのほう。

   ── 枠の数を、画面に書かない ────────────────────
   手で回すので、1日に受けられる数には限りがある。
   限りがあることは本当だが、残り何枠かは画面に出さない。

   出すと、数を数えていることになる。
   数えるには保存先が要る。保存先が無い状態で数を書くと、
   それは作り物の残り枠になる。

   受けられる数は API 側で止める。画面では約束しない。 */

/** 体験の中身は、いちばん軽い入口商品と同じ */
const base = getPlan(ENTRY_PLAN);

/** 何人が読むか。plans.ts から引く */
export const TRIAL_ANSWERS = base.answers;

/** 何が返ってくるか。plans.ts から引く */
export const TRIAL_INCLUDES = base.includes;

/** 体験のあとに買えるもの（体験と同じ形の商品） */
export const TRIAL_NEXT = base;

/**
 * こちらから返事をするまでの上限（時間）。
 *
 * 手で回している。守れる数字しか書かない。
 * 回せなくなったら、ここを増やす（画面の文も一緒に変わる）。
 */
export const TRIAL_REPLY_HOURS = 72;

/**
 * 1日に受けられる件数。
 *
 * 手で回すので、実際に回せる数。
 * 画面には出さない。超えた分は順番待ちとして受ける。
 */
export const TRIAL_PER_DAY = 5;

/** 書いてもらう「確かめたいこと」の上限 */
export const TOPIC_MAX = 300;

/**
 * 体験を受け付けているか。
 *
 * 既定は開いている。閉じるときだけ環境変数を入れる。
 * 「開くために設定が要る」形にすると、開き忘れたまま広告が走る。
 */
export const trialOpen = process.env.TRIAL_OPEN !== "0";

/* ══════════════════════════════════════════════════
   どちらの向きを、体験として受けられるか
   ══════════════════════════════════════════════════

   回答者が揃っている向きだけが体験になる（who.ts）。
   揃っていない向きの人は、断るのではなく順番待ちで受ける。

   断ると、その人が何人来たのかが分からない。
   分からないままだと、回答者を集める理由が作れない。 */

export type Intake = "trial" | "waitlist";

/** この性別の人を、体験として受けられるか */
export function intakeFor(g: Gender): Intake {
  return ASKER_OPEN[g] ? "trial" : "waitlist";
}

/** 順番待ちになる人に出す言葉。何を待っているのかを書く */
export function waitlistLine(g: Gender): string {
  return `${GENDER_LABEL[opposite(g)]}の回答者が揃い次第、こちらからご連絡します。`;
}

/* ══════════════════════════════════════════════════
   画面に出す言葉
   ══════════════════════════════════════════════════ */

export const TRIAL_H1 = "1件だけ、先に確カメる。";

export const TRIAL_LEAD =
  `送ろうとしている文や、迷っている場面を1つ送ってください。` +
  `実在する${advisorWord()}${TRIAL_ANSWERS}人が読んで、どう受け取ったかをそのまま返します。`;

/** お金のことは、見出しではなくここで書く */
export const TRIAL_MONEY = "体験にお金はかかりません。お支払いの手続きもありません。";

/** いつ返ってくるか */
export const TRIAL_WHEN =
  `${TRIAL_REPLY_HOURS}時間以内に、いただいたメールアドレスへご連絡します。`;

/** 受け付けたあとに出す言葉 */
export const TRIAL_DONE =
  `お申し込みを受け付けました。${TRIAL_WHEN}`;

/** 保存先が無いときに、書いたものを捨てないための案内 */
export const TRIAL_FALLBACK =
  "いまこの画面からお預かりできません。下のボタンからメールでお送りいただければ、同じようにお返しします。";

/* ── 公開の前に止めること ───────────────────────── */
{
  // 安さで売らない／怖がらせて売らない。
  // ページに直接書いた文は check-copy が見るが、ここは lib なので自分で見る。
  for (const [k, v] of Object.entries({
    TRIAL_H1, TRIAL_LEAD, TRIAL_MONEY, TRIAL_WHEN, TRIAL_DONE, TRIAL_FALLBACK,
  })) {
    assertNotCheap(v, `trial.${k}`);
    assertNotScary(v, `trial.${k}`);
  }

  /* 見出しで、お金のことを言わないこと。
     言うと、安いから来る人が来る。見出しは何が返るかに使う。 */
  if (/無料|お金|円|¥|タダ/.test(TRIAL_H1)) {
    throw new Error(`体験の見出しが金額の話になっています（${TRIAL_H1}）`);
  }

  /* お金がかからないことは、どこかに必ず書くこと。
     書かないと、押したあとに課金されると思われる。 */
  if (!/お金はかかりません/.test(TRIAL_MONEY)) {
    throw new Error("体験にお金がかからないことが、書かれていません");
  }

  /* 残り枠を画面に書かないこと。
     数えるには保存先が要る。無い状態で書くと作り物になる。 */
  for (const v of [TRIAL_H1, TRIAL_LEAD, TRIAL_MONEY, TRIAL_WHEN, TRIAL_DONE]) {
    if (/残り\s*\d|あと\s*\d\s*(枠|名|人)|\d+\s*枠/.test(v)) {
      throw new Error(`体験の文に、残り枠が書かれています（${v}）`);
    }
  }

  /* 人数を直書きしないこと。plans.ts から引いていること。
     直書きすると、商品を組み直した日に体験の説明だけ古くなる。

     最初 includes(String(TRIAL_ANSWERS)) で見ていたが、
     説明の頭に「場面を1つ送ってください」と書いてあるので、
     人数を 3 に直書きしても "1" が別の場所で見つかって通った。
     「◯人」の形で、その数だけが出ていることを見る。 */
  {
    const nums = [...TRIAL_LEAD.matchAll(/(\d+)\s*人/g)].map((m) => Number(m[1]));
    if (nums.length === 0) {
      throw new Error("体験の説明に、何人が読むのかが書かれていません");
    }
    for (const n of nums) {
      if (n !== TRIAL_ANSWERS) {
        throw new Error(
          `体験の説明が${n}人になっていますが、入口商品は${TRIAL_ANSWERS}人です`,
        );
      }
    }
  }
  if (TRIAL_ANSWERS !== base.answers) {
    throw new Error("体験の人数が、入口商品と違います");
  }

  /* 体験の中身が、空でないこと。
     空のまま出すと「何が返るか分からないもの」を配ることになる。 */
  if (TRIAL_INCLUDES.length === 0) {
    throw new Error("体験で返すものが、1つも書かれていません");
  }

  /* 返事の期限が、守れる長さであること。
     手で回しているので、短すぎる約束をしない。 */
  if (TRIAL_REPLY_HOURS < 24) {
    throw new Error(`返事の期限が${TRIAL_REPLY_HOURS}時間です（手で回すには短すぎます）`);
  }
  // 期限は必ず画面に出ること。出ないと、待てばいいのか分からない。
  if (!TRIAL_WHEN.includes(String(TRIAL_REPLY_HOURS))) {
    throw new Error("返事の期限が、画面の文に入っていません");
  }

  /* 開いている向きは、体験として受けられること。
     ここが waitlist になると、売っている相手を体験から外すことになる。 */
  for (const g of ["male", "female"] as const) {
    const want = ASKER_OPEN[g] ? "trial" : "waitlist";
    if (intakeFor(g) !== want) {
      throw new Error(`${GENDER_LABEL[g]}の受け方が、開いている向き（who.ts）と食い違っています`);
    }
  }

  /* 順番待ちの言葉に、何を待っているのかが書いてあること。
     「お待ちください」だけだと、何がいつ変わるのか分からない。 */
  for (const g of ["male", "female"] as const) {
    const line = waitlistLine(g);
    if (!/回答者が揃い次第/.test(line)) {
      throw new Error(`${GENDER_LABEL[g]}の順番待ちの文に、何を待つのかが書かれていません`);
    }
    // 待つ相手は異性であること（同性に聞く形にしない）。
    if (!line.includes(GENDER_LABEL[opposite(g)])) {
      throw new Error(`${GENDER_LABEL[g]}の順番待ちの文で、待つ相手が異性になっていません`);
    }
  }

  /* 書いてもらう量が、長すぎないこと。
     体験の入口で1000字書かせると、書けないまま離れる。 */
  if (TOPIC_MAX > 400) {
    throw new Error(`確かめたいことの上限が${TOPIC_MAX}字です（体験の入口には長すぎます）`);
  }

  /* 保存できないときの案内に、別の送り方が書いてあること。
     「お預かりできません」で終わると、書いたものがそこで消える。 */
  if (!/メール/.test(TRIAL_FALLBACK)) {
    throw new Error("保存できないときの案内に、別の送り方が書かれていません");
  }
}
