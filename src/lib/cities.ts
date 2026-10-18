import { BEEN } from "./been";

/* ══════════════════════════════════════════════════
   都市別の相談ページ
   ══════════════════════════════════════════════════

   ── 作ったのは、入れ物だけ ──────────────────────
   いま CITIES は空です。だから都市のページは1枚も出ません。
   sitemap にも載らず、検索にも出ません。

   空にしてあるのは、怠けたからではない。

   確認が取れているのは「15の国・地域に行ったことがある」まで。
   どの都市へ、いつ、どういう旅で行ったかは、確認できていない。

   都市別ページの中身は、そこが全部。
     いつ行ったか
     どういう旅だったか
     何に迷って、何に困ったか

   これを埋められるのは運営者だけ。
   こちらが推測で書けば、読む人には区別がつかないまま、
   行ったことのない都市のページが並ぶ。

   入れ物と判定だけ先に作って、埋まったぶんだけ出す。

   ── 埋め方 ──────────────────────────────────────
   下の CITIES に、1都市ずつ足す。
   足した瞬間に /cities/<slug> が出て、sitemap にも載る。

   中途半端に足せないようにしてある。
   visited が null のもの、struggles や asks が空のものは、
   公開の前に止まる（下の判定）。

   ── 国と都市を、混ぜないこと ────────────────────
   「タイ」と「バンコク」は別。
   country は been.ts の15に無ければ止まる。
   行ったことのある国でなければ、その都市にも行っていない。 */

export type Example = {
  /** 相談として送られてきそうな文 */
  q: string;
  /** こちらがお返しする中身 */
  a: string;
  /** そのやりとりで、結局どこがはっきりしたか */
  organized: string;
};

export type City = {
  /** URL になる。英小文字とハイフンだけ */
  slug: string;
  /** 都市名。日本語 */
  name: string;
  /** 国・地域名。been.ts の15のどれか */
  country: string;
  /** 行ったときのこと。確認が取れるまで null */
  visited: {
    /** いつ行ったか。例「2023年の春」 */
    when: string;
    /** どういう旅だったか。例「一人で5日」 */
    style: string;
  } | null;
  /** 経験として、迷ったこと・困ったこと */
  struggles: string[];
  /** この都市について相談できる、具体的な例 */
  asks: string[];
  /** やりとりの見本。「利用イメージ」と明記して出す */
  example: Example | null;
};

/**
 * 公開する都市。
 *
 * 空です。運営者が、実際に行った都市だけを足してください。
 * 足し方は上のコメントに書いてあります。
 */
export const CITIES: City[] = [];

export function cityBySlug(slug: string): City | undefined {
  return CITIES.find((c) => c.slug === slug);
}

/** 国ごとにまとめる。一覧の並べ方に使う */
export function citiesByCountry(): { country: string; cities: City[] }[] {
  const out: { country: string; cities: City[] }[] = [];
  for (const c of CITIES) {
    const hit = out.find((o) => o.country === c.country);
    if (hit) hit.cities.push(c);
    else out.push({ country: c.country, cities: [c] });
  }
  return out;
}

/* ── 公開の前に止めること ─────────────────────────
   空のうちは、どれも通る。
   足したときにだけ効く。 */
{
  const seen = new Set<string>();
  for (const c of CITIES) {
    /* ── 行っていない国の都市を、作らないこと ──────────
        いちばん大事な判定。
        been.ts の15に無い国は、その都市にも行っていない。 */
    if (!BEEN.includes(c.country)) {
      throw new Error(
        `「${c.name}」の国が「${c.country}」になっていますが、` +
          `行ったことのある国・地域（lib/been.ts）に入っていません`,
      );
    }
    /* 国名を都市名に書いていないこと。
       「タイ」のページを作っても、どこの話か決まらない。 */
    if (c.name === c.country) {
      throw new Error(`「${c.name}」が国名のままです。都市名を書いてください`);
    }
    if (BEEN.includes(c.name)) {
      throw new Error(`「${c.name}」は国・地域の名前です。都市名を書いてください`);
    }

    if (!/^[a-z][a-z0-9-]*$/.test(c.slug)) {
      throw new Error(`「${c.name}」のURL（${c.slug}）に使えない文字が入っています`);
    }
    if (seen.has(c.slug)) throw new Error(`URL「${c.slug}」が重なっています`);
    seen.add(c.slug);

    /* ── 行ったことが確認できていないものを、出さないこと ──
       ここが null のまま公開すると、
       行っていない都市のページが並ぶ。 */
    if (c.visited === null) {
      throw new Error(
        `「${c.name}」の訪問時期・旅のスタイルが未確認です。` +
          `確認が取れるまで CITIES から外してください（推測で埋めないこと）`,
      );
    }
    if (!c.visited.when || !c.visited.style) {
      throw new Error(`「${c.name}」の、いつ行ったか／どういう旅だったかが空です`);
    }

    /* ── 中身の無いページを、検索に出さないこと ──────── */
    if (c.struggles.length < 2) {
      throw new Error(`「${c.name}」に、迷ったこと・困ったことが2つ以上ありません`);
    }
    if (c.asks.length < 3) {
      throw new Error(`「${c.name}」に、相談できる例が3つ以上ありません`);
    }

    /* ── 大丈夫、と保証しないこと ────────────────────
       根拠なく安全を保証すると、
       そのとおりにならなかったときに責任を負う形になる。 */
    const words = [...c.struggles, ...c.asks, c.visited.when, c.visited.style];
    if (c.example) words.push(c.example.q, c.example.a, c.example.organized);
    for (const t of words) {
      for (const w of ["安全です", "大丈夫です", "問題ありません", "心配ありません", "絶対"]) {
        if (t.includes(w)) {
          throw new Error(`「${c.name}」に「${w}」が入っています。保証はできません`);
        }
      }
      for (const w of ["危険", "危ない", "治安が悪い", "狙われ"]) {
        if (t.includes(w)) {
          throw new Error(`「${c.name}」に「${w}」が入っています。怖がらせて売らないでください`);
        }
      }
    }

    /* ── 見本は、見本だと分かること ──────────────────
       実際の利用者の声に見せない。 */
    if (c.example) {
      for (const [k, v] of Object.entries(c.example)) {
        if (!v) throw new Error(`「${c.name}」の見本の ${k} が空です`);
      }
      for (const w of ["お客様の声", "利用者の声", "体験談", "満足", "おかげで"]) {
        if (c.example.q.includes(w) || c.example.a.includes(w)) {
          throw new Error(`「${c.name}」の見本が、実際の利用者の声に見えます（「${w}」）`);
        }
      }
    }
  }
}
