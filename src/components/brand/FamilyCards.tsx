import Link from "next/link";
import { PLANS, FAMILIES, type Family, type Plan } from "@/lib/ask/plans";
import PlanCta from "@/components/brand/PlanCta";
import PlanArt from "@/components/brand/PlanArt";
import Yen from "@/components/brand/Yen";

// 選ぶのは2つだけ。
//
// ══════════════════════════════════════════════════
// 商品を並べない。買い方を並べる
// ══════════════════════════════════════════════════
// 前は4枚のカードを並べていた。
// 「確かめる／決める／試す」という役割を先に覚えてもらって、
// どの役割に当たるかの対応表を読んでから、値段を見る形だった。
//
// 読む人が決めたいのは、そこではない。
//   文字で見てもらうのか、声で話すのか
// それだけ。
//
// ══════════════════════════════════════════════════
// 1回から試せる。でも、勧めるのは5回分
// ══════════════════════════════════════════════════
// 初めての人は、これから5回迷うことがまだ想像できない。
// だから1回だけ買える口を開ける。
//
// ただし、実際に使い始めると判断は1回では終わらない。
// 5回分のほうが1回あたり安いことを、並べて見せる。
// 割引率は書かない（「○%オフ」は安売りの言葉）。
// 1回あたりの金額を並べれば、見れば分かる。

/** 家族の絵。買い方では変えない */
const ART: Record<Family, Plan["id"]> = {
  text: "review",
  call: "call15",
  mock: "mockdate",
};

function unitYen(p: Plan): number {
  return p.uses ? Math.round(p.yen / p.uses) : p.yen;
}

function Row({ p, open }: { p: Plan; open: boolean }) {
  const pack = Boolean(p.uses);
  // 「おすすめ」は、いま実際に勧めているもの1つだけ。
  // 受付前の商品に付けると、押せないものを勧めることになる
  const push = Boolean(p.featured) && open;
  return (
    <li
      className={`flex flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-card border px-4 py-3.5 ${
        push ? "border-brand bg-brand-tint" : "border-line bg-paper"
      }`}
    >
      <span className="min-w-0">
        <span className="block text-[14.5px] font-black text-slate">
          {p.name}
          {push && (
            <span className="ml-2 rounded-pill bg-brand px-2 py-0.5 text-[10.5px] font-bold text-paper">
              おすすめ
            </span>
          )}
        </span>
        {/* 1回あたり。パックが安いことを、割引率ではなく金額で見せる */}
        <span className="mt-0.5 block text-[11.5px] text-steel">
          1回あたり ¥{unitYen(p).toLocaleString()}
        </span>
      </span>

      <span className="flex shrink-0 items-center gap-3">
        <span className="text-[17px] font-black tabular-nums text-slate">
          <Yen yen={p.yen} from={p.from} />
        </span>
        {open ? (
          <PlanCta
            plan={p.id}
            from="family"
            className="min-h-[44px] shrink-0 rounded-pill bg-brand px-4 text-[13px] !text-paper"
          >
            選ぶ
          </PlanCta>
        ) : (
          <span className="rounded-pill bg-mist px-3 py-2 text-[11.5px] font-bold text-steel">
            受付前
          </span>
        )}
      </span>
    </li>
  );
}

export default function FamilyCards({
  openIds,
  /** 出す家族。既定は文字と声の2つ。対面はまだ出さない */
  families = ["text", "call"],
}: {
  openIds: string[];
  families?: Family[];
}) {
  return (
    <ul className="flex flex-col gap-4">
      {families.map((fid) => {
        const f = FAMILIES.find((x) => x.id === fid)!;
        // 安い買い方から並べる。1回 → 5回分
        const list = PLANS.filter((p) => p.family === fid).sort((a, b) => a.yen - b.yen);
        if (list.length === 0) return null;
        const open = list.some((p) => openIds.includes(p.id));
        // 絵は家族に1つ。1回売りには絵を持たせていないので、
        // 家族の代表から引く（開いているかどうかで絵を変えない）
        const art = ART[fid];

        return (
          <li
            key={fid}
            className="overflow-hidden rounded-card border border-line bg-paper p-5 shadow-card sm:p-6"
          >
            <PlanArt id={art} />

            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[19px] font-black leading-[1.4] text-slate">
                {f.label}
              </h3>
              {!open && (
                <span className="rounded-pill bg-mist px-2.5 py-1 text-[10.5px] font-bold text-steel">
                  まだ開いていません
                </span>
              )}
            </div>
            <p className="mt-2 text-[13.5px] leading-[1.85] text-steel">{f.lead}</p>

            {/* 何が返ってくるか。値段より先に出す */}
            <ul className="mt-4 flex flex-col gap-1.5 border-t border-line pt-4">
              {list[0].includes.slice(0, 5).map((x) => (
                <li key={x} className="flex items-start gap-2 text-[12.5px] leading-[1.7]">
                  <span aria-hidden className="mt-[3px] shrink-0 text-[11px] font-black text-brand">
                    ✓
                  </span>
                  <span className="min-w-0 text-steel">{x}</span>
                </li>
              ))}
            </ul>

            <ul className="mt-4 flex flex-col gap-2 border-t border-line pt-4">
              {list.map((p) => (
                <Row key={p.id} p={p} open={openIds.includes(p.id)} />
              ))}
            </ul>
          </li>
        );
      })}

      {/* 対面は、まだ形も決まっていない。1行だけ */}
      <li className="rounded-card border border-line bg-mist px-5 py-4">
        <p className="text-[13px] leading-[1.85] text-steel">
          このほかに、本番をそのまま一度やってみる Mock Date があります。
          <Link
            href="/plans"
            className="ml-1 font-bold text-brand underline decoration-line underline-offset-4"
          >
            見る
          </Link>
        </p>
      </li>
    </ul>
  );
}
