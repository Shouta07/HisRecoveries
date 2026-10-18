import { CITIES } from "./cities";

/* ══════════════════════════════════════════════════
   実体験の記事
   ══════════════════════════════════════════════════

   ── ここも、入れ物だけ ──────────────────────────
   STORIES は空です。記事は1本も出ません。

   ここに入るのは、一般論ではなく、実際にあったことだけ。

     空港から宿まで、自分がどう移動したか
     一人で食事や観光をして、どう感じたか
     困ったこと、準備してよかったこと

   運営者が実際に書いたものしか置けない。
   こちらで書くと、行っていない旅の話になる。

   ── 薄い記事を量産しない ────────────────────────
   「バンコク 空港 移動」で検索して出てくるものを
   言い換えて並べることはできる。できるが、しない。

   同じものがすでに何千本もある。そこへ足しても読まれないし、
   読まれたところで、このサービスを買う理由にならない。

   買う理由になるのは「この人は実際に行っている」の1点だけ。
   だから、実際に行った話しか置かない。

   ── 写真 ────────────────────────────────────────
   運営者が撮ったものだけ。
   素材サイトの写真を、本人の旅の写真として置かない。
   photo には、撮った本人のものだと確認できたファイルだけを指す。

   ── 記事から、都市のページへ ────────────────────
   記事は単体で終わらせない。必ず city を持たせて、
   読んだ人が相談のページへ進めるようにする。
   city が CITIES に無ければ、公開の前に止まる。 */

export type Story = {
  /** URL になる。英小文字とハイフンだけ */
  slug: string;
  title: string;
  /** どの都市の話か。cities.ts の slug */
  city: string;
  /** 一覧と検索結果に出る1行 */
  summary: string;
  /** 本文。1つずつが1段落 */
  body: string[];
  /** 公開日。YYYY-MM-DD */
  date: string;
  /** 運営者が撮った写真だけ。無ければ空 */
  photos: { src: string; alt: string }[];
};

/**
 * 公開する記事。
 *
 * 空です。運営者が実際に書いたものだけを足してください。
 */
export const STORIES: Story[] = [];

export function storyBySlug(slug: string): Story | undefined {
  return STORIES.find((s) => s.slug === slug);
}

export function storiesOfCity(citySlug: string): Story[] {
  return STORIES.filter((s) => s.city === citySlug);
}

/* ── 公開の前に止めること ───────────────────────── */
{
  const seen = new Set<string>();
  for (const s of STORIES) {
    if (!/^[a-z][a-z0-9-]*$/.test(s.slug)) {
      throw new Error(`記事「${s.title}」のURL（${s.slug}）に使えない文字が入っています`);
    }
    if (seen.has(s.slug)) throw new Error(`記事のURL「${s.slug}」が重なっています`);
    seen.add(s.slug);

    /* ── 行き先のページが、あること ──────────────────
       記事だけ出して、相談へ進む先が無い状態にしない。 */
    if (!CITIES.some((c) => c.slug === s.city)) {
      throw new Error(
        `記事「${s.title}」の都市（${s.city}）が、相談ページにありません。` +
          `先に lib/cities.ts へ足してください`,
      );
    }

    /* ── 薄い記事を出さないこと ──────────────────────
       検索のためだけに置いた短文を、公開しない。 */
    if (!s.title || !s.summary) throw new Error(`記事「${s.slug}」に見出しか1行がありません`);
    const len = s.body.join("").length;
    if (s.body.length < 3 || len < 400) {
      throw new Error(
        `記事「${s.title}」が短すぎます（${s.body.length}段落・${len}字）。` +
          `検索のためだけの記事は出さないでください`,
      );
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s.date)) {
      throw new Error(`記事「${s.title}」の日付（${s.date}）の形が違います`);
    }

    /* ── 実際にあったことが、書いてあること ────────────
       一般論だけの記事は、ここで止まる。
       自分が何をしたかを書いていれば、一人称が必ず出る。 */
    const text = s.body.join("\n");
    if (!/(わたし|私|自分|こちら)/.test(text)) {
      throw new Error(
        `記事「${s.title}」に、自分が何をしたかが書かれていません。` +
          `一般論ではなく、実際にあったことを書いてください`,
      );
    }

    /* ── 保証しない・怖がらせない ──────────────────── */
    for (const w of ["安全です", "大丈夫です", "絶対", "危険", "危ない", "治安が悪い"]) {
      if (text.includes(w) || s.title.includes(w) || s.summary.includes(w)) {
        throw new Error(`記事「${s.title}」に「${w}」が入っています`);
      }
    }

    /* ── 写真 ────────────────────────────────────────
       代替テキストが無い写真を置かない。
       置き場所も決めておく（素材サイトの画像が
       まぎれ込まないよう、公開フォルダを分ける）。 */
    for (const p of s.photos) {
      if (!p.alt) throw new Error(`記事「${s.title}」の写真に、説明（alt）がありません`);
      if (!p.src.startsWith("/img/stories/")) {
        throw new Error(
          `記事「${s.title}」の写真が /img/stories/ の外にあります（${p.src}）。` +
            `運営者が撮ったものだけを、そこへ置いてください`,
        );
      }
    }
  }
}
