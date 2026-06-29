// Curation: per-complex citations quoting what each clinic/authority writes.
// Neutral — always attribute the source and link out; never present as our own,
// never endorse one clinic over another.
//
// 記入方法: 各配列に { source, url, quote } を追加するだけで、
//   - ホームの「取り扱う領域」カード（先頭1件をプレビュー）
//   - 記事ページ /areas/[id]（全件）
// に自動反映されます。
//
// ルール（docs/CURATION_PLAYBOOK.md 参照）:
//   - quote は短い抜粋（1〜2文）。全文転載しない／改変しない。
//   - source は出典名、url は元記事の正規URL（別タブ・nofollowで表示）。
//   - 体験談ではなく「メカニズム・一般的知見」を引用（医療広告配慮）。
//   - 特定院に偏らせない。可能なら公的・学会を優先。

export type Citation = {
  /** clinic / authority name shown as attribution */
  source: string;
  /** canonical URL of the original article (opens in a new tab) */
  url: string;
  /** a short, fairly-used excerpt */
  quote: string;
};

export const citationsByComplex: Record<string, Citation[]> = {
  // 推奨出典: 日本皮膚科学会「男性型脱毛症診療ガイドライン」/ MSDマニュアル家庭版「男性型脱毛症」/ 専門クリニックの医師監修ページ
  hair: [],

  // 推奨出典: 日本皮膚科学会「原発性局所多汗症診療ガイドライン」/ MSDマニュアル「多汗症」「臭汗症」
  sweat: [],

  // 推奨出典: 日本皮膚科学会「尋常性痤瘡（ざ瘡）治療ガイドライン」/ MSDマニュアル「ざ瘡（にきび）」
  skin: [],

  // 推奨出典: 厚労省 e-ヘルスネット（睡眠など）/ 形成・美容皮膚科の医師監修ページ（印象の要素分解）
  face: [],

  // 推奨出典: 日本皮膚科学会「医療レーザー脱毛ガイドライン」/ アンドロゲン・毛周期に触れた皮膚科解説
  "body-hair": [],

  // 推奨出典: 厚労省「こころの情報サイト」/ MSDマニュアル「身体醜形症（BDD）」
  self: [],
};
