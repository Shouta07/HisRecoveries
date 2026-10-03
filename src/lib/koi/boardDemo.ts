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
/* ── 日付を、固定で書かない ──────────────────────
   「2026-10-03」と書くと、見ている日によって
   「今日」が「120日前」になり、全部が止まってるになる。
   いまから何日前か、で持つ。 */
const DAY = 86400000;
const ago = (d: number) => new Date(Date.now() - d * DAY).toISOString();

export const DEMO_BOARD: BoardCard[] = toBoard([
  {
    id: "d1", partner_label: "Aさん", dating_app: "with",
    current_stage: "second_date_completed", last_decision: "水族館の日程を決める",
    recent: "向こうから水族館の提案が出た", records: 4,
    updated_at: ago(0),
  },
  {
    id: "d2", partner_label: "Bさん", dating_app: "tapple",
    current_stage: "messaging", last_decision: "20時以降で電話に誘う",
    recent: "夜なら電話できそう", records: 2,
    updated_at: ago(1),
  },
  {
    id: "d3", partner_label: "Cさん", dating_app: "pairs",
    current_stage: "messaging", last_decision: null,
    recent: "返信待ち", records: 1,
    updated_at: ago(3),
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
  /* 温度感が、1種類に偏っていないこと。
     全部「進んでる」だと、うまくいっている見本にしかならない。
     止まっている相手がいるのが、ふつうの状態。 */
  if (new Set(DEMO_BOARD.map((c) => c.heat)).size < 2) {
    throw new Error("見本の温度感が1種類しかありません");
  }
  /* 日付を固定で書いていないこと。
     見ている日によって「今日」が何か月も前になる。 */
  if (!DEMO_BOARD.some((c) => c.since === "今日")) {
    throw new Error("見本に、今日動いた相手がいません（日付を固定で書いていませんか）");
  }
  // 直近に何があったかが、全員に入っていること。
  for (const c of DEMO_BOARD) {
    if (!c.recent) throw new Error(`見本の${c.who}に、直近の出来事がありません`);
  }
  // 本名らしきものを出さないこと。
  for (const c of DEMO_BOARD) {
    if (!/^[A-Z]さん$/.test(c.who)) {
      throw new Error(`見本の呼び名「${c.who}」が、記号になっていません`);
    }
  }
}
