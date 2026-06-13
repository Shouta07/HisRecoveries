// The emotional entry layer for His Recoveries.
//
// His Recoveries does not sort men by symptom — it meets them at the
// feeling ("鏡を見るのが少し嫌だ") and only then translates that feeling
// into possible causes (territories). Flow:
//
//   感情 → 自意識（なぜ気になるのか）→ 悩み票 → 原因候補 → 理解 → 次の一歩

export type FeelingCause = {
  /** territory slug the cause analysis lives at */
  territory: string;
  /** the cause, named in the visitor's words */
  cause: string;
};

export type Feeling = {
  slug: string;
  /** the statement the visitor selects on the home Hub */
  statement: string;
  /** why this feeling arises — self-consciousness framing */
  why: string;
  /** who tends to carry this feeling */
  who: string;
  /** 悩み票 — life-pain vignettes, not symptoms */
  vignettes: string[];
  /** 原因候補 — possible causes, each links into a cause-analysis page */
  causes: FeelingCause[];
};

// Display label for each territory (genre), shown as a tag on cause cards.
export const TERRITORY_LABEL: Record<string, string> = {
  "sweat-odor": "汗とにおい",
  "skin-acne": "肌とニキビ跡",
  "hair-loss": "薄毛とAGA",
  "beard-body-hair": "髭と体毛",
  "face-impression": "顔の印象",
  "mind-awareness": "心と自意識",
};

const FEELINGS: Feeling[] = [
  {
    slug: "mirror",
    statement: "鏡を見るのが、少し嫌だ",
    why: "鏡を見るのが嫌だという感覚は、特定の欠点というより、「自分の顔を、自分がどう評価しているか」の問題であることが多いものです。ニキビ跡、毛穴、ヒゲの濃さ、生え際、表情の癖——具体的な引き金は人によって違いますが、共通しているのは、見るたびに自分を減点する視線を、自分自身に向けてしまうこと。まずは、その視線がどこに向いているのかを切り分けるところから始まります。",
    who: "毎朝の身支度のなかで、特定の部位を確認する時間が少しずつ長くなっている人。誰かに指摘されたわけではないのに、自分の中だけで採点が続いている人に多い感覚です。",
    vignettes: [
      "歯磨きのあいだ、鏡の中央に視線を置けない",
      "朝、洗面所に立つ数秒が、なんとなく重い",
      "髪をかき上げる動作のたび、生え際を確認している",
      "髭を剃るとき、フェイスラインばかり見てしまう",
    ],
    causes: [
      { territory: "skin-acne", cause: "ニキビ跡・赤み・肌の凹凸" },
      { territory: "face-impression", cause: "毛穴・表情の癖・印象" },
      { territory: "beard-body-hair", cause: "ヒゲの濃さ・剃り跡" },
      { territory: "hair-loss", cause: "生え際・髪の密度" },
      { territory: "mind-awareness", cause: "鏡への違和感そのもの" },
    ],
  },
  {
    slug: "photo",
    statement: "写真に写るのが、苦手だ",
    why: "写真が苦手なのは、「自分の見え方が、自分のイメージとずれる」瞬間に立ち会うからです。鏡は左右反転で見慣れていますが、写真はそうではありません。さらに、止まった一枚は逃げ場がなく、肌・輪郭・頭頂部・表情——気になっている部分が、そのまま記録に残ります。苦手の正体は、たいてい「一つの欠点」ではなく、複数の小さな引っかかりの合計です。",
    who: "集合写真や撮影の場面で、無意識に立ち位置を選んでしまう人。撮られた一枚を、人より長く見つめて確認してしまう人に多い感覚です。",
    vignettes: [
      "集合写真で、自分だけ馴染んでいない気がする",
      "撮られる前に、無意識に立ち位置を後ろにする",
      "頭頂部が写る角度を、いつも避けている",
      "撮り直しを頼めず、苦手な一枚が残る",
    ],
    causes: [
      { territory: "face-impression", cause: "顔の印象・老け見え" },
      { territory: "hair-loss", cause: "頭頂部・つむじ" },
      { territory: "skin-acne", cause: "肌の質感・凹凸" },
      { territory: "mind-awareness", cause: "自己評価の癖" },
    ],
  },
  {
    slug: "cleanliness",
    statement: "清潔感に、自信がない",
    why: "「清潔感」は、実は清潔さそのものより、「整っているように見えるか」という印象の話です。だからこそ曖昧で、自信を持ちにくい。汗やにおい、肌のテカリ、ヒゲや体毛の処理、髪のまとまり——どれか一つではなく、全体の印象として評価される感覚が、漠然とした不安につながります。要素に分解すると、自分がどこに引っかかっているかが見えてきます。",
    who: "「清潔感のある人」という言葉の前で、なぜか身構えてしまう人。人との距離が近づく場面に、苦手意識を持っている人に多い感覚です。",
    vignettes: [
      "「清潔感」という言葉の前で、なぜか身構える",
      "夏、人との距離が近づく場面が苦手だ",
      "グレーのシャツを、何年も選んでいない",
      "自分のにおいが、ふと不安になる瞬間がある",
    ],
    causes: [
      { territory: "sweat-odor", cause: "汗・におい" },
      { territory: "skin-acne", cause: "肌・テカリ" },
      { territory: "beard-body-hair", cause: "ヒゲ・体毛の処理" },
      { territory: "face-impression", cause: "全体の印象" },
    ],
  },
  {
    slug: "before-meeting",
    statement: "人と会う前に、気になることがある",
    why: "人と会う前に意識が高まるのは、「見られる」という前提が立ち上がるからです。相手や場面によって、気になる場所が変わるのもこのためで、汗・におい、肌、ヒゲ、髪——その日の状況に応じて、注意が体のどこかに集まります。整えたつもりでも確信が持てないのは、評価の基準が自分の外にあると感じているからかもしれません。",
    who: "約束の前に、鏡の前にいる時間が長くなる人。準備を終えても、どこか落ち着かなさが残る人に多い感覚です。",
    vignettes: [
      "約束の前、鏡の前にいる時間が長くなる",
      "会う相手によって、気になる場所が変わる",
      "整えたつもりでも、確信が持てない",
      "「見られる」と思った瞬間、意識が顔に集まる",
    ],
    causes: [
      { territory: "sweat-odor", cause: "汗・におい" },
      { territory: "skin-acne", cause: "肌" },
      { territory: "beard-body-hair", cause: "ヒゲ・体毛" },
      { territory: "hair-loss", cause: "髪" },
      { territory: "face-impression", cause: "顔の印象" },
    ],
  },
  {
    slug: "aging",
    statement: "老けた気がする",
    why: "「老けた気がする」は、実年齢ではなく、印象の変化を自分で察知している状態です。肌の質感、輪郭のゆるみ、髪の密度、そして無意識の表情。可逆的な要素も多く含まれますが、それ以上に効いているのが「同年代と比べてしまう」心の動きです。老化感は、見た目と比較の掛け算で強まります。",
    who: "同年代と並んだ瞬間に、自分だけ少し上に見える気がする人。ふとした表情の疲れを、写真で見つけてしまう人に多い感覚です。",
    vignettes: [
      "同年代と並ぶと、自分だけ少し上に見える気がする",
      "ふとした瞬間の表情が、思ったより疲れている",
      "「老けたくない」と、口に出せないまま考えている",
      "鏡より、写真のほうが正直に見える",
    ],
    causes: [
      { territory: "face-impression", cause: "肌・輪郭・表情" },
      { territory: "hair-loss", cause: "薄毛・AGA" },
      { territory: "mind-awareness", cause: "比較と老化感" },
    ],
  },
  {
    slug: "tired",
    statement: "最近、疲れて見える",
    why: "「疲れて見える」は、目元・肌・表情に出る身体のサインであると同時に、自分でそれを見つけてしまう自意識の話でもあります。睡眠負債は目の下のクマやむくみ、肌のくすみとして表面化し、下がった口角や姿勢が印象を強めます。よく寝たはずなのに顔だけ疲れて見えるのは、原因が睡眠だけではないからです。",
    who: "「疲れてる?」と聞かれて、否定したいのに当たっている人。夕方の鏡で、自分が重く見える人に多い感覚です。",
    vignettes: [
      "よく寝たはずなのに、顔だけ疲れている",
      "目の下のことを、人より気にしている",
      "「疲れてる?」と聞かれて、否定したいのに当たっている",
      "夕方になると、鏡の中の自分が重く見える",
    ],
    causes: [
      { territory: "mind-awareness", cause: "睡眠・目元・自意識" },
      { territory: "face-impression", cause: "目元・くすみ・印象" },
      { territory: "skin-acne", cause: "肌のコンディション" },
    ],
  },
];

export function getAllFeelings(): Feeling[] {
  return FEELINGS;
}

export function getFeeling(slug: string): Feeling | undefined {
  return FEELINGS.find((f) => f.slug === slug);
}

export function getAllFeelingSlugs(): string[] {
  return FEELINGS.map((f) => f.slug);
}
