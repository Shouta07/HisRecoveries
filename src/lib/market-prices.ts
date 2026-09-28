// 市場価格との比較。
//
// ══════════════════════════════════════════════════
// 出典の無い金額は、画面に出さない
// ══════════════════════════════════════════════════
// 他社の金額を並べるのは比較広告になる。
// 景品表示法では、比較に使う数字は
//   ・実証されていること
//   ・正確に引用すること
//   ・公正に比較すること
// が要る。うろ覚えの金額を並べると、それだけで違反になりうる。
//
// だから金額は source（社名・URL・確認日）が無いと出さない。
// verified() が出典付きのものだけを返し、
// 出典の無い行は「金額を伏せたまま、何が違うか」だけを出す。
//
// 出典が入った瞬間に、その行の金額が出る。何も書き換えなくてよい。
//
// ══════════════════════════════════════════════════
// やらないこと
// ══════════════════════════════════════════════════
// 「結婚相談所より圧倒的にお得」のような煽りは書かない。
// 提供しているものが違うので、金額だけで優劣は付かない。
// 違うのは、必要な支援の深さ。

export type MarketRow = {
  id: string;
  /** 何のサービスか。社名ではなく種類で書く */
  label: string;
  /** 何をしてくれるか */
  what: string;
  /** 金額。出典が無いあいだは画面に出さない */
  yen?: { from: number; to?: number; monthlyFrom?: number; monthlyTo?: number };
  /** 出典。これが無い金額は表示されない */
  source?: { name: string; url: string; checkedOn: string };
  /** 無料で使えるもの（AI）。金額の出典は要らない */
  free?: boolean;
  /** これが His Recoveries の行か */
  ours?: boolean;
};

export const MARKET: MarketRow[] = [
  {
    id: "ai",
    label: "AI",
    what: "考える。文章を作る。整理する。",
    free: true,
  },
  {
    id: "ours",
    label: "His Recoveries",
    what: "本番の前に、相手に近い実在の人で確かめる。必要なら直して、もう一度確かめる。",
    ours: true,
  },
  {
    id: "photo_pick",
    label: "写真を選んでもらう",
    what: "実在する数人が、どの写真がよいかを選ぶ。",
    // ▼ 金額を出すには、出典を入れてください（例: 出品ページのURLと確認日）
  },
  {
    id: "profile_writing",
    label: "プロフィールを書いてもらう",
    what: "人が自己紹介文を作る。反応を確かめる工程は入らない。",
  },
  {
    id: "counseling",
    label: "恋愛相談（1対1）",
    what: "1人の相手に、時間を取って相談する。",
  },
  {
    id: "agency",
    label: "結婚相談所",
    what: "入会金と月額がかかる。長い期間、婚活そのものを支える。",
  },
];

/** 金額を出してよい行 */
export function hasPrice(r: MarketRow): boolean {
  return Boolean(r.free || r.ours || (r.yen && r.source));
}

/** 出典が入っていないので、金額を伏せている行 */
export function unsourced(): MarketRow[] {
  return MARKET.filter((r) => !r.free && !r.ours && !(r.yen && r.source));
}

/* ── 公開の前に止めること ───────────────────────── */
{
  // 出典の無い金額が紛れ込んでいないこと。
  for (const r of MARKET) {
    if (r.yen && !r.source) {
      throw new Error(
        `「${r.label}」に金額がありますが出典がありません。比較に使う数字には出典が要ります（景表法）`,
      );
    }
    if (r.source && !/^https?:\/\//.test(r.source.url)) {
      throw new Error(`「${r.label}」の出典URLが不正です`);
    }
    if (r.source && !/^\d{4}-\d{2}-\d{2}$/.test(r.source.checkedOn)) {
      throw new Error(`「${r.label}」の出典に確認日がありません（YYYY-MM-DD）`);
    }
  }
  // 煽りを書かない。
  const BAN = ["圧倒的", "お得", "最安", "コスパ最強", "より安い", "だけ"];
  for (const r of MARKET) {
    const hit = BAN.find((b) => r.what.includes(b));
    if (hit) throw new Error(`比較の文に「${hit}」が入っています（金額だけで優劣を付けない）`);
  }
  if (!MARKET.some((r) => r.ours)) throw new Error("自分の行がありません");
}
