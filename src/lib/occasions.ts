// 人生シーン（Occasion）— サイトの入口。ジョブ理論（JTBD）で整理したもの。
//
// 男性が雇う仕事（Job）は「理想の自分になるために、必要な変化を最短距離で実現すること」。
// ただし「理想の男になりたい」という抽象的な欲求だけでは、人は財布を開かない。
// NEWT が「最高の人生を」ではなく「この日程で、この旅行を失敗なく」を解いているのと同じで、
// HR も 人生イベント × 男性改善 という具体の粒度で入る。
//
// だから各シーンは3層で持つ：
//   purpose   … 顧客が選ぶ言葉（叶えたいこと）
//   job       … その裏にある本当のJob（お金を払う理由）
//   obstacles … 表面的な悩み（What）＝現在の障害。診断へのブリッジになる
//
// ここは「顧客の言葉」の層。編成ロジック（planner.ts）は一切知らない —
// シーンが planner に渡すのは goalKeys / modules / ラベルという素のデータだけで、
// 依存の向きは occasions → planner の一方向に保つ（循環させない）。

export type OccasionId = "romance" | "bigday" | "work" | "family" | "restart";

export type Occasion = {
  id: OccasionId;
  /** 通し番号（カードの表示用） */
  no: string;
  /** 叶えたいこと（＝顧客が選ぶ言葉）。「〜たい」で書く */
  purpose: string;
  /** 本当のJob。表面的な悩みの下にある、お金を払う理由 */
  job: string;
  /** 表面的な悩み（What）＝現在の障害。Job と診断のあいだを埋める */
  obstacles: string[];
  /** カード見出し */
  title: string;
  /** カードの一行（なぜこのシーンでHRが効くのか） */
  lead: string;
  /** 具体例。ユーザーが「これは自分だ」と指させる粒度で */
  examples: string[];
  /** プランナーに引き継ぐ「やりたいこと」（planner.ts の goals.key） */
  goalKeys: string[];
  /** 構成に必ず入れるモジュール（planner.ts の planModules.id） */
  modules: string[];
  /** 構成名に使う見出し（例：「恋愛・出会いの場面のためのパッケージ」） */
  headline: string;
  /** 束ね方の冒頭に置く、シーン固有の一文 */
  flowLead: string;
  /** 「その日」の日付入力を出すか（締切から逆算できるシーンか） */
  dated: boolean;
  /** 日付入力のラベル */
  dateLabel?: string;
};

export const occasions: Occasion[] = [
  {
    id: "romance",
    no: "01",
    purpose: "恋愛で、選ばれる自分になりたい",
    job: "自信を持って、女性と向き合える自分になりたい。",
    obstacles: ["肌荒れ", "髪型", "服", "体型"],
    title: "選ばれる男に、なりたい",
    lead: "出会いは、加点より先に減点で決まります。まず減点をなくすところから。",
    examples: ["彼女が欲しい", "モテたい", "女性から選ばれたい", "婚活を成功させたい", "恋愛に自信を持ちたい"],
    goalKeys: ["clean", "date", "photo"],
    modules: ["hair-style", "styling", "photo"],
    headline: "恋愛・出会いの場面",
    flowLead: "出会いの場面は、減点をなくすことから。清潔感の土台をつくり、その上で写真とスタイリングを整えます。",
    dated: false,
  },
  {
    id: "bigday",
    no: "02",
    purpose: "大切な日に、最高の自分でいたい",
    job: "人生の節目で、最高の自分として記録を残したい。",
    obstacles: ["写真写り", "清潔感", "肌"],
    title: "あの日を、最高の自分で",
    lead: "写真は一生残ります。当日だけでは動かないものから、先に着手します。",
    examples: ["結婚式前", "プロポーズ前", "記念写真", "婚活写真"],
    goalKeys: ["photo", "clean", "skin"],
    modules: ["hair-style", "skincare", "styling", "photo"],
    headline: "人生の大切な日",
    flowLead: "その日は動かせません。だから、時間のかかるもの（肌・髪）から先に始め、服と撮影は最後に置きます。",
    dated: true,
    dateLabel: "その日は、いつですか",
  },
  {
    id: "work",
    no: "03",
    purpose: "仕事で、信頼されたい",
    job: "能力だけでなく、見た目でも信頼される人間になりたい。",
    obstacles: ["服装", "髪", "姿勢", "印象"],
    title: "第一印象で、信頼される",
    lead: "中身は、伝わる前に値踏みされます。疲れて見えることを、まず消します。",
    examples: ["プレゼン", "登壇", "営業", "昇進", "経営者として人前に出る"],
    goalKeys: ["work", "clean", "face"],
    modules: ["hair-style", "skincare", "styling", "photo"],
    headline: "仕事・人前の場面",
    flowLead: "人前に立つ日は、疲れ見えを消すのが最優先。そのうえで、写真は今後3年使える資産にします。",
    dated: true,
    dateLabel: "その日は、いつですか（任意）",
  },
  {
    id: "family",
    no: "04",
    purpose: "家族に、誇られる存在でいたい",
    job: "大切な人から、魅力的な存在であり続けたい。",
    obstacles: ["老け見え", "体型", "身だしなみ"],
    title: "誇られる、夫と父でいる",
    lead: "生活感は、直せます。毎日の型を決めて、考えなくても整っている状態に。",
    examples: ["妻にもう一度惚れ直されたい", "子供からかっこいい父親と言われたい", "家族に自信を持って向き合いたい"],
    goalKeys: ["clean", "face", "clothes"],
    modules: ["hair-style", "skincare", "styling", "photo"],
    headline: "家族・パートナー",
    flowLead: "特別な一日より、毎日の水準を上げます。自分で再現できる型まで持ち帰るのが目的です。",
    dated: false,
  },
  {
    id: "restart",
    no: "05",
    purpose: "もう一度、自分を好きになりたい",
    job: "昔の自分以上に、自分を好きになりたい。",
    obstacles: ["疲れ顔", "自信の低下", "習慣の崩れ"],
    title: "もう一度、自分を取り戻す",
    lead: "何から始めればいいか、分からなくて大丈夫です。効く順に、一つずつ。",
    examples: ["老けたと言われた", "昔より魅力が落ちた気がする", "人生の転機で変わりたい", "30代以降の自己投資"],
    goalKeys: ["face", "hair", "mind"],
    modules: ["hair-style", "skincare", "styling", "photo"],
    headline: "自分の再設計",
    flowLead: "一度きりで終わらせません。効く順に積んで、自分の手で再現できるところまでを一続きに設計します。",
    dated: false,
  },
];

export function occasionById(id: string | null | undefined): Occasion | undefined {
  if (!id) return undefined;
  return occasions.find((o) => o.id === id);
}
