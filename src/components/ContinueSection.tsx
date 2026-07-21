// Stage 3 — 進む（つづく）。
// 「一日で、終わりにしない。」記録はあなたのものとして育ち、次の一手を折にふれて。
// 価格・サブスク・会員制の具体は書かない。「詳しくは、体験のなかで。」で止める。
const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

export default function ContinueSection() {
  return (
    <section id="continue" className="relative z-10 scroll-mt-24">
      <div className="max-w-[860px] mx-auto px-5 sm:px-8 py-6">
        <div className="rounded-[2rem] bg-[#16241a] text-[#EDF1E8] p-8 sm:p-12 overflow-hidden relative">
          <div aria-hidden className="absolute -bottom-20 -left-12 w-80 h-80 rounded-full blur-3xl" style={{ background: "rgba(133,171,139,0.14)" }} />
          <div className="relative">
            <div className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#85AB8B] mb-4">Continue — つづく</div>
            <h2 className="text-[1.4rem] sm:text-[2rem] leading-[1.5]" style={{ ...MINCHO, fontWeight: 800 }}>
              一日で、<span className="text-[#85AB8B]">終わりにしない。</span>
            </h2>
            <div className="mt-6 space-y-4 text-[14px] sm:text-[15px] text-[#C9D2C4] leading-[2.05] max-w-[34rem]">
              <p>整えた一日は、はじまり。</p>
              <p>
                体験のあとも、記録はあなたのものとして育ち、
                <br className="hidden sm:block" />
                次の一手を折にふれてお渡しします。
              </p>
              <p className="text-[#9FB0A0] text-[13px]">詳しくは、体験のなかで。</p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-[11.5px] text-[#9FB0A0]">
              {["整える", "持ち帰る", "育つ", "つづく"].map((t, i) => (
                <span key={t} className="inline-flex items-center gap-3">
                  {i > 0 && <span aria-hidden className="text-[#4a5a4c]">—</span>}
                  <span>{t}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
