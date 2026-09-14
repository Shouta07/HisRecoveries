import { isStageId, type StageId } from "./journey";
import type { AgeGroup } from "./journey";

// 自分の記録。端末の中だけに置く。
//
// ── 主語は必ず「自分」──────────────────────────
// 相手の名前・写真・連絡先・SNS・メッセージ本文は、型として持たない。
// 「保存しない運用にする」ではなく、入れる場所を作らない。
// 場所があると、いつか誰かが入れる。
//
// 任意のニックネームも置かない。
// 「最近会っている人」程度でも、置いた時点で記録は相手ごとに分かれ始め、
// 分かれた瞬間にこれは相手の台帳になる。主語を1つに保つほうを取る。
//
// ── 相手ごとに分けない ────────────────────────────
// 記録は時系列に1本だけ。誰についての記録かは、書きたい人が
// 自由入力に書くだけで、こちらは構造として持たない。
//
// ── 端末内 ──────────────────────────────────
// 恋愛の記録をサーバーに置くと、同意・保管期間・削除・漏洩の設計が要る。
// いまその体制はない。だから預からない。
// 端末を移ると消えることは、画面に書く（隠さない）。

const VERSION = 2;
const KEY = "hr_rel_v2";
const KEY_V1 = "hr_rel_v1";

/** 今日はどうでしたか（1問目） */
export type Feel = "fun" | "again" | "unsure" | "off";
/** 自然体でいられましたか（2問目） */
export type Natural = "yes" | "some" | "little";

/** v1 で聞いていたもの。もう聞かないが、移行した記録には残っている */
export type LegacyKind = "talk" | "met" | "moved" | "unsure" | "other";
export type LegacyAgain = "yes" | "maybe" | "no";

export type Entry = {
  /** 端末内で一意。並べ替えにも使う */
  id: string;
  /** YYYY-MM-DD */
  date: string;
  /** 今日はどうでしたか */
  feel?: Feel;
  /** 自然体でいられましたか */
  natural?: Natural;
  /** 何か気になったことは（任意） */
  noticed?: string;
  /** 残しておきたいことは（任意） */
  note?: string;
  /**
   * あとから振り返って書き足したこと（任意）。
   * 記録そのものとは分けて持つ。
   * その日に思ったことと、あとで思ったことは、別のものだから。
   */
  reflect?: string;
  /** ここから下は v1 からの移行分だけが持つ。新しく書かれることはない */
  kind?: LegacyKind;
  again?: LegacyAgain;
};

export type Store = {
  version: number;
  stage: StageId | null;
  age: AgeGroup | null;
  entries: Entry[];
};

const EMPTY: Store = { version: VERSION, stage: null, age: null, entries: [] };

/* ── v1 からの移行 ──────────────────────────────────
   v1 は kind（話した／会った／進展した／迷った）を最初に聞いていた。
   出来事の分類から入るのは、記録ではなく台帳の作り方だったので、もう聞かない。
   ただし既に書かれたものを黙って捨てない。legacy として持ち、画面にも出す。 */
type V1Entry = {
  id: string;
  date: string;
  kind?: LegacyKind;
  feel?: "natural" | "fun" | "unsure" | "off";
  again?: LegacyAgain;
  note?: string;
};

function migrate(v1: { stage?: unknown; age?: unknown; entries?: V1Entry[] }): Store {
  const entries: Entry[] = (v1.entries ?? []).map((e) => {
    const out: Entry = { id: e.id, date: e.date };
    if (e.kind) out.kind = e.kind;
    if (e.again) out.again = e.again;
    if (e.note) out.note = e.note;
    // v1 の「かなり自然だった」は、v2 では2問目にあたる。
    // 1問目に無理に押し込むと、書いていないことを書いたことにしてしまう。
    if (e.feel === "natural") out.natural = "yes";
    else if (e.feel === "fun") out.feel = "fun";
    else if (e.feel === "unsure") out.feel = "unsure";
    else if (e.feel === "off") out.feel = "off";
    if (!out.feel && e.again === "yes") out.feel = "again";
    return out;
  });
  return {
    version: VERSION,
    stage: isStageId(v1.stage) ? v1.stage : null,
    age: (typeof v1.age === "string" ? (v1.age as AgeGroup) : null) ?? null,
    entries,
  };
}

function read(): Store {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as Store;
      if (s?.version === VERSION && Array.isArray(s.entries)) return s;
    }
    const old = window.localStorage.getItem(KEY_V1);
    if (old) {
      const s = migrate(JSON.parse(old));
      write(s); // 一度書き戻す。次からは移行を通らない
      return s;
    }
    return EMPTY;
  } catch {
    return EMPTY;
  }
}

function write(s: Store): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* 保存できない環境では、記録だけ諦める。画面は動かす */
  }
}

function today(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function load(): Store {
  return read();
}

export function setStage(stage: StageId): Store {
  const s = read();
  const next = { ...s, version: VERSION, stage };
  write(next);
  return next;
}

export function setAge(age: AgeGroup): Store {
  const s = read();
  const next = { ...s, version: VERSION, age };
  write(next);
  return next;
}

export function addEntry(e: Omit<Entry, "id" | "date">): Entry {
  const s = read();
  const entry: Entry = {
    ...e,
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    date: today(),
  };
  write({ ...s, version: VERSION, entries: [entry, ...s.entries] });
  return entry;
}

export function getEntry(id: string): Entry | null {
  return read().entries.find((e) => e.id === id) ?? null;
}

/** 振り返りを書き足す。記録そのものは書き換えない */
export function setReflect(id: string, text: string): Entry | null {
  const s = read();
  let hit: Entry | null = null;
  const entries = s.entries.map((e) => {
    if (e.id !== id) return e;
    hit = { ...e, reflect: text.trim() || undefined };
    return hit;
  });
  if (!hit) return null;
  write({ ...s, version: VERSION, entries });
  return hit;
}

export function removeEntry(id: string): Store {
  const s = read();
  const next = { ...s, version: VERSION, entries: s.entries.filter((e) => e.id !== id) };
  write(next);
  return next;
}

/** 全部消す。消し方が分かりにくいサービスにしない */
export function clearAll(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
    window.localStorage.removeItem(KEY_V1);
  } catch {
    /* ignore */
  }
}

export function hasStarted(): boolean {
  const s = read();
  return Boolean(s.stage) || s.entries.length > 0;
}

// ── 画面に出す言葉 ────────────────────────────────
// 1問目。§12 の4択をそのまま持つ。
export const FEEL_LABEL: Record<Feel, string> = {
  fun: "楽しかった",
  again: "もう一度会いたい",
  unsure: "まだ分からない",
  off: "少し違った",
};
// 2問目。
export const NATURAL_LABEL: Record<Natural, string> = {
  yes: "はい",
  some: "まあまあ",
  little: "あまり",
};
// v1 の記録にだけ残る言葉。
export const LEGACY_KIND_LABEL: Record<LegacyKind, string> = {
  talk: "話した",
  met: "会った",
  moved: "進展した",
  unsure: "迷った",
  other: "その他",
};
export const LEGACY_AGAIN_LABEL: Record<LegacyAgain, string> = {
  yes: "また会いたい",
  maybe: "また会いたい：まだ分からない",
  no: "また会いたい：いいえ",
};

/** 日付を「9月12日（土）」にする。曜日まで出すのは、記録が場面と結びつくため */
const WEEK = ["日", "月", "火", "水", "木", "金", "土"];
export function jpDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const w = WEEK[new Date(y, m - 1, d).getDay()] ?? "";
  return `${m}月${d}日（${w}）`;
}

/**
 * 記録から、見えてきたことを1〜2文にする（§22）。
 *
 * 点数にしない。順位にもしない。人格のラベルも付けない。
 * 言い切らない——必ず「〜という記録が増えています」「〜のようです」で止める。
 *
 * 3件たまるまでは何も言わない。2件で「傾向」と書いたら、それは感想。
 */
export function insight(s: Store): string | null {
  const said = s.entries.filter((e) => e.feel || e.natural);
  if (said.length < 3) return null;

  const nat = s.entries.filter((e) => e.natural);
  const warm = s.entries.filter((e) => e.feel === "fun" || e.feel === "again");

  // 自然体でいられた日と、また会いたいと書いた日が重なっているか
  const naturalYes = nat.filter((e) => e.natural === "yes");
  const overlap = naturalYes.filter((e) => e.feel === "fun" || e.feel === "again").length;
  if (naturalYes.length >= 2 && overlap / naturalYes.length >= 0.6) {
    return "自然体でいられた日に、「楽しかった」「もう一度会いたい」と書いていることが多いようです。";
  }

  // 違和感のほうが多い
  const off = s.entries.filter((e) => e.feel === "off").length;
  if (said.length >= 3 && off / said.length >= 0.4) {
    return "「少し違った」と残していることが、少なくありません。無理に合わせていないかどうか、読み返してみてもよさそうです。";
  }

  // 自然体になれていない日が続いている
  const little = nat.filter((e) => e.natural === "little").length;
  if (nat.length >= 3 && little / nat.length >= 0.5) {
    return "「あまり自然体ではなかった」という記録が増えています。どんな場面でそうなりやすいのか、書き残してみると見えてくるかもしれません。";
  }

  if (warm.length >= 3) {
    return "「楽しかった」「もう一度会いたい」と書いた日が重なってきました。何が良かったのかまで残しておくと、あとで効いてきます。";
  }

  return "まだはっきりした傾向は出ていません。記録が増えると、ここが変わります。";
}

// ── 型の段階で相手を持てなくする ────────────────────
// 将来この型に name / photo / phone / line / sns / message を足したら、
// その時点でこのサービスは相手の管理台帳になる。
// 足そうとした人が必ず通る場所に、止める仕掛けを置く。
//
// 以前は実体を1つ作ってキーを数えていたが、任意のプロパティは
// 実体に現れないので、足されても素通りしていた。型の側で見る。
type ForbiddenKey =
  | "name"
  | "nickname"
  | "photo"
  | "phone"
  | "line"
  | "sns"
  | "message"
  | "partner"
  | "contact";

/**
 * Entry に相手を特定する名前のプロパティがあると、この型が never になり、
 * 下の代入が型エラーになる。tsc と next build の両方で落ちる。
 */
type SubjectIsSelf<T> = Extract<keyof T, ForbiddenKey> extends never ? T : never;
const _subjectIsSelf: SubjectIsSelf<Entry> = { id: "x", date: "2026-01-01" };
void _subjectIsSelf;

export { isStageId };
