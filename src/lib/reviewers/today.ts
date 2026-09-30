import { dbSelect, dbRpc, dbAdminEnabled } from "../db";
import { OPEN_CATEGORIES, category as getCategory, type CategoryId } from "../ask/model";

// 今日、受け付けている人。
//
// ══════════════════════════════════════════════════
// 「出勤」と呼ばない
// ══════════════════════════════════════════════════
// 受付中・本日の受付・次回受付。この言い方で通す。
// 「出勤」「在籍」「キャスト」「指名」は、
// 売っているものが人であるという前提の言葉。
//
// ここで売っているのは人ではなく、その人の反応。
// 言い方を1つ間違えると、来る人も、答える人も入れ替わる。
// 下の判定が、この語彙を機械で見張る。
//
// ══════════════════════════════════════════════════
// 無い数字は作らない
// ══════════════════════════════════════════════════
// 「受付中3人」は、本当に3人いるときだけ。
// 「平均18分」は、実績が十分にあるときだけ。
// 「あと2枠」は作らない（急がせるための数字になる）。
//
// 賑わって見せるために盛ると、来た人が最初に気づく。
// そして、気づいた人は二度と来ない。
//
// ══════════════════════════════════════════════════
// 0人のときに「0人」と叫ばない
// ══════════════════════════════════════════════════
// いま審査を通った人は0人。
// 「現在、受付中の女性はいません」とだけ書いた枠を
// トップに常設すると、来た全員に空っぽだと知らせることになる。
//
// 0人のときは、節ごと出さない（shouldShow）。
// 嘘はつかないが、空の棚をわざわざ見せもしない。
// 相談を書く画面まで進んだ人には、そこで正直に伝える。

export type Status = "available" | "busy" | "paused" | "offline";

export type Reviewer = {
  id: string;
  name: string;
  ageBand: string;
  status: Status;
  /** 得意だと言っている相談の種類 */
  specialties: CategoryId[];
  verified: boolean;
  /** 答えた件数。0なら出さない */
  answered: number;
  /** 受付の終わり。受付中のときだけ */
  until: string | null;
  /** 次に受け付ける時刻。いま受付中でないときだけ */
  nextAt: string | null;
};

type Row = {
  id: string;
  display_name: string | null;
  display_age_band: string;
  specialties: string[] | null;
  verified_age: boolean | null;
  verified_profile: boolean | null;
  answered_count: number | null;
  shift_ends_at: string | null;
  next_starts_at: string | null;
  status: string;
};

/** 画面に出す言葉。ここ以外で状態を日本語にしない */
export const STATUS_LABEL: Record<Status, string> = {
  available: "受付中",
  busy: "対応中",
  paused: "受付を止めています",
  offline: "本日の受付は終了",
};

/** 節の見出しと説明 */
export const TODAY = {
  head: "今日、タシカメできる人",
  lead: "受付中の人に、そのまま届きます。誰が読むかは、届くまで分かりません。",
  /** 受付中が0人のとき、相談を書く画面で出す */
  none: "いま受付中の人がいません。相談は送れます。受付が始まった順に届きます。",
};

/**
 * おまかせの説明。
 *
 * 「誰に当たるか」を楽しみにさせない。
 * 楽しみなのは、自分の場面を読んだ人から
 * どんな反応が返ってくるか。
 *
 * 人を引き当てる遊びにした時点で、答える側が品物になる。
 */
export const OMAKASE = {
  head: "誰が読むかは、届くまで分かりません。",
  body: "相談の内容に合う、受付中の人へ届けます。選ぶのはこちらです。",
  why: "返ってくるのは、用意された答えではなく、読んだ人が実際にどう感じたかです。",
};

/** JST で時刻だけ。保存は UTC、見せるのは日本時間 */
export function jstTime(iso: string): string {
  return new Intl.DateTimeFormat("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Tokyo",
  }).format(new Date(iso));
}

/** その人の、いまの一行 */
export function whenLabel(r: Reviewer): string {
  if (r.status === "available") {
    return r.until ? `${jstTime(r.until)} まで受付` : "受付中";
  }
  if (r.status === "busy") return "いま対応中";
  if (r.nextAt) return `${jstTime(r.nextAt)} から受付`;
  return STATUS_LABEL[r.status];
}

function toStatus(x: string): Status {
  return x === "available" || x === "busy" || x === "paused" ? x : "offline";
}

/** 今日の受付。受付中の人を先に、次に受付予定の人 */
export async function reviewersToday(limit = 8): Promise<Reviewer[]> {
  if (!dbAdminEnabled) return [];
  const rows = await dbSelect<Row>(
    "reviewer_status?select=id,display_name,display_age_band,specialties,verified_age,verified_profile,answered_count,shift_ends_at,next_starts_at,status&limit=40",
  );
  const open = new Set(OPEN_CATEGORIES.map((c) => c.id as string));

  return rows
    .map((r) => {
      const status = toStatus(r.status);
      return {
        id: r.id,
        // 呼び名が無ければ出さない。ここで勝手に名前を作らない
        name: (r.display_name ?? "").trim(),
        ageBand: r.display_age_band,
        status,
        // 受け付けていない種類は、得意として出さない（押した先が行き止まりになる）
        specialties: ((r.specialties ?? []) as string[]).filter((s) =>
          open.has(s),
        ) as CategoryId[],
        verified: Boolean(r.verified_age) && Boolean(r.verified_profile),
        answered: Number(r.answered_count ?? 0),
        until: status === "available" ? r.shift_ends_at : null,
        nextAt: status === "available" ? null : r.next_starts_at,
      };
    })
    .filter((r) => r.name.length > 0)
    .sort((a, b) => {
      const rank = (s: Status) =>
        s === "available" ? 0 : s === "busy" ? 1 : s === "paused" ? 2 : 3;
      return rank(a.status) - rank(b.status);
    })
    .slice(0, limit);
}

/**
 * この節を出すか。
 *
 * 受付中も、これから受付の人も1人もいないなら出さない。
 * 「現在0人です」という枠を常設すると、
 * 来た全員に、空っぽであることを知らせることになる。
 */
export function shouldShow(list: Reviewer[]): boolean {
  return list.some((r) => r.status !== "offline");
}

/** いま受け付けている人数。盛らない */
export function openNow(list: Reviewer[]): number {
  return list.filter((r) => r.status === "available").length;
}

/** 得意な種類の、画面に出す言い方 */
export function specialtyLabels(r: Reviewer): string[] {
  return r.specialties.map((c) => getCategory(c).label);
}

/** おまかせで、次の人に出す */
export async function offerNext(
  consultationId: string,
): Promise<{ ok: boolean; reviewer?: string; expiresAt?: string; why?: string }> {
  if (!dbAdminEnabled) return { ok: false, why: "no db" };
  const res = await dbRpc<
    { ok: boolean; reviewer: string | null; expires_at: string | null; why: string | null }[]
  >("offer_next", { p_consultation: consultationId });
  if (!res.ok) return { ok: false, why: res.error };
  const row = Array.isArray(res.data) ? res.data[0] : undefined;
  if (!row) return { ok: false, why: "出せませんでした" };
  return {
    ok: Boolean(row.ok),
    reviewer: row.reviewer ?? undefined,
    expiresAt: row.expires_at ?? undefined,
    why: row.why ?? undefined,
  };
}

/** 受ける。2人が同時に押しても、1人しか通らない */
export async function acceptOffer(
  responderToken: string,
  offerId: string,
): Promise<{ ok: boolean; replyToken?: string; why?: string }> {
  if (!dbAdminEnabled) return { ok: false, why: "no db" };
  const res = await dbRpc<{ ok: boolean; reply_token: string | null; why: string | null }[]>(
    "accept_offer",
    { p_responder_token: responderToken, p_offer: offerId },
  );
  if (!res.ok) return { ok: false, why: res.error };
  const row = Array.isArray(res.data) ? res.data[0] : undefined;
  if (!row) return { ok: false, why: "受けられませんでした" };
  return {
    ok: Boolean(row.ok),
    replyToken: row.reply_token ?? undefined,
    why: row.why ?? undefined,
  };
}

/* ── 公開の前に止めること ─────────────────────────
   ここは、言い方ひとつで別の商売になる場所。 */
{
  // 夜の店の言葉を入れない。
  // 1つ入った時点で、来る人も、答える人も入れ替わる。
  const NIGHT = /出勤|在籍|キャスト|嬢|指名料|本指名|同伴|体入|ランキング|No\.1|人気順/;
  const copy = [
    ...Object.values(STATUS_LABEL),
    ...Object.values(TODAY),
    ...Object.values(OMAKASE),
  ];
  for (const t of copy) {
    const hit = t.match(NIGHT);
    if (hit) {
      throw new Error(
        `受付まわりの言葉に「${hit[0]}」が入っています。ここで売っているのは人ではなく、その人の反応です`,
      );
    }
  }

  // 急がせる数字を作らない。
  // 「あと2枠」「残りわずか」は、内容ではなく焦りで買わせる。
  for (const t of copy) {
    if (/あと\d+枠|残り\d+|枠が埋ま|お早め/.test(t)) {
      throw new Error(`受付まわりの言葉が、急がせる形になっています（${t}）`);
    }
  }

  // くじ引きとして売らない。
  // 人を引き当てる遊びにした時点で、答える側が品物になる。
  for (const t of Object.values(OMAKASE)) {
    if (/ガチャ|当たり|ハズレ|レア|確率|運よく/.test(t)) {
      throw new Error(`おまかせの説明が、くじ引きになっています（${t}）`);
    }
  }
  // 何が楽しみなのかを、間違えない。
  if (!OMAKASE.why.includes("実際にどう感じたか")) {
    throw new Error(
      "おまかせの説明が、返ってくるものではなく、誰が来るかの話になっています",
    );
  }

  // 「今すぐ」を、速さの約束にしない。
  // 実績が出るまで、何分とは言わない。
  for (const t of copy) {
    if (/最短\d+分|\d+分以内に(返|届)|すぐ(返|届)ります/.test(t)) {
      throw new Error(`受付まわりの言葉が、速さを約束しています（${t}）`);
    }
  }

  // 0人のときの断りが、送れないと読めないこと。
  // 受付中が0人でも、相談は預かれる。
  if (!TODAY.none.includes("相談は送れます")) {
    throw new Error("受付が0人のときの断りに、相談を送れることが書かれていません");
  }

  // 状態は4つとも、言葉を持っていること。
  // 色だけで区別すると、色が見えない人に何も伝わらない。
  for (const s of ["available", "busy", "paused", "offline"] as Status[]) {
    if (!STATUS_LABEL[s]) throw new Error(`状態「${s}」の言い方がありません`);
  }
}
