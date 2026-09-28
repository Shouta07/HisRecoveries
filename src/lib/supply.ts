import { dbSelect, dbAdminEnabled } from "@/lib/db";

// いま、売っていい状態か。
//
// ══════════════════════════════════════════════════
// 答えられる人がいないのに売らない
// ══════════════════════════════════════════════════
// 決済だけ通って、誰にも届かないのがいちばん悪い。
// 返金すれば済む話ではなく、その一度で信用が終わる。
//
// だから、条件に合う人が足りないあいだは、
// 買うボタンを出さずに「順番待ち」に切り替える。
//
// ══════════════════════════════════════════════════
// 「最短数分」を、事実でないうちは書かない
// ══════════════════════════════════════════════════
// 速さは、この製品のいちばんの売り。
// だからこそ、担保できないうちに書くと、そこが最初の嘘になる。
// 実績が出るまで、速さの文言は出さない。

/** 欲しい人数に対して、これだけいれば売ってよい */
export const SUPPLY_RATIO = 1.5;

export type Supply = {
  /** 設定が入っているか */
  configured: boolean;
  /** 条件を問わず、いま答えられる人 */
  online: number;
  /** 確認済みで、active な人 */
  verified: number;
  /** 売ってよいか */
  open: boolean;
  /** 速さを名乗ってよいか */
  canPromiseSpeed: boolean;
};

const EMPTY: Supply = {
  configured: false,
  online: 0,
  verified: 0,
  open: false,
  canPromiseSpeed: false,
};

/**
 * いまの供給を見る。
 *
 * need は1件あたりに要る人数。
 * online が need × SUPPLY_RATIO に届いていれば売ってよい。
 * ちょうど need 人しかいない状態で売ると、1人断られた時点で足りなくなる。
 */
export async function supply(need: number): Promise<Supply> {
  if (!dbAdminEnabled) return EMPTY;

  const now = new Date().toISOString();
  const rows = await dbSelect<{
    available: boolean;
    available_until: string | null;
    verified_age: boolean;
    avg_reply_minutes: number | null;
  }>(
    "responders?select=available,available_until,verified_age,avg_reply_minutes&active=eq.true",
  );

  const verified = rows.filter((r) => r.verified_age).length;
  const online = rows.filter(
    (r) => r.verified_age && r.available && (!r.available_until || r.available_until > now),
  ).length;

  // 速さを名乗ってよいのは、実際に測れているときだけ。
  const measured = rows
    .map((r) => r.avg_reply_minutes)
    .filter((n): n is number => typeof n === "number");
  const canPromiseSpeed =
    measured.length >= 5 && measured.reduce((a, b) => a + b, 0) / measured.length <= 15;

  return {
    configured: true,
    online,
    verified,
    open: online >= Math.ceil(need * SUPPLY_RATIO),
    canPromiseSpeed,
  };
}

/** 足りないときに画面へ出す言葉。ごまかさない */
export function shortMessage(s: Supply, need: number): string {
  if (!s.configured) return "いま受け付けの準備をしています。";
  if (s.verified === 0) {
    return "いま回答できる方を集めています。集まり次第、受け付けを始めます。";
  }
  return `いま答えられる方が${s.online}人です。${need}人にお届けするには足りないため、受け付けを止めています。`;
}

/* ── 公開の前に止めること ───────────────────────── */
{
  // ちょうどの人数で開けないこと。1人断られたら足りなくなる。
  if (SUPPLY_RATIO <= 1) {
    throw new Error("供給の余裕がありません（SUPPLY_RATIO は1より大きく）");
  }
  // 設定が無いときは、必ず閉じていること。
  if (EMPTY.open) throw new Error("設定が無いのに受け付けが開いています");
  if (EMPTY.canPromiseSpeed) throw new Error("実績が無いのに速さを名乗っています");
}
