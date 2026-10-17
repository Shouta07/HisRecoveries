import { dbAdminEnabled, dbSelect, dbInsertReturning } from "../db";
import { SCENES, MIN_SHOWN, sceneOf, choiceOf, type Scene } from "./problems";
import type { Gender } from "../who";

/* ══════════════════════════════════════════════════
   答えを集めて、数える
   ══════════════════════════════════════════════════

   ── 作っているのは、回答者の入口でもある ────────
   この面がいちばん詰まっているところを解く。

   いま回答者は0人。そのあいだ「月3回、実在する異性に
   確カメられる」は空手形のまま。LPをいくら磨いても、
   Stripe が開いても、そこは埋まらない。

   答えた人が、そのまま回答者の候補になる。
   答えた履歴が、実技の見本になる。
   だから、この面は集客であると同時に、仕入れでもある。

   ── 割合（%）では出さない ──────────────────────
   「68%がAを選びました」は、数えた人数が見えない。
   3人中2人でも 67% になる。

   出すのは「5人のうち3人」。
   voice.ts の方針と同じ（数えられるものしか出さない）。

   ── 少ないうちは、分布を出さない ────────────────
   1人や2人の答えを分布として出すと、
   それは「みんなこう思っている」になる。
   見ていないことを、知っているように見せない。

   MIN_SHOWN 人に満たないあいだは、人数だけ出す。

   ── 先に選ばせてから、見せる ────────────────────
   選ぶ前に分布を見せると、多数派に引っ張られる。
   そうなると、集まった答えが「前の人の答え」になる。
   選んでから見せる。画面側ではなく、ここで守る。

   ── 消す口を置かない ────────────────────────────
   集めた答えを消す関数は作らない。
   数が減らせる形にしておくと、都合の悪い分布を
   直せることになる。 */

export type Tally = {
  /** 選択肢ごとの数 */
  counts: Record<string, number>;
  /** 答えた人数 */
  total: number;
  /** 分布を出していいか。MIN_SHOWN 人に満たなければ false */
  shown: boolean;
};

export type SceneResult = {
  /** 相談する人から見た異性の答え */
  opposite: Tally;
  /** 同性の答え */
  same: Tally;
};

type Row = { choice_id: string; gender: string };

function tally(rows: Row[], s: Scene): Tally {
  const counts: Record<string, number> = {};
  for (const c of s.choices) counts[c.id] = 0;
  let total = 0;
  for (const r of rows) {
    // 知らない選択肢は数えない（問題を直したあとの古い答え）
    if (!(r.choice_id in counts)) continue;
    counts[r.choice_id] += 1;
    total += 1;
  }
  return { counts, total, shown: total >= MIN_SHOWN };
}

/**
 * その場面の、いまの分布。
 *
 * 見る人の性別を受け取って、異性と同性に分ける。
 * 分けないと、男性が男性の答えを「異性の反応」として読む。
 */
export async function resultOf(sceneId: string, viewer: Gender): Promise<SceneResult | null> {
  const s = sceneOf(sceneId);
  if (!s) return null;
  const empty: Tally = { counts: {}, total: 0, shown: false };
  for (const c of s.choices) empty.counts[c.id] = 0;
  if (!dbAdminEnabled) return { opposite: { ...empty }, same: { ...empty } };

  const rows = await dbSelect<Row>(
    `scene_answers?scene_id=eq.${encodeURIComponent(sceneId)}` +
      `&select=choice_id,gender&limit=5000`,
  );
  const other = viewer === "male" ? "female" : "male";
  return {
    opposite: tally(rows.filter((r) => r.gender === other), s),
    same: tally(rows.filter((r) => r.gender === viewer), s),
  };
}

/**
 * 1つ答える。
 *
 * voter は端末が持つ使い捨ての印。会員登録は無い。
 * 同じ端末から同じ場面に何度も入れられないよう、
 * 表の側（scene_answers_once）で1つに絞っている。
 *
 * 知らない場面・知らない選択肢・知らない性別は、ここで落とす。
 * 画面から来るものを、そのまま信じない。
 */
export async function answer(v: {
  sceneId: unknown;
  choiceId: unknown;
  gender: unknown;
  voter: unknown;
}): Promise<{ ok: boolean; why?: string }> {
  if (typeof v.sceneId !== "string") return { ok: false, why: "場面がありません" };
  const s = sceneOf(v.sceneId);
  if (!s) return { ok: false, why: "その場面はありません" };

  if (typeof v.choiceId !== "string" || !choiceOf(s, v.choiceId)) {
    return { ok: false, why: "その選び方はありません" };
  }
  if (v.gender !== "male" && v.gender !== "female") {
    return { ok: false, why: "どちらの立場かが分かりません" };
  }
  if (typeof v.voter !== "string" || !/^[A-Za-z0-9]{8,64}$/.test(v.voter)) {
    return { ok: false, why: "印の形が違います" };
  }
  if (!dbAdminEnabled) return { ok: false, why: "いまは集計できません。少ししてから、もう一度お試しください。" };

  const ins = await dbInsertReturning("scene_answers", {
    scene_id: s.id,
    choice_id: v.choiceId,
    gender: v.gender,
    voter: v.voter,
  });
  /* 2回目は、表の側で弾かれる。
     それは失敗ではないので、ok のまま返す
     （押した人には、前に選んだぶんの分布が出ればよい）。 */
  return { ok: true, why: ins.ok ? undefined : "すでに答えています" };
}

/* ── 公開の前に止めること ───────────────────────── */
{
  /* 消す口を置かないこと。
     数が減らせる形にしておくと、都合の悪い分布を直せることになる。 */
  const names = ["resultOf", "answer", "tally"];
  for (const n of names) {
    if (/delete|remove|drop|clear|reset/i.test(n)) {
      throw new Error(`答えを集めるところに、消すもの（${n}）があります`);
    }
  }

  /* 少ないうちは、分布を出さないこと。
     ここが false のまま true になると、
     1人の答えが「みんなの答え」として出る。 */
  const s = SCENES[0];
  const one = tally([{ choice_id: s.choices[0].id, gender: "female" }], s);
  if (one.shown) {
    throw new Error("1人の答えが、分布として出る形になっています");
  }
  const enough = tally(
    Array.from({ length: MIN_SHOWN }, () => ({ choice_id: s.choices[0].id, gender: "female" })),
    s,
  );
  if (!enough.shown) {
    throw new Error(`${MIN_SHOWN} 人が答えても、分布が出ない形になっています`);
  }

  /* 知らない選択肢を数えないこと。
     問題を直したあと、古い答えが混ざる。 */
  const stale = tally([{ choice_id: "zzz", gender: "female" }], s);
  if (stale.total !== 0) {
    throw new Error("一覧に無い選択肢を数えています");
  }
}
