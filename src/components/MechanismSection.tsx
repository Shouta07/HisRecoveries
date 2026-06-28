// 悩み別メカニズム (moved from /mechanism) with attached interviews
// (当事者 / サロン / クリニック) per complex — replaces /interviews too.
import { complexes } from "@/lib/complexes";
import { voicesByComplex, type VoiceRole } from "@/lib/voices";

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

const ROLE_STYLE: Record<VoiceRole, string> = {
  当事者: "bg-[#e7ede4] text-[#3d5638]",
  サロン: "bg-[#eef0e6] text-[#6b7a2e]",
  クリニック: "bg-[#e5f0ef] text-[#0f766e]",
};

export default function MechanismSection() {
  return (
    <section id="mechanism" className="relative z-10 scroll-mt-24 text-[#1f2a1d]">
      <div className="max-w-[1100px] mx-auto px-5 sm:px-8 pt-6 pb-20 md:pb-28">
        <div className="on-media max-w-2xl mb-10 md:mb-14">
          <div className="flex items-center gap-3 mb-4">
            <span aria-hidden className="block w-8 h-px bg-[#85AB8B]" />
            <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#3d5638] font-medium">
              The Mechanism &amp; Voices
            </span>
          </div>
          <h2 className="text-[1.9rem] md:text-[2.4rem] leading-[1.3] text-[#1f2a1d]" style={{ ...MINCHO, fontWeight: 800 }}>
            なぜ生じるのか、<span className="text-[#3d5638]">通った人の声と。</span>
          </h2>
          <p className="mt-4 text-[#4b5b47] text-[14.5px] leading-[1.95]">
            悩み別に「なぜ起きるのか」を仕組みで。そこに、当事者・サロン・連携医療機関の声を添えていきます。
            煽らず、断定せず、原因から。
          </p>
        </div>

        <div className="space-y-5">
          {complexes.map((c, i) => {
            const voices = voicesByComplex[c.id] ?? [];
            return (
              <article
                key={c.id}
                id={c.id}
                className="scroll-mt-24 rounded-[1.5rem] bg-white border border-[#1f2a1d]/10 p-7 sm:p-9 shadow-sm"
              >
                <div className="grid lg:grid-cols-[1.1fr_1fr] gap-7 lg:gap-10">
                  {/* mechanism */}
                  <div>
                    <div className="flex items-baseline gap-3 mb-3">
                      <span className="font-mono text-[13px] text-[#85AB8B]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="text-[1.4rem] font-bold text-[#1f2a1d]" style={MINCHO}>
                        {c.ja}
                      </h3>
                    </div>
                    <span
                      className="inline-flex rounded-full px-3 py-1 text-[11.5px] font-bold mb-4"
                      style={{ backgroundColor: c.accentSoft, color: c.accent }}
                    >
                      {c.system}
                    </span>
                    <p className="text-[14px] text-[#3a423a] leading-[2]">{c.why}</p>
                  </div>

                  {/* attached voices */}
                  <div className="lg:border-l lg:border-[#1f2a1d]/8 lg:pl-9">
                    <div className="text-[12px] font-medium text-[#3d5638] mb-4">現場の声</div>
                    {voices.length > 0 ? (
                      <div className="space-y-3">
                        {voices.map((v, vi) => (
                          <div key={vi} className="rounded-[1rem] bg-[#f6f8f4] border border-[#1f2a1d]/8 p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10.5px] font-bold ${ROLE_STYLE[v.role]}`}>
                                {v.role}
                              </span>
                              {v.span && <span className="text-[11px] text-[#6b7a66]">{v.span}</span>}
                            </div>
                            <p className="text-[13px] text-[#1f2a1d] leading-[1.85]">「{v.quote}」</p>
                            <div className="mt-2 text-[11.5px] text-[#6b7a66]">{v.who}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[12.5px] text-[#9aa79a] leading-[1.9]">
                        インタビューは順次公開していきます。
                      </p>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <p className="on-media mt-8 text-[12px] text-[#6b7a66] leading-[1.9]">
          ※ 一般的に知られる情報の整理および当事者・関係者の観察であり、診断・治療・受診勧奨を目的としたものではありません。
          個別の判断は医療機関にご相談ください。インタビューはすべて匿名で、特定の医療機関・商品を推奨するものではありません。
        </p>
      </div>
    </section>
  );
}
