import { PRICE_LINE, MEET_MINUTES, WINDOW_LINE, REPLY_LINE } from "./service";

/* ══════════════════════════════════════════════════
   使うまでの流れ
   ══════════════════════════════════════════════════

   ── 道具を4つに決めた ───────────────────────────
     Web          何を売っているか、いくらか、誰が答えるか
     LINE         買う前の確認、事前のヒアリング、旅行中の相談
     Stripe       お支払い
     Google Meet  出発前のオンライン相談

   独自のチャットも、会員機能も、旅程を管理する画面も作らない。
   作ると、運営する人が4つではなく5つを見ることになる。

   ── LINE を足して終わり、にしない ────────────────
   いちばん落ちるのはここ。

   「LINEで相談できるか聞く」を押して、友だち追加して、
   そこで止まる。何を書けばいいか分からないから。

   送ってほしい4つを、押す前の画面に書いておく。
   追加した直後のあいさつにも、同じ4つを置く
   （docs/line-greeting.md に運営者向けの文案がある）。

   ── 4つより多く聞かない ─────────────────────────
   航空券の番号も、予約番号も、旅程表も、ここでは要らない。
   買う前に求めると、答えるほうの手間が先に来る。

   聞くのは「対応できるかを判断するために要る最小限」。
   それ以上は、お支払いのあとで聞けばいい。 */

/** 最初に LINE で送ってもらう4つ */
export const ASK_ITEMS = [
  { label: "行き先", hint: "国と都市（例：タイ・バンコク）" },
  { label: "出発日と帰国日", hint: "決まっていれば日付、未定ならおおよそで" },
  { label: "一人で海外へ行くのは初めてか", hint: "はい／いいえ だけで大丈夫です" },
  { label: "いまいちばん気になっていること", hint: "1つでかまいません" },
] as const;

/** 4つを1行にまとめた言い方。ボタンのそばに置く */
export const ASK_ONE_LINE = ASK_ITEMS.map((a) => a.label).join("／");

/* ══════════════════════════════════════════════════
   流れ
   ══════════════════════════════════════════════════
   どこまでが無料で、どこからが有料かが
   順番で分かるように並べる。 */

export type Step = {
  n: number;
  title: string;
  body: string;
  /** 無料のうちか */
  free: boolean;
};

export const FLOW: Step[] = [
  {
    n: 1,
    title: "このページで、中身と料金を見る",
    body: `${PRICE_LINE}。何を相談できて、何を引き受けないかは、この下に全部書いてあります。`,
    free: true,
  },
  {
    n: 2,
    title: "LINEを追加して、4つ送る",
    body: `${ASK_ONE_LINE}。この4つだけで大丈夫です。航空券の番号や旅程表は要りません。`,
    free: true,
  },
  {
    n: 3,
    title: "対応できるか、こちらで確かめる",
    body: "行ったことのある国でも、相談の中身によってはお答えできないことがあります。できない場合は、その場でそう申し上げます。ここまで料金はかかりません。",
    free: true,
  },
  {
    n: 4,
    title: "できることと、条件をお伝えする",
    body: `お答えできる範囲、${WINDOW_LINE}、${REPLY_LINE}、料金をまとめてお送りします。`,
    free: true,
  },
  {
    n: 5,
    title: "お支払い（Stripe）",
    body: "お支払い用のリンクをLINEでお送りします。カード情報は決済代行業者が直接お預かりし、当社は受け取りません。",
    free: false,
  },
  {
    n: 6,
    title: "オンライン相談の日時を、LINEで決める",
    body: "出発前に落ち着いて話せる日時を合わせます。Google MeetのURLは、日時が決まってから個別にお送りします。",
    free: false,
  },
  {
    n: 7,
    title: `出発前に、${MEET_MINUTES}分お話しする`,
    body: "ご予定を上から見ながら、気になるところで止まります。事前にお送りいただいた4つには、こちらで目を通しておきます。",
    free: false,
  },
  {
    n: 8,
    title: "旅行中も、同じトークで聞く",
    body: "出発前に話した相手が、そのまま続けてお答えします。対象期間中、LINEでの相談の回数に上限はありません。",
    free: false,
  },
];

/** 無料と有料の境目。CTAのそばに必ず並べて書く */
export const FREE_UNTIL = "対応できるかの確認は、ここまで無料です";
export const PAID_FROM = "具体的な相談は、お支払いのあとで始まります";

/* ── 公開の前に止めること ───────────────────────── */
{
  /* ── 聞くのは4つ。増やさないこと ──────────────────
     ここが増えるたびに、LINEを追加した人が止まる。 */
  /* as const なので、長さが4だと型に出てしまう。
     4以外になった瞬間に型が never へ落ちて、
     本来出したいエラーより先に型エラーになる。
     判定は値として見る。 */
  const items: readonly { label: string; hint: string }[] = ASK_ITEMS;
  if (items.length !== 4) {
    throw new Error(`最初に聞くことが ${items.length} 個あります（4つです）`);
  }
  for (const a of items) {
    if (!a.label || !a.hint) throw new Error(`「${a.label}」に書き方の例がありません`);
  }
  /* 買う前に、重いものを求めないこと。
     旅程表や予約番号を先に求めると、答えるほうの手間が先に来る。 */
  for (const w of ["航空券", "予約番号", "旅程表", "便名", "パスポート", "旅券"]) {
    for (const a of items) {
      if (a.label.includes(w) || a.hint.includes(w)) {
        throw new Error(`最初に聞くことに「${w}」が入っています。買う前に求めないでください`);
      }
    }
  }
  /* 行き先は、国と都市の両方を聞くこと。
     国だけだと、どこの話か決まらない。 */
  if (!items[0].hint.includes("国") || !items[0].hint.includes("都市")) {
    throw new Error("行き先の聞き方に、国と都市の両方が書かれていません");
  }

  /* ── 流れが、順番どおりであること ──────────────────
     無料のうちに有料が混ざったり、
     支払いの前に通話が来たりしないこと。 */
  FLOW.forEach((s, i) => {
    if (s.n !== i + 1) throw new Error(`流れの番号がずれています（${s.n} が ${i + 1} 番目）`);
    if (!s.title || !s.body) throw new Error(`流れの ${s.n} に中身がありません`);
  });

  const all = FLOW.map((s) => `${s.title}${s.body}`).join("\n");
  for (const [re, what] of [
    [/LINE/, "LINE"],
    [/Stripe|お支払い/, "お支払い"],
    [/Google Meet/, "Google Meet"],
  ] as [RegExp, string][]) {
    if (!re.test(all)) throw new Error(`流れに「${what}」が出てきません`);
  }

  /* 無料が先、有料が後。混ざらないこと。
     混ざると、どこから課金されるのかが読めなくなる。 */
  const firstPaid = FLOW.findIndex((s) => !s.free);
  if (firstPaid < 0) throw new Error("流れに、有料になる段がありません");
  if (FLOW.slice(firstPaid).some((s) => s.free)) {
    throw new Error("流れの中で、有料のあとに無料の段が混ざっています");
  }

  /* お支払いが、通話より先に来ること。
     逆だと、ただで通話できると読める。 */
  const payAt = FLOW.findIndex((s) => /お支払い|Stripe/.test(s.title));
  const meetAt = FLOW.findIndex((s) => /お話し|オンライン相談/.test(s.title));
  if (payAt < 0 || meetAt < 0) throw new Error("流れに、お支払いか通話の段がありません");
  if (payAt > meetAt) throw new Error("通話が、お支払いより先に来ています");

  /* 対応できるかの確認が、お支払いより先にあること。
     ここが後ろだと、できない相談に先にお金を払わせることになる。 */
  const checkAt = FLOW.findIndex((s) => /対応できるか/.test(s.title));
  if (checkAt < 0) throw new Error("流れに、対応できるかを確かめる段がありません");
  if (checkAt > payAt) throw new Error("対応できるかの確認が、お支払いより後ろにあります");

  /* ── 無料と有料の境目を、言えていること ──────────── */
  if (!FREE_UNTIL || !PAID_FROM) throw new Error("無料と有料の境目が書かれていません");
  if (!/無料/.test(FREE_UNTIL)) throw new Error("無料の範囲に「無料」と書かれていません");
  if (!/お支払い/.test(PAID_FROM)) throw new Error("有料の始まりに「お支払い」と書かれていません");

  /* ── 怖がらせて買わせないこと ────────────────────── */
  for (const s of FLOW) {
    for (const w of ["危険", "危ない", "万が一", "トラブルに備え", "一人では無理"]) {
      if (`${s.title}${s.body}`.includes(w)) {
        throw new Error(`流れの ${s.n} に「${w}」が入っています`);
      }
    }
  }
}
