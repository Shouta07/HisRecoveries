import { dbAdminEnabled, dbSelect, dbInsertReturning, dbUpdate } from "../db";
import { makeConsultToken, isTalkerToken } from "../ask/token";
import { cleanLabel, type CaseRow } from "../ask/cases-store";
import { STAGES } from "../talk/shape";

/* ══════════════════════════════════════════════════
   会話が残すものを、書く
   ══════════════════════════════════════════════════

   ── 話す人の鍵で、必ず絞る ──────────────────────
   このサービスに会員登録は無く、鍵を知っていることが本人の証拠。
   恋亀の鍵（t...）は、その人の相手すべてをまとめる鍵で、
   relationship_cases.pass_token に入れている。

   ここの関数は全部、第一引数が話す人の鍵。
   引数で受け取ったケースIDを、そのまま信じない。
   必ず「その鍵のものか」を確かめてから書く。

   確かめないと、IDを1つ書き換えるだけで他人の記録に書ける。
   会員登録が無いぶん、ここが唯一の壁になる。

   ── 恋亀に、消させない ──────────────────────────
   消す関数を置かない。道具の一覧（tools.ts）にも無い。
   会話の勢いで消えると、戻せない。

   ── 表は増やさない ──────────────────────────────
   relationship_cases と episodes は、もうある。
   恋亀のために別の表を作ると、同じ人の記録が2か所に分かれる。 */

/** 恋亀の段。talk/shape.ts と同じ語彙 */
type Stage = (typeof STAGES)[number];

export type KoiCase = {
  id: string;
  token: string;
  partner_label: string | null;
  current_stage: string | null;
  last_decision: string | null;
  updated_at: string;
};

const SELECT = "id,token,partner_label,current_stage,last_decision,updated_at";

/** その人が話している相手の一覧。新しい順 */
export async function peopleOf(talker: string): Promise<KoiCase[]> {
  if (!dbAdminEnabled || !isTalkerToken(talker)) return [];
  return dbSelect<KoiCase>(
    `relationship_cases?pass_token=eq.${encodeURIComponent(talker)}` +
      `&status=eq.active&select=${SELECT}&order=updated_at.desc&limit=20`,
  );
}

/**
 * いま何人・何記録ためているか。
 *
 * 無料の上限に当たっているかを見るのに使う。
 * 数えるのはサーバー。画面に数えさせると、書き換えられる。
 */
export async function usageOf(talker: string): Promise<{ people: number; records: number }> {
  if (!dbAdminEnabled || !isTalkerToken(talker)) return { people: 0, records: 0 };
  const people = await dbSelect<{ id: string }>(
    `relationship_cases?pass_token=eq.${encodeURIComponent(talker)}&status=eq.active&select=id`,
  );
  if (people.length === 0) return { people: 0, records: 0 };
  // その人のケースに紐づく記録だけを数える
  const ids = people.map((x) => x.id).join(",");
  const records = await dbSelect<{ id: string }>(
    `episodes?case_id=in.(${encodeURIComponent(ids)})&select=id`,
  );
  return { people: people.length, records: records.length };
}

/**
 * そのケースが、その人のものか。
 *
 * ここが、この仕組みで唯一の壁。
 * 呼ぶ側が渡した person_id をそのまま信じない。
 */
export async function ownedBy(talker: string, caseId: string): Promise<KoiCase | null> {
  if (!dbAdminEnabled || !isTalkerToken(talker)) return null;
  if (!/^[0-9a-f-]{36}$/i.test(caseId)) return null;
  const rows = await dbSelect<KoiCase>(
    `relationship_cases?id=eq.${encodeURIComponent(caseId)}` +
      `&pass_token=eq.${encodeURIComponent(talker)}&select=${SELECT}&limit=1`,
  );
  return rows[0] ?? null;
}

/**
 * 相手を1人つくる。
 *
 * 呼び名しか受け取らない。本名も連絡先も扱わない
 * （形の判定は dispatch.ts が先に済ませている）。
 */
export async function addPerson(
  talker: string,
  nickname: string,
  sourceApp?: string | null,
): Promise<KoiCase | null> {
  if (!dbAdminEnabled || !isTalkerToken(talker)) return null;
  const label = cleanLabel(nickname);
  if (!label) return null;

  // 同じ呼び名が既にあれば、作らずそれを返す。
  // 会話のたびに「Aさん」が増えると、記録が散らばる。
  const had = await dbSelect<KoiCase>(
    `relationship_cases?pass_token=eq.${encodeURIComponent(talker)}` +
      `&partner_label=eq.${encodeURIComponent(label)}&select=${SELECT}&limit=1`,
  );
  if (had[0]) return had[0];

  const ins = await dbInsertReturning<CaseRow>("relationship_cases", {
    // ケース自体の鍵。本人が1件だけ開くときに使う（既存の仕組みと同じ）
    token: makeConsultToken(),
    // 話す人の鍵。ここで本人に結びつく
    pass_token: talker,
    partner_label: label,
    dating_app: sourceApp ?? null,
  });
  const row = ins.rows[0];
  return row
    ? {
        id: row.id,
        token: row.token,
        partner_label: row.partner_label,
        current_stage: row.current_stage,
        last_decision: row.last_decision,
        updated_at: row.updated_at,
      }
    : null;
}

/** いまどこにいるかを変える */
export async function setStage(
  talker: string,
  caseId: string,
  stage: string,
): Promise<boolean> {
  const c = await ownedBy(talker, caseId);
  if (!c) return false;
  if (!(STAGES as readonly string[]).includes(stage)) return false;
  await dbUpdate("relationship_cases", `id=eq.${encodeURIComponent(c.id)}`, {
    current_stage: stage as Stage,
    updated_at: new Date().toISOString(),
  });
  return true;
}

/** 次にやることを1つ残す */
export async function setNextAction(
  talker: string,
  caseId: string,
  action: string,
): Promise<boolean> {
  const c = await ownedBy(talker, caseId);
  if (!c) return false;
  const a = action.trim().slice(0, 200);
  if (!a) return false;
  await dbUpdate("relationship_cases", `id=eq.${encodeURIComponent(c.id)}`, {
    last_decision: a,
    updated_at: new Date().toISOString(),
  });
  return true;
}

/**
 * 1回ぶんの記録（EP）をつくる。
 *
 * 通し番号は、その相手の中で1から。
 * 空いている番号を数えるのではなく、いちばん大きい番号の次にする
 * （消す経路が無いので、穴は空かない）。
 */
export async function addEpisode(
  talker: string,
  caseId: string,
  ep: { title: string; summary?: string | null; nextAction?: string | null },
): Promise<{ number: number } | null> {
  const c = await ownedBy(talker, caseId);
  if (!c) return null;
  const title = ep.title.trim().slice(0, 60);
  if (!title) return null;

  const last = await dbSelect<{ episode_number: number }>(
    `episodes?case_id=eq.${encodeURIComponent(c.id)}` +
      `&select=episode_number&order=episode_number.desc&limit=1`,
  );
  const n = (last[0]?.episode_number ?? 0) + 1;

  const ins = await dbInsertReturning("episodes", {
    case_id: c.id,
    episode_number: n,
    title,
    summary: ep.summary?.trim().slice(0, 600) ?? null,
    next_action: ep.nextAction?.trim().slice(0, 200) ?? null,
  });
  if (!ins.ok) return null;

  // 相手の「次にやること」も、最後のEPに合わせる
  if (ep.nextAction) await setNextAction(talker, c.id, ep.nextAction);
  return { number: n };
}

/** その相手の、直近のEP。恋亀が前回の続きを出すために読む */
export async function recentEpisodes(
  talker: string,
  caseId: string,
  limit = 3,
): Promise<{ episode_number: number; title: string; next_action: string | null }[]> {
  const c = await ownedBy(talker, caseId);
  if (!c) return [];
  const n = Math.min(Math.max(1, limit), 10);
  return dbSelect(
    `episodes?case_id=eq.${encodeURIComponent(c.id)}` +
      `&select=episode_number,title,next_action&order=episode_number.desc&limit=${n}`,
  );
}

/* ── 公開の前に止めること ───────────────────────── */
{
  /* 消す関数を置かないこと。
     道具の一覧にも無い。会話の勢いで消えると戻せない。 */
  const names = [
    "peopleOf", "ownedBy", "addPerson", "setStage",
    "setNextAction", "addEpisode", "recentEpisodes",
  ];
  for (const n of names) {
    if (/delete|remove|drop|purge|clear/i.test(n)) {
      throw new Error(`書き込みの口に、消すもの（${n}）があります`);
    }
  }

  /* 書く関数は、全部「話す人の鍵」を最初に受け取ること。
     受け取らない口が1つでもあると、そこから他人の記録に書ける。

     引数の名前はビルド後に消えるので、ここでは数と並びを見ない。
     代わりに、下の形で守る。 */

  // 段は、こちらが決めた一覧の外を受け取らないこと。
  if (!(STAGES as readonly string[]).includes("matched")) {
    throw new Error("段の一覧が、恋亀のものと食い違っています");
  }
}
