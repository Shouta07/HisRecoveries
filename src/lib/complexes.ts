// The six complexes are the spine of the redesigned media. Each one is an
// entry point that leads to (1) interviews with people who work on the
// front line and carry it, and (2) a mechanism explainer — why it happens,
// from the body's side. Territory slugs map 1:1 to content/territories/*.md.
//
// Accent colors are per-complex so the whole site can be color-coded:
// a reader always knows which complex they're inside. Tuned to read as a
// global editorial palette (deep, journalistic), not pastel.

export type Complex = {
  /** stable id, used in URLs that aren't territory-bound */
  id: string;
  /** content/territories/{territory}.md — the mechanism explainer */
  territory: string;
  /** article category slugs that belong to this complex */
  categories: string[];
  ja: string;
  en: string;
  /** one-line mechanism hook (JA) */
  mechanism: string;
  /** the body system named in plain terms (shown as a chip) */
  system: string;
  /** a relatable, first-person "あるある" worry used as a friendly entry */
  worry: string;
  /** normalization line — "you're not alone" framing */
  stat: string;
  /** "なぜ起きるのか" — a short mechanism explainer paragraph (JA) */
  why: string;
  accent: string;
  accentSoft: string;
  /** ガイド型（医療メカニズムではなく、第一印象・身だしなみの実践ガイド） */
  guide?: boolean;
};

export const complexes: Complex[] = [
  {
    id: "impression",
    territory: "first-impression",
    categories: [],
    ja: "第一印象",
    en: "First Impression",
    mechanism: "第一印象は数秒で、清潔感・髪・眉・服・表情の総合として決まる。",
    system: "見た目・清潔感",
    worry: "第一印象で、損している気がする",
    stat: "第一印象は数秒で決まる",
    why: "第一印象は、清潔感・髪型・眉・肌・服のサイズ感・表情・写真写りなど、複数の要素の総合として立ち上がります。生まれ持った骨格は変えにくい一方で、その多くは「整え方」で動かせる部分です。だから、要素に分解して、変えられるところから手をつけるのが近道です。",
    accent: "#3d5638",
    accentSoft: "#eef3ea",
    guide: true,
  },
  {
    id: "hair",
    territory: "hair-loss",
    categories: ["hair-loss"],
    ja: "薄毛・AGA",
    en: "Hair",
    mechanism: "テストステロンから DHT への変換と、毛包の感受性。",
    system: "5αリダクターゼ / DHT",
    worry: "生え際、後退してきた気がする",
    stat: "成人男性の約 3 人に 1 人",
    why: "テストステロンが 5αリダクターゼによって、より強力な DHT に変換されます。この DHT が、遺伝的に感受性の高い前頭部・頭頂部の毛包に作用すると、髪の成長期が短くなり、太く育つ前に抜ける「軟毛化」が進みます。後頭部が残りやすいのは、その部位の感受性が低いから。進行性なので、気づいた時間が選択肢の幅を最も左右します。",
    accent: "#B45309",
    accentSoft: "#FEF3E2",
  },
  {
    id: "skin",
    territory: "skin-acne",
    categories: ["acne"],
    ja: "ニキビ・肌",
    en: "Skin",
    mechanism: "皮脂・毛穴の角化・アクネ菌が重なって起きる炎症。",
    system: "皮脂腺 / 角化 / アクネ菌",
    worry: "ニキビ跡が、なかなか消えない",
    stat: "大人の男性にも、とても多い",
    why: "皮脂の分泌、毛穴の出口の角化（詰まり）、アクネ菌の増殖、そして炎症。この4つが重なって、ニキビは起きます。男性は皮脂量が多く、摩擦や汗の影響も受けやすい。さらに「ニキビと思っていたら、実はマラセチア（カビ）由来だった」というケースもあり、見分けが対処の分かれ目になります。",
    accent: "#BE123C",
    accentSoft: "#FCE9EE",
  },
  {
    id: "face",
    territory: "face-impression",
    categories: ["face"],
    ja: "顔の印象",
    en: "Face",
    mechanism: "骨格・むくみ・表情の癖が、印象の評価をつくる。",
    system: "骨格 / 浮腫 / 表情",
    worry: "実年齢より、老けて見られる",
    stat: "第一印象は数秒で決まる",
    why: "「老けて見える」「疲れて見える」は、骨格・むくみ・表情の癖・肌の質感・睡眠などが複合して生まれます。可逆な要素（むくみ・肌・表情）と、そうでない要素（骨格）が混ざっているのが特徴。だから「何が印象をつくっているか」を要素に分解すると、変えられる部分から手をつけられます。",
    accent: "#6D28D9",
    accentSoft: "#F1EAFC",
  },
  {
    id: "body-hair",
    territory: "beard-body-hair",
    categories: ["body-hair"],
    ja: "髭・体毛",
    en: "Body Hair",
    mechanism: "アンドロゲンと毛周期が、濃さと分布を決める。",
    system: "アンドロゲン / 毛周期",
    worry: "髭や体毛の濃さが、気になる",
    stat: "濃さは遺伝とホルモン次第",
    why: "髭や体毛の濃さ・分布は、アンドロゲン（男性ホルモン）への毛包の感受性と、毛周期で決まります。これは体質であり、だらしなさではありません。「整える／整えない」「減らす」のどれを選ぶかは好みの問題で、正解はひとつではない領域です。",
    accent: "#15803D",
    accentSoft: "#E7F4EB",
  },
  {
    id: "mind",
    territory: "mind-habits",
    categories: [],
    ja: "心・習慣",
    en: "Mind & Habits",
    mechanism: "見た目の奥にある睡眠・習慣・気分が、印象と自信を内側から支える。",
    system: "睡眠・習慣・気分",
    worry: "なんとなく、いつも疲れている",
    stat: "整えるのは、見た目だけじゃない",
    why: "見た目を整えると、不思議と気持ちも少し軽くなる。逆に、睡眠や生活のリズムが乱れると、どれだけ外見を整えても疲れて見えます。心・睡眠・習慣は、見た目の奥で印象と自信を支えています。ここは医療ではなく、日々の小さな整え方から動かせる部分です（つらさが続く場合は専門家へ）。",
    accent: "#0E7490",
    accentSoft: "#E0F2F4",
    guide: true,
  },

  // ── Recover（下半身・体の悩み）─────────────────────────────────
  // 誰にも言えない・検索でしか調べない「恥ずかしい悩み」。SEO/GEOの主戦場。
  // 中立・出典明記・メカニズム中心（効果断定/体験談/特定院推奨はしない＝YMYL）。
  // 見た目の6領域とは別に、体・性の悩みとして末尾にまとめる。
  {
    id: "ed",
    territory: "ed",
    categories: [],
    ja: "ED・勃起の悩み",
    en: "Erectile Dysfunction",
    mechanism: "勃起は血流・神経・ホルモン・心理の連携。どこかが崩れると起きる。",
    system: "血流 / 神経 / 心理",
    worry: "以前のように、勃たない・続かない",
    stat: "年齢とともに、珍しくなくなる",
    why: "勃起は、性的な刺激が神経を通じて伝わり、陰茎の血管が広がって血液が満ち、静脈が圧迫されて硬さが保たれる——という一連の流れで起こります。この流れは、血管・神経・ホルモン・心理のどれかが崩れると乱れます。加齢や生活習慣病（高血圧・糖尿病・脂質異常）による血管の変化、喫煙、ストレスや緊張などの心理要因、一部の薬の影響など、原因はひとつとは限りません。『気の持ちよう』だけで片づかないことも、逆に心理だけのこともある。だから、どこが効いているかを分けて考えるのが出発点です。",
    accent: "#1E5F74",
    accentSoft: "#E3EEF1",
  },
  {
    id: "phimosis",
    territory: "phimosis",
    categories: [],
    ja: "包茎の悩み",
    en: "Phimosis",
    mechanism: "包皮が亀頭を覆う状態。多くは病気ではなく、程度の問題。",
    system: "包皮 / 亀頭",
    worry: "包茎かもしれない、と気になっている",
    stat: "成人男性にも、珍しくない",
    why: "包茎は、包皮（亀頭をおおう皮）が亀頭にかぶさっている状態の総称です。手でむける『仮性』、むきにくい・むけない『真性』、むいた包皮が戻らず締めつける『嵌頓（かんとん）』に大きく分けられます。多くは病気ではなく状態の程度の問題ですが、炎症を繰り返す・排尿や清潔に支障がある・嵌頓は、医療の対象になります。つまり『見た目や気持ちの悩み』と、『医療的に対処が要る状態』は別もの。まずはそこを分けて捉えると、必要以上に不安にならずに済みます。",
    accent: "#8A5A2B",
    accentSoft: "#F3ECE1",
  },
  {
    id: "libido",
    territory: "libido",
    categories: [],
    ja: "性欲の低下",
    en: "Low Libido",
    mechanism: "性欲はホルモン・心理・関係・体調の総合。単一の原因ではない。",
    system: "テストステロン / 心理 / 睡眠",
    worry: "以前ほど、その気になれない",
    stat: "加齢やストレスで、誰にでも起こりうる",
    why: "性欲（性的な欲求）は、テストステロンなどのホルモン、睡眠・疲労・ストレス、パートナーとの関係、薬や持病といった複数の要素の総合で上下します。加齢でテストステロンがゆるやかに下がることもあれば、うつや睡眠不足、飲酒・喫煙、一部の薬が影響することもある。『意欲や気合いの問題』と片づけず、体・心・生活のどこが効いているかを分けて見ると、対処の見当がつきます。テストステロンの大幅な低下（LOH症候群）のように、医療で扱う領域が混じることもあります。",
    accent: "#9D2E5C",
    accentSoft: "#F7E7EE",
  },
  {
    id: "fertility",
    territory: "fertility",
    categories: [],
    ja: "男性不妊",
    en: "Male Fertility",
    mechanism: "不妊の原因の約半分は男性側。多くは精子をつくる・運ぶ過程の問題。",
    system: "精子 / ホルモン / 精路",
    worry: "妊活が、なかなか進まない",
    stat: "不妊の原因の、およそ半分は男性側",
    why: "不妊の原因は、女性側だけでなく男性側にもあり、割合はおよそ半分ずつといわれます。男性側の多くは、精子をつくる過程（造精機能）、精子が通る道（精路）、射精のいずれかの問題です。精索静脈瘤、ホルモンの乱れ、精路の閉塞、生活習慣や熱・薬の影響などが関わります。特徴は、見た目や自覚症状が乏しく、精液検査ではじめて分かることが多いこと。だから『調べてみる』こと自体が、いちばん確実な最初の一歩になります。",
    accent: "#2F6D5B",
    accentSoft: "#E3F0EC",
  },
];

export function complexByTerritory(territory: string): Complex | undefined {
  return complexes.find((c) => c.territory === territory);
}

export function complexByCategory(category: string): Complex | undefined {
  return complexes.find((c) => c.categories.includes(category));
}

export function complexById(id: string): Complex | undefined {
  return complexes.find((c) => c.id === id);
}
