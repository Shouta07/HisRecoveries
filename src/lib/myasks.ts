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
  /**
   * 恋愛のどの段階で相談したか。
   * 「前回の続き」を出すために要る。
   */
  step?: string;
  /**
   * 同じ相手についての相談をまとめる鍵。
   *
   * ── 相手の情報は持たない ────────────────────────
   * 名前もアプリ名も保存しない。端末の中でも持たない。
   * 持つのは、利用者が自分で付けた短いラベルだけ
   * （「アプリの人」「先週の」など。本人にしか分からない言葉）。
   *
   * これが無いと、毎回ゼロから状況を説明することになる。
   */
  thread?: string;
};

/** 同じ相手についての相談のまとまり */
export type Thread = {
  id: string;
  label: string;
  items: MyAsk[];
  /** いちばん新しい相談の日付 */
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

/**
 * 同じ相手ごとにまとめる。
 *
 * 毎回ゼロから説明させないための土台。
 * 「前回の続きとして相談する」を出すのに使う。
 */
export function threads(): Thread[] {
  const items = list();
  const by = new Map<string, MyAsk[]>();
  for (const it of items) {
    const key = it.thread ?? "";
    if (!key) continue;
    const arr = by.get(key) ?? [];
    arr.push(it);
    by.set(key, arr);
  }
  return [...by.entries()]
    .map(([id, arr]) => ({
      id,
      label: id,
      items: arr.sort((a, b) => b.at.localeCompare(a.at)),
      at: arr[0]?.at ?? "",
    }))
    .sort((a, b) => b.at.localeCompare(a.at));
}

/** いちばん新しい、まとまりのある相談 */
export function latestThread(): Thread | null {
  return threads()[0] ?? null;
}

/** まとまりに属していない相談 */
export function loose(): MyAsk[] {
  return list().filter((x) => !x.thread);
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

// まとまりのラベルに、相手の情報を入れさせない。
// 「田中さん」「Pairsの人」と書けてしまうと、端末を共有している人に
// 誰の話かが分かる。長さで縛る（20文字まで）。
export const THREAD_LABEL_MAX = 20;

export function cleanThreadLabel(x: unknown): string | undefined {
  if (typeof x !== "string") return undefined;
  const t = x.trim().slice(0, THREAD_LABEL_MAX);
  return t || undefined;
}
void _noBody;
