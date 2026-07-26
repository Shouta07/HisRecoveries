// パッケージ自動編成エンジン。
//
// 「都道府県 × 年齢 × やりたいこと」を入れると、
//   ① あなた用のパッケージ（モジュールの組み合わせ）
//   ② その立地に合わせた日程プラン（事前 → 当日 → 後日）
//   ③ 各ステップの読みもの（記事）
// を返す。相談・体験の前に「設計してもらえた感」を先に渡すのが目的。
//
// 完全に決定的（AI 呼び出しなし・クライアントで即時計算）。
// 価格・所要はすべて「目安」。確定は無料相談で、という建付けを崩さない。

/* ────────────────────────── 拠点 ────────────────────────── */

export type HubId = "tokyo" | "osaka" | "nagoya" | "fukuoka" | "sapporo" | "sendai" | "hiroshima";

export type Hub = {
  id: HubId;
  city: string;
  /** 編成のリードタイム（正直に出す） */
  lead: string;
};

export const hubs: Record<HubId, Hub> = {
  tokyo: { id: "tokyo", city: "東京", lead: "常設。最短2週間で編成できます。" },
  osaka: { id: "osaka", city: "大阪", lead: "編成に約3週間いただきます。" },
  nagoya: { id: "nagoya", city: "名古屋", lead: "編成に約3週間いただきます。" },
  fukuoka: { id: "fukuoka", city: "福岡", lead: "編成に約3週間いただきます。" },
  sapporo: { id: "sapporo", city: "札幌", lead: "出張チームでの編成。約4週間いただきます。" },
  sendai: { id: "sendai", city: "仙台", lead: "出張チームでの編成。約4週間いただきます。" },
  hiroshima: { id: "hiroshima", city: "広島", lead: "出張チームでの編成。約4週間いただきます。" },
};

/* ────────────────────────── 都道府県 ────────────────────────── */

export type RegionName =
  | "北海道・東北"
  | "関東"
  | "中部"
  | "近畿"
  | "中国・四国"
  | "九州・沖縄";

export type Prefecture = {
  id: string;
  name: string;
  region: RegionName;
  /** 最寄りの開催拠点 */
  hub: HubId;
  /** 拠点までの片道の目安（分）。0 = 拠点と同一県 */
  travel: number;
  /** 空路が現実的な場合 */
  air?: boolean;
};

export const prefectures: Prefecture[] = [
  // 北海道・東北
  { id: "hokkaido", name: "北海道", region: "北海道・東北", hub: "sapporo", travel: 0 },
  { id: "aomori", name: "青森県", region: "北海道・東北", hub: "sendai", travel: 210 },
  { id: "iwate", name: "岩手県", region: "北海道・東北", hub: "sendai", travel: 90 },
  { id: "miyagi", name: "宮城県", region: "北海道・東北", hub: "sendai", travel: 0 },
  { id: "akita", name: "秋田県", region: "北海道・東北", hub: "sendai", travel: 140 },
  { id: "yamagata", name: "山形県", region: "北海道・東北", hub: "sendai", travel: 70 },
  { id: "fukushima", name: "福島県", region: "北海道・東北", hub: "sendai", travel: 80 },
  // 関東
  { id: "ibaraki", name: "茨城県", region: "関東", hub: "tokyo", travel: 70 },
  { id: "tochigi", name: "栃木県", region: "関東", hub: "tokyo", travel: 60 },
  { id: "gunma", name: "群馬県", region: "関東", hub: "tokyo", travel: 70 },
  { id: "saitama", name: "埼玉県", region: "関東", hub: "tokyo", travel: 35 },
  { id: "chiba", name: "千葉県", region: "関東", hub: "tokyo", travel: 40 },
  { id: "tokyo", name: "東京都", region: "関東", hub: "tokyo", travel: 0 },
  { id: "kanagawa", name: "神奈川県", region: "関東", hub: "tokyo", travel: 30 },
  // 中部
  { id: "niigata", name: "新潟県", region: "中部", hub: "tokyo", travel: 120 },
  { id: "toyama", name: "富山県", region: "中部", hub: "tokyo", travel: 130 },
  { id: "ishikawa", name: "石川県", region: "中部", hub: "tokyo", travel: 150 },
  { id: "fukui", name: "福井県", region: "中部", hub: "osaka", travel: 110 },
  { id: "yamanashi", name: "山梨県", region: "中部", hub: "tokyo", travel: 90 },
  { id: "nagano", name: "長野県", region: "中部", hub: "tokyo", travel: 90 },
  { id: "gifu", name: "岐阜県", region: "中部", hub: "nagoya", travel: 25 },
  { id: "shizuoka", name: "静岡県", region: "中部", hub: "tokyo", travel: 60 },
  { id: "aichi", name: "愛知県", region: "中部", hub: "nagoya", travel: 0 },
  // 近畿
  { id: "mie", name: "三重県", region: "近畿", hub: "nagoya", travel: 50 },
  { id: "shiga", name: "滋賀県", region: "近畿", hub: "osaka", travel: 50 },
  { id: "kyoto", name: "京都府", region: "近畿", hub: "osaka", travel: 30 },
  { id: "osaka", name: "大阪府", region: "近畿", hub: "osaka", travel: 0 },
  { id: "hyogo", name: "兵庫県", region: "近畿", hub: "osaka", travel: 30 },
  { id: "nara", name: "奈良県", region: "近畿", hub: "osaka", travel: 45 },
  { id: "wakayama", name: "和歌山県", region: "近畿", hub: "osaka", travel: 70 },
  // 中国・四国
  { id: "tottori", name: "鳥取県", region: "中国・四国", hub: "osaka", travel: 150 },
  { id: "shimane", name: "島根県", region: "中国・四国", hub: "hiroshima", travel: 150 },
  { id: "okayama", name: "岡山県", region: "中国・四国", hub: "osaka", travel: 50 },
  { id: "hiroshima", name: "広島県", region: "中国・四国", hub: "hiroshima", travel: 0 },
  { id: "yamaguchi", name: "山口県", region: "中国・四国", hub: "fukuoka", travel: 60 },
  { id: "tokushima", name: "徳島県", region: "中国・四国", hub: "osaka", travel: 110 },
  { id: "kagawa", name: "香川県", region: "中国・四国", hub: "osaka", travel: 110 },
  { id: "ehime", name: "愛媛県", region: "中国・四国", hub: "osaka", travel: 180 },
  { id: "kochi", name: "高知県", region: "中国・四国", hub: "osaka", travel: 190 },
  // 九州・沖縄
  { id: "fukuoka", name: "福岡県", region: "九州・沖縄", hub: "fukuoka", travel: 0 },
  { id: "saga", name: "佐賀県", region: "九州・沖縄", hub: "fukuoka", travel: 40 },
  { id: "nagasaki", name: "長崎県", region: "九州・沖縄", hub: "fukuoka", travel: 100 },
  { id: "kumamoto", name: "熊本県", region: "九州・沖縄", hub: "fukuoka", travel: 50 },
  { id: "oita", name: "大分県", region: "九州・沖縄", hub: "fukuoka", travel: 90 },
  { id: "miyazaki", name: "宮崎県", region: "九州・沖縄", hub: "fukuoka", travel: 180 },
  { id: "kagoshima", name: "鹿児島県", region: "九州・沖縄", hub: "fukuoka", travel: 90 },
  { id: "okinawa", name: "沖縄県", region: "九州・沖縄", hub: "fukuoka", travel: 150, air: true },
];

export const REGION_ORDER: RegionName[] = [
  "北海道・東北",
  "関東",
  "中部",
  "近畿",
  "中国・四国",
  "九州・沖縄",
];

/** select の optgroup 用 */
export function prefecturesByRegion(): { region: RegionName; items: Prefecture[] }[] {
  return REGION_ORDER.map((region) => ({
    region,
    items: prefectures.filter((p) => p.region === region),
  }));
}

/* ────────────────────────── モジュール ────────────────────────── */

export type ModulePhase = "pre" | "day" | "post";

export type PlanModule = {
  id: string;
  name: string;
  /** 記事の紐付け先（/areas/{area}）。articles マップのキーと一致させる */
  area: string;
  phase: ModulePhase;
  /** 所要（分） */
  minutes: number;
  /** 目安価格（円）。0 = 無料 or 実費（医療機関へ直接） */
  price: number;
  priceNote?: string;
  /** 何をするか */
  what: string;
  /** なぜこの位置なのか */
  why: string;
  /** 「束ね方」の一文に並べる短句（順番の説明に使う） */
  flow?: string;
  /** 中立の医療連携（HR は施術しない・売らない） */
  medical?: boolean;
  /** オンラインで完結できる */
  online?: boolean;
};

// 配列の順序＝当日の並び順。「土台 → 個別 → 仕上げ（撮影）」。
export const planModules: PlanModule[] = [
  {
    id: "consult",
    name: "無料相談（匿名・15分）",
    area: "impression",
    phase: "pre",
    minutes: 15,
    price: 0,
    what: "カメラオフ・表示名なしでOK。現在地と、外せない場面を聞かせてください。",
    why: "ここで構成を確定します。売り込みはありません。",
    online: true,
  },
  {
    id: "counseling",
    name: "印象カウンセリング（似合うを言葉に）",
    area: "impression",
    phase: "pre",
    minutes: 90,
    price: 22000,
    priceNote: "パッケージお申し込みで全額充当",
    what: "第一印象を要素に分解し、あなたの「似合う」を言語化。当日の設計図をつくります。",
    why: "当日を迷わないために、先に言葉にしておきます。",
    online: true,
  },
  {
    id: "hair-medical",
    name: "薄毛の現在地チェック（提携先へ中立に橋渡し）",
    area: "hair",
    phase: "pre",
    minutes: 0,
    price: 0,
    priceNote: "紹介・情報提供は無料／診察費は医療機関へ直接",
    what: "セルフチェックのうえ、必要なら提携クリニックの診断へ。HR は施術しません。",
    why: "進行性なので、当日の前に現在地だけ先に押さえます。",
    flow: "薄毛の現在地を、先に押さえる",
    medical: true,
  },
  {
    id: "skin-medical",
    name: "肌の現在地チェック（提携先へ中立に橋渡し）",
    area: "skin",
    phase: "pre",
    minutes: 0,
    price: 0,
    priceNote: "紹介・情報提供は無料／診察費は医療機関へ直接",
    what: "炎症・乾燥・摩擦・跡を切り分け、医療が要る部分だけ提携先へ。",
    why: "跡と新しいものは分けて考えます。ケアの前に切り分けを。",
    flow: "肌は、医療が要る部分だけ切り分ける",
    medical: true,
  },
  {
    id: "hair-style",
    name: "髪型・眉を整える",
    area: "impression",
    phase: "day",
    minutes: 90,
    price: 25000,
    what: "顔立ちに合う髪型と眉に。自分で再現できる手入れの手順まで。",
    why: "印象がいちばん大きく動く土台。ここから始めます。",
    flow: "髪と眉で、土台を上げる",
  },
  {
    id: "skincare",
    name: "肌の下地づくり・スキンケア基礎",
    area: "skin",
    phase: "day",
    minutes: 60,
    price: 22000,
    what: "その日の仕上がりの下地を整え、毎日の手順を最小構成で決めます。",
    why: "髪の次に、肌の質感。ここが整うとメイクも服も効きます。",
    flow: "肌の質感を、整える",
  },
  {
    id: "makeup",
    name: "メンズメイク（施術＋再現レッスン）",
    area: "face",
    phase: "day",
    minutes: 90,
    price: 38000,
    what: "完全初心者向け。疲れ見え・くすみを整え、自分の手で再現できるところまで。",
    why: "土台が整ってから乗せると、やりすぎずに効きます。",
    flow: "その上に、最小限のメイクを乗せる",
  },
  {
    id: "bodyhair",
    name: "ヒゲ・体毛の方針づくり",
    area: "body-hair",
    phase: "day",
    minutes: 45,
    price: 15000,
    what: "整える／減らす／そのまま——目的から方針を決め、必要なら提携先の選択肢も中立に。",
    why: "正解はひとつではないので、目的から先に決めます。",
    flow: "ヒゲ・体毛は、目的から方針を決める",
  },
  {
    id: "styling",
    name: "服選び・買い物同行",
    area: "impression",
    phase: "day",
    minutes: 120,
    price: 45000,
    what: "サイズ感から。その場で着られる一式と、着回しの型を持ち帰ります。",
    why: "髪・肌が整ってから選ぶと、似合う服が変わります。",
    flow: "整った状態で、服を選ぶ",
  },
  {
    id: "photo",
    name: "撮影（ビフォーアフター／プロフィール）",
    area: "impression",
    phase: "day",
    minutes: 90,
    price: 45000,
    what: "整えた状態で撮影。プロフィールにそのまま使えるカットまで。",
    why: "最後に置くことで、その日の到達点が記録として残ります。",
    flow: "最後に撮影して、記録に残す",
  },
  {
    id: "mind",
    name: "睡眠・習慣の設計（オンライン）",
    area: "mind",
    phase: "post",
    minutes: 60,
    price: 18000,
    what: "睡眠を一定に、習慣は仕組みで。無理なく続く最小の設計を一緒に。",
    why: "内側が整うと、同じ見た目でも生き生きして見えます。",
    flow: "睡眠・習慣は、後日オンラインで並行して整える",
    online: true,
  },
  {
    id: "followup",
    name: "1ヶ月後の再現チェック（オンライン）",
    area: "impression",
    phase: "post",
    minutes: 30,
    price: 0,
    priceNote: "構成に含まれます",
    what: "自分の手で再現できているかを確認し、崩れているところだけ直します。",
    why: "その日だけで終わらせないための、最後の一手。",
    online: true,
  },
];

const moduleById = new Map(planModules.map((m) => [m.id, m]));
const moduleOrder = new Map(planModules.map((m, i) => [m.id, i]));

/* ────────────────────────── やりたいこと ────────────────────────── */

export type Goal = {
  key: string;
  label: string;
  /** 見出しに差し込む体言（「〜のためのパッケージ」に入る形） */
  short: string;
  /** 選択時に足されるモジュール */
  modules: string[];
};

export const goals: Goal[] = [
  { key: "clean", label: "清潔感を、底上げしたい", short: "清潔感の底上げ", modules: ["hair-style", "styling"] },
  { key: "photo", label: "写真・プロフィールをよくしたい", short: "写真・プロフィール", modules: ["hair-style", "makeup", "styling", "photo"] },
  { key: "hair", label: "髪・薄毛が気になる", short: "髪・薄毛", modules: ["hair-medical", "hair-style"] },
  { key: "skin", label: "肌・ニキビを整えたい", short: "肌・ニキビ", modules: ["skin-medical", "skincare"] },
  { key: "face", label: "老け見え・疲れ顔を変えたい", short: "老け見え・疲れ顔", modules: ["skincare", "makeup"] },
  { key: "bodyhair", label: "ヒゲ・体毛を、どうにかしたい", short: "ヒゲ・体毛", modules: ["bodyhair"] },
  { key: "clothes", label: "服の選び方が、わからない", short: "服選び", modules: ["styling"] },
  { key: "date", label: "婚活・デートに向けて", short: "婚活・デート", modules: ["hair-style", "styling", "photo"] },
  { key: "work", label: "仕事・面接・人前に出る場面で", short: "仕事の場面", modules: ["hair-style", "styling", "photo"] },
  { key: "mind", label: "睡眠・気分・習慣を整えたい", short: "睡眠・習慣", modules: ["mind"] },
];

// 自由記述からの拾い上げ。「書いたら組んでくれる」を成立させるための最小の読み取り。
const TEXT_RULES: { re: RegExp; occasion?: string; modules: string[] }[] = [
  { re: /結婚式|披露宴|二次会/, occasion: "結婚式・披露宴", modules: ["hair-style", "styling", "photo"] },
  { re: /婚活|マッチング|お見合い|デート|彼女/, occasion: "婚活・デート", modules: ["hair-style", "styling", "photo"] },
  { re: /面接|転職|就活|昇進|商談|営業|登壇|プレゼン/, occasion: "仕事の場面", modules: ["hair-style", "styling", "photo"] },
  { re: /同窓会|再会|久しぶり|帰省/, occasion: "人と会う予定", modules: ["hair-style", "styling"] },
  { re: /写真|プロフ|アイコン|撮影/, occasion: "写真を撮る", modules: ["photo"] },
  { re: /メイク|化粧/, modules: ["makeup"] },
  { re: /服|ファッション|私服|コーデ/, modules: ["styling"] },
  { re: /髪|ハゲ|はげ|薄毛|生え際|AGA|つむじ/, modules: ["hair-medical", "hair-style"] },
  { re: /肌|ニキビ|にきび|毛穴|吹き出物|乾燥/, modules: ["skin-medical", "skincare"] },
  { re: /ヒゲ|ひげ|髭|体毛|すね毛|脱毛/, modules: ["bodyhair"] },
  { re: /眉|まゆ/, modules: ["hair-style"] },
  { re: /睡眠|寝れ|眠れ|habits|習慣|疲れ|だるさ|気分/, modules: ["mind"] },
  { re: /老け|若見え|疲れ顔|くすみ|クマ/, modules: ["skincare", "makeup"] },
];

/** 相談で拾うべき、いまの提供範囲外のキーワード（黙って落とさず、正直に返す） */
const OUT_OF_SCOPE: { re: RegExp; note: string }[] = [
  { re: /痩せ|ダイエット|体型|筋トレ|ジム|体重/, note: "体型づくり（トレーニング・食事）は、いまのパッケージには含まれません。無料相談で、中立に提携先をご紹介できます。" },
  { re: /歯|矯正|ホワイトニング/, note: "歯の治療・矯正は医療です。パッケージには含めず、無料相談で提携先をご紹介します。" },
  { re: /整形|美容外科|手術|注射|ボトックス/, note: "施術は HR では行いません。必要な場合のみ、売らない立場で提携先の選択肢をお伝えします。" },
];

/* ────────────────────────── 年齢 ────────────────────────── */

export type AgeBand = {
  id: string;
  label: string;
  min: number;
  max: number;
  /** その年代でよく効く重心 */
  emphasis: string;
  /** 提案（自動では足さない） */
  suggest: string[];
};

export const ageBands: AgeBand[] = [
  {
    id: "teens",
    label: "10代",
    min: 0,
    max: 19,
    emphasis: "「型を覚える」ことに配点します。高いものを買うより、髪・眉・サイズ感の基本から。",
    suggest: ["skincare"],
  },
  {
    id: "20s",
    label: "20代",
    min: 20,
    max: 29,
    emphasis: "自分で再現できるところまでを厚めに。土台（髪・眉・服のサイズ感）で伸びしろが大きい年代です。",
    suggest: ["photo"],
  },
  {
    id: "30s",
    label: "30代",
    min: 30,
    max: 39,
    emphasis: "清潔感の底上げと、写真での見え方に配点。薄毛は「早く知るほど選べる幅が広い」時期です。",
    suggest: ["hair-medical", "skincare"],
  },
  {
    id: "40s",
    label: "40代",
    min: 40,
    max: 49,
    emphasis: "「若く見せる」より「疲れて見せない」。肌の質感と睡眠が、いちばん効きます。",
    suggest: ["skincare", "mind"],
  },
  {
    id: "50s+",
    label: "50代以上",
    min: 50,
    max: 200,
    emphasis: "品と清潔感に配点。髪・眉・肌の質感を整えるだけで、印象は静かに変わります。",
    suggest: ["skincare", "mind"],
  },
];

export function ageBandFor(age: number): AgeBand {
  return ageBands.find((b) => age >= b.min && age <= b.max) ?? ageBands[2];
}

/* ────────────────────────── 日程プラン ────────────────────────── */

export type PlanShape = "same-day" | "late-start" | "stay-over" | "two-day";

export type PlanSlot = {
  /** 時刻（当日のみ）。事前・後日は undefined */
  time?: string;
  title: string;
  note: string;
  /** 所要ラベル */
  dur?: string;
  medical?: boolean;
  online?: boolean;
};

export type PlanDay = {
  key: string;
  /** 「事前」「当日」など */
  label: string;
  /** 「オンライン」「東京」など */
  place: string;
  caption: string;
  slots: PlanSlot[];
};

export type PlanInput = {
  prefectureId: string;
  age: number;
  goalKeys: string[];
  /** やりたいこと（自由記述） */
  text?: string;
};

export type Plan = {
  prefecture: Prefecture;
  hub: Hub;
  band: AgeBand;
  shape: PlanShape;
  /** 見出し（構成名） */
  title: string;
  /** 束ね方の一文 */
  synthesis: string;
  /** 読み取った場面 */
  occasions: string[];
  modules: PlanModule[];
  days: PlanDay[];
  /** 当日の合計（分） */
  dayMinutes: number;
  priceFrom: number;
  /** 年代からの追加提案（構成に未採用のもの） */
  suggestions: PlanModule[];
  /** 記事を出す領域（重心順） */
  areas: string[];
  notes: string[];
};

function fmtTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}:${String(m).padStart(2, "0")}`;
}

export function formatYen(n: number): string {
  return `¥${n.toLocaleString("ja-JP")}`;
}

function durLabel(minutes: number): string {
  if (minutes >= 60 && minutes % 60 === 0) return `${minutes / 60}時間`;
  if (minutes > 60) return `${Math.floor(minutes / 60)}時間${minutes % 60}分`;
  return `${minutes}分`;
}

/** 当日枠を時刻に落とす（4時間を超えたら昼休憩を挟む） */
function layoutDay(mods: PlanModule[], startMin: number): PlanSlot[] {
  const slots: PlanSlot[] = [];
  let cursor = startMin;
  let lunched = false;
  for (const m of mods) {
    if (!lunched && cursor >= 12 * 60 && cursor < 14 * 60) {
      slots.push({ time: fmtTime(cursor), title: "昼休憩", note: "詰め込みません。ここで一度、力を抜きます。", dur: "60分" });
      cursor += 60;
      lunched = true;
    }
    slots.push({
      time: fmtTime(cursor),
      title: m.name,
      note: m.what,
      dur: durLabel(m.minutes),
      medical: m.medical,
    });
    cursor += m.minutes;
  }
  return slots;
}

export function composePlan(input: PlanInput): Plan {
  const prefecture =
    prefectures.find((p) => p.id === input.prefectureId) ?? prefectures.find((p) => p.id === "tokyo")!;
  const hub = hubs[prefecture.hub];
  const age = Number.isFinite(input.age) ? input.age : 30;
  const band = ageBandFor(age);
  const text = (input.text ?? "").trim();

  /* ── ① モジュールを集める ── */
  // 無料相談・カウンセリング・1ヶ月後フォローは、どの構成にも必ず入る骨格。
  const picked = new Set<string>(["consult", "counseling", "followup"]);
  const areaWeight = new Map<string, number>();

  const chosenGoals = goals.filter((g) => input.goalKeys.includes(g.key));
  for (const g of chosenGoals) g.modules.forEach((id) => picked.add(id));

  const occasions: string[] = [];
  const notes: string[] = [];
  if (text) {
    for (const rule of TEXT_RULES) {
      if (!rule.re.test(text)) continue;
      rule.modules.forEach((id) => picked.add(id));
      if (rule.occasion && !occasions.includes(rule.occasion)) occasions.push(rule.occasion);
    }
    for (const rule of OUT_OF_SCOPE) {
      if (rule.re.test(text) && !notes.includes(rule.note)) notes.push(rule.note);
    }
  }

  // 何も拾えなかったとき＝第一印象の基本形で組む（空の結果を返さない）。
  if (picked.size <= 3) ["hair-style", "styling", "photo"].forEach((id) => picked.add(id));

  // 写真を撮るなら、服と髪は前提として揃える（順番の整合性）。
  if (picked.has("photo")) {
    picked.add("hair-style");
    picked.add("styling");
  }

  const modules = planModules
    .filter((m) => picked.has(m.id))
    .sort((a, b) => (moduleOrder.get(a.id) ?? 0) - (moduleOrder.get(b.id) ?? 0));

  for (const m of modules) {
    areaWeight.set(m.area, (areaWeight.get(m.area) ?? 0) + 1);
  }

  /* ── ② 立地から日程の形を決める ── */
  const dayMods = modules.filter((m) => m.phase === "day");
  const dayMinutes = dayMods.reduce((s, m) => s + m.minutes, 0);
  const far = prefecture.travel >= 150;
  const mid = prefecture.travel >= 60 && prefecture.travel < 150;
  const splits = dayMinutes > 420;

  let shape: PlanShape;
  if (splits) shape = "two-day";
  else if (far) shape = "stay-over";
  else if (mid) shape = "late-start";
  else shape = "same-day";

  // 当日移動で間に合わない距離なら、開始を1時間うしろへ。
  const startMin = prefecture.travel < 60 ? 10 * 60 : 11 * 60;

  /* ── ③ 日程を組む ── */
  const days: PlanDay[] = [];

  const preMods = modules.filter((m) => m.phase === "pre");
  days.push({
    key: "pre",
    label: "事前",
    place: "オンライン（どこからでも）",
    caption: `${prefecture.name}からでも、ここまでは移動なしで進みます。`,
    slots: preMods.map((m) => ({
      title: m.name,
      note: m.what,
      dur: m.minutes ? durLabel(m.minutes) : "随時",
      medical: m.medical,
      online: m.online,
    })),
  });

  // 前泊の案内は「遠方のときだけ」。拠点と同じ県に前日移動は要らない。
  if (far) {
    days.push({
      key: "eve",
      label: "前日",
      place: `${hub.city}へ移動`,
      caption: prefecture.air
        ? `${prefecture.name}からは空路で。前泊すると、当日を朝から使えます（宿泊はご自身で手配／ご希望なら候補をお渡しします）。`
        : `${prefecture.name}から${hub.city}まで、片道およそ${durLabel(prefecture.travel)}。前泊すると、当日を朝から使えます。`,
      slots: [
        { title: "移動・前泊（任意）", note: "当日移動でも組めます。その場合は開始を遅らせて調整します。", dur: `片道 約${durLabel(prefecture.travel)}` },
      ],
    });
  }

  if (shape === "two-day") {
    // 7時間を超える構成は、2日に割る（詰め込まない）。
    const half = Math.ceil(dayMods.length / 2);
    const d1 = dayMods.slice(0, half);
    const d2 = dayMods.slice(half);
    days.push({
      key: "day1",
      label: "1日目",
      place: `${hub.city}（専属チーム）`,
      caption: "土台から。ここで髪・肌の質感まで整えます。",
      slots: layoutDay(d1, startMin),
    });
    days.push({
      key: "day2",
      label: "2日目",
      place: `${hub.city}（専属チーム）`,
      caption: "整った状態から、服と撮影へ。1日に詰めることもできます（相談で調整）。",
      slots: layoutDay(d2, 10 * 60),
    });
  } else {
    days.push({
      key: "day",
      label: "当日",
      place: `${hub.city}（専属チーム貸切）`,
      caption:
        shape === "same-day"
          ? `${prefecture.name}から${prefecture.travel === 0 ? "移動なしで" : `約${durLabel(prefecture.travel)}で`}。1日で完結します。`
          : `当日移動でも間に合う集合時間に。1日で完結します。`,
      slots: layoutDay(dayMods, startMin),
    });
  }

  const postMods = modules.filter((m) => m.phase === "post");
  days.push({
    key: "post",
    label: "後日",
    place: "オンライン",
    caption: "その日で終わらせないための、後半戦。",
    slots: [
      ...(picked.has("photo")
        ? [{ title: "写真のお渡し", note: "撮影データを、レタッチのうえお渡しします。", dur: "1週間以内", online: true }]
        : []),
      ...postMods.map((m) => ({
        title: m.name,
        note: m.what,
        dur: durLabel(m.minutes),
        online: m.online,
      })),
    ],
  });

  /* ── ④ 費用・束ね方・注記 ── */
  const priceFrom = modules.reduce((s, m) => s + m.price, 0);

  // モジュール順（＝整える順番）そのままを一文にする。
  const parts = modules.map((m) => m.flow).filter((f): f is string => Boolean(f));
  const synthesis =
    parts.length >= 2
      ? `${parts.join(" → ")}。この順番で組みました。土台から順に積むと、後の一手がよく効きます。`
      : parts.length === 1
        ? `まずは「${parts[0]}」に絞って組みました。あれもこれも、はやりません。`
        : "";

  const suggestions = band.suggest
    .filter((id) => !picked.has(id))
    .map((id) => moduleById.get(id))
    .filter((m): m is PlanModule => Boolean(m));

  if (age > 0 && age < 18) {
    notes.unshift("18歳未満の方は、保護者の同意のうえでご相談ください。医療に関わるご案内は特に慎重に扱います。");
  }
  notes.push(`${hub.city}での開催です。${hub.lead}`);
  if (prefecture.travel > 0) {
    notes.push(
      `${prefecture.name}から${hub.city}までの交通費・宿泊費はお客さま負担です。${hub.city}以外での出張開催をご希望の場合は、無料相談で個別にお見積りします。`,
    );
  }
  notes.push("価格・所要はすべて目安です。無料相談で構成を確定してから、正式なお見積りをお出しします。");
  if (modules.some((m) => m.medical)) {
    notes.push("His Recoveries は医療行為を行いません。診断・治療が要る部分は、売らない・中立の立場で提携先の選択肢をお伝えします。");
  }

  const areas = [...areaWeight.entries()].sort((a, b) => b[1] - a[1]).map(([a]) => a);

  const headline = occasions[0] ?? chosenGoals[0]?.short ?? "第一印象";
  const title = `${prefecture.name}・${age}歳／${headline}のためのパッケージ`;

  return {
    prefecture,
    hub,
    band,
    shape,
    title,
    synthesis,
    occasions,
    modules,
    days,
    dayMinutes,
    priceFrom,
    suggestions,
    areas,
    notes,
  };
}

/** 相談フォームにそのまま貼れる、プレーンテキスト版 */
export function planToText(plan: Plan, input: PlanInput): string {
  const lines: string[] = [];
  lines.push(`【${plan.title}】`);
  lines.push(`お住まい：${plan.prefecture.name} ／ 年齢：${input.age}歳 ／ 開催拠点：${plan.hub.city}`);
  const goalLabels = goals.filter((g) => input.goalKeys.includes(g.key)).map((g) => g.label);
  if (goalLabels.length) lines.push(`やりたいこと：${goalLabels.join("、")}`);
  if (input.text?.trim()) lines.push(`ご記入：${input.text.trim()}`);
  lines.push("");
  lines.push("■ 構成");
  plan.modules.forEach((m) => {
    lines.push(`・${m.name}（${m.minutes ? durLabel(m.minutes) : "随時"}／${m.price ? formatYen(m.price) : "無料・実費"}）`);
  });
  lines.push(`合計の目安：${formatYen(plan.priceFrom)}〜`);
  lines.push("");
  lines.push("■ 日程プラン");
  plan.days.forEach((d) => {
    lines.push(`[${d.label}｜${d.place}]`);
    d.slots.forEach((s) => lines.push(`  ${s.time ? `${s.time} ` : ""}${s.title}${s.dur ? `（${s.dur}）` : ""}`));
  });
  return lines.join("\n");
}
