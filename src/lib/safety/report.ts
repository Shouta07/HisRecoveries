import { dbRpc, dbAdminEnabled } from "../db";
import { NEVER_ASK } from "../ask/sensitive";

// 通報。
//
// ══════════════════════════════════════════════════
// 書いたことと、できることを合わせる
// ══════════════════════════════════════════════════
// 「答える女性本人への性的な言動はできません」と書いてある。
// 書いてあるのに、出す口が無いなら、実際には黙認している。
//
// ══════════════════════════════════════════════════
// 録音しないぶん、ここで受ける
// ══════════════════════════════════════════════════
// 通話は録音していない（call/room.ts で設定ごと止めてある）。
// 録音しないことを、何が起きたか把握しないための
// 逃げ道にはしない。その場で出せる口を作る。
//
// ══════════════════════════════════════════════════
// 押した人が損をしない
// ══════════════════════════════════════════════════
// 通報しても、その回の報酬は引かない。
// 引くと、我慢したほうが得になる。
// 画面にもそう書く。書かないと、書いていないのと同じ。
//
// ══════════════════════════════════════════════════
// 理由を選ばせるが、選べなくても出せる
// ══════════════════════════════════════════════════
// 「その他」を必ず置く。
// 用意した箱に入らないことは、必ず起きる。

export type ReasonId =
  | "sexual"
  | "harassment"
  | "contact"
  | "meetup"
  | "threat"
  | "other";

export const REASONS: { id: ReasonId; label: string }[] = [
  { id: "sexual", label: "自分への性的な言動" },
  { id: "harassment", label: "不快な言い方・しつこい" },
  { id: "contact", label: "連絡先を聞かれた・渡された" },
  { id: "meetup", label: "外で会おうと言われた" },
  { id: "threat", label: "おどされた・怖かった" },
  { id: "other", label: "その他" },
];

export function isReasonId(x: unknown): x is ReasonId {
  return typeof x === "string" && REASONS.some((r) => r.id === x);
}

/** 画面に出す言葉 */
export const SAFETY = {
  open: "報告する",
  head: "何がありましたか",
  /** 押す前に、これを必ず読ませる */
  promise:
    "報告しても、この回の報酬は引かれません。通話はそのまま終えて構いません。",
  after: "受け取りました。こちらで確認します。無理に続けないでください。",
  /** 通話中、いつでも押せる場所にあること */
  duringCall: "この通話を終える",
};

export const NOTE_MAX = 300;

/** 通報を出す */
export async function fileReport(opts: {
  responderToken: string;
  consultationId?: string | null;
  callSessionId?: string | null;
  reason: ReasonId;
  note?: string | null;
}): Promise<{ ok: boolean; why?: string }> {
  if (!dbAdminEnabled) return { ok: false, why: "no db" };
  if (!isReasonId(opts.reason)) return { ok: false, why: "知らない理由です" };

  const res = await dbRpc<{ ok: boolean; why: string | null }[]>(
    "file_safety_report",
    {
      p_responder_token: opts.responderToken,
      p_consultation: opts.consultationId ?? null,
      p_call: opts.callSessionId ?? null,
      p_reason: opts.reason,
      p_note: opts.note ? opts.note.trim().slice(0, NOTE_MAX) : null,
    },
  );
  if (!res.ok) return { ok: false, why: res.error };
  const row = Array.isArray(res.data) ? res.data[0] : undefined;
  if (!row) return { ok: false, why: "受け取れませんでした" };
  return { ok: Boolean(row.ok), why: row.why ?? undefined };
}

/* ── 公開の前に止めること ───────────────────────── */
{
  // 「その他」が必ずあること。
  // 用意した箱に入らないことは、必ず起きる。
  if (!REASONS.some((r) => r.id === "other")) {
    throw new Error("通報の理由に「その他」がありません（入らないことは必ず起きます）");
  }

  // 規約で禁止していることに、出す口があること。
  //
  // sensitive.ts の NEVER_ASK に書いてあるのに、
  // ここに対応する理由が無いなら、書いてあるだけになる。
  const all = REASONS.map((r) => r.label).join("");
  for (const [must, where] of [
    ["性的", "性的な言動"],
    ["連絡先", "連絡先"],
    ["会", "外で会おうとすること"],
  ] as const) {
    if (!all.includes(must)) {
      throw new Error(`規約で禁止している「${where}」を、通報する口がありません`);
    }
  }
  // 規約のほうが消えていないことも見ておく。
  // あちらが消えると、ここだけ残って意味が分からなくなる。
  if (!NEVER_ASK.some((n) => n.includes("性的"))) {
    throw new Error("規約から、答える女性本人への性的な線が消えています");
  }

  // 報酬を引かないと、必ず書くこと。
  // 引かれると思っている人は、通報しない。
  if (!SAFETY.promise.includes("報酬は引かれません")) {
    throw new Error("通報の画面に、報酬が引かれないことが書かれていません");
  }
  // 続けなくてよいことも書く。
  if (!SAFETY.after.includes("無理に続けないで")) {
    throw new Error("通報のあとに、続けなくてよいことが書かれていません");
  }

  // 理由の数。少ないと「その他」ばかりになって、何が起きたか分からない。
  if (REASONS.length < 5) throw new Error("通報の理由が少なすぎます");

  // IDの重複。
  if (new Set(REASONS.map((r) => r.id)).size !== REASONS.length) {
    throw new Error("通報の理由のIDが重複しています");
  }
}
