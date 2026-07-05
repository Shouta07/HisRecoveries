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
};
