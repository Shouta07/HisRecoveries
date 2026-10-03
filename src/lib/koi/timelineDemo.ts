import type { TimelineItem } from "./timeline";
import { toTimeline } from "./timeline";

/* トップに出す、ここまでの見本。
 *
 * 実在の誰かの記録ではない。札は、この部品の外で必ず付ける。
 *
 * ── 相談だけで終わらせない ──────────────────────
 * 相談 → 行動 → 結果 まで入れる。
 * 相談しか並んでいないと、相談サービスに見える。 */
export const DEMO_TIMELINE: TimelineItem[] = toTimeline([
  { episode_number: 1, title: "withでマッチ", next_action: null, created_at: "2026-09-20T10:00:00Z" },
  { episode_number: 2, title: "LINEを交換", next_action: null, created_at: "2026-09-24T10:00:00Z" },
  { episode_number: 3, title: "初めて電話した", next_action: "デートに誘う", created_at: "2026-09-26T10:00:00Z" },
  { episode_number: 4, title: "初デート", next_action: "お礼を送る", created_at: "2026-09-30T10:00:00Z" },
  { episode_number: 5, title: "2回目に誘うか話した", next_action: "水族館に誘う", created_at: "2026-10-02T10:00:00Z" },
  { episode_number: 6, title: "誘ってOKをもらった", next_action: "日程を決める", created_at: "2026-10-03T10:00:00Z" },
]);

/* ── 公開の前に止めること ───────────────────────── */
{
  if (DEMO_TIMELINE.length < 4) {
    throw new Error("見本が短すぎます（続いていることが伝わりません）");
  }
  /* 相談 → 行動 → 結果 が入っていること。
     相談しか並んでいないと、相談サービスに見える。 */
  const flat = DEMO_TIMELINE.map((x) => x.what).join(" ");
  if (!/話した/.test(flat)) throw new Error("見本に、相談が入っていません");
  if (!/誘っ|送っ|会っ|デート/.test(flat)) throw new Error("見本に、行動が入っていません");
  if (!/OK|もらった|決ま|返事/.test(flat)) throw new Error("見本に、結果が入っていません");

  // 最後は、次にやることが残っていること。
  if (!DEMO_TIMELINE[DEMO_TIMELINE.length - 1].next) {
    throw new Error("見本の最後に、次にやることが残っていません");
  }
}
