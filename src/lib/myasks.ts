// 自分が出した相談の控え。
//
// ── なぜ要るか ────────────────────────────────────
// 会員登録を入れていないので、結果に戻る手段は URL だけだった。
// 「このリンクが、結果に戻れる唯一の場所です」と書いてはいるが、
// リンクを失った人は本当にどこにも戻れない。
// 連絡先を受け取っていないので、こちらから送ることもできない。
//
// 同じ端末で開いている限りは、この控えで戻れるようにする。
// アカウントを作らせずに、履歴だけを手元に持ってもらう形。
//
// ── 端末の中だけ ──────────────────────────────────
// サーバーには送らない。送ると「誰がどの相談を出したか」の対応表になる。
// 匿名で聞ける、という前提がそこで崩れる。
//
// ── 中身は持たない ────────────────────────────────
// 相談の本文はここに入れない。鍵とカテゴリと日付だけ。
// 端末を共有している人に、本文まで見えてしまうのを避ける。

const KEY = "hr_asks_v1";
const VERSION = 1;
const MAX = 50;

export type MyAsk = {
  /** 結果を見るための鍵 */
  token: string;
  /** カテゴリ。一覧で「何を聞いたか」が分かる程度に */
  category: string;
  /** 何人に聞いたか */
  size: number;
  /** ISO 日付 */
  at: string;
};

type Store = { version: number; items: MyAsk[] };

function read(): Store {
  if (typeof window === "undefined") return { version: VERSION, items: [] };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { version: VERSION, items: [] };
    const s = JSON.parse(raw) as Store;
    if (s?.version !== VERSION || !Array.isArray(s.items)) return { version: VERSION, items: [] };
    return s;
  } catch {
    return { version: VERSION, items: [] };
  }
}

function write(s: Store) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* 保存できない環境では、控えだけ諦める。相談そのものは出せている */
  }
}

export function list(): MyAsk[] {
  return read().items;
}

export function add(a: Omit<MyAsk, "at">): void {
  const s = read();
  // 同じ鍵を二重に持たない
  const items = [{ ...a, at: new Date().toISOString() }, ...s.items.filter((x) => x.token !== a.token)];
  write({ version: VERSION, items: items.slice(0, MAX) });
}

export function remove(token: string): MyAsk[] {
  const s = read();
  const items = s.items.filter((x) => x.token !== token);
  write({ version: VERSION, items });
  return items;
}

export function clearAll(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

/** 「9月28日」にする */
export function shortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

/* ── 公開の前に止めること ─────────────────────────
   本文をうっかり持たせないようにする。
   ここに body や comment を足した時点で、
   端末を共有している人に相談の中身が見えるようになる。 */
type Forbidden = "body" | "text" | "comment" | "note" | "answers" | "email";
type NoBody<T> = Extract<keyof T, Forbidden> extends never ? T : never;
const _noBody: NoBody<MyAsk> = { token: "c", category: "message", size: 3, at: "" };
void _noBody;
