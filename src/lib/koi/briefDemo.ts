import { briefFor } from "./brief";
import type { KoiCase } from "./store";

/* トップに出す、AIへ渡す文章の見本。
 *
 * 実際に出るものと同じ関数（briefFor）で作る。
 * 別に書くと、見せている文章と渡される文章がずれる。 */
const CASE: KoiCase = {
  id: "demo", token: "c", partner_label: "Aさん", dating_app: "with",
  current_stage: "second_date_completed",
  last_decision: "水族館の日程を決める",
  updated_at: new Date().toISOString(),
  today_action: null,
  waiting_on: "user",
  status_label: "2回目デート後",
  next_action_due: null,
  timeline_summary: "前回、水族館に行きたいと相手から話が出た。現在は日程未定。",
  last_contact_at: null,
  next_scheduled_event: null,
};

export const DEMO_BRIEF = briefFor(CASE).text;

/* ── 公開の前に止めること ───────────────────────── */
{
  if (!DEMO_BRIEF) throw new Error("見本の文章が空です");
  // 渡すものが分かること。呼び名・アプリ・段階・次が入っていること。
  for (const t of ["Aさん", "with", "2回目デート後", "水族館"]) {
    if (!DEMO_BRIEF.includes(t)) throw new Error(`見本に「${t}」が入っていません`);
  }
  // 相談の始まりにつながっていること。
  if (!DEMO_BRIEF.endsWith("今回の相談はここからです。")) {
    throw new Error("見本が、相談の始まりにつながっていません");
  }
}
