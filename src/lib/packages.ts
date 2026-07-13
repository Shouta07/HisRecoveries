// 改善プログラムは「第一印象改善パッケージ」1本に特化。
// 個別ページ /packages/[id] で内容・価格目安・中立の医療連携・付加価値を提示。
// （standard / highend は docs/_archive にアーカイブ）

export type ExperiencePackage = {
  id: string;
  name: string;
  /** short theme / subtitle */
  theme: string;
  tagline: string;
  /** 含まれるもの（順序） */
  steps: string[];
  duration: string;
  /** 価格目安 */
  price: string;
  forWhom: string;
  /** バッジ等のハイライト */
  highlights?: string[];
  /** 招待制フラグ（現在未使用。招待制ティアを再導入する場合のみ使用） */
  invitation?: boolean;
  /** このはじめ方“ならでは”の付加価値 */
  value: { t: string; d: string }[];
};

export const packages: ExperiencePackage[] = [
  {
    id: "first-impression",
    name: "第一印象改善パッケージ",
    theme: "専属チーム貸切 / 1日完結",
    tagline: "メイク・スタイリスト・カメラマンの専属チームが、あなた一人のために一日を設計する。第一印象を、まるごと。",
    steps: [
      "印象カウンセリング（似合うを言葉に）",
      "完全初心者向けメイク（施術＋自分で再現できるレッスン）",
      "服選び（プロが選ぶ一着・買い物同行）",
      "写真撮影（ビフォーアフター）",
    ],
    duration: "1日完結",
    price: "目安 ¥150,000〜",
    forWhom: "大事な日を控えた方へ。第一印象で外せない場面に。ギフトにも。",
    highlights: ["専属チーム貸切", "1日完結", "完全匿名", "ギフト可"],
    value: [
      { t: "専属チームを、一日貸切", d: "メイク・スタイリスト・カメラマンが、あなた一人のために。編成も進行も、こちらで。" },
      { t: "自分で探し回らない", d: "3業者を調べ、3回説明し、3回予約する——その手間を、窓口ひとつで肩代わり。" },
      { t: "人に知られない", d: "完全匿名で。恥ずかしい説明を、何度もしなくていい。実名・顔写真は不要。" },
      { t: "はじめてでも、外さない", d: "完全初心者向け。プロの目で、似合うを。自分で再現できるところまで。" },
    ],
  },
];

// 商品ラダー（PricingSection で提示）。パッケージ本体以外の入口・出口。
export const entryDiagnosis = {
  name: "印象診断セッション",
  price: "¥22,000",
  duration: "90分・オンライン可",
  note: "90分で、あなたの第一印象を要素に分解。何が印象をつくっているかを言葉にし、その場から使える「整える順番」をお渡しします。当日パッケージをお申し込みの場合、全額を代金に充当。",
};

// 内側の現在地（血液）。提携クリニックと仕込み中のため、価格・検査項目は
// サイトに一切出さない。ご案内は匿名相談から（docs/BLOOD_CHECK_DESIGN.md）。
export const bloodCheck = {
  name: "血液コンディション・チェック",
  status: "準備中",
  note: "悪いところを探す検査ではなく、現在地を知る検査。提携クリニックでの検査と、結果のあとの伴走まで。詳しいご案内は、匿名の無料相談から。",
};

export const giftOption = {
  name: "ギフト券",
  price: "¥165,000",
  duration: "有効期限6ヶ月",
  note: "大切な人へ。手紙を添えて。何をするかは受け取ったご本人が匿名で選べ、贈り主に内容は開示されません。",
};

export const urgentNote =
  "7日以内の実施をご希望の場合、緊急対応枠（+30%）でお受けできることがあります。";
