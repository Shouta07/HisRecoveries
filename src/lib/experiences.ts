// 体験モジュールのレジストリ（拡張の“器”）。
//
// His Recoveries の構造：
//   メディア（Library）で集客 → 相談（悩みを聞く・匿名）を内包 → 体験がコア価値。
// 体験は「モジュール」。今は第一印象（外側）と血液（内側）から始め、
// 髪・肌・体・心へと順次拡張する。拡張は、この配列に1件足すだけで
// Service セクション／導線に反映される。
//
// UI 表示ポリシー：available / preparing のみ描画する。
// planned（構想中）は“器としての予約枠”で、UIには出さない
// （未実装の機能を売り物として出さないというガードレール）。

export type ExperienceStatus = "available" | "preparing" | "planned";

export type ExperienceModule = {
  id: string;
  /** 悩み領域との接続（/areas/{areaId}）。横断は undefined */
  areaId?: string;
  /** 現在地の軸（外側＝見た目 / 内側＝コンディション） */
  axis: "outer" | "inner";
  /** カード上の軸ラベル */
  axisLabel: string;
  /**
   * どの層への入口か（表には出さない設計タグ）。
   * now = 顕在層（いま困っている・動いているが迷子）
   * ahead = 潜在層（今は困っていないが、そろそろ／先手・予防）
   * 新モジュールは必ずどちらかを設定する。
   */
  layer: "now" | "ahead";
  /** カード冒頭の「誰へのものか」1行（layer を言葉にしたもの） */
  hook: string;
  /** 体験名（カード見出し） */
  name: string;
  /** ひとことで「何が受けられるか」 */
  summary: string;
  status: ExperienceStatus;
  /** 状態バッジ文言 */
  statusLabel: string;
  /** 出せる価格目安のみ（準備中・構想中は空） */
  price?: string;
  /** 遷移先（詳細ページ or 匿名相談） */
  href: string;
  /** カード下部のCTA文言 */
  cta: string;
};

export const experiences: ExperienceModule[] = [
  {
    id: "first-impression",
    areaId: "impression",
    axis: "outer",
    axisLabel: "外側から",
    layer: "now",
    hook: "「何から始めればいいか、分からない」——いま動きたい人に。",
    name: "第一印象パッケージ",
    summary:
      "メイク・服・写真のプロチームが、あなたの第一印象を一日で。入口は印象診断（¥22,000・お申し込みで全額充当）から。",
    status: "available",
    statusLabel: "提供中",
    price: "目安 ¥150,000〜",
    href: "/packages/first-impression",
    cta: "詳しく見る",
  },
  {
    id: "blood",
    areaId: "mind",
    axis: "inner",
    axisLabel: "内側から",
    layer: "ahead",
    hook: "「今は困っていない。でも、そろそろ」——先手を打ちたい人に。",
    name: "血液コンディション・チェック",
    summary:
      "悪いところ探しではなく、現在地を知る検査。数値の解釈は医師が、その後の伴走を私たちが。ご案内は無料相談から。",
    status: "preparing",
    statusLabel: "準備中",
    href: "/apply",
    cta: "案内は無料相談から",
  },

  // ── 拡張の予約枠（status: "planned"。UI 非表示）──────────────
  // 体験化が決まったら status を preparing → available に上げるだけ。
  // layer（now=顕在/ahead=潜在）と hook は提供決定時に確定させる。
  { id: "hair", areaId: "hair", axis: "outer", axisLabel: "外側から", layer: "now", hook: "", name: "髪の体験", summary: "", status: "planned", statusLabel: "構想中", href: "/apply", cta: "相談する" },
  { id: "skin", areaId: "skin", axis: "outer", axisLabel: "外側から", layer: "ahead", hook: "", name: "肌の体験", summary: "", status: "planned", statusLabel: "構想中", href: "/apply", cta: "相談する" },
  { id: "body", areaId: "body-hair", axis: "outer", axisLabel: "外側から", layer: "now", hook: "", name: "体の体験", summary: "", status: "planned", statusLabel: "構想中", href: "/apply", cta: "相談する" },
  { id: "mind", areaId: "mind", axis: "inner", axisLabel: "内側から", layer: "ahead", hook: "", name: "心・習慣の体験", summary: "", status: "planned", statusLabel: "構想中", href: "/apply", cta: "相談する" },
];

/** Service セクション等で描画してよい体験（提供中・準備中）。 */
export const visibleExperiences = experiences.filter(
  (e) => e.status === "available" || e.status === "preparing",
);

/** 領域IDから、その領域の“提供可能な”体験を引く（メディア→体験の結線用）。 */
export function experienceForArea(areaId: string): ExperienceModule | undefined {
  return experiences.find(
    (e) => e.areaId === areaId && (e.status === "available" || e.status === "preparing"),
  );
}
