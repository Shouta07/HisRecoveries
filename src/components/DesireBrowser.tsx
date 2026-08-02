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
 *
 * デザインは診断カードの語彙に合わせる：濃緑のヘッダー帯・大きな角丸・
 * 深いソフトシャドウ。カード内にCTA文言を繰り返さず、余白と級差で見せる。
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
      <div className="rounded-[1.6rem] bg-white border border-[#1B2024]/10 shadow-[0_24px_60px_-40px_rgba(20,32,26,0.55)] overflow-hidden">
        {/* ヘッダー帯 — 診断カードと同じ濃緑のアンカー */}
        <div className="bg-[#2E4A66] text-[#F1F3F3] px-6 sm:px-9 py-6 sm:py-7">
          <div className="font-mono text-[11px] tracking-[0.24em] uppercase text-[#70B0B0]">
            目的から探す
          </div>
          <h2
            className="mt-2.5 text-[1.35rem] sm:text-[1.7rem] font-[800] leading-[1.4] text-[#F1F3F3]"
            style={HEAD}
          >
            {heading}
          </h2>
          <p className="mt-2 text-[14px] sm:text-[15px] text-[#C3D3D6] leading-[1.8]">
            悩みの名前がわからなくても、「どうなりたいか」から選べます。
          </p>
        </div>

        {/* 目的のグリッド */}
        <div className="p-5 sm:p-7">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {DESIRE_ORDER.map((key) => {
              const d = DESIRES[key];
              const count = clustersByDesire(key).length;
              const active = key === activeDesire;
              return (
                <Link
                  key={key}
                  href={`/areas?desire=${key}#mokuteki`}
                  aria-current={active ? "true" : undefined}
                  className={`group relative rounded-[1.2rem] px-5 py-4 transition-all duration-200 ${
                    active
                      ? "bg-[#2E4A66] text-[#F1F3F3] shadow-[0_18px_40px_-26px_rgba(20,32,26,0.8)]"
                      : "bg-[#FAFBFB] text-[#1B2024] hover:bg-white hover:shadow-[0_18px_40px_-28px_rgba(20,32,26,0.55)] hover:-translate-y-0.5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[15.5px] font-bold leading-[1.5]" style={HEAD}>
                      {d.label}
                    </span>
                    <span
                      className={`shrink-0 font-mono text-[12px] tabular-nums pt-1 ${
                        active ? "text-[#70B0B0]" : "text-[#5E6E76]"
                      }`}
                    >
                      {count}
                    </span>
                  </div>
                  <p
                    className={`mt-2 text-[13.5px] leading-[1.85] ${
                      active ? "text-[#C3D3D6]" : "text-[#414A50]"
                    }`}
                  >
                    {d.hook}
                  </p>
                  {/* 矢印はホバー時だけ。全カードにCTA文言を並べない */}
                  <span
                    aria-hidden
                    className={`absolute right-4 bottom-3 text-[14.5px] transition-all duration-200 ${
                      active
                        ? "text-[#70B0B0] opacity-100"
                        : "text-[#2F6F79] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5"
                    }`}
                  >
                    →
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
