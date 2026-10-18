/* ══════════════════════════════════════════════════
   売っているもの。1か所で持つ
   ══════════════════════════════════════════════════

   ── なぜここに集めるか ──────────────────────────
   料金・期間・返信の条件は、トップ・料金・FAQ・規約・
   英語版・中国語版、と6か所以上に出る。

   書き写すと、どこか1つが必ず古くなる。
   前の版で「月3回」と「月1回」が食い違っていたのが、まさにそれ。

   ここだけが持ち、画面は引く。

   ── 約束していないことを、約束しない ────────────
   「相談し放題」は本当だが、無条件ではない。
   期間があり、返信は原則24時間以内で、緊急対応は含まない。

   その3つは、必ず「し放題」と一緒に出す（判定で見る）。
   小さい注意書きに隠すと、買った人が最初に困る。 */

export const PRICE_YEN = 3980;

/** 出発の何日前から使えるか */
export const WINDOW_BEFORE_DAYS = 7;

/** 旅行期間の上限 */
export const MAX_TRIP_DAYS = 7;

/** 返信の目安。時間 */
export const REPLY_HOURS = 24;

/* ══════════════════════════════════════════════════
   含むもの・含まないもの
   ══════════════════════════════════════════════════
   含まないものを、隠さない。
   ただし、並べ方で不安を煽らない。
   「できないこと」が画面の主役にならないよう、
   含むものより先には置かない（画面側の並びで守る）。 */

export const INCLUDED = [
  "出発前の準備について、何度でも相談できます",
  "旅行中も、同じトークで相談できます",
  "調べても決めきれないことを、一緒に整理します",
  "実際に行った人が、何に困って何を準備したかを話せます",
] as const;

export const NOT_INCLUDED = [
  "緊急時の対応、現地への駆けつけ",
  "すぐに返す約束（原則24時間以内のお返事です）",
  "予約や手配の代行、通訳の代行",
  "旅程をまるごと作ること",
] as const;

/* ══════════════════════════════════════════════════
   画面に出す言い方
   ══════════════════════════════════════════════════ */

export const PRICE_LINE = `1旅行 ${PRICE_YEN.toLocaleString()}円（税込）`;
export const UNLIMITED_LINE = "対象期間中、相談の回数に上限はありません";
export const WINDOW_LINE = `出発の${WINDOW_BEFORE_DAYS}日前から、帰国日まで（旅行期間は最大${MAX_TRIP_DAYS}日間）`;
export const REPLY_LINE = `原則${REPLY_HOURS}時間以内にお返事します。主に日本時間の夜に対応しています`;
export const EMERGENCY_LINE = "緊急時の対応は含みません";

/** 「し放題」を出すときに、必ず一緒に出す3つ */
export const UNLIMITED_SET = [UNLIMITED_LINE, WINDOW_LINE, REPLY_LINE] as const;

/* ── 公開の前に止めること ───────────────────────── */
{
  if (PRICE_YEN <= 0) throw new Error("値段が入っていません");

  /* ── 「し放題」を、単独で出せないようにする ──────
     UNLIMITED_LINE を画面に置くときは、UNLIMITED_SET ごと置く。
     期間と返信の条件が離れると、買った人が最初に困る。 */
  if (UNLIMITED_SET.length !== 3) {
    throw new Error("「し放題」と一緒に出す条件が3つありません（回数・期間・返信）");
  }
  if (!UNLIMITED_SET.includes(UNLIMITED_LINE)) {
    throw new Error("「し放題」の行が、組の中にありません");
  }
  if (!WINDOW_LINE.includes(String(WINDOW_BEFORE_DAYS)) || !WINDOW_LINE.includes(String(MAX_TRIP_DAYS))) {
    throw new Error("期間の行に、日数が入っていません");
  }
  if (!REPLY_LINE.includes(String(REPLY_HOURS))) {
    throw new Error("返信の行に、時間が入っていません");
  }

  /* ── すぐ返すと、読ませないこと ────────────────
     「24時間以内」と「24時間対応」は別物。
     後者だと、夜中に返ってくると思われる。 */
  for (const t of [REPLY_LINE, UNLIMITED_LINE, PRICE_LINE]) {
    for (const w of ["24時間対応", "即時", "すぐに返", "always", "24/7", "いつでも返"]) {
      if (t.includes(w)) {
        throw new Error(`「${t}」に「${w}」が入っています。返すのは原則${REPLY_HOURS}時間以内です`);
      }
    }
  }

  /* ── 引き受けないことに、緊急が入っていること ────
     ここが抜けると、助けを呼べる先だと思われる。
     それは命に関わる誤解になる。 */
  if (!NOT_INCLUDED.some((t) => t.includes("緊急"))) {
    throw new Error("含まないものに、緊急時の対応が入っていません");
  }
  if (!NOT_INCLUDED.some((t) => /手配|代行/.test(t))) {
    throw new Error("含まないものに、手配・代行が入っていません");
  }

  /* ── 不安で売らないこと ────────────────────────
     一人旅は、ただでさえ家族に反対される。
     「危ない」「一人では無理」は、行くのをやめる方向に押す。
     この製品は、自分で旅する人の判断を支える側。 */
  for (const t of [...INCLUDED, ...NOT_INCLUDED, PRICE_LINE, UNLIMITED_LINE, WINDOW_LINE, REPLY_LINE]) {
    for (const w of ["危険", "危ない", "不安な方", "一人では", "万が一", "トラブルに備え", "心配な方"]) {
      if (t.includes(w)) {
        throw new Error(`「${t}」に「${w}」が入っています。怖がらせて売らないでください`);
      }
    }
  }

  /* ── 安さで売らないこと ────────────────────────── */
  for (const t of [PRICE_LINE, UNLIMITED_LINE]) {
    for (const w of ["お得", "格安", "最安", "今だけ", "期間限定", "キャンペーン", "割引"]) {
      if (t.includes(w)) throw new Error(`「${t}」に「${w}」が入っています`);
    }
  }

  /* 含むものが、含まないものより少なくないこと。
     できないことの一覧に見えるページにしない。 */
  if (INCLUDED.length < NOT_INCLUDED.length) {
    throw new Error("含まないもののほうが多くなっています。できないことの一覧に見えます");
  }
}
