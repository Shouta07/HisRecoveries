import { clusters } from "./clusters";

// たしかメディア。
//
// ══════════════════════════════════════════════════
// 記事は、タシカメの集客装置
// ══════════════════════════════════════════════════
// 「読み物のコーナー」を横に作るのではない。
// 検索から来た人が、一般論を読んだあとで
// 「で、俺の場合は？」に進める場所にする。
//
// ══════════════════════════════════════════════════
// いま、当たっている記事は少ない
// ══════════════════════════════════════════════════
// 55本あるが、ほとんどは AGA・肌・体毛・健康の記事で、
// 前の商売のもの。マッチングアプリの記事は1本も無い。
//
// 近いのは「見た目 × アプリ・デート」の8本だけ。
// その8本を、恋愛のどの段で読むものかで並べ直す。
//
// ══════════════════════════════════════════════════
// 消さない
// ══════════════════════════════════════════════════
// 残りの47本を消すのは簡単だが、戻せない。
// どれだけ読まれていて、どこからリンクされているかを
// こちらは知らない。消した瞬間に、そのぶんは戻らない。
//
// ここでは並べ方を変えるだけにして、
// 何を消すべきかは、数字を見てから決める。

/** 恋愛の、どの段で読むものか */
export type Phase =
  | "profile"
  | "message"
  | "invite"
  | "date"
  | "after"
  | "self";

export const PHASES: { id: Phase; label: string; lead: string }[] = [
  { id: "profile", label: "写真・プロフィール", lead: "出す前に、どう見えるか" },
  { id: "message", label: "メッセージ・LINE", lead: "送る前に、どう読まれるか" },
  { id: "invite", label: "誘う", lead: "誘う前に、どう受け取られるか" },
  { id: "date", label: "デート", lead: "会う前に、整えておくこと" },
  { id: "after", label: "デートのあと", lead: "次につなげるために" },
  { id: "self", label: "自分を整える", lead: "土台のところ" },
];

/**
 * 記事を、恋愛の段に割り当てる。
 *
 * slug で名指しする。中身を機械で判定しない
 * （「デート」という語が1回出るだけの記事が混ざる）。
 */
const IN_PHASE: Record<Phase, string[]> = {
  profile: ["matching-app-shashin", "omiai-fukusou-men"],
  // まだ1本も無い。書くならここから
  message: [],
  invite: ["machikon-gokon-midashinami"],
  date: ["hatsu-date-fukusou", "date-zenjitsu-mijitaku", "seiketsukan-shoutai-5"],
  // まだ1本も無い
  after: [],
  self: [
    "kanojo-dekinai-mitame",
    "seiketsukan-tsukurikata",
    "otoko-jibunmigaki-hajimekata",
  ],
};

export type MediaArticle = {
  slug: string;
  title: string;
  lead: string;
  href: string;
};

function find(slug: string): MediaArticle | null {
  const a = clusters.find((c) => c.slug === slug);
  if (!a) return null;
  return {
    slug: a.slug,
    title: a.title,
    lead: a.lead,
    href: `/areas/${a.areaId}/${a.slug}`,
  };
}

/** その段の記事 */
export function articlesIn(p: Phase): MediaArticle[] {
  return IN_PHASE[p].map(find).filter((x): x is MediaArticle => x !== null);
}

/** 段に割り当てた記事の slug */
export function assignedSlugs(): Set<string> {
  return new Set(Object.values(IN_PHASE).flat());
}

/** 段に入らなかった記事。消さずに、下にまとめて置く */
export function others(): MediaArticle[] {
  const used = assignedSlugs();
  return clusters
    .filter((c) => !used.has(c.slug))
    .map((c) => ({
      slug: c.slug,
      title: c.title,
      lead: c.lead,
      href: `/areas/${c.areaId}/${c.slug}`,
    }));
}

/** 段に並べた本数 */
export function assignedCount(): number {
  return PHASES.reduce((n, p) => n + articlesIn(p.id).length, 0);
}

export const MEDIA = {
  name: "たしかメディア",
  head: "恋愛の「これ、どうする？」を確かめる。",
  lead:
    "マッチングアプリ、LINE、デート、付き合う前。男性が迷いやすい場面を、女性の視点と実例から。",
  /** 記事の下から、自分の場面へ */
  bridge: "自分の場合は、どうだろう。",
};

/* ── 公開の前に止めること ───────────────────────── */
{
  // 名指しした slug が、実在すること。
  // 記事を消したり slug を変えたりしたときに、
  // 静かに消えるのではなく、ここで止める。
  for (const [phase, slugs] of Object.entries(IN_PHASE)) {
    for (const s of slugs) {
      if (!clusters.some((c) => c.slug === s)) {
        throw new Error(`たしかメディアの「${phase}」が、無い記事を指しています（${s}）`);
      }
    }
  }

  // 同じ記事を、2つの段に置かない。
  const all = Object.values(IN_PHASE).flat();
  if (new Set(all).size !== all.length) {
    throw new Error("同じ記事が複数の段に入っています");
  }

  // 1本も割り当てられていない段があってよい（まだ書いていない）。
  // ただし、全部空なら、この面を作る意味が無い。
  if (all.length === 0) {
    throw new Error("たしかメディアに、1本も記事が割り当てられていません");
  }

  // 残りを消していないこと。
  // 並べ替えのつもりで、うっかり減らしていないかを見る。
  if (assignedCount() + others().length !== clusters.length) {
    throw new Error("記事の合計が合いません（並べ替えで落としています）");
  }
}
