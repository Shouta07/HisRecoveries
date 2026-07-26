// Curation: per-complex references/citations. Neutral — always attribute the
// source and link out; never present as our own, never endorse one clinic.
//
// 現状: 中立な医学情報源（MSDマニュアル家庭版）の該当ページを「参考・出典リンク」
// として掲載。verbatim の引用文（quote）は、原文ページを確認のうえ後から追加可能。
//   - quote を入れると、その文を「」付きの引用として表示。
//   - quote が無ければ、source + note の「参考リンク」として表示。
//
// ルール（docs/CURATION_PLAYBOOK.md）: 短い抜粋・改変しない・出典明記・
// 体験談ではなくメカニズム・特定院に偏らせない。

export type Citation = {
  /** 出典名（権威・公的を優先） */
  source: string;
  /** 元ページの正規URL（別タブ・nofollow） */
  url: string;
  /** リンク先ページの内容を表す中立な一言（quote が無いとき表示） */
  note?: string;
  /** 原文からの短い抜粋（確認済みのときのみ。「」付きで表示） */
  quote?: string;
};

const MSD = "MSDマニュアル家庭版";

export const citationsByComplex: Record<string, Citation[]> = {
  hair: [
    {
      source: MSD,
      url: "https://www.msdmanuals.com/ja-jp/home/17-%E7%9A%AE%E8%86%9A%E3%81%AE%E7%97%85%E6%B0%97/%E6%AF%9B%E9%AB%AA%E3%81%AE%E7%97%85%E6%B0%97/%E8%84%B1%E6%AF%9B%E7%97%87%EF%BC%88%E8%84%B1%E6%AF%9B%EF%BC%89",
      note: "脱毛症（男性型脱毛症を含む）の原因と仕組み",
    },
  ],
  skin: [
    {
      source: MSD,
      url: "https://www.msdmanuals.com/ja-jp/home/17-%E7%9A%AE%E8%86%9A%E3%81%AE%E7%97%85%E6%B0%97/%E3%81%AB%E3%81%8D%E3%81%B3%E3%81%A8%E9%96%A2%E9%80%A3%E7%96%BE%E6%82%A3/%E3%81%AB%E3%81%8D%E3%81%B3-%E3%81%96%E7%98%A1",
      note: "にきび（ざ瘡）の原因と仕組み",
    },
  ],
  // 顔の印象は適切な公的・中立の単一ソースが少ないため、原文（主）中心。順次追加。
  face: [],
  "body-hair": [
    {
      source: MSD,
      url: "https://www.msdmanuals.com/ja-jp/home/17-%E7%9A%AE%E8%86%9A%E3%81%AE%E7%97%85%E6%B0%97/%E6%AF%9B%E9%AB%AA%E3%81%AE%E7%97%85%E6%B0%97/%E5%A4%9A%E6%AF%9B",
      note: "多毛（体毛が濃くなる）の原因",
    },
  ],
  ed: [
    {
      source: MSD,
      url: "https://www.msdmanuals.com/ja-jp/home/21-%E7%94%B7%E6%80%A7%E3%81%AE%E5%81%A5%E5%BA%B7%E4%B8%8A%E3%81%AE%E5%95%8F%E9%A1%8C/%E7%94%B7%E6%80%A7%E3%81%AE%E6%80%A7%E6%A9%9F%E8%83%BD%E3%81%8A%E3%82%88%E3%81%B3%E6%80%A7%E6%A9%9F%E8%83%BD%E9%9A%9C%E5%AE%B3/%E5%8B%83%E8%B5%B7%E9%9A%9C%E5%AE%B3-ed",
      note: "勃起障害（ED）の原因・評価・生活習慣との関わり",
    },
  ],
  phimosis: [
    {
      source: MSD,
      url: "https://www.msdmanuals.com/ja-jp/home/21-%E7%94%B7%E6%80%A7%E3%81%AE%E5%81%A5%E5%BA%B7%E4%B8%8A%E3%81%AE%E5%95%8F%E9%A1%8C/%E9%99%B0%E8%8C%8E%E3%81%A8%E7%B2%BE%E5%B7%A3%E3%81%AE%E7%97%85%E6%B0%97/%E5%8C%85%E8%8C%8E%E3%81%A8%E5%B5%8C%E9%A0%93%E5%8C%85%E8%8C%8E",
      note: "包茎と嵌頓包茎の違い・注意点",
    },
  ],
  libido: [
    {
      source: MSD,
      url: "https://www.msdmanuals.com/ja-jp/home/21-%E7%94%B7%E6%80%A7%E3%81%AE%E5%81%A5%E5%BA%B7%E4%B8%8A%E3%81%AE%E5%95%8F%E9%A1%8C/%E7%94%B7%E6%80%A7%E3%81%AE%E6%80%A7%E6%A9%9F%E8%83%BD%E3%81%8A%E3%82%88%E3%81%B3%E6%80%A7%E6%A9%9F%E8%83%BD%E9%9A%9C%E5%AE%B3/%E7%94%B7%E6%80%A7%E3%81%AE%E6%80%A7%E6%AC%B2%E6%B8%9B%E9%80%80",
      note: "男性の性欲減退の原因（ホルモン・心理・薬など）",
    },
  ],
  fertility: [
    {
      source: MSD,
      url: "https://www.msdmanuals.com/ja-jp/home/22-%E5%A5%B3%E6%80%A7%E3%81%AE%E5%81%A5%E5%BA%B7%E4%B8%8A%E3%81%AE%E5%95%8F%E9%A1%8C/%E4%B8%8D%E5%A6%8A%E7%97%87%E3%81%8A%E3%82%88%E3%81%B3%E5%8F%8D%E5%BE%A9%E6%B5%81%E7%94%A3/%E7%B2%BE%E5%AD%90%E3%81%AE%E5%95%8F%E9%A1%8C",
      note: "精子の問題（男性不妊の要因）と検査・治療の考え方",
    },
  ],
};
