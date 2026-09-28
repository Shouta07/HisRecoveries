import { NextRequest, NextResponse } from "next/server";
import { dbSelect, dbAdminEnabled } from "@/lib/db";
import { isPanelAge, cleanAttrs } from "@/lib/ask/model";

// 今、この条件で答えられる人。
//
// ── 数えるだけ。誰かは返さない ────────────────────
// 返すのは人数と、年代の並びだけ。
// 一人ひとりのカードを返すと、条件を少しずつ変えて叩くことで
// 個人が絞り込める。匿名で引き受けてもらっている以上、渡さない。
//
// ── いない数を作らない ────────────────────────────
// 0人なら0人と返す。画面にはその通りに出す。
// ここで適当な数を返したら、その瞬間から全部うそになる。
//
// ── ONのまま放置された人を数えない ────────────────
// available_until を過ぎた人は、もうONではない。

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!dbAdminEnabled) {
    return NextResponse.json({ configured: false, n: 0, ages: [] });
  }

  const sp = req.nextUrl.searchParams;
  const age = sp.get("age");
  const attrs = cleanAttrs(sp.get("attrs")?.split(",") ?? []);

  const now = new Date().toISOString();
  const q = [
    "responders?select=display_age_band,attrs",
    "active=eq.true",
    // 年齢を確かめた人だけ数える。自己申告のままの人を「答えられる人」に入れない。
    "verified_age=eq.true",
    "available=eq.true",
    `or=(available_until.is.null,available_until.gt.${now})`,
  ];
  if (isPanelAge(age) && age !== "any") {
    q.push(`display_age_band=eq.${encodeURIComponent(age)}`);
  }

  const rows = await dbSelect<{ display_age_band: string; attrs: string[] | null }>(
    q.join("&"),
  );

  // 属性はこちらで絞る（jsonb の包含条件を URL に組むより読みやすい）
  const match = rows.filter((r) =>
    attrs.every((a) => (r.attrs ?? []).includes(a)),
  );

  return NextResponse.json(
    {
      configured: true,
      n: match.length,
      // 年代の並びだけ。並び順は数の多い順にして、個人を辿れなくする。
      ages: [...new Set(match.map((r) => r.display_age_band))].slice(0, 4),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
