import { dbSelect, dbAdminEnabled } from "@/lib/db";
import { PANEL_AGES } from "@/lib/ask/model";
import { QuestionCard, LiveBadge, type Question } from "./market";

// いま動いているもの。
//
// ── 作り物を置かない ──────────────────────────────
// ここは「市場が動いている感じ」を出したい場所なので、
// それらしい件数を置きたくなる。置かない。
//
// 二面市場で「3 / 5 responses」が嘘だと、
// 偽っているのはデザインではなく、市場そのものの厚みになる。
// 答える人がいるから聞く価値がある、という前提を偽ることになる。
//
// だから実データだけを出す。0件なら0件と書く。
// 埋まった瞬間に、ここは勝手に動き出す。

type LiveRow = {
  id: string;
  category: string;
  panel_age: string;
  panel_attrs: string[] | null;
  panel_size: number;
  answered: number;
  status: string;
};

export default async function LiveMarket({ tone = "dark" }: { tone?: "light" | "dark" }) {
  const dark = tone === "dark";

  const rows = dbAdminEnabled
    ? await dbSelect<LiveRow>(
        "live_questions?select=id,category,panel_age,panel_attrs,panel_size,answered,status&limit=6",
      )
    : [];

  const questions: Question[] = rows.map((r) => ({
    id: r.id,
    categoryId: r.category,
    panel: PANEL_AGES.find((p) => p.id === r.panel_age)?.label ?? "指定なし",
    attrs: r.panel_attrs ?? [],
    answered: Number(r.answered) || 0,
    of: r.panel_size,
  }));

  const live = questions.some((q) => q.answered < q.of);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <p className={`text-[11px] font-bold uppercase tracking-[0.22em] ${dark ? "text-ash-soft" : "text-ash"}`}>
          Questions happening now
        </p>
        <LiveBadge on={live} tone={tone} />
      </div>

      {questions.length > 0 ? (
        <>
          <div className={`mt-7 border-t ${dark ? "border-rule-dark" : "border-rule"}`}>
            {questions.map((q) => (
              <QuestionCard key={q.id} q={q} tone={tone} />
            ))}
          </div>
          <p className={`mt-5 text-[12px] leading-[1.8] ${dark ? "text-ash-soft" : "text-ash"}`}>
            相談の中身は出していません。出しているのは、どんな種類の問いが、
            誰に向けて、何件集まっているかだけです。
          </p>
        </>
      ) : (
        <div className={`mt-7 border-t pt-8 ${dark ? "border-rule-dark" : "border-rule"}`}>
          <p className={`text-[22px] font-bold leading-[1.5] sm:text-[26px] ${dark ? "text-bone" : "text-void"}`}>
            まだ、1件も流れていません。
          </p>
          <p className={`mt-4 max-w-[30em] text-[15px] leading-[1.95] ${dark ? "text-ash-soft" : "text-ash"}`}>
            はじまったばかりなので、ここは空です。
            件数をそれらしく埋めることはしません。
            相談が出て、誰かが答えたら、この場所が動きます。
          </p>
        </div>
      )}
    </div>
  );
}
