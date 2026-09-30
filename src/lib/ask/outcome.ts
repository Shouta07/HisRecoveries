import { dbRpc, dbSelect, dbAdminEnabled } from "../db";

// 実行した結果。
//
// ══════════════════════════════════════════════════
// 相談は「どう思いますか」で終わる
// ══════════════════════════════════════════════════
// 女性の反応を読んで、送るか送らないかを決めた。
// そのあと、実際に何が起きたか。
// そこまで持つと、次に相談するときの出発点が変わる。
//
//   持っていないとき  「はじめまして。いま27歳で、withで…」
//   持っているとき    「前回は追いLINEしないと決めて、翌日返信が来た」
//
// ══════════════════════════════════════════════════
// 任意にする
// ══════════════════════════════════════════════════
// 答えないまま放っておける。催促もしない。
// 必須にすると、次に相談するときの邪魔になる。
// ここで取りたいのは回収率ではなく、次の相談のための続きなので、
// 答えてくれた人のぶんだけで足りる。
//
// ══════════════════════════════════════════════════
// 良し悪しで並べない
// ══════════════════════════════════════════════════
// 「うまくいった／いかなかった」の2択にしない。
// 恋愛はそう割り切れないし、割り切らせると
// 「いかなかった」を選びたくないので答えなくなる。
// 起きた出来事を、そのまま並べる。
//
// ══════════════════════════════════════════════════
// 相手のことは持たない
// ══════════════════════════════════════════════════
// 相手が誰か、相手が実際に送ってきた文面は持たない。
// 相手はこのサービスに同意していない第三者。
// 持つのは、相談した本人から見た出来事だけ。

export type OutcomeId =
  | "replied"
  | "date_set"
  | "good"
  | "nothing"
  | "no_reply"
  | "other";

export const OUTCOMES: { id: OutcomeId; label: string }[] = [
  { id: "replied", label: "返信が来た" },
  { id: "date_set", label: "会う約束ができた" },
  { id: "good", label: "良い反応だった" },
  { id: "nothing", label: "特に変化なし" },
  { id: "no_reply", label: "返信がなかった" },
  { id: "other", label: "別の展開になった" },
];

export function isOutcomeId(x: unknown): x is OutcomeId {
  return typeof x === "string" && OUTCOMES.some((o) => o.id === x);
}

export function outcomeLabel(id: string): string {
  return OUTCOMES.find((o) => o.id === id)?.label ?? "教えてもらいました";
}

/** ひとことの長さ。長文を書かせない（書かせると誰も書かない） */
export const NOTE_MAX = 120;

/** 聞くときの一行 */
export const ASK_OUTCOME = "その後、どうなりましたか？";

/** なぜ聞くのか。理由を書かずに聞かない */
export const WHY_ASK =
  "次に相談するとき、ここから続けられます。答えなくても構いません。";

export type Outcome = { outcome: OutcomeId; note: string | null; createdAt: string };

type Row = { outcome: string; note: string | null; created_at: string };

/** その相談の結果。まだ教えてもらっていなければ null */
export async function outcomeOf(consultationId: string): Promise<Outcome | null> {
  if (!dbAdminEnabled) return null;
  const rows = await dbSelect<Row>(
    `case_events?consultation_id=eq.${encodeURIComponent(consultationId)}&select=outcome,note,created_at&limit=1`,
  );
  const r = rows[0];
  if (!r || !isOutcomeId(r.outcome)) return null;
  return { outcome: r.outcome, note: r.note, createdAt: r.created_at };
}

/**
 * 結果を書く。
 *
 * 書くのは schema.sql の record_outcome。
 * 二度押し・リロード・通信断のどれで来ても、1件しか作らない。
 * 相談IDは画面から受け取らない（他人の相談に書けてしまう）。
 */
export async function recordOutcome(
  token: string,
  outcome: OutcomeId,
  note: string | null,
): Promise<{ ok: boolean; why?: string }> {
  if (!dbAdminEnabled) return { ok: false, why: "no db" };
  if (!isOutcomeId(outcome)) return { ok: false, why: "知らない結果です" };

  const res = await dbRpc<{ ok: boolean; outcome: string | null; why: string | null }[]>(
    "record_outcome",
    {
      p_token: token,
      p_outcome: outcome,
      p_note: note ? note.trim().slice(0, NOTE_MAX) : null,
    },
  );
  if (!res.ok) return { ok: false, why: res.error };

  const row = Array.isArray(res.data) ? res.data[0] : undefined;
  if (!row) return { ok: false, why: "書けませんでした" };
  return { ok: Boolean(row.ok), why: row.why ?? undefined };
}

/* ── 公開の前に止めること ───────────────────────── */
{
  // 2択にしない。「うまくいった／いかなかった」だと、
  // いかなかった人が答えなくなって、残るのは良い話だけになる。
  if (OUTCOMES.length < 5) throw new Error("結果の選択肢が少なすぎます（5つ以上）");

  // 良し悪しの言葉を、選択肢に入れない。
  // 「成功」と書いた時点で、選ばなかった人は失敗したことになる。
  const JUDGING = /成功|失敗|勝ち|負け|うまくいった|ダメだった/;
  for (const o of OUTCOMES) {
    if (JUDGING.test(o.label)) {
      throw new Error(`結果の選択肢「${o.label}」が、良し悪しの判定になっています`);
    }
  }

  // 起きなかった側も、必ず選べること。
  // 良い結果だけ並べると、集まるのは良い結果だけになる。
  for (const must of ["no_reply", "nothing"] as OutcomeId[]) {
    if (!OUTCOMES.some((o) => o.id === must)) {
      throw new Error(`結果の選択肢から「${must}」が消えています（良い結果だけが残ります）`);
    }
  }

  // IDの重複。
  if (new Set(OUTCOMES.map((o) => o.id)).size !== OUTCOMES.length) {
    throw new Error("結果のIDが重複しています");
  }

  // 聞き方。理由を書かずに聞かない。
  // 何に使うのか分からないまま聞かれると、答える理由が無い。
  if (!WHY_ASK.includes("答えなくても")) {
    throw new Error("結果を聞く画面に、答えなくてよいことが書かれていません");
  }

  // 長文を書かせない。
  if (NOTE_MAX > 200) throw new Error("ひとことが長すぎます（書かせると誰も書きません）");
}
