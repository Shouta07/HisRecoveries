// The emotional entry layer for His Recoveries.
//
// His Recoveries does not sort men by symptom — it meets them at the
// feeling ("鏡を見るのが少し嫌だ") and only then translates that feeling
// into possible causes (territories). Flow:
//
//   感情 → 自意識（なぜ気になるのか）→ 悩み票 → 原因候補 → 理解 → 次の一歩
//
// Content is bilingual: top-level fields are Japanese; `en` mirrors them.

export type FeelingCause = {
  /** territory slug the cause analysis lives at */
  territory: string;
  /** the cause, named in the visitor's words (ja) */
  cause: string;
  /** the cause in English */
  causeEn: string;
};

export type FeelingL10n = {
  statement: string;
  why: string;
  who: string;
  vignettes: string[];
};

export type Feeling = {
  slug: string;
  /** ja statement (kept top-level for existing JP code) */
  statement: string;
  why: string;
  who: string;
  vignettes: string[];
  causes: FeelingCause[];
  /** English mirror of the localized fields */
  en: FeelingL10n;
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

export const TERRITORY_LABEL_EN: Record<string, string> = {
  "sweat-odor": "Sweat & Odor",
  "skin-acne": "Skin & Acne Scars",
  "hair-loss": "Hair Loss & AGA",
  "beard-body-hair": "Beard & Body Hair",
  "face-impression": "Facial Impression",
  "mind-awareness": "Mind & Self-Consciousness",
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
      { territory: "skin-acne", cause: "ニキビ跡・赤み・肌の凹凸", causeEn: "Acne scars, redness, uneven skin" },
      { territory: "face-impression", cause: "毛穴・表情の癖・印象", causeEn: "Pores, expression habits, impression" },
      { territory: "beard-body-hair", cause: "ヒゲの濃さ・剃り跡", causeEn: "Beard thickness, shaving marks" },
      { territory: "hair-loss", cause: "生え際・髪の密度", causeEn: "Hairline, hair density" },
      { territory: "mind-awareness", cause: "鏡への違和感そのもの", causeEn: "The discomfort with the mirror itself" },
    ],
    en: {
      statement: "I don't quite like looking in the mirror",
      why: "Disliking the mirror is usually less about a specific flaw than about how you evaluate your own face. The trigger differs — acne scars, pores, the thickness of a beard, a receding hairline, a habit of expression — but what they share is a gaze that subtracts a little each time you look. It begins with separating where that gaze is actually pointed.",
      who: "Men whose time checking a particular feature in the morning routine has slowly grown. Common among those for whom no one has pointed anything out, yet the scoring continues inside themselves.",
      vignettes: [
        "While brushing your teeth, you can't put your eyes on the center of the mirror",
        "The few seconds standing at the sink in the morning feel somehow heavy",
        "Each time you push your hair back, you check the hairline",
        "When shaving, you keep watching the jawline",
      ],
    },
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
      { territory: "face-impression", cause: "顔の印象・老け見え", causeEn: "Facial impression, looking older" },
      { territory: "hair-loss", cause: "頭頂部・つむじ", causeEn: "The crown, the whorl" },
      { territory: "skin-acne", cause: "肌の質感・凹凸", causeEn: "Skin texture, unevenness" },
      { territory: "mind-awareness", cause: "自己評価の癖", causeEn: "The habit of self-evaluation" },
    ],
    en: {
      statement: "I'm not good at being in photos",
      why: "Being uncomfortable in photos comes from facing the moment your appearance diverges from your self-image. You're used to the mirror's left-right reversal; a photo is not that. And a frozen frame has no escape — skin, contour, crown, expression all stay on record exactly as the parts you mind. The discomfort is usually not one flaw but the sum of several small catches.",
      who: "Men who unconsciously choose where to stand in group shots. Common among those who look at the taken photo longer than others, checking.",
      vignettes: [
        "In group photos, only you seem not to blend in",
        "Before being photographed, you unconsciously step toward the back",
        "You always avoid angles that show the crown of your head",
        "Unable to ask for a retake, the photo you dislike remains",
      ],
    },
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
      { territory: "sweat-odor", cause: "汗・におい", causeEn: "Sweat & odor" },
      { territory: "skin-acne", cause: "肌・テカリ", causeEn: "Skin, shine" },
      { territory: "beard-body-hair", cause: "ヒゲ・体毛の処理", causeEn: "Beard & body-hair grooming" },
      { territory: "face-impression", cause: "全体の印象", causeEn: "Overall impression" },
    ],
    en: {
      statement: "I'm not confident about cleanliness",
      why: "'Cleanliness' is, in fact, less about being clean than about whether you look put-together. That's exactly why it's vague and hard to feel confident about. Sweat and odor, oily skin, beard and body-hair grooming, the neatness of hair — you're evaluated as an overall impression rather than any single thing, and that feeds a diffuse unease. Break it into elements and you can see where you're caught.",
      who: "Men who somehow brace at the words 'a person with cleanliness.' Common among those who feel awkward in situations where the distance to others closes.",
      vignettes: [
        "You brace, somehow, at the word 'cleanliness'",
        "In summer, situations where people come close feel difficult",
        "You haven't chosen a gray shirt in years",
        "There are moments your own odor suddenly worries you",
      ],
    },
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
      { territory: "sweat-odor", cause: "汗・におい", causeEn: "Sweat & odor" },
      { territory: "skin-acne", cause: "肌", causeEn: "Skin" },
      { territory: "beard-body-hair", cause: "ヒゲ・体毛", causeEn: "Beard & body hair" },
      { territory: "hair-loss", cause: "髪", causeEn: "Hair" },
      { territory: "face-impression", cause: "顔の印象", causeEn: "Facial impression" },
    ],
    en: {
      statement: "There's something I mind before meeting people",
      why: "Awareness rises before meeting people because the premise of 'being seen' comes alive. The place you mind shifts with the person or the setting — sweat and odor, skin, beard, hair — attention gathers somewhere in the body according to the day's situation. Not feeling sure even after grooming may be because you feel the standard of judgment lies outside yourself.",
      who: "Men who spend longer in front of the mirror before an appointment. Common among those who finish preparing yet still feel unsettled.",
      vignettes: [
        "Before an appointment, your time in front of the mirror grows",
        "The place you mind changes with who you're meeting",
        "Even after grooming, you can't feel sure",
        "The moment you think 'I'll be seen,' awareness gathers in your face",
      ],
    },
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
      { territory: "face-impression", cause: "肌・輪郭・表情", causeEn: "Skin, contour, expression" },
      { territory: "hair-loss", cause: "薄毛・AGA", causeEn: "Hair loss, AGA" },
      { territory: "mind-awareness", cause: "比較と老化感", causeEn: "Comparison and the sense of aging" },
    ],
    en: {
      statement: "I feel like I've aged",
      why: "'Feeling like I've aged' is you detecting a change in impression, not your actual age. Skin texture, a loosening contour, hair density, and unconscious expression. Many elements are reversible — but what works even more strongly is the inner motion of comparing yourself to peers. The sense of aging intensifies as the multiplication of appearance and comparison.",
      who: "Men who, standing beside peers, feel only they look a little older. Common among those who find the fatigue of an offhand expression in a photo.",
      vignettes: [
        "Beside peers of the same age, only you seem to look a bit older",
        "An offhand expression looks more tired than you'd thought",
        "You think 'I don't want to age' without being able to say it aloud",
        "Photos look more honest than the mirror",
      ],
    },
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
      { territory: "mind-awareness", cause: "睡眠・目元・自意識", causeEn: "Sleep, the eye area, self-consciousness" },
      { territory: "face-impression", cause: "目元・くすみ・印象", causeEn: "Eye area, dullness, impression" },
      { territory: "skin-acne", cause: "肌のコンディション", causeEn: "Skin condition" },
    ],
    en: {
      statement: "Lately, I look tired",
      why: "'Looking tired' is a bodily sign in the eye area, skin, and expression — and at the same time a matter of self-consciousness, of catching it yourself. Sleep debt surfaces as dark circles, puffiness, and dull skin, and a lowered mouth corner or posture strengthens the impression. Your face looking tired even after a good night's sleep is because the cause is not sleep alone.",
      who: "Men who want to deny 'You look tired?' but find it hits the mark. Common among those for whom the evening mirror looks heavy.",
      vignettes: [
        "Even after sleeping well, only your face is tired",
        "You mind the area under your eyes more than others do",
        "Asked 'Are you tired?', you want to deny it but it's true",
        "By evening, the self in the mirror looks heavy",
      ],
    },
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

// Reverse lookup: which feelings point at a given territory (cause)?
// Used to cross-link cause-analysis pages back into the emotional entry.
export function getFeelingsForTerritory(territory: string): Feeling[] {
  return FEELINGS.filter((f) =>
    f.causes.some((c) => c.territory === territory)
  );
}

// Map a content category → its cause-analysis territory, so an article
// can offer a contextual "なぜ起こるのか" link + a tailored Recovery Check.
const CATEGORY_TO_TERRITORY: Record<string, string> = {
  hyperhidrosis: "sweat-odor",
  bromhidrosis: "sweat-odor",
  acne: "skin-acne",
  face: "face-impression",
  "hair-loss": "hair-loss",
  "body-hair": "beard-body-hair",
  philosophy: "mind-awareness",
};

export function territoryForCategory(category: string): string | null {
  return CATEGORY_TO_TERRITORY[category] ?? null;
}
