// ── Accord 契約（Accord → 会員ビュー）───────────────────────────────
// Accord = His Recoveries / バイタリティデザインのコーディネーション基盤
// （システム・オブ・レコード）。相談・検査・施術・担当メモ・クリニックの
// 検査値などは、すべて Accord 側で発生する。会員アプリ(/member)は、この
// `Feed` を読み取って表示するだけ。顧客はここへ一切書き込まない。
//
// このファイルは「Accord が配信するデータの形」を型として固定する。
// 本番では下の FEED_* をモックではなく Accord API のレスポンスに差し替える
// （GET /api/member/feed → Feed）。設計は docs/ACCORD_PLATFORM_SPEC.md。

// 検査値（クリニック → Accord → 会員ビュー）。キーは Marker.key。
export type Bloods = Record<string, string>;

// dir: "up" = 範囲内で高いほどステータス高 / "down" = 低いほど高。
// short = レーダー軸の短縮名。cat = ヒント/ECの紐付けカテゴリ。
export type Marker = {
  key: string;
  label: string;
  short: string;
  unit: string;
  low: number;
  high: number;
  dir: "up" | "down";
  hint: string;
  cat: string;
};

// Accord が扱う検査項目の定義（＝クリニック連携で取り込む血液マーカー）。
export const MARKERS: Marker[] = [
  { key: "testosterone", label: "テストステロン", short: "活力", unit: "ng/dL", low: 250, high: 1100, dir: "up", hint: "活力・意欲に関わるとされる。睡眠・運動・体重管理が土台。", cat: "vitality" },
  { key: "ferritin", label: "フェリチン（鉄）", short: "鉄", unit: "ng/mL", low: 30, high: 300, dir: "up", hint: "低いと疲れやすさに関わることがある。鉄を含む食事を意識。", cat: "iron" },
  { key: "zinc", label: "亜鉛", short: "亜鉛", unit: "µg/dL", low: 80, high: 130, dir: "up", hint: "肌・髪・味覚に関わるとされる。牡蠣・赤身肉・ナッツなど。", cat: "zinc" },
  { key: "vitaminD", label: "ビタミンD", short: "ビタD", unit: "ng/mL", low: 30, high: 50, dir: "up", hint: "日光と食事で。骨・気分との関連が語られる。", cat: "vitd" },
  { key: "hba1c", label: "HbA1c", short: "血糖", unit: "%", low: 4.6, high: 5.5, dir: "down", hint: "高めは食事・運動の見直しの目安。甘い飲料を減らす。", cat: "metabo" },
  { key: "ldl", label: "LDLコレステロール", short: "脂質", unit: "mg/dL", low: 0, high: 120, dir: "down", hint: "高めは食事・運動の見直しの目安。", cat: "metabo" },
];

// 来訪の種類。物語（章）は、この来訪が完了することでのみ前に進む。
// 「オンライン診療」は提携クリニックの医師が HR プラットフォーム上で行う遠隔診療
// （HRは医療行為をしない＝場と仕組みだけを提供）。詳細は docs/ACCORD_PLATFORM_SPEC.md §5。
export type Kind = "相談" | "検査" | "診断" | "施術" | "メンテ" | "オンライン診療";

// 一回の来訪。Accord 側で、予約→実施→記録の流れの中で埋まっていく。
export type Visit = {
  id: string;
  kind: Kind;
  place: "オンライン" | "通院" | "来店";
  title: string;
  date: string;                 // 実施日 or 予定日（YYYY.MM.DD）
  status: "done" | "scheduled";
  by?: string;                  // クリニック / サロン / 担当
  note?: string;                // 担当（コーディネーター）からの一言
  bloods?: Bloods;              // 検査で得た数値（クリニック → Accord）
};

// 会員一人分の配信データ（Accord → /member）。
export type Feed = {
  goal: string;                 // 相談で把握した「なりたい自分」
  updatedAt: string;            // Accord 側の最終更新
  coordinator: string;          // 担当コーディネーター
  visits: Visit[];             // 時系列（古い→新しい）。done と scheduled が混在
};

// ── ステータス化（診断ではなく、ゲーム的な可視化）────────────────
export function markerScore(m: Marker, raw: string | undefined): number {
  if (raw === undefined || raw === "") return 0;
  const v = Number(raw);
  if (Number.isNaN(v)) return 0;
  const span = m.high - m.low || 1;
  const s = m.dir === "down" ? ((m.high - v) / span) * 100 : ((v - m.low) / span) * 100;
  return Math.max(0, Math.min(100, Math.round(s)));
}
export function rankOf(score: number): string {
  return score >= 90 ? "S" : score >= 75 ? "A" : score >= 60 ? "B" : score >= 45 ? "C" : score >= 30 ? "D" : "E";
}
export function overallOfBloods(v: Bloods): number {
  const scores = MARKERS.map((m) => markerScore(m, v[m.key]));
  return Math.round(scores.reduce((a, b) => a + b, 0) / MARKERS.length);
}

// ── デモ用モック（本番では Accord API のレスポンスに差し替える）──────
// 進行中の会員（相談→検査→診断→施術→2回目検査 まで完了、次はメンテ予定）。
export const FEED_ACTIVE: Feed = {
  goal: "自信を持って、人と会えるように",
  updatedAt: "2026.07.08",
  coordinator: "担当コーディネーター 佐々木",
  visits: [
    { id: "v1", kind: "相談", place: "オンライン", title: "はじめての相談", date: "2026.03.02", status: "done", by: "His Recoveries", note: "まず現在地を知ることから始めましょう、とお話ししました。" },
    { id: "v2", kind: "検査", place: "通院", title: "血液検査", date: "2026.03.10", status: "done", by: "提携クリニックA", note: "鉄と亜鉛がやや低め。まずは食事から、必要なら補い方も。", bloods: { testosterone: "420", ferritin: "38", zinc: "72", vitaminD: "22", hba1c: "5.6", ldl: "128" } },
    { id: "v3", kind: "診断", place: "来店", title: "印象診断", date: "2026.03.18", status: "done", by: "His Recoveries", note: "眉と肌の清潔感から。写真写りは、ここで大きく変わります。" },
    { id: "v4", kind: "施術", place: "来店", title: "眉・スキンケア導入", date: "2026.04.05", status: "done", by: "提携サロンB", note: "眉を整え、朝晩のケアを無理のない形で。" },
    { id: "v5", kind: "検査", place: "通院", title: "血液検査（2回目）", date: "2026.06.20", status: "done", by: "提携クリニックA", note: "鉄・亜鉛・ビタミンDが改善。表情の疲れも和らいできました。", bloods: { testosterone: "520", ferritin: "78", zinc: "95", vitaminD: "36", hba1c: "5.4", ldl: "118" } },
    { id: "v6", kind: "メンテ", place: "通院", title: "メンテナンス診察", date: "2026.07.25", status: "scheduled", by: "提携クリニックA", note: "変化を定着させる回。次の一手も一緒に決めましょう。" },
  ],
};

// まだ Accord に何も無い状態（相談前）。
export const FEED_EMPTY: Feed = { goal: "", updatedAt: "—", coordinator: "", visits: [] };
