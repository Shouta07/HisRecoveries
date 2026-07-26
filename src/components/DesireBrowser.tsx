import Link from "next/link";
import {
  DESIRES,
  DESIRE_ORDER,
  clustersByDesire,
  type DesireKey,
} from "@/lib/clusters";

const HEAD = { fontFamily: "var(--font-shippori)" } as const;

/**
 * 「あなたは、何を叶えたいですか？」— 目的（普遍的欲求）から記事を探す入口。
 * ホームと /areas の両方で使う。クリックで /areas?desire=<key> に絞り込み。
 * 明るいクリーム面（#f4f6f2 系）に載る前提のライトテーマ。
 */
export default function DesireBrowser({
  activeDesire,
  heading = "あなたは、何を叶えたいですか？",
}: {
  activeDesire?: DesireKey;
  heading?: string;
}) {
  return (
    <section id="mokuteki" className="scroll-mt-[128px]">
      <div className="flex items-center gap-3 mb-2">
        <span aria-hidden className="block w-8 h-px bg-[#85AB8B]" />
        <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-[#3d5638] font-medium">
          目的から探す
        </span>
      </div>
      <h2 className="text-[1.35rem] sm:text-[1.6rem] leading-[1.3] text-[#1f2a1d]" style={HEAD}>
        {heading}
      </h2>
      <p className="mt-2 text-[13px] text-[#4b5b47] leading-[1.85]">
        悩みの名前がわからなくても、「どうなりたいか」から記事を探せます。
      </p>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {DESIRE_ORDER.map((key) => {
          const d = DESIRES[key];
          const count = clustersByDesire(key).length;
          const active = key === activeDesire;
          return (
            <Link
              key={key}
              href={`/areas?desire=${key}#mokuteki`}
              aria-current={active ? "true" : undefined}
              className={`group rounded-[1.2rem] border p-4 transition-all ${
                active
                  ? "border-[#3d5638] bg-[#16241A] text-[#EDF1E8] shadow-[0_18px_38px_-24px_rgba(20,32,26,0.6)]"
                  : "border-[#1f2a1d]/10 bg-white text-[#1f2a1d] hover:border-[#3d5638]/40 hover:-translate-y-0.5"
              }`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[15px] font-bold" style={HEAD}>
                  {d.label}
                </span>
                <span
                  className={`text-[11px] tabular-nums ${
                    active ? "text-[#9ec4a3]" : "text-[#6b7a66]"
                  }`}
                >
                  {count}本
                </span>
              </div>
              <p
                className={`mt-1.5 text-[12px] leading-[1.8] ${
                  active ? "text-[#C9D2C4]" : "text-[#4b5b47]"
                }`}
              >
                {d.hook}
              </p>
              <span
                className={`mt-2.5 inline-flex items-center gap-1 text-[12px] font-semibold ${
                  active ? "text-[#9ec4a3]" : "text-[#3d5638]"
                }`}
              >
                {active ? "選択中" : "記事を見る"} <span aria-hidden>→</span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
