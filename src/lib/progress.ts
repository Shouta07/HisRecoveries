// 行動の記録。
//
// ── なぜ要るか ────────────────────────────────
// 診断は「順番」と「今月やること3つ」を出して、そこで終わっていた。
// 渡したあと、やったかどうかを知る手段がこちらにも本人にも無い。
//
// 追うべき数字は「100人が診断して、そのうち何人が実際に動いたか」。
// 記録する場所が無いかぎり、この数字は永久に出ない。
//
// ── ログインを作らない ──────────────────────────
// 会員登録を入れると、そこで人が減る。しかも預かるのは
// 健康・身体に関する情報（要配慮個人情報）になり、
// 同意・削除・保管期間の設計が要る。いまその体制はない。
//
// 代わりに、すでにある2つを組み合わせる。
//   ・診断結果を復元できるURL（/check?r=CODE）＝ 本人だけが持つ鍵
//   ・その端末の localStorage       ＝ 進み具合の置き場
// URLが身元、端末が記録。こちらには何も残らない。
//
// ── 正直に書かないといけないこと ──────────────────
// 端末に置くので、別の端末で同じURLを開いても進捗は出ない。
// これは仕様上どうにもならないので、画面にそう書く（隠さない）。
//
// ── 壊れても止めない ────────────────────────────
// localStorage は、プライベートモードや容量超過で普通に失敗する。
// 失敗したら記録を諦めるだけで、結果の表示は絶対に止めない。
// 記録は付属品で、順番のほうが本体。

/** 保存の形。増やすときは version を上げて、読めない古い形は捨てる */
const VERSION = 1;
const KEY = "hr_progress_v1";

export type Progress = {
  version: number;
  /** 診断結果のコード（?r= の中身）ごとに持つ */
  byCode: Record<
    string,
    {
      /** 終えた行動の文言。文言で持つのは、順番が変わっても対応が壊れないため */
      done: string[];
      /** 最後に触った日（YYYY-MM-DD）。「前回から◯日」に使う */
      last: string;
    }
  >;
};

const EMPTY: Progress = { version: VERSION, byCode: {} };

function read(): Progress {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const p = JSON.parse(raw) as Progress;
    // 古い形は読まずに捨てる。無理に移行すると、壊れた記録が残り続ける。
    if (p?.version !== VERSION || typeof p.byCode !== "object") return EMPTY;
    return p;
  } catch {
    return EMPTY;
  }
}

function write(p: Progress): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* 保存できない環境では、記録だけ諦める。表示は続ける */
  }
}

/** 今日の日付（端末のローカル時刻）。UTCに寄せると日付がずれる */
function today(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function getDone(code: string): string[] {
  return read().byCode[code]?.done ?? [];
}

/** 最後に触った日から何日経ったか。まだ一度も触っていなければ null */
export function daysSince(code: string): number | null {
  const last = read().byCode[code]?.last;
  if (!last) return null;
  const ms = new Date(today()).getTime() - new Date(last).getTime();
  if (Number.isNaN(ms)) return null;
  return Math.max(0, Math.round(ms / 86_400_000));
}

/**
 * 1つの行動の状態を入れ替える。戻り値は入れ替えたあとの一覧。
 * 「終えた」だけでなく「やっぱり戻す」も残す。
 * 取り消せない記録は、正直につけてもらえない。
 */
export function toggle(code: string, text: string): string[] {
  const p = read();
  const cur = p.byCode[code]?.done ?? [];
  const next = cur.includes(text) ? cur.filter((t) => t !== text) : [...cur, text];
  p.version = VERSION;
  p.byCode[code] = { done: next, last: today() };
  write(p);
  return next;
}
