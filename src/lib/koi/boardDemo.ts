import type { BoardCard } from "./board";
import { toBoard } from "./board";

/* トップに出す、一覧の見本。
 *
 * ── 見本であることを隠さない ────────────────────
 * 実在の誰かの記録ではない。
 * 札（画面の見本です）は、この部品の外で必ず付ける。
 *
 * ── 複数アプリ・複数人であること ────────────────
 * ここが伝わらないと、ただの恋愛相談に見える。
 * アプリは必ず2つ以上、人は3人以上出す。
 *
 * ── 全員にやることがある状態にしない ────────────
 * 「待つ」と決めた人も入れる。
 * 全部にNEXTが付いていると、急かす道具に見える。 */
export const DEMO_BOARD: BoardCard[] = toBoard([
  {
    id: "d1", partner_label: "Aさん", dating_app: "with",
    current_stage: "second_date_completed", last_decision: "水族館の日程を決める",
    updated_at: "2026-10-03T10:00:00Z",
  },
  {
    id: "d2", partner_label: "Bさん", dating_app: "pairs",
    current_stage: "messaging", last_decision: "今夜、電話に誘う",
    updated_at: "2026-10-02T10:00:00Z",
  },
  {
    id: "d3", partner_label: "Cさん", dating_app: "tapple",
    current_stage: "first_date_scheduled", last_decision: "土曜の店を決める",
    updated_at: "2026-10-01T10:00:00Z",
  },
  {
    id: "d4", partner_label: "Dさん", dating_app: "with",
    current_stage: "messaging", last_decision: null,
    updated_at: "2026-09-28T10:00:00Z",
  },
]);

/* ── 公開の前に止めること ───────────────────────── */
{
  // 複数アプリであること。1つだと、横断していることが伝わらない。
  const apps = new Set(DEMO_BOARD.map((c) => c.app));
  if (apps.size < 2) {
    throw new Error(`見本のアプリが ${apps.size} 種類です（2つ以上）`);
  }
  // 複数人であること。
  if (DEMO_BOARD.length < 3) {
    throw new Error(`見本の相手が ${DEMO_BOARD.length} 人です（3人以上）`);
  }
  /* 全員にやることが付いていないこと。
     全部にNEXTがあると、急かす道具に見える。 */
  if (DEMO_BOARD.every((c) => c.next)) {
    throw new Error("見本の全員に、次にやることが付いています（待つ人も入れること）");
  }
  // 本名らしきものを出さないこと。
  for (const c of DEMO_BOARD) {
    if (!/^[A-Z]さん$/.test(c.who)) {
      throw new Error(`見本の呼び名「${c.who}」が、記号になっていません`);
    }
  }
}
