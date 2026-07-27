// ゴール（理想の日）起点のロードマップ定義。
//
// His Recoveries が売るのは「施術」ではなく「その日を、自信を持って迎えられること」。
// だから入口は悩み（薄毛・ニキビ…）ではなく、**迎えたい日**から始める。
// 各ステップは実在の記事に紐づけ、「読んで終わり」ではなく「終わらせて次へ」にする。

export type GoalStep = {
  /** チェック識別子（localStorage に保存） */
  id: string;
  /** いつやるか（タイムライン表示） */
  when: string;
  /** 何を終わらせるか */
  title: string;
  /** なぜそれが効くか（1行） */
  why: string;
  /** 紐づく記事 */
  areaId: string;
  slug: string;
};

export type Goal = {
  id: string;
  /** 選択肢の見出し＝迎えたい日 */
  label: string;
  /** その日に本当に欲しいもの（施術ではなく結果） */
  outcome: string;
  /** 既定の準備期間（日） */
  defaultDays: number;
  steps: GoalStep[];
};

/**
 * 期限がある3つに絞る（データが集まってから増やす）。
 * 「期限がない（清潔感・若返り）」「贈りたい」は別導線に逃がす。
 */
export const GOALS: Goal[] = [
  {
    id: "konkatsu",
    label: "婚活・出会い",
    outcome: "選ばれる側に回って、次に進む",
    defaultDays: 90,
    steps: [
      {
        id: "seiketsu",
        when: "今週",
        title: "清潔感の土台をつくる",
        why: "加点より先に、減点をなくす。ここが全部の前提になります。",
        areaId: "impression",
        slug: "seiketsukan-shoutai-5",
      },
      {
        id: "hair",
        when: "〜3週目",
        title: "髪型を、今の自分に合わせる",
        why: "第一印象がいちばん大きく動くのが髪です。",
        areaId: "impression",
        slug: "mens-hairstyle-seiketsukan",
      },
      {
        id: "mayu",
        when: "〜5週目",
        title: "眉を整える",
        why: "顔の印象が締まる。手間が小さく、変化が見えやすい。",
        areaId: "impression",
        slug: "mayu-totonoe",
      },
      {
        id: "photo",
        when: "〜8週目",
        title: "写真を撮り直す",
        why: "出会いの入口は写真。盛らずに、整えて撮る。",
        areaId: "impression",
        slug: "matching-app-shashin",
      },
      {
        id: "date",
        when: "当日まで",
        title: "初デートの服を決めておく",
        why: "当日に迷わない。サイズ感が合っていれば十分です。",
        areaId: "impression",
        slug: "hatsu-date-fukusou",
      },
    ],
  },
  {
    id: "kekkonshiki",
    label: "結婚式・大事な日",
    outcome: "写真に残る日を、最高の状態で迎える",
    defaultDays: 90,
    steps: [
      {
        id: "skin",
        when: "今週",
        title: "肌を整えはじめる",
        why: "肌は時間がかかる。いちばん早く始めるべき項目です。",
        areaId: "skin",
        slug: "mens-skincare-junban",
      },
      {
        id: "hair",
        when: "〜4週目",
        title: "髪型を決めて、当日の型を作る",
        why: "当日に初挑戦しない。慣らす時間を取ります。",
        areaId: "impression",
        slug: "mens-hairstyle-seiketsukan",
      },
      {
        id: "fuku",
        when: "〜8週目",
        title: "服装を、浮かない形で用意する",
        why: "場に合うことが第一。サイズ感で印象が決まります。",
        areaId: "impression",
        slug: "kekkonshiki-mijitaku-men",
      },
      {
        id: "photo",
        when: "〜10週目",
        title: "写真写りを練習する",
        why: "写真は一生残ります。角度と表情は、練習で変わる。",
        areaId: "impression",
        slug: "shashin-utsuri",
      },
      {
        id: "zenjitsu",
        when: "前日",
        title: "前日の仕上げをする",
        why: "やりすぎない。整えるだけで、当日の状態が変わります。",
        areaId: "impression",
        slug: "date-zenjitsu-mijitaku",
      },
    ],
  },
  {
    id: "mensetsu",
    label: "面接・転職",
    outcome: "信頼される第一印象で、勝負する",
    defaultDays: 30,
    steps: [
      {
        id: "base",
        when: "今週",
        title: "面接の第一印象を、要素に分ける",
        why: "何で判断されているかを知る。ここから逆算します。",
        areaId: "impression",
        slug: "mensetsu-daiichiinsho",
      },
      {
        id: "mayu",
        when: "〜10日目",
        title: "髪と眉を整える",
        why: "清潔感の大半はこの2つ。短期間で効きます。",
        areaId: "impression",
        slug: "mayu-totonoe",
      },
      {
        id: "hyoujou",
        when: "〜3週目",
        title: "表情をつくる",
        why: "「怖い」「不機嫌そう」は、意図と関係なく損をします。",
        areaId: "impression",
        slug: "hyoujou-egao-tsukurikata",
      },
      {
        id: "shisei",
        when: "〜3週目",
        title: "姿勢を直す",
        why: "猫背は自信のなさに見える。座り方から変わります。",
        areaId: "impression",
        slug: "shisei-insho-neko-ze",
      },
      {
        id: "fuku",
        when: "当日まで",
        title: "服のサイズ感を合わせる",
        why: "高い服より、肩と丈が合った服。ここで差がつきます。",
        areaId: "impression",
        slug: "fuku-size-silhouette",
      },
    ],
  },
];

export function getGoal(id: string): Goal | undefined {
  return GOALS.find((g) => g.id === id);
}

/** 選べる準備期間 */
export const DAY_OPTIONS = [30, 90, 180] as const;
