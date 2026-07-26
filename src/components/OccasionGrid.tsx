"use client";

// Job（叶えたいこと）別の入口 — サイトのメインエントランス。
//
// 悩み（「薄毛が気になる」）を自認させると、いちばん払える層ほど入ってこない。
// だから最初に選ばせるのは、恥ずかしくない情報＝叶えたいことだけにする。
// 表面的な悩み（現在の障害）は選んだ後に見せ、診断が構成として言い当てる。
//
// ブランドの3層のうち、ここは「実際に売る入口」の層：
//   上位概念 … 理想の男に、最短距離で。（ヒーロー）
//   売る入口 … 大切な場面で、自信を持てる自分へ。（このセクション）
//   提供価値 … あなたに必要な変化の順番を設計する。（このセクション本文〜診断）

import Link from "next/link";
import { occasions, type OccasionId } from "@/lib/occasions";

const MINCHO: React.CSSProperties = {
  fontFamily:
    "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

export default function OccasionGrid({
  selected,
  onSelect,
}: {
  selected: OccasionId | null;
  onSelect: (id: OccasionId) => void;
}) {
  return (
    <section
      id="occasions"
      className="relative z-10 scroll-mt-24 text-[#1f2a1d]"
    >
      <div className="max-w-[1100px] mx-auto px-5 sm:px-8 pt-12 sm:pt-16 pb-2">
        <div className="max-w-2xl mb-7">
          <div className="flex items-center gap-3 mb-3">
            <span aria-hidden className="block w-8 h-px bg-[#85AB8B]" />
            <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#3d5638] font-medium">
              大切な場面で、自信を持てる自分へ
            </span>
          </div>
          <h2
            className="text-[1.5rem] sm:text-[1.9rem] leading-[1.35]"
            style={{ ...MINCHO, fontWeight: 800 }}
          >
            あなたは、<span className="text-[#3d5638]">何を叶えたい</span>
            ですか？
          </h2>
          <p className="mt-3 text-[13px] sm:text-[14px] text-[#4b5b47] leading-[1.9]">
            必要な変化は、悩みではなく
            <span className="font-semibold text-[#1f2a1d]">叶えたいこと</span>
            から決まります。 近いものをひとつ選んでください。そこから逆算して、
            <span className="font-semibold text-[#1f2a1d]">
              あなたに必要な変化の順番
            </span>
            を設計します。
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {occasions.map((o) => {
            const on = selected === o.id;
            return (
              <div key={o.id} className="relative flex">
                <button
                  type="button"
                  onClick={() => onSelect(o.id)}
                  aria-pressed={on}
                  className={`group flex flex-1 flex-col text-left rounded-[1.4rem] border p-5 sm:p-6 pb-12 sm:pb-14 transition-colors ${
                    on
                      ? "bg-[#16241A] border-[#16241A] text-[#EDF1E8]"
                      : "bg-white border-[#1f2a1d]/12 hover:border-[#3d5638]/45"
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-3">
                    <span
                      className={`font-mono text-[10.5px] tracking-[0.14em] ${on ? "text-[#9ec4a3]" : "text-[#85AB8B]"}`}
                    >
                      {o.no}
                    </span>
                    <span
                      className={`text-[11px] font-semibold leading-[1.5] ${on ? "text-[#C9D2C4]" : "text-[#6b7a66]"}`}
                    >
                      {o.purpose}
                    </span>
                  </div>

                  <div
                    className={`text-[1.05rem] sm:text-[1.15rem] font-bold leading-[1.45] ${on ? "text-[#EDF1E8]" : "text-[#1f2a1d]"}`}
                    style={MINCHO}
                  >
                    {o.title}
                  </div>

                  {/* 本当のJob — 表面的な悩みの下にある、お金を払う理由 */}
                  <p
                    className={`mt-2.5 text-[12.5px] font-semibold leading-[1.8] ${on ? "text-[#D7DED2]" : "text-[#3d5638]"}`}
                  >
                    {o.job}
                  </p>
                  <p
                    className={`mt-1.5 text-[11.5px] leading-[1.75] ${on ? "text-[#9FB0A0]" : "text-[#6b7a66]"}`}
                  >
                    {o.lead}
                  </p>

                  <ul className="mt-3.5 flex flex-wrap gap-1.5">
                    {o.examples.map((e) => (
                      <li
                        key={e}
                        className={`rounded-full px-2.5 py-1 text-[10.5px] leading-[1.5] ${
                          on
                            ? "bg-white/[0.08] text-[#D7DED2]"
                            : "bg-[#eef3ea] text-[#3d5638]"
                        }`}
                      >
                        {e}
                      </li>
                    ))}
                  </ul>

                  <span
                    className={`mt-auto pt-4 inline-flex items-center gap-1.5 text-[12.5px] font-bold ${
                      on ? "text-[#9ec4a3]" : "text-[#3d5638]"
                    }`}
                  >
                    {on ? "選択中 — 下で組んでいます" : "このシーンで組む"}
                    <span
                      aria-hidden
                      className="group-hover:translate-x-0.5 transition-transform"
                    >
                      →
                    </span>
                  </span>
                </button>

                {/* 詳しく読みたい人向けの副導線。button の中に a は入れられないので外に出す。 */}
                <Link
                  href={`/occasions/${o.id}`}
                  className={`absolute right-5 bottom-5 sm:right-6 sm:bottom-6 text-[11.5px] font-semibold underline underline-offset-4 transition-opacity hover:opacity-70 ${
                    on ? "text-[#9FB0A0]" : "text-[#6b7a66]"
                  }`}
                >
                  詳しく
                </Link>
              </div>
            );
          })}

          {/* 6枚目＝当てはまらない人の受け皿。選ばせずに、そのまま下へ流す。 */}
          <div className="flex flex-col justify-center rounded-[1.4rem] border border-dashed border-[#1f2a1d]/18 bg-[#f6f8f4] p-5 sm:p-6">
            <div
              className="text-[13.5px] font-bold text-[#1f2a1d] leading-[1.5]"
              style={MINCHO}
            >
              当てはまるものが、ない
            </div>
            <p className="mt-2 text-[12px] text-[#4b5b47] leading-[1.8]">
              決まっていなくても大丈夫です。選ばずに、そのまま下のフォームへ。
              住まいと年齢だけでも、組めます。
            </p>
            <a
              href="#diagnosis"
              className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-bold text-[#3d5638] hover:opacity-70 transition-opacity"
            >
              選ばずに進む <span aria-hidden>→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
