import type { Store, Entry } from "./relationship";

// 「今日」の問い（§39）。
//
// ── ダッシュボードにしない ────────────────────────
// ホームでいちばん大きいのは数字でも一覧でもなく、問い1つ。
// 開いた人が最初にすることは、読むことではなく、思い出すこと。
//
// ── 相手の気持ちを推測しない ──────────────────────
// 「相手はあなたに好意があるかもしれません」の類は一切作らない。
// 問いの主語は常に自分。こちらが知っているのは、本人が書いたことだけ。
//
// ── 前と同じ問いを出し続けない ────────────────────
// 毎回同じ一文だと、二日目から読まれなくなる。
// 直近の記録と、そこからの日数で言い換える。

export type Todays = {
  /** 画面のいちばん上に置く問い */
  ask: string;
  /** 問いの下に一行だけ添える。無いこともある */
  note?: string;
};

function daysBetween(iso: string, now: Date): number {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return 0;
  const a = new Date(y, m - 1, d).getTime();
  const b = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.round((b - a) / 86400000);
}

export function todaysAsk(s: Store, now: Date = new Date()): Todays {
  const last: Entry | undefined = s.entries[0];

  if (!last) {
    return {
      ask: "最近、どうですか？",
      note: "会った日や、何か感じた日に、ひとこと残しておく場所です。",
    };
  }

  const ago = daysBetween(last.date, now);

  if (ago === 0) {
    return { ask: "今日のこと、ほかに残しておきたいことはありますか？" };
  }

  // 書いたばかりの「もう一度会いたい」に、理由が残っていない。
  // ここがこのプロダクトで最も拾いたい瞬間。
  if (ago <= 3 && last.feel === "again" && !last.note) {
    return {
      ask: "この前、もう一度会いたいと思ったのは、\nどんなところでしたか？",
      note: "理由のほうが先に薄れます。",
    };
  }

  if (ago <= 3 && last.feel === "off") {
    return { ask: "この前の違和感は、いまも残っていますか？" };
  }

  if (ago <= 3) {
    return { ask: "この前会ったとき、\nどんな感じでしたか？" };
  }

  if (ago <= 10) {
    if (s.stage === "consider") {
      return { ask: "いま、いちばん気になっているのは\n何ですか？" };
    }
    if (s.entries.length >= 3) {
      return { ask: "最近、人といるときの自分は\nどんな感じですか？" };
    }
    return { ask: "最近、どうですか？" };
  }

  return {
    ask: "しばらく空きました。\n最近はどうですか？",
    note: `前に書いたのは${ago}日前です。`,
  };
}

// ── 公開の前に止めること ───────────────────────────
// 問いの主語が相手に移っていないか。移った瞬間に、これは占いになる。
const BANNED = [
  "相手は", "相手の気持ち", "脈", "好意", "気があ", "思われて",
  "成功", "確率", "％", "%", "点", "おすすめ", "してください", "すべき",
];
{
  const store = (stage: Store["stage"], entries: Entry[]): Store => ({
    version: 2,
    stage,
    age: null,
    entries,
  });
  const mk = (date: string, e: Partial<Entry> = {}): Entry => ({ id: "x", date, ...e });
  // 実際に通りうる分岐を全部踏む。文面を目で読むだけでは奥が残る。
  const cases: Store[] = [
    store(null, []),
    store(null, [mk("2026-01-10")]),
    store(null, [mk("2026-01-08", { feel: "again" })]),
    store(null, [mk("2026-01-08", { feel: "again", note: "あり" })]),
    store(null, [mk("2026-01-08", { feel: "off" })]),
    store("consider", [mk("2026-01-03")]),
    store("know", [mk("2026-01-03"), mk("2026-01-02"), mk("2026-01-01")]),
    store(null, [mk("2025-12-01")]),
  ];
  const now = new Date(2026, 0, 10);
  for (const c of cases) {
    const t = todaysAsk(c, now);
    for (const text of [t.ask, t.note ?? ""]) {
      const hit = BANNED.find((b) => text.includes(b));
      if (hit) {
        throw new Error(`「今日」の問いに「${hit}」が入っています（主語は自分だけ）`);
      }
    }
    if (!t.ask.includes("？")) {
      throw new Error(`「今日」の一行が問いになっていません: ${t.ask}`);
    }
  }
}
