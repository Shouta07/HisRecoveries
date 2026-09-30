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

/**
 * 買い方の1行。
 *
 * 2列に並べると1列が160pxしかない。
 * 名前・1回あたり・金額・ボタンを横一列に置くと、全部潰れる。
 * 上に名前と金額、下にボタン、の2段にする。
 */
function Row({ p, open }: { p: Plan; open: boolean }) {
  const push = Boolean(p.featured) && open;
  return (
    <li
      className={`rounded-card border px-3 py-2.5 ${
        push ? "border-brand bg-brand-tint" : "border-line bg-paper"
      }`}
    >
      <p className="flex flex-wrap items-baseline gap-x-1.5">
        <span className="text-[12.5px] font-black text-slate">{p.name}</span>
        {push && (
          <span className="rounded-pill bg-brand px-1.5 py-0.5 text-[9.5px] font-bold text-paper">
            おすすめ
          </span>
        )}
      </p>
      <p className="mt-0.5 flex flex-wrap items-baseline gap-x-2">
        <span className="text-[16px] font-black tabular-nums text-slate">
          <Yen yen={p.yen} from={p.from} />
        </span>
        {/* 1回あたり。パックが安いことを、割引率ではなく金額で見せる */}
        {p.uses && (
          <span className="text-[10.5px] text-steel">1回 ¥{unitYen(p).toLocaleString()}</span>
        )}
      </p>

      {open ? (
        <PlanCta
          plan={p.id}
          from="family"
          className="mt-2 min-h-[40px] w-full rounded-pill bg-brand px-3 text-[12.5px] !text-paper"
        >
          選ぶ
        </PlanCta>
      ) : (
        <span className="mt-2 flex min-h-[40px] items-center justify-center rounded-pill bg-mist text-[11px] font-bold text-steel">
          受付前
        </span>
      )}
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
    // ══════════════════════════════════════════════
    // 2つを横に並べる
    // ══════════════════════════════════════════════
    // 縦に積むと、2つ目を見るのにスクロールが要る。
    // 「文字か、声か」は見比べて決めるものなので、
    // 片方ずつ見せたら比べられない。
    //
    // 狭い画面では1列が160pxしかないので、
    // カードの中身を減らす（返ってくるものは、開いているほうだけ）。
    <ul className="grid grid-cols-2 items-start gap-2.5 sm:gap-4">
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
            className="overflow-hidden rounded-card border border-line bg-paper p-3 shadow-card sm:p-5"
          >
            <PlanArt id={art} />

            <h3 className="text-[14.5px] font-black leading-[1.45] text-slate sm:text-[17px]">
              {f.label}
            </h3>
            {!open && (
              <span className="mt-1 inline-flex rounded-pill bg-mist px-2 py-0.5 text-[10px] font-bold text-steel">
                まだ開いていません
              </span>
            )}
            <p className="mt-1.5 text-[11.5px] leading-[1.75] text-steel sm:text-[13px]">
              {f.lead}
            </p>

            {/* 何が返ってくるか。
                狭い列では3つまで。全部並べると、片方の列だけ倍の高さになる */}
            <ul className="mt-3 flex flex-col gap-1 border-t border-line pt-3">
              {list[0].includes.slice(0, 3).map((x) => (
                <li key={x} className="flex items-start gap-1.5 text-[11px] leading-[1.6] sm:text-[12.5px]">
                  <span aria-hidden className="mt-[3px] shrink-0 text-[9px] font-black text-brand">
                    ✓
                  </span>
                  <span className="min-w-0 text-steel">{x}</span>
                </li>
              ))}
            </ul>

            <ul className="mt-3 flex flex-col gap-1.5 border-t border-line pt-3">
              {list.map((p) => (
                <Row key={p.id} p={p} open={openIds.includes(p.id)} />
              ))}
            </ul>
          </li>
        );
      })}

      {/* 対面は、まだ形も決まっていない。1行だけ。
          2列の片側に入れると、1行が3行に折り返す。横いっぱいに置く */}
      <li className="col-span-2 rounded-card border border-line bg-mist px-4 py-3.5">
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
