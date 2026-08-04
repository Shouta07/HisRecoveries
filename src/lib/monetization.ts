// 収益の開示と、記事内リンクの扱い。
//
// 方針は「認められているものは出す。認められていないものはゼロにする」。
// 線を引くのは分野ではなく、リンクの行き先。
//
//   ・非医療の物・サービス   … 成果報酬（アフィリエイト）を受け取る
//   ・医療機関への送客       … 受け取らない（医療広告ガイドライン）
//
// 医療広告規制は「誘引性 × 特定性」の2要件で成立する。
// 特定の医療機関名を出す時点で②特定性は避けられないので、
// ①誘引性——受診に誘導する対価——を持たないことがすべてになる。
// 送客に連動した報酬を受け取った瞬間、その記事は広告になり、
// 自由診療の費用・リスク・副作用の明示義務がかかる。いまの記事の型では満たせない。
//
// 受け取る側についても、書けば済む話ではない。
// 景表法のステマ規制（2023年10月〜）は「事業者の表示なのに、
// 第三者の感想に見えること」を禁じている。だから
//   ・記事の頭に、本文より先に見える形で告知する
//   ・リンクの隣に「広告」と出す
//   ・rel="sponsored" を付ける
// の3つを、データが入った時点で自動で満たすように組んである。

/** 記事内で紹介する物・サービスの区分 */
export type AdCategoryId =
  | "cosmetic"
  | "grooming"
  | "apparel"
  | "supplement"
  | "fitness"
  | "service"
  | "dating"
  | "medical"
  | "drug";

export type AdCategory = {
  id: AdCategoryId;
  label: string;
  /** 具体例。開示ページに出す */
  example: string;
  /** 成果報酬を受け取るか */
  paid: boolean;
  /** なぜそうしているか。一文で */
  reason: string;
};

export const AD_CATEGORIES: AdCategory[] = [
  {
    id: "cosmetic",
    label: "化粧品・スキンケア",
    example: "洗顔料、日焼け止め、シャンプー、育毛剤（医薬部外品）",
    paid: true,
    reason: "店頭で買えるものなので、受け取っても受診の判断に影響しません。",
  },
  {
    id: "grooming",
    label: "道具・美容家電",
    example: "シェーバー、眉用のはさみ、ドライヤー、光美容器",
    paid: true,
    reason: "同上。ただし効果ではなく、使い方と向き不向きだけを書きます。",
  },
  {
    id: "apparel",
    label: "服・靴・小物",
    example: "シャツ、革靴、眼鏡",
    paid: true,
    reason: "サイズと形の話なので、報酬の有無で書く内容が変わりません。",
  },
  {
    id: "supplement",
    label: "サプリ・保健機能食品",
    example: "ビタミン、亜鉛、プロテイン",
    paid: true,
    reason: "表示できる機能の範囲が決まっているので、その範囲だけを書きます。",
  },
  {
    id: "fitness",
    label: "運動・体づくり",
    example: "ジム、パーソナルトレーニング、家庭用の器具",
    paid: true,
    reason: "続けられるかどうかが要点で、そこは料金と場所で決まります。",
  },
  {
    id: "service",
    label: "学びと記録",
    example: "撮影、パーソナルカラー診断、オンライン講座、書籍",
    paid: true,
    reason: "医療にあたらないサービスです。",
  },
  {
    id: "dating",
    label: "出会いの場",
    example: "マッチングアプリ、結婚相談所",
    paid: true,
    reason: "土台と見た目が整ったあとの話としてのみ扱います。",
  },
  {
    id: "medical",
    label: "医療機関・オンライン診療",
    example: "美容クリニック、AGA外来、医療脱毛、歯科",
    paid: false,
    reason:
      "受診に連動した報酬を受け取ると、その記事は医療広告になります。ゼロにすることでしか、中立には書けません。",
  },
  {
    id: "drug",
    label: "医薬品",
    example: "内服薬、外用薬（一般用医薬品を含む）",
    paid: false,
    reason:
      "承認された効能効果の範囲でしか書けず、記事の書き方と両立しません。当面は扱いません。",
  },
];

const BY_ID = new Map(AD_CATEGORIES.map((c) => [c.id, c]));

export function adCategory(id: AdCategoryId): AdCategory {
  const c = BY_ID.get(id);
  if (!c) throw new Error(`未定義のカテゴリ: ${id}`);
  return c;
}

/**
 * 記事内で紹介する物・サービス。
 *
 * sponsored を任意にしていないのは、書き忘れを「広告ではない」と
 * 解釈させないため。省略できると、いちばん危ない側に倒れる。
 */
export type ProductRef = {
  /** 商品・サービス名 */
  name: string;
  /**
   * 何のための道具か。1〜2文。
   * 効能効果は書かない（薬機法66条は媒体側にもかかる）。
   * 「肌が変わる」ではなく「洗ったあとの突っ張りが気になる人向け」。
   */
  note: string;
  /** 販売ページ。実在を確認したものだけ */
  href: string;
  category: AdCategoryId;
  /** 成果報酬を受け取るリンクか */
  sponsored: boolean;
  /** 価格の目安。変動するので「約」を付けて書く。省略可 */
  price?: string;
};

/**
 * 広告の文体。ここに並ぶ言い回しが1つでも入ったら、ビルドを落とす。
 *
 * 「煽らない」を編集方針として書くだけなら、守れているかどうかは
 * 書いた本人の記憶に依存する。成果報酬が発生し始めたあと、
 * 締切に追われた誰かが「今だけ」と1回書いて、それが通る。
 * 通ってしまえば2回目からは前例になる。
 *
 * だから約束の側ではなく、機械の側に置く。
 * ここに引っかかる原稿は公開できない。例外の作り方も用意しない。
 *
 * 「限定」は「数量限定」等の中立な用法もあるが、区別を機械にさせると
 * 抜け道になるので、まとめて禁じる。必要なら言い換える。
 */
export const PROMO_WORDS = [
  "今だけ",
  "残りわずか",
  "限定",
  "お得",
  "激安",
  "最安",
  "キャンペーン",
  "セール",
  "特別価格",
  "初回無料",
  "人気No",
  "売れ筋",
  "ランキング1位",
  "おすすめ第",
  "圧倒的",
  "最強",
  "必ず",
  "絶対",
] as const;

/**
 * 広告の文体が混ざっていないかを確かめる。
 * 対象は読者が読む文字列だけ（URL や id は見ない）。
 */
export function assertNoPromoWords(texts: string[], where: string) {
  for (const t of texts) {
    const hit = PROMO_WORDS.find((w) => t.includes(w));
    if (hit) {
      throw new Error(
        `${where}: 広告の言い回し「${hit}」が入っています。判断を急がせる書き方はしません（該当箇所: ${t.slice(0, 40)}…）`,
      );
    }
  }
}

/**
 * 受け取れない区分に成果報酬が付いていないかを確かめる。
 * ビルド時に落とすのが目的なので、握りつぶさず投げる。
 */
export function assertProducts(products: ProductRef[], where: string) {
  for (const p of products) {
    if (p.sponsored && !adCategory(p.category).paid) {
      throw new Error(
        `${where}: 「${p.name}」は ${adCategory(p.category).label} なので成果報酬を受け取れません（sponsored: false にするか、リンクを外してください）`,
      );
    }
    if (!/^https?:\/\//.test(p.href)) {
      throw new Error(`${where}: 「${p.name}」のリンクが不正です（${p.href}）`);
    }
    assertNoPromoWords([p.name, p.note, p.price ?? ""], where);
  }
}

/**
 * 記事に成果報酬つきのリンクが1つでもあるか。
 * ここが true なら、本文より先に見える位置に告知を出す。
 */
export function hasSponsored(sections: { products?: ProductRef[] }[]): boolean {
  return sections.some((s) => s.products?.some((p) => p.sponsored));
}

/** リンクの rel。成果報酬なら sponsored を必ず付ける */
export function productRel(p: ProductRef): string {
  return p.sponsored
    ? "sponsored nofollow noopener noreferrer"
    : "nofollow noopener noreferrer";
}
