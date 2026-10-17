import { CITIES } from "../voice";
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
  /** どの都市の話か。voice.ts の CITIES */
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
    id: "airport-to-hotel",
    app: "バンコク",
    stage: "出発前",
    setup: [
      "深夜1時に空港着の便を取った。",
      "宿はスクンビット。空港からの行き方は決めていない。",
    ],
    choices: [
      { id: "a", text: "配車アプリを入れて、着いてから呼ぶ" },
      { id: "b", text: "空港の正規タクシー乗り場に並ぶ" },
      { id: "c", text: "宿に送迎を頼んでおく" },
      { id: "d", text: "朝まで空港で待って、始発で動く" },
    ],
  },
  {
    id: "first-night",
    app: "台北",
    stage: "現地1日目",
    setup: [
      "宿に着いたのが夜8時。まだ何も食べていない。",
      "外は小雨。宿の周りは店が開いている。",
    ],
    choices: [
      { id: "a", text: "近くの店に、ひとりで入る" },
      { id: "b", text: "コンビニで買って、部屋で食べる" },
      { id: "c", text: "夜市まで足をのばす" },
      { id: "d", text: "今日は寝て、明日の朝から動く" },
    ],
  },
  {
    id: "is-this-overcharged",
    app: "バンコク",
    stage: "現地",
    setup: [
      "タクシーでメーターを使ってくれず、500バーツと言われた。",
      "地図で見ると、20分くらいの距離。",
    ],
    choices: [
      { id: "a", text: "その場で断って、別の車を探す" },
      { id: "b", text: "値段を下げられないか聞いてみる" },
      { id: "c", text: "払って乗る。もめるほうが面倒" },
      { id: "d", text: "配車アプリで呼び直す" },
    ],
  },
  {
    id: "feeling-sick",
    app: "ソウル",
    stage: "現地",
    setup: [
      "2日目の朝、お腹をこわした。熱はない。",
      "今日は歩く予定を入れていた。",
    ],
    choices: [
      { id: "a", text: "予定を消して、宿で休む" },
      { id: "b", text: "薬局へ行って、薬を買う" },
      { id: "c", text: "保険会社に電話して聞く" },
      { id: "d", text: "様子を見ながら、近場だけ動く" },
    ],
  },
  {
    id: "telling-family",
    app: "台北",
    stage: "出発前",
    setup: [
      "ひとりで行くことを、まだ親に言っていない。",
      "出発は再来週。",
    ],
    choices: [
      { id: "a", text: "行き先と日程だけ、先に伝える" },
      { id: "b", text: "宿と便名まで共有しておく" },
      { id: "c", text: "帰ってきてから話す" },
      { id: "d", text: "友達にだけ、日程を預けておく" },
    ],
  },
  {
    id: "last-day-money",
    app: "ソウル",
    stage: "帰国前",
    setup: [
      "最終日。現地のお金が5,000ウォンぶん残っている。",
      "空港までは交通カードで行ける。",
    ],
    choices: [
      { id: "a", text: "空港で使い切る" },
      { id: "b", text: "そのまま持って帰る" },
      { id: "c", text: "両替して日本円に戻す" },
      { id: "d", text: "交通カードにチャージしておく" },
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
    if (!(CITIES as readonly string[]).includes(s.app)) {
      throw new Error(`場面「${s.id}」の都市「${s.app}」が、対応都市にありません`);
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

    /* 決めつけを置かないこと。
       「現地の人はみんな」「日本人は必ず」のような書き方は、
       行った1人の実感ではなく、こちらの一般化になる。 */
    const flat = text.match(/みんな|必ず|絶対|全員|どこでも/);
    if (flat) {
      throw new Error(`場面「${s.id}」に「${flat[0]}」が入っています。1人の実感を一般化しないでください`);
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

  /* ── 都市が1つに偏っていないこと ──────────────
     対応は3都市。場面が全部バンコクだと、1都市の話に見える。 */
  if (new Set(SCENES.map((s) => s.app)).size < 2) {
    throw new Error("場面の都市が1種類しかありません（2つ以上）");
  }

  /* ── 「待つ」が入っていること ────────────────────
     全部の場面が「動く手」だけだと、急かす道具になる。
     待つのも手のうち。board.ts でも同じことを見ている。 */
  if (!SCENES.some((s) => s.choices.some((c) => /待つ|様子を見る|休む/.test(c.text)))) {
    throw new Error("どの場面にも、動かない手がありません（休むのも手のうちです）");
  }

  if (MIN_SHOWN < 2) {
    throw new Error(`分布を出す最低人数が ${MIN_SHOWN} 人です。1人の答えを分布として出せません`);
  }
}
