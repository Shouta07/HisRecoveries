import { KNOWN_APPS } from "../koi/board";
import { MIND_READING } from "../ask/model";
import { NEVER, SCARE, CHEAP } from "../voice";

/* ══════════════════════════════════════════════════
   この場面、あなたならどうする？
   ══════════════════════════════════════════════════

   ── 詰将棋にしない ──────────────────────────────
   元になった形（詰め）は、正解の1手を当てさせるもの。
   それはこの製品では作れない。

   voice.ts に「正解は渡さない」と書いて、判定まで置いてある。
   「Aならこう感じた、Bならこう感じた、までがこちらの仕事。
     どちらにするかは、その人が決める」

   しかも、いま回答者は0人。
   見ていないのに「これが正解です」と書いたら、
   架空の4人を出していたときと同じ間違いになる。

   だから、正解を持たない。
   型にも置かない。足そうとしたら、そこで止まる。

   ── では、何を返すか ────────────────────────────
   選んだあとに出るのは、点数でも採点でもなく、
   同じ場面を見た人が、どれを選んだかの数。

     異性 5人のうち 3人が A を選びました
     同性 8人のうち 5人が C を選びました

   割合（%）では出さない。数えられる形でだけ出す
   （voice.ts の方針。出すのは「3人中2人」だけ）。

   ── どの選択肢も、成立すること ──────────────────
   明らかにおかしい選択肢を1つ混ぜると、
   そこで「正解当て」に戻る。

   4つとも、実際にやっている人がいる手にする。
   迷うから問題になる。迷わないなら、出す意味が無い。

   ── 解説を書かない ──────────────────────────────
   書いた時点で、こちらが正解を持っていることになる。
   出すのは、人がどう分かれたかまで。 */

export type Choice = {
  /** 画面と保存に使う。1文字 */
  id: string;
  text: string;
};

/**
 * 1場面。
 *
 * 正解のフィールドは置かない。
 * 「answer」「best」「correct」を足そうとすると、型で止まる。
 * コメントで禁じるだけだと、いつか足される。
 */
export type Scene = {
  /** URL に出る短い名前 */
  id: string;
  /** どのアプリで出会ったか。board.ts の語彙 */
  app: string;
  /** どこまで進んでいるか */
  stage: string;
  /** 場面。3行まで */
  setup: string[];
  /** 選択肢。3〜4つ。どれも成立すること */
  choices: Choice[];
};

export const SCENES: Scene[] = [
  {
    id: "after-second-date",
    app: "with",
    stage: "2回目デート後",
    setup: [
      "帰り際に「楽しかった、またね」と言われた。",
      "翌日の昼、まだ連絡は来ていない。",
    ],
    choices: [
      { id: "a", text: "すぐ「昨日ありがとう」を送る" },
      { id: "b", text: "夕方まで待ってから送る" },
      { id: "c", text: "お礼と一緒に、次の誘いまで入れて送る" },
      { id: "d", text: "相手から来るまで待つ" },
    ],
  },
  {
    id: "when-to-ask-line",
    app: "Pairs",
    stage: "やりとり中",
    setup: [
      "マッチして5往復。話は続いている。",
      "まだアプリの中だけでやりとりしている。",
    ],
    choices: [
      { id: "a", text: "いまLINEを聞く" },
      { id: "b", text: "もう2〜3往復してから聞く" },
      { id: "c", text: "先に「電話しませんか」と誘う" },
      { id: "d", text: "相手から言ってくるのを待つ" },
    ],
  },
  {
    id: "where-to-go",
    app: "タップル",
    stage: "初デートの予定",
    setup: [
      "土曜に会うことは決まった。",
      "場所はまだ決めていない。",
    ],
    choices: [
      { id: "a", text: "2〜3店を出して、選んでもらう" },
      { id: "b", text: "1店に決めて提案する" },
      { id: "c", text: "行きたいジャンルを先に聞く" },
      { id: "d", text: "当日の気分で決めようと伝える" },
    ],
  },
  {
    id: "slower-replies",
    app: "with",
    stage: "やりとり中",
    setup: [
      "前は半日で返ってきたのが、最近は1日空く。",
      "内容そのものは、変わっていない。",
    ],
    choices: [
      { id: "a", text: "今まで通りの頻度で送り続ける" },
      { id: "b", text: "相手の間隔に合わせて、こちらも空ける" },
      { id: "c", text: "「忙しい？」と一度聞いてみる" },
      { id: "d", text: "しばらく送らずに様子を見る" },
    ],
  },
  {
    id: "next-plan-on-the-spot",
    app: "Pairs",
    stage: "初回デート後",
    setup: [
      "初デートの帰り道。駅までの道を歩いている。",
      "次の約束は、まだしていない。",
    ],
    choices: [
      { id: "a", text: "その場で日程まで決める" },
      { id: "b", text: "「また行きましょう」とだけ言う" },
      { id: "c", text: "家に帰ってからLINEで誘う" },
      { id: "d", text: "相手から出てくるのを待つ" },
    ],
  },
  {
    id: "asked-about-others",
    app: "タップル",
    stage: "やりとり中",
    setup: [
      "「ほかにもやりとりしてる人いるの？」と聞かれた。",
      "実際、何人かと同時に進んでいる。",
    ],
    choices: [
      { id: "a", text: "正直に人数まで言う" },
      { id: "b", text: "「何人かとは話してます」とだけ言う" },
      { id: "c", text: "聞かれた理由のほうを先に聞く" },
      { id: "d", text: "冗談にして流す" },
    ],
  },
];

/** 分布を出していい最低人数。これを割ったら、数だけ出す */
export const MIN_SHOWN = 3;

export function sceneOf(id: string): Scene | null {
  return SCENES.find((s) => s.id === id) ?? null;
}

export function choiceOf(s: Scene, id: string): Choice | null {
  return s.choices.find((c) => c.id === id) ?? null;
}

/** その場面の、全部の文。判定に使う */
function allText(s: Scene): string {
  return [s.stage, ...s.setup, ...s.choices.map((c) => c.text)].join(" ");
}

/* ── 公開の前に止めること ───────────────────────── */
{
  if (SCENES.length < 3) throw new Error(`場面が ${SCENES.length} 個しかありません（3つ以上）`);

  const ids = new Set<string>();
  for (const s of SCENES) {
    if (ids.has(s.id)) throw new Error(`場面のID「${s.id}」が重なっています`);
    ids.add(s.id);
    if (!/^[a-z0-9-]{3,40}$/.test(s.id)) {
      throw new Error(`場面のID「${s.id}」が、URLに置ける形ではありません`);
    }

    /* アプリ名は、こちらが受け取れるものだけ。
       ここだけ別の名前が出ると、「このアプリも対応」と
       読んだ人が、貼ったときに揃わない。 */
    if (!(KNOWN_APPS as readonly string[]).includes(s.app)) {
      throw new Error(`場面「${s.id}」のアプリ「${s.app}」が、board.ts の一覧にありません`);
    }

    /* ── 場面は短く ────────────────────────────
       長い場面は、読む前に飛ばされる。
       3行で足りないなら、それは問題が大きすぎる。 */
    if (s.setup.length === 0) throw new Error(`場面「${s.id}」に、状況が書かれていません`);
    if (s.setup.length > 3) {
      throw new Error(`場面「${s.id}」の状況が ${s.setup.length} 行あります（3行まで）`);
    }
    for (const line of s.setup) {
      if (line.length > 60) {
        throw new Error(`場面「${s.id}」の「${line}」が ${line.length} 字あります（60字まで）`);
      }
    }

    /* ── 選択肢は3〜4つ ────────────────────────
       2つだと、二択の当てっこになる。
       5つ以上だと、読む前に選ばれる。 */
    if (s.choices.length < 3 || s.choices.length > 4) {
      throw new Error(`場面「${s.id}」の選択肢が ${s.choices.length} 個です（3〜4つ）`);
    }
    const cids = new Set<string>();
    for (const c of s.choices) {
      if (cids.has(c.id)) throw new Error(`場面「${s.id}」の選択肢ID「${c.id}」が重なっています`);
      cids.add(c.id);
      if (!/^[a-z]$/.test(c.id)) {
        throw new Error(`場面「${s.id}」の選択肢ID「${c.id}」は1文字にしてください`);
      }
      if (!c.text) throw new Error(`場面「${s.id}」に、中身の無い選択肢があります`);
      if (c.text.length > 40) {
        throw new Error(`場面「${s.id}」の選択肢「${c.text}」が ${c.text.length} 字あります（40字まで）`);
      }
    }

    /* ══════════════════════════════════════════
       採点に読める言葉を、置かない
       ══════════════════════════════════════════
       「正解」「ベスト」「NG」「べき」が1語でも入ると、
       そこから先は正解当てとして読まれる。

       選択肢に「ダメな例」を混ぜたくなったときに、
       いちばん出やすいのがこの語。 */
    const text = allText(s);
    for (const w of [
      "正解", "不正解", "ベスト", "最善", "べき", "NG", "ng",
      "ダメ", "だめ", "間違い", "正しい", "おすすめ", "推奨",
      "減点", "加点", "スコア", "点数",
    ]) {
      if (text.includes(w)) {
        throw new Error(
          `場面「${s.id}」に「${w}」が入っています。` +
            `どれが良いかは、こちらが決めません（正解を持たない形です）`,
        );
      }
    }

    /* 相手の気持ちを、こちらが言わないこと。
       「脈あり」「本命」は利用規約 第12条で扱わないと決めている。
       MIND_READING は正規表現（model.ts）。一覧ではない。 */
    const mind = text.match(MIND_READING);
    if (mind) {
      throw new Error(`場面「${s.id}」に「${mind[0]}」が入っています。相手の気持ちは当てません`);
    }

    /* トップと同じ線を、ここにも通す。
       攻略・安さ・怖がらせは、この面でも置けない。 */
    for (const [list, why] of [
      [NEVER, "この製品は、モテる方法でも攻略でもありません"],
      [SCARE, "怖がらせて見せないでください"],
      [CHEAP, "安さで見せないでください"],
    ] as const) {
      const hit = list.find((w) => text.includes(w));
      if (hit) throw new Error(`場面「${s.id}」に「${hit}」が入っています。${why}`);
    }
  }

  /* ── アプリが1つに偏っていないこと ──────────────
     この製品は「複数アプリ」が芯。
     場面が全部 with だと、1つのアプリの話に見える。 */
  if (new Set(SCENES.map((s) => s.app)).size < 2) {
    throw new Error("場面のアプリが1種類しかありません（2つ以上）");
  }

  /* ── 「待つ」が入っていること ────────────────────
     全部の場面が「動く手」だけだと、急かす道具になる。
     待つのも手のうち。board.ts でも同じことを見ている。 */
  if (!SCENES.some((s) => s.choices.some((c) => /待つ|様子を見る/.test(c.text)))) {
    throw new Error("どの場面にも、待つ手がありません（待つのも手のうちです）");
  }

  if (MIN_SHOWN < 2) {
    throw new Error(`分布を出す最低人数が ${MIN_SHOWN} 人です。1人の答えを分布として出せません`);
  }
}
