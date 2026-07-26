// Curation: 領域／記事ごとの出典。中立 — 必ず出典を明示して外部へリンクし、
// 自分たちの言葉のように見せない。特定の医療機関を推奨しない。
//
// ── 「引用」と「参考リンク」を型で区別する ─────────────────────────
// 著作権法32条の引用は「改変しない」ことが要件。したがって *原文を確認していない
// 引用文を載せることはできない*（うろ覚え・要約は改変にあたる）。
// そこで Citation を判別可能なユニオンにし、
//   - quote を書くなら verifiedAt（原文を確認した日）が必須
//   - verifiedAt が無ければ quote は書けない（型エラー）
// とすることで、「未確認の引用文」がコンパイル時に入り得ない状態にしている。
//
// quote が無いものは「参考リンク」として表示する（引用ではないので改変の問題が
// 生じない）。専門性の担保は、まず *出典の質* で行う: 公的機関・学会を優先。
//
// ルール（docs/CURATION_PLAYBOOK.md）:
//   短い抜粋・改変しない・出典明記・体験談ではなくメカニズム・特定院に偏らせない。
//   医療広告ガイドラインの観点から、効果や治療成果を語る文は引用しない。

/** 出典の種別。信頼度の優先順位: 公的機関・学会 > 医学情報 > 一般記事 */
export type CitationKind = "公的機関" | "学会" | "医学情報";

type CitationCore = {
  /** 出典名（権威・公的を優先） */
  source: string;
  /** 元ページの正規URL（別タブ・nofollow） */
  url: string;
  /** 出典の種別（UIにバッジで出し、読者が信頼度を判断できるようにする） */
  kind: CitationKind;
  /** リンク先ページの内容を表す中立な一言。効果断定を含めない */
  note: string;
};

/**
 * 出典。quote（原文からの短い抜粋）を持つ場合は、原文を確認した日
 * verifiedAt を必ず添える。確認していない引用文は型として表現できない。
 */
export type Citation =
  | (CitationCore & { quote?: never; verifiedAt?: never })
  | (CitationCore & { quote: string; verifiedAt: string });

const MSD = "MSDマニュアル家庭版";

// ── 出典マスター（領域横断で再利用する）──────────────────────────
// 学会・公的機関の一次情報を優先。医療者向けガイドラインも、
// 「どこまでが専門家の合意か」を読者が辿れるようにするために併記する。

const ED_MSD: Citation = {
  source: MSD,
  kind: "医学情報",
  url: "https://www.msdmanuals.com/ja-jp/home/21-%E7%94%B7%E6%80%A7%E3%81%AE%E5%81%A5%E5%BA%B7%E4%B8%8A%E3%81%AE%E5%95%8F%E9%A1%8C/%E7%94%B7%E6%80%A7%E3%81%AE%E6%80%A7%E6%A9%9F%E8%83%BD%E3%81%8A%E3%82%88%E3%81%B3%E6%80%A7%E6%A9%9F%E8%83%BD%E9%9A%9C%E5%AE%B3/%E5%8B%83%E8%B5%B7%E9%9A%9C%E5%AE%B3-ed",
  note: "勃起障害（ED）の原因・評価・生活習慣との関わり（一般向けの医学情報）",
};
const ED_JSSM: Citation = {
  source: "日本性機能学会・日本泌尿器科学会「ED診療ガイドライン［第3版］」",
  kind: "学会",
  url: "https://www.jssm.info/guideline/3rd.html",
  note: "EDの定義・診断・治療について、専門学会がまとめた医療者向けの診療ガイドライン",
};
const ED_MINDS: Citation = {
  source: "Mindsガイドラインライブラリ（日本医療機能評価機構）",
  kind: "公的機関",
  url: "https://minds.jcqhc.or.jp/summary/c00469/",
  note: "ED診療ガイドラインの第三者による収載ページ。ガイドラインの位置づけを確認できる",
};

const PHIMOSIS_MSD: Citation = {
  source: MSD,
  kind: "医学情報",
  url: "https://www.msdmanuals.com/ja-jp/home/21-%E7%94%B7%E6%80%A7%E3%81%AE%E5%81%A5%E5%BA%B7%E4%B8%8A%E3%81%AE%E5%95%8F%E9%A1%8C/%E9%99%B0%E8%8C%8E%E3%81%A8%E7%B2%BE%E5%B7%A3%E3%81%AE%E7%97%85%E6%B0%97/%E5%8C%85%E8%8C%8E%E3%81%A8%E5%B5%8C%E9%A0%93%E5%8C%85%E8%8C%8E",
  note: "成人を含む包茎と嵌頓包茎の違い・嵌頓が緊急とされる理由（一般向けの医学情報）",
};
const PHIMOSIS_JSPU: Citation = {
  source: "日本小児泌尿器科学会「包茎」",
  kind: "学会",
  url: "https://jspu.jp/ippan_011.html",
  note: "小児包茎の自然経過と、治療が検討される状態についての専門学会による一般向け解説",
};

const LIBIDO_MSD: Citation = {
  source: MSD,
  kind: "医学情報",
  url: "https://www.msdmanuals.com/ja-jp/home/21-%E7%94%B7%E6%80%A7%E3%81%AE%E5%81%A5%E5%BA%B7%E4%B8%8A%E3%81%AE%E5%95%8F%E9%A1%8C/%E7%94%B7%E6%80%A7%E3%81%AE%E6%80%A7%E6%A9%9F%E8%83%BD%E3%81%8A%E3%82%88%E3%81%B3%E6%80%A7%E6%A9%9F%E8%83%BD%E9%9A%9C%E5%AE%B3/%E7%94%B7%E6%80%A7%E3%81%AE%E6%80%A7%E6%AC%B2%E6%B8%9B%E9%80%80",
  note: "男性の性欲減退に関わる要因（ホルモン・心理・薬など／一般向けの医学情報）",
};
const LIBIDO_LOH: Citation = {
  source: "日本泌尿器科学会・日本Men's Health医学会「LOH症候群（加齢男性性腺機能低下症）診療の手引き」",
  kind: "学会",
  url: "https://www.urol.or.jp/lib/files/other/guideline/44_loh.pdf",
  note: "テストステロン低下と症状・診断の考え方をまとめた、専門学会による医療者向けの手引き（PDF）",
};
const LIBIDO_TYOJYU: Citation = {
  source: "健康長寿ネット（公益財団法人 長寿科学振興財団）",
  kind: "公的機関",
  url: "https://www.tyojyu.or.jp/net/topics/tokushu/koreisha-hinyokishikkan/LOHshokogun.html",
  note: "男性の性腺機能低下症（LOH症候群）についての一般向け解説",
};

const FERT_MSD: Citation = {
  source: MSD,
  kind: "医学情報",
  url: "https://www.msdmanuals.com/ja-jp/home/22-%E5%A5%B3%E6%80%A7%E3%81%AE%E5%81%A5%E5%BA%B7%E4%B8%8A%E3%81%AE%E5%95%8F%E9%A1%8C/%E4%B8%8D%E5%A6%8A%E7%97%87%E3%81%8A%E3%82%88%E3%81%B3%E5%8F%8D%E5%BE%A9%E6%B5%81%E7%94%A3/%E7%B2%BE%E5%AD%90%E3%81%AE%E5%95%8F%E9%A1%8C",
  note: "精子の問題（数・運動・形態）と検査の考え方（一般向けの医学情報）",
};
const FERT_JUA_GL: Citation = {
  source: "日本泌尿器科学会 編・日本生殖医学会 後援「男性不妊症診療ガイドライン 2024年版」",
  kind: "学会",
  url: "https://www.urol.or.jp/lib/files/other/guideline/52_male_infertility.pdf",
  note: "男性不妊症の診断・治療について、専門学会がまとめた医療者向けの診療ガイドライン（PDF）",
};
const FERT_JSRM_CAUSE: Citation = {
  source: "日本生殖医学会「生殖医療Q&A Q4．不妊症の原因にはどういうものがありますか？」",
  kind: "学会",
  url: "http://www.jsrm.or.jp/public/funinsho_qa04.html",
  note: "不妊症の原因と男性因子の位置づけについての、専門学会による一般向けQ&A",
};
const FERT_JSRM_TEST: Citation = {
  source: "日本生殖医学会「生殖医療Q&A Q7．不妊症の検査はどこで、どんなことをするのですか？」",
  kind: "学会",
  url: "http://www.jsrm.or.jp/public/funinsho_qa07.html",
  note: "不妊症の検査の流れと、精液検査の位置づけについての専門学会による一般向けQ&A",
};

/** 領域（ピラー）ごとの出典 */
export const citationsByComplex: Record<string, Citation[]> = {
  hair: [
    {
      source: MSD,
      kind: "医学情報",
      url: "https://www.msdmanuals.com/ja-jp/home/17-%E7%9A%AE%E8%86%9A%E3%81%AE%E7%97%85%E6%B0%97/%E6%AF%9B%E9%AB%AA%E3%81%AE%E7%97%85%E6%B0%97/%E8%84%B1%E6%AF%9B%E7%97%87%EF%BC%88%E8%84%B1%E6%AF%9B%EF%BC%89",
      note: "脱毛症（男性型脱毛症を含む）の原因と仕組み",
    },
  ],
  skin: [
    {
      source: MSD,
      kind: "医学情報",
      url: "https://www.msdmanuals.com/ja-jp/home/17-%E7%9A%AE%E8%86%9A%E3%81%AE%E7%97%85%E6%B0%97/%E3%81%AB%E3%81%8D%E3%81%B3%E3%81%A8%E9%96%A2%E9%80%A3%E7%96%BE%E6%82%A3/%E3%81%AB%E3%81%8D%E3%81%B3-%E3%81%96%E7%98%A1",
      note: "にきび（ざ瘡）の原因と仕組み",
    },
  ],
  // 顔の印象は適切な公的・中立の単一ソースが少ないため、原文（主）中心。順次追加。
  face: [],
  "body-hair": [
    {
      source: MSD,
      kind: "医学情報",
      url: "https://www.msdmanuals.com/ja-jp/home/17-%E7%9A%AE%E8%86%9A%E3%81%AE%E7%97%85%E6%B0%97/%E6%AF%9B%E9%AB%AA%E3%81%AE%E7%97%85%E6%B0%97/%E5%A4%9A%E6%AF%9B",
      note: "多毛（体毛が濃くなる）の原因",
    },
  ],
  ed: [ED_MSD, ED_JSSM, ED_MINDS],
  phimosis: [PHIMOSIS_MSD, PHIMOSIS_JSPU],
  libido: [LIBIDO_MSD, LIBIDO_LOH, LIBIDO_TYOJYU],
  fertility: [FERT_MSD, FERT_JUA_GL, FERT_JSRM_CAUSE, FERT_JSRM_TEST],
};

/**
 * クラスタ記事（/areas/[id]/[slug]）ごとの出典。
 * 記事は「出典明記」を掲げている以上、記事単位で出典を辿れる必要がある。
 * 未設定の記事は、領域（ピラー）の出典にフォールバックする。
 */
export const citationsByCluster: Record<string, Citation[]> = {
  // ED
  "ed-genin-wo-wakeru": [ED_MSD, ED_JSSM],
  "ed-chiryo-erabikata": [ED_JSSM, ED_MINDS, ED_MSD],
  // 包茎
  "hokei-shurui-chigai": [PHIMOSIS_MSD, PHIMOSIS_JSPU],
  "hokei-shujutsu-erabikata": [PHIMOSIS_MSD, PHIMOSIS_JSPU],
  // 性欲の低下
  "seiyoku-teika-genin": [LIBIDO_MSD, LIBIDO_LOH, LIBIDO_TYOJYU],
  "seiyoku-taio-erabikata": [LIBIDO_LOH, LIBIDO_TYOJYU, LIBIDO_MSD],
  // 男性不妊
  "dansei-funin-kiso": [FERT_JSRM_CAUSE, FERT_JUA_GL, FERT_MSD],
  "seieki-kensa-nagare": [FERT_JSRM_TEST, FERT_JUA_GL, FERT_MSD],
};

/** 記事ページで表示する出典（記事固有 → 無ければ領域のもの） */
export function citationsForCluster(areaId: string, slug: string): Citation[] {
  return citationsByCluster[slug] ?? citationsByComplex[areaId] ?? [];
}
