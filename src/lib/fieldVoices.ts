// 現場の声（キュレーション）— 各領域で活躍する現場のプロが公開している
// 記事・コラムを、出典明記の「参考リンク＋中立な一言」で紹介する。
//
// 目的（docs/INTERVIEW_PROGRAM.md）:
//   紹介（恩を先に渡す）→ 連絡 → 取材 → 一次情報記事、の階段の1段目。
// ルール:
//   - 原文の長文転載はしない（リンク＋自分の言葉の紹介文のみ。引用する場合は短く・出典明記）
//   - ランキング・ベスト表記をしない（中立）
//   - 効果断定を含む紹介文を書かない（薬機法/景表法）
//   - 紹介後に本人へ連絡し、取材につなげる（連絡日・状態を status で管理）

export type FieldVoice = {
  /** 対象領域（areas の id: hair / skin / face / body-hair） */
  areaId: string;
  /** 業界ラベル（メンズメイク / スタイリング / 撮影 / 婚活 など） */
  industry: string;
  /** 書き手（活動名・肩書き） */
  author: string;
  /** 記事・コラムのタイトル */
  title: string;
  /** 元記事URL（別タブ・nofollow） */
  url: string;
  /** 中立な紹介文（自分の言葉で1〜2文。効果断定なし） */
  note: string;
  /** 取材ファネルの状態（サイトには表示しない・運用用） */
  status?: "curated" | "contacted" | "interview-scheduled" | "interviewed";
};

// 追加はここに。空の間は「現場の声」セクションは表示されない（壊れない）。
export const fieldVoices: FieldVoice[] = [];

export function fieldVoicesByArea(areaId: string): FieldVoice[] {
  return fieldVoices.filter((v) => v.areaId === areaId);
}
