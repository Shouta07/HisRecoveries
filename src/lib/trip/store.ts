import { dbAdminEnabled, dbSelect, dbInsertReturning, dbUpdate } from "../db";
import { isTalkerToken } from "../token";
import { CITIES } from "../voice";
import { LEGS, type Leg } from "./log";

/* ══════════════════════════════════════════════════
   旅が残すものを、書く
   ══════════════════════════════════════════════════

   ── 旅人の鍵で、必ず絞る ────────────────────────
   このサービスに会員登録は無く、鍵を知っていることが本人の証拠。
   旅人の鍵（t...）が、その人の旅すべてをまとめる。

   ここの関数は全部、第一引数が旅人の鍵。
   引数で受け取った旅IDを、そのまま信じない。
   必ず「その鍵のものか」を確かめてから書く。

   確かめないと、IDを1つ書き換えるだけで他人の記録に書ける。
   会員登録が無いぶん、ここが唯一の壁になる。

   ── 消させない ──────────────────────────────────
   消す関数を置かない。旅の記録は、帰ってきてからのほうが
   値打ちが出る（半年後の自分と、次に行く人のため）。
   勢いで消えると、戻せない。

   ── 表は2つだけ ────────────────────────────────
   trips（旅1つ）と trip_records（1回の記録）。
   マチアプ版の relationship_cases / episodes は使わない。
   単位が相手から旅に変わったので、流用すると列の意味がずれる。 */

export type Trip = {
  id: string;
  token: string;
  city: string;
  depart_at: string;
  return_at: string;
  /** 直近で済んだこと */
  done: string | null;
  /** 次にやること。1つだけ */
  next_action: string | null;
  /** 次に話すときの「前回どこまで」 */
  summary: string | null;
  status: string;
  updated_at: string;
};

const SELECT =
  "id,token,city,depart_at,return_at,done,next_action,summary,status,updated_at";

/** その人の旅。新しい順 */
export async function tripsOf(talker: string): Promise<Trip[]> {
  if (!dbAdminEnabled || !isTalkerToken(talker)) return [];
  return dbSelect<Trip>(
    `trips?token=eq.${encodeURIComponent(talker)}` +
      `&status=eq.active&select=${SELECT}&order=depart_at.desc&limit=20`,
  );
}

/**
 * いま何旅・何記録ためているか。
 *
 * 無料の上限に当たっているかを見るのに使う。
 * 数えるのはサーバー。画面に数えさせると、書き換えられる。
 */
export async function usageOf(talker: string): Promise<{ trips: number; records: number }> {
  if (!dbAdminEnabled || !isTalkerToken(talker)) return { trips: 0, records: 0 };
  const trips = await dbSelect<{ id: string }>(
    `trips?token=eq.${encodeURIComponent(talker)}&status=eq.active&select=id`,
  );
  if (trips.length === 0) return { trips: 0, records: 0 };
  const ids = trips.map((x) => x.id).join(",");
  const records = await dbSelect<{ id: string }>(
    `trip_records?trip_id=in.(${encodeURIComponent(ids)})&select=id`,
  );
  return { trips: trips.length, records: records.length };
}

/**
 * その旅が、その人のものか。
 *
 * ここが、この仕組みで唯一の壁。
 * 呼ぶ側が渡した旅IDを、そのまま信じない。
 */
export async function ownedBy(talker: string, tripId: string): Promise<Trip | null> {
  if (!dbAdminEnabled || !isTalkerToken(talker)) return null;
  if (!/^[0-9a-f-]{36}$/i.test(tripId)) return null;
  const rows = await dbSelect<Trip>(
    `trips?id=eq.${encodeURIComponent(tripId)}` +
      `&token=eq.${encodeURIComponent(talker)}&select=${SELECT}&limit=1`,
  );
  return rows[0] ?? null;
}

/**
 * 旅を1つつくる。
 *
 * 受け取るのは都市と日程だけ。
 * 宿の名前も便名も持たない（伏せ字を通す前に届く場所を作らない）。
 */
export async function addTrip(
  talker: string,
  v: { city: string; departAt: string; returnAt: string },
): Promise<Trip | null> {
  if (!dbAdminEnabled || !isTalkerToken(talker)) return null;
  if (!(CITIES as readonly string[]).includes(v.city)) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v.departAt) || !/^\d{4}-\d{2}-\d{2}$/.test(v.returnAt)) {
    return null;
  }
  if (v.returnAt < v.departAt) return null;

  /* 同じ都市・同じ出発日の旅が既にあれば、作らずそれを返す。
     貼るたびに「バンコク」が増えると、記録が散らばる。 */
  const had = await dbSelect<Trip>(
    `trips?token=eq.${encodeURIComponent(talker)}` +
      `&city=eq.${encodeURIComponent(v.city)}` +
      `&depart_at=eq.${encodeURIComponent(v.departAt)}&select=${SELECT}&limit=1`,
  );
  if (had[0]) return had[0];

  const ins = await dbInsertReturning<Trip>("trips", {
    token: talker,
    city: v.city,
    depart_at: v.departAt,
    return_at: v.returnAt,
  });
  return ins.rows[0] ?? null;
}

/**
 * 読み取ったものを、まとめて保存する。
 *
 * ══════════════════════════════════════════════════
 * 空で上書きしない
 * ══════════════════════════════════════════════════
 * AIが返さなかった項目は null で来る。
 * そのまま入れると、前に分かっていたことが消える。
 *
 * 例：今回は宿の話しかしなかった回で、
 *     前回決めた「空港→宿の移動手段を決める」が消える。
 */
export async function applyTrip(
  talker: string,
  tripId: string,
  v: { done?: string | null; nextAction?: string | null; summary?: string | null },
): Promise<boolean> {
  const t = await ownedBy(talker, tripId);
  if (!t) return false;

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  const put = (k: string, x: string | null | undefined) => {
    if (typeof x === "string" && x.trim()) patch[k] = x.trim().slice(0, 300);
  };
  put("done", v.done);
  put("next_action", v.nextAction);
  put("summary", v.summary);

  await dbUpdate("trips", `id=eq.${encodeURIComponent(t.id)}`, patch);
  return true;
}

/** 1回ぶんの記録。旅程のどこかに付く */
export async function addRecord(
  talker: string,
  tripId: string,
  v: { leg: Leg; what: string; occurredOn?: string | null },
): Promise<{ number: number } | null> {
  const t = await ownedBy(talker, tripId);
  if (!t) return null;
  if (!(LEGS as string[]).includes(v.leg)) return null;
  const what = v.what.trim().slice(0, 200);
  if (!what) return null;

  const last = await dbSelect<{ record_number: number }>(
    `trip_records?trip_id=eq.${encodeURIComponent(t.id)}` +
      `&select=record_number&order=record_number.desc&limit=1`,
  );
  const n = (last[0]?.record_number ?? 0) + 1;

  const ins = await dbInsertReturning("trip_records", {
    trip_id: t.id,
    record_number: n,
    leg: v.leg,
    what,
    occurred_on: v.occurredOn ?? null,
  });
  if (!ins.ok) return null;
  return { number: n };
}

/** その旅の記録。古い順（旅程の順に読むため） */
export async function recordsOf(
  talker: string,
  tripId: string,
  limit = 50,
): Promise<{ record_number: number; leg: Leg; what: string; occurred_on: string | null }[]> {
  const t = await ownedBy(talker, tripId);
  if (!t) return [];
  const n = Math.min(Math.max(1, limit), 200);
  return dbSelect(
    `trip_records?trip_id=eq.${encodeURIComponent(t.id)}` +
      `&select=record_number,leg,what,occurred_on&order=record_number.asc&limit=${n}`,
  );
}

/* ── 公開の前に止めること ───────────────────────── */
{
  /* 消す口を置かないこと。
     旅の記録は、帰ってきてからのほうが値打ちが出る。 */
  const names = ["tripsOf", "usageOf", "ownedBy", "addTrip", "applyTrip", "addRecord", "recordsOf"];
  for (const n of names) {
    if (/delete|remove|drop|purge|clear/i.test(n)) {
      throw new Error(`書き込みの口に、消すもの（${n}）があります`);
    }
  }

  /* 旅程の段が、記録と同じ語彙であること。
     別に持つと、記録から情報へ移すときに落ちる。 */
  if (!(LEGS as string[]).includes("prep")) {
    throw new Error("旅程の段が、log.ts のものと食い違っています");
  }

  /* 対応していない都市の旅を、作れないこと。
     作れると「対応は3都市」と書いている1画面目が嘘になる。 */
  if (CITIES.length !== 3) {
    throw new Error(`対応都市が ${CITIES.length} 個あります（3つだけ）`);
  }
}
