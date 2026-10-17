import { CITIES } from "../voice";

/* ══════════════════════════════════════════════════
   都市と、空港の記号
   ══════════════════════════════════════════════════

   ── なぜ記号を出すか ────────────────────────────
   BKK / TPE / ICN。
   航空券にも、搭乗券にも、荷物のタグにも出てくる3文字。

   「バンコク」と書くだけだと、旅行の記事と同じ見た目になる。
   記号が並ぶと、持ちものが切符になる。
   飾りではなく、その人が予約確認メールで何度も見ている文字。

   ── 増やさない ──────────────────────────────────
   都市は voice.ts の CITIES が持つ3つだけ。
   ここはその3つに記号を足すだけで、一覧を別に持たない。
   別に持つと、片方だけ増えた日に食い違う（下の判定で止める）。

   ── 空港は1都市1つ ──────────────────────────────
   バンコクにはドンムアン（DMK）もあるが、出さない。
   初めて一人で行く人が、どちらに着くかを選ぶ画面ではない。
   記号は「どの街か」を言うための札で、便の情報ではない。 */

export type City = (typeof CITIES)[number];

export const CITY_CODE: Record<string, string> = {
  バンコク: "BKK",
  台北: "TPE",
  ソウル: "ICN",
};

/** 時差。日本から見て何時間ずれるか。現地の夜を数えるのに使う */
export const CITY_OFFSET: Record<string, number> = {
  バンコク: -2,
  台北: -1,
  ソウル: 0,
};

export function codeOf(city: string): string | null {
  return CITY_CODE[city] ?? null;
}

/** 日本との時差を、読める形で。ずれがないときは出さない */
export function offsetLabel(city: string): string | null {
  const h = CITY_OFFSET[city];
  if (h === undefined || h === 0) return null;
  return `日本より${Math.abs(h)}時間${h < 0 ? "遅い" : "早い"}`;
}

/* ── 公開の前に止めること ───────────────────────── */
{
  /* 都市の一覧を、2か所で持たないこと。
     片方だけ増えた日に、記号の無い都市が画面に出る。 */
  for (const c of CITIES) {
    if (!CITY_CODE[c]) throw new Error(`都市「${c}」の空港の記号がありません`);
    if (CITY_OFFSET[c] === undefined) throw new Error(`都市「${c}」の時差がありません`);
  }
  for (const c of Object.keys(CITY_CODE)) {
    if (!(CITIES as readonly string[]).includes(c)) {
      throw new Error(`記号だけがある都市「${c}」があります（voice.ts の CITIES にありません）`);
    }
  }

  /* 記号は3文字の英大文字であること。
     小文字や4文字だと、切符に見えない。 */
  for (const [c, code] of Object.entries(CITY_CODE)) {
    if (!/^[A-Z]{3}$/.test(code)) {
      throw new Error(`${c}の記号「${code}」が、3文字の大文字になっていません`);
    }
  }
  if (new Set(Object.values(CITY_CODE)).size !== Object.keys(CITY_CODE).length) {
    throw new Error("空港の記号が重なっています");
  }

  /* 時差が、現実にありえる幅に収まっていること。
     3都市とも、日本から2時間以内。 */
  for (const [c, h] of Object.entries(CITY_OFFSET)) {
    if (Math.abs(h) > 3) throw new Error(`${c}の時差が ${h} 時間です。対象は近場の3都市だけです`);
  }
  if (offsetLabel("ソウル") !== null) throw new Error("時差のない都市で、時差を出しています");
  if (offsetLabel("バンコク") !== "日本より2時間遅い") throw new Error("時差の書き方が合っていません");
}
