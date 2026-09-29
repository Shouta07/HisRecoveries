import { plan, type PlanId } from "../ask/plans";

// 通話の時間を決める。
//
// ══════════════════════════════════════════════════
// 時間はサーバーが持つ
// ══════════════════════════════════════════════════
// 画面のカウントダウンは飾り。
// ブラウザの時計は変えられるし、タブを止めれば進まない。
// 実際に切るのは、サーバーが持つ ends_at だけ。
//
// 画面は「あと何分か」を表示するが、
// 切る判断は必ず、届いた ends_at とサーバー時刻の差で決める。
//
// ══════════════════════════════════════════════════
// 先に入った人を待たせない代わりに、時間も始めない
// ══════════════════════════════════════════════════
// 女性が5分早く入っても、そこからは数えない。
// 両方がつながった時刻を started_at にする。
//
// 逆に、男性が来ないまま時間だけ過ぎるのも止めないといけない。
// 予約時刻から GRACE_MINUTES 待って来なければ no_show にする。
//
// ══════════════════════════════════════════════════
// 切れても延びない
// ══════════════════════════════════════════════════
// 通信が切れて入り直しても、ends_at は動かさない。
// 15分の通話で7分目に切れて2分後に戻ったら、残りは6分。
// 延ばせるのは運営だけ（extend）。その記録は残す。

/** 通話の状態 */
export type CallStatus =
  | "pending_payment"
  | "paid"
  | "waiting_assignment"
  | "scheduled"
  | "ready"
  | "active"
  | "completed"
  | "cancelled"
  | "no_show";

export const CALL_STATUSES: CallStatus[] = [
  "pending_payment",
  "paid",
  "waiting_assignment",
  "scheduled",
  "ready",
  "active",
  "completed",
  "cancelled",
  "no_show",
];

export const STATUS_LABEL: Record<CallStatus, string> = {
  pending_payment: "お支払い前",
  paid: "お支払い済み",
  waiting_assignment: "相手をさがしています",
  scheduled: "日時が決まりました",
  ready: "まもなく始まります",
  active: "通話中",
  completed: "終わりました",
  cancelled: "取り消しました",
  no_show: "つながりませんでした",
};

export function isCallStatus(x: unknown): x is CallStatus {
  return typeof x === "string" && (CALL_STATUSES as string[]).includes(x);
}

/** 入室ボタンが押せるようになる、開始時刻の何分前か */
export const OPEN_BEFORE_MINUTES = 10;

/** 男性が来ないまま待つ時間。これを過ぎたら no_show */
export const GRACE_MINUTES = 10;

/** 画面に出す残り時間の知らせ（分） */
export const WARN_AT_MINUTES = [5, 1] as const;

/** 通話に使うトークンの寿命。ends_at を越えては出さない */
export const TOKEN_MAX_SECONDS = 60 * 45;

/** そのプランの通話は何分か。通話でないプランは null */
export function minutesOf(id: PlanId): number | null {
  return plan(id).callMinutes ?? null;
}

/**
 * 終わる時刻。
 *
 * 始まった時刻に分数を足すだけ。ここに「切断していた分を足す」は入れない。
 * 入れた瞬間、切ったり戻ったりで時間が伸ばせるようになる。
 */
export function endsAt(startedAt: string | Date, minutes: number): Date {
  const t = new Date(startedAt).getTime();
  if (!Number.isFinite(t)) throw new Error("開始時刻が読めません");
  if (!Number.isFinite(minutes) || minutes <= 0) throw new Error("分数が不正です");
  return new Date(t + minutes * 60_000);
}

/** 残りの秒数。過ぎていたら 0 */
export function remainingSeconds(endsAtIso: string | Date, now: Date = new Date()): number {
  const end = new Date(endsAtIso).getTime();
  if (!Number.isFinite(end)) return 0;
  return Math.max(0, Math.floor((end - now.getTime()) / 1000));
}

/** 終わっているか。切るかどうかは必ずこれで決める */
export function isOver(endsAtIso: string | null, now: Date = new Date()): boolean {
  if (!endsAtIso) return false;
  return remainingSeconds(endsAtIso, now) <= 0;
}

/** 「12:42」の形。画面にもログにも同じものを出す */
export function clock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

/** 入室してよい時間帯に入っているか */
export function canEnter(scheduledAt: string | null, now: Date = new Date()): boolean {
  if (!scheduledAt) return false;
  const t = new Date(scheduledAt).getTime();
  if (!Number.isFinite(t)) return false;
  return now.getTime() >= t - OPEN_BEFORE_MINUTES * 60_000;
}

/** 待ちすぎか。予約時刻から GRACE_MINUTES 過ぎたら来なかったことにする */
export function isNoShow(scheduledAt: string | null, now: Date = new Date()): boolean {
  if (!scheduledAt) return false;
  const t = new Date(scheduledAt).getTime();
  if (!Number.isFinite(t)) return false;
  return now.getTime() > t + GRACE_MINUTES * 60_000;
}

/**
 * 通話トークンの寿命（秒）。
 *
 * ends_at を1秒でも越えるトークンを出さない。
 * 出してしまうと、画面を閉じて開き直すだけで時間が延びる。
 */
export function tokenSeconds(endsAtIso: string | null, now: Date = new Date()): number {
  if (!endsAtIso) return Math.min(TOKEN_MAX_SECONDS, OPEN_BEFORE_MINUTES * 60);
  return Math.min(TOKEN_MAX_SECONDS, remainingSeconds(endsAtIso, now));
}

/** その状態から入室してよいか */
export function canJoin(status: CallStatus): boolean {
  return status === "ready" || status === "active" || status === "scheduled";
}

/* ── 公開の前に止めること ─────────────────────────
   ここは「時間を切る」ための計算なので、ずれていると
   払った時間より短く切るか、いつまでも切れないかになる。
   どちらも取り返しがつかないので、数で確かめる。 */
{
  const t0 = new Date("2026-01-01T12:00:00.000Z");

  // 15分の通話は、始まった時刻の15分後に終わる。
  const e15 = endsAt(t0, 15);
  if (e15.toISOString() !== "2026-01-01T12:15:00.000Z") {
    throw new Error(`15分の終わりが合いません: ${e15.toISOString()}`);
  }
  const e30 = endsAt(t0, 30);
  if (e30.toISOString() !== "2026-01-01T12:30:00.000Z") {
    throw new Error(`30分の終わりが合いません: ${e30.toISOString()}`);
  }

  // 切れて戻っても延びないこと。
  // 7分目に切れて2分後に戻ったら、残りは6分ちょうど。
  const back = new Date(t0.getTime() + 9 * 60_000);
  if (remainingSeconds(e15, back) !== 6 * 60) {
    throw new Error(`切れて戻ったあとの残りが合いません: ${remainingSeconds(e15, back)}`);
  }

  // 過ぎたら 0 で、負にならない。
  const late = new Date(t0.getTime() + 99 * 60_000);
  if (remainingSeconds(e15, late) !== 0) throw new Error("過ぎたあとの残りが0ではありません");
  if (!isOver(e15.toISOString(), late)) throw new Error("過ぎたのに終わっていません");
  if (isOver(e15.toISOString(), t0)) throw new Error("始まった直後に終わっています");

  // 過ぎたあとにトークンを出さない。出すと、開き直すだけで延びる。
  if (tokenSeconds(e15.toISOString(), late) !== 0) {
    throw new Error("終わったあとにトークンの寿命が残っています");
  }
  // トークンが ends_at を越えないこと。
  const left = remainingSeconds(e30, t0);
  if (tokenSeconds(e30.toISOString(), t0) > left) {
    throw new Error("トークンの寿命が、終わる時刻を越えています");
  }

  // 表示の形。
  if (clock(762) !== "12:42") throw new Error(`残り時間の形が違います: ${clock(762)}`);
  if (clock(0) !== "0:00") throw new Error("0のときの形が違います");
  if (clock(-5) !== "0:00") throw new Error("負の秒が表示に出ています");

  // 早く入れる時間帯。
  const sched = "2026-01-01T12:00:00.000Z";
  if (canEnter(sched, new Date("2026-01-01T11:40:00.000Z"))) {
    throw new Error("開始20分前に入室できてしまいます");
  }
  if (!canEnter(sched, new Date("2026-01-01T11:55:00.000Z"))) {
    throw new Error("開始5分前に入室できません");
  }

  // 来なかった判定。
  if (isNoShow(sched, new Date("2026-01-01T12:05:00.000Z"))) {
    throw new Error("5分の遅れで来なかったことにしています");
  }
  if (!isNoShow(sched, new Date("2026-01-01T12:11:00.000Z"))) {
    throw new Error("11分過ぎても待ち続けています");
  }

  // 知らせる時刻は、短いほうの通話より内側にあること。
  for (const m of WARN_AT_MINUTES) {
    if (m >= 15) throw new Error(`残り${m}分の知らせは、15分の通話では出せません`);
  }
  // 知らせは、遠いほうから順に並べる（5分 → 1分）。
  for (let i = 1; i < WARN_AT_MINUTES.length; i++) {
    if (WARN_AT_MINUTES[i] >= WARN_AT_MINUTES[i - 1]) {
      throw new Error("残り時間の知らせが、遠い順に並んでいません");
    }
  }

  // 状態の名前が重複していないこと。
  if (new Set(CALL_STATUSES).size !== CALL_STATUSES.length) {
    throw new Error("通話の状態が重複しています");
  }
  // 払う前に入室できないこと。ここが緩むと、ただで話せる。
  for (const st of ["pending_payment", "paid", "waiting_assignment"] as CallStatus[]) {
    if (canJoin(st)) throw new Error(`「${STATUS_LABEL[st]}」で入室できてしまいます`);
  }
  for (const st of ["completed", "cancelled", "no_show"] as CallStatus[]) {
    if (canJoin(st)) throw new Error(`「${STATUS_LABEL[st]}」で入室できてしまいます`);
  }
}
