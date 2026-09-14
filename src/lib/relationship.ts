import { isStageId, type StageId } from "./journey";
import type { AgeGroup } from "./journey";

// 自分の記録。端末の中だけに置く。
//
// ── 主語は必ず「自分」──────────────────────────
// 相手の名前・写真・連絡先・SNS・メッセージ本文は、型として持たない。
// 「保存しない運用にする」ではなく、入れる場所を作らない。
// 場所があると、いつか誰かが入れる。
//
// ── 相手ごとに分けない ────────────────────────────
// 相手ごとの履歴を持った瞬間、これは相手の管理台帳になる。
// 記録は時系列に1本だけ。誰についての記録かは、書きたい人が
// 任意のメモに書くだけで、こちらは構造として持たない。
//
// ── 端末内 ──────────────────────────────────
// 恋愛の記録をサーバーに置くと、同意・保管期間・削除・漏洩の設計が要る。
// いまその体制はない。だから預からない。
// 端末を移ると消えることは、画面に書く（隠さない）。

const VERSION = 1;
const KEY = "hr_rel_v1";

export type Feel = "natural" | "fun" | "unsure" | "off";
export type Again = "yes" | "maybe" | "no";
export type RecordKind = "talk" | "met" | "moved" | "unsure" | "other";

export type Entry = {
  /** 端末内で一意。並べ替えにも使う */
  id: string;
  /** YYYY-MM-DD */
  date: string;
  kind: RecordKind;
  /** どうだったか。任意 */
  feel?: Feel;
  /** また会いたいか。任意 */
  again?: Again;
  /** 自由入力。任意。ここに何を書くかは本人の自由 */
  note?: string;
};

export type Store = {
  version: number;
  stage: StageId | null;
  age: AgeGroup | null;
  entries: Entry[];
};

const EMPTY: Store = { version: VERSION, stage: null, age: null, entries: [] };

function read(): Store {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const s = JSON.parse(raw) as Store;
    if (s?.version !== VERSION || !Array.isArray(s.entries)) return EMPTY;
    return s;
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

export function addEntry(e: Omit<Entry, "id" | "date">): Store {
  const s = read();
  const entry: Entry = {
    ...e,
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    date: today(),
  };
  const next = { ...s, version: VERSION, entries: [entry, ...s.entries] };
  write(next);
  return next;
}

export function removeEntry(id: string): Store {
  const s = read();
  const next = { ...s, version: VERSION, entries: s.entries.filter((e) => e.id !== id) };
  write(next);
  return next;
}

/** 全部消す。消し方が分かりにくいサービスにしない（§18） */
export function clearAll(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export function hasStarted(): boolean {
  const s = read();
  return Boolean(s.stage) || s.entries.length > 0;
}

// ── 画面に出す言葉 ────────────────────────────────
export const KIND_LABEL: Record<RecordKind, string> = {
  talk: "話した",
  met: "会った",
  moved: "進展した",
  unsure: "迷った",
  other: "その他",
};
export const FEEL_LABEL: Record<Feel, string> = {
  natural: "かなり自然だった",
  fun: "楽しかった",
  unsure: "まだ分からない",
  off: "少し違和感があった",
};
export const AGAIN_LABEL: Record<Again, string> = {
  yes: "はい",
  maybe: "まだ分からない",
  no: "いいえ",
};

/**
 * 記録から、傾向を1文にする。
 *
 * 点数にしない。順位にもしない。
 * 3件たまるまでは何も言わない——2件で「傾向」と書いたら、それは感想。
 */
export function insight(s: Store): string | null {
  const withFeel = s.entries.filter((e) => e.feel);
  if (withFeel.length < 3) return null;

  const again = s.entries.filter((e) => e.again === "yes");
  const naturalAndAgain = again.filter((e) => e.feel === "natural" || e.feel === "fun").length;

  if (again.length >= 2 && naturalAndAgain / again.length >= 0.6) {
    return "自然に話せた日に、また会いたいと書いていることが多いようです。";
  }
  const off = withFeel.filter((e) => e.feel === "off").length;
  if (off / withFeel.length >= 0.4) {
    return "違和感を書き残していることが、少なくないようです。無理に合わせていないか、振り返ってみてもよさそうです。";
  }
  return "まだはっきりした傾向は出ていません。記録が増えると、ここが変わります。";
}

// ── 型の段階で相手を持てなくする ────────────────────
// 将来この型に name / photo / phone / line / sns / message を足したら、
// その時点でこのサービスは相手の管理台帳になる。
// 足そうとした人が必ず通る場所に、止める仕掛けを置く。
const FORBIDDEN_KEYS = ["name", "photo", "phone", "line", "sns", "message", "partner", "contact"];
{
  const sample: Entry = { id: "x", date: "2026-01-01", kind: "met" };
  for (const k of Object.keys(sample)) {
    if (FORBIDDEN_KEYS.includes(k)) {
      throw new Error(
        `記録の型に「${k}」があります。相手を特定する情報は持ちません（主語は自分だけ）`,
      );
    }
  }
}

export function isRecordKind(x: unknown): x is RecordKind {
  return typeof x === "string" && x in KIND_LABEL;
}
export { isStageId };
