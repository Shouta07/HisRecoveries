import Link from "next/link";
import { PLANS, topPlans, tier } from "@/lib/ask/plans";
import PlanCta from "@/components/brand/PlanCta";
import Reveal from "@/components/brand/Reveal";
import Yen from "@/components/brand/Yen";

// 売るもの5つのカード。
//
// ══════════════════════════════════════════════════
// 1か所から出す
// ══════════════════════════════════════════════════
// トップと /plans の両方に出る。
// それぞれで書くと、片方だけ古い値段や古い文言が残る。
// ここが唯一の形で、中身は plans.ts の PLANS から引く。
//
// ══════════════════════════════════════════════════
// 値段より先に、何をするものかを出す
// ══════════════════════════════════════════════════
// 金額だけ並べると、人数で比べられる。
// 差は人数ではなく「本番にどれだけ近いか」なので、
// 段（見てもらう → 反応を見る → 会話を試す → …）を先に出す。
//
// ══════════════════════════════════════════════════
// 買えないものを、買えるように見せない
// ══════════════════════════════════════════════════
// available が false のものは、押しても課金画面に行かない。
// 順番待ちへ渡す。ここを曖昧にすると、届けられない約束を売る。

/**
 * 値段の差を、何で説明するか。
 *
 * 「相談の量」で説明しない。量で説明すると、1回あたりの単価で比べられる。
 * 説明するのは「どこまで一緒にやるか」。
 */
const HOW_FAR: Record<string, string> = {
  review: "自分で出す。その前に見てもらう",
  call15: "1つだけ、その場で一緒に決める",
  session: "この相手について、一通り決めきる",
  mockdate: "本番と同じことを、一度通しでやる",
};

export default function PlanCards({
  from,
  all = false,
  openIds,
}: {
  from: string;
  all?: boolean;
  /**
   * いま実際に買えるIDの一覧（サーバーが call/gate.ts から作る）。
   *
   * 声で話す商品は、コードの available が false のままでも、
   * 鍵が揃っていれば買える。その判定は環境を見るので、
   * サーバー側で作ってここへ渡す（client で見ると答えが変わる）。
   */
  openIds?: string[];
}) {
  // トップは5つまで（topPlans）。/plans は全部。
  // ここを PLANS 固定にすると、onTop の上限判定が何も守らなくなる。
  const list = all ? PLANS : topPlans();
  const isOpen = (id: string) => (openIds ? openIds.includes(id) : false);

  return (
    <ul className="flex flex-col gap-3.5">
      {list.map((p, i) => (
        <li key={p.id}>
          <Reveal delay={i * 60}>
            <div
              className={`flex h-full flex-col rounded-card border bg-paper p-5 shadow-card sm:p-6 ${
                p.featured ? "border-2 border-brand" : "border-line"
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                {/* 役割を先に出す。商品名だけだと、どれを使うのか決まらない */}
                <span className="rounded-pill bg-brand-tint px-2.5 py-1 text-[11px] font-black text-brand-deep">
                  {tier(p.tier).label}
                </span>
                <span className="text-[11px] font-bold text-steel">{tier(p.tier).when}</span>
                {isOpen(p.id) ? (
                  <span className="ml-auto rounded-pill border border-line px-2.5 py-1 text-[10.5px] font-bold text-steel">
                    いま受付中
                  </span>
                ) : (
                  <span className="ml-auto rounded-pill bg-mist px-2.5 py-1 text-[10.5px] font-bold text-steel">
                    受付前
                  </span>
                )}
              </div>

              {/* 値段より先に、何をするものかを出す */}
              <p className="mt-2 text-[18px] font-black leading-[1.5] text-slate sm:text-[20px]">
                {p.tagline}
              </p>
              <p className="mt-2.5 text-[13.5px] leading-[1.8] text-steel">{p.value}</p>
              <p className="mt-1.5 text-[12.5px] leading-[1.75] text-steel">
                {HOW_FAR[p.id]}
              </p>

              <ul className="mt-4 flex flex-col gap-1.5 border-t border-line pt-4">
                {p.includes.map((x) => (
                  <li key={x} className="flex items-start gap-2 text-[12.5px] leading-[1.7]">
                    <span aria-hidden className="mt-[3px] shrink-0 text-[11px] font-black text-brand">
                      ✓
                    </span>
                    <span className="min-w-0 text-steel">{x}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                <p className="text-[15px] font-black text-slate">
                  {p.name}
                  <span className="ml-2.5 text-[22px]">
                    <Yen yen={p.yen} from={p.from} />
                  </span>
                  {/* まとめ売りは「1件いくら」に見せない。
                      1つの素材に6,000円を払う話になって、誰も押さない */}
                  {p.uses && (
                    <span className="ml-2 text-[11.5px] font-bold text-steel">
                      月額なし / 自動更新なし
                    </span>
                  )}
                </p>
                {isOpen(p.id) ? (
                  <PlanCta
                    plan={p.id}
                    from={from}
                    className="min-h-[48px] shrink-0 rounded-pill bg-brand px-6 text-[14.5px] !text-paper shadow-card"
                  >
                    {p.uses ? `${p.uses}回分を持っておく` : "この内容で確かめる"}{" "}
                    <span aria-hidden className="ml-1.5">&rarr;</span>
                  </PlanCta>
                ) : (
                  <Link
                    href="/talk"
                    className="inline-flex min-h-[48px] shrink-0 items-center justify-center rounded-pill border border-line bg-paper px-6 text-[14px] font-bold text-steel"
                  >
                    順番待ちに入る <span aria-hidden className="ml-1.5">&rarr;</span>
                  </Link>
                )}
              </div>
            </div>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
