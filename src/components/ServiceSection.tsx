// Service — 一本の線を1セクションに集約。
// Step 01 現在地を知る（外側=印象診断¥22,000 / 内側=血液・準備中）
// Step 02 道のりを選ぶ（Recover|取り戻す / Refine|深める）
// ギフトは独立させず、両プランに「贈れる」とさりげなく（守秘設計は維持）。
// 急ぎ（緊急枠）は脚注に。CTA はすべて既存の匿名相談導線。
import Link from "next/link";
import BookingCTA from "@/components/BookingCTA";
import { entryDiagnosis, bloodCheck, urgentNote } from "@/lib/packages";

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

export default function ServiceSection() {
  return (
    <section id="service" className="relative z-10 scroll-mt-24 text-[#1f2a1d]">
      <div className="max-w-[1100px] mx-auto px-5 sm:px-8 pt-10 sm:pt-16 pb-6">

        {/* Step 01 — 現在地を知る */}
        <div className="on-media max-w-2xl mb-7">
          <div className="flex items-center gap-3 mb-3">
            <span aria-hidden className="block w-8 h-px bg-[#85AB8B]" />
            <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#3d5638] font-medium">Step 01 — 現在地を知る</span>
          </div>
          <h2 className="text-[1.4rem] sm:text-[1.8rem] leading-[1.4]" style={{ ...MINCHO, fontWeight: 800 }}>
            まず、いまの自分を知ることから。
          </h2>
          <p className="mt-3 text-[#4b5b47] text-[13px] sm:text-[14.5px] leading-[1.95]">
            取り戻したいものがあるのか、もう一段深めたいのか。
            <br className="hidden sm:block" />
            どちらも、現在地を知ることから始まります。
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 mb-12">
          {/* 外側の現在地 — 印象診断 */}
          <Link href="/apply" className="group rounded-[1.4rem] bg-white border border-[#1f2a1d]/12 p-6 sm:p-7 hover:border-[#3d5638]/50 transition-colors">
            <div className="text-[10px] tracking-[0.18em] text-[#3d5638] font-semibold mb-2">外側の現在地</div>
            <div className="flex items-baseline gap-2">
              <span className="text-[1.05rem] font-bold text-[#1f2a1d]" style={MINCHO}>{entryDiagnosis.name}</span>
              <span className="text-[13px] font-bold text-[#3d5638]">{entryDiagnosis.price}</span>
            </div>
            <p className="mt-2 text-[12px] text-[#4b5b47] leading-[1.85]">{entryDiagnosis.note}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#3d5638] group-hover:gap-2.5 transition-all">匿名で相談する <span aria-hidden>→</span></span>
          </Link>
          {/* 内側の現在地 — 血液（準備中） */}
          <Link href="/apply" className="group rounded-[1.4rem] bg-white border border-[#1f2a1d]/12 p-6 sm:p-7 hover:border-[#3d5638]/50 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] tracking-[0.18em] text-[#3d5638] font-semibold">内側の現在地</span>
              <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-[#eef3ea] text-[#3d5638]">{bloodCheck.status}</span>
            </div>
            <div className="text-[1.05rem] font-bold text-[#1f2a1d]" style={MINCHO}>{bloodCheck.name}</div>
            <p className="mt-2 text-[12px] text-[#4b5b47] leading-[1.85]">{bloodCheck.note}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#3d5638] group-hover:gap-2.5 transition-all">ご案内は、匿名相談から <span aria-hidden>→</span></span>
          </Link>
        </div>

        {/* 気になることは、いくつでも（複数選択して始められる） */}
        <div className="on-media mb-12 rounded-[1.4rem] border border-[#1f2a1d]/10 bg-white/60 p-6 sm:p-7">
          <div className="text-[13.5px] font-bold text-[#1f2a1d] mb-3" style={MINCHO}>気になることは、いくつでも。</div>
          <div className="flex flex-wrap gap-2 mb-4">
            {["薄毛", "ニキビ・肌", "疲れて見える", "清潔感", "写真が苦手", "自信・パートナーシップ", "そのほか"].map((t) => (
              <span key={t} className="rounded-full border border-[#3d5638]/25 bg-[#eef3ea] px-3.5 py-1.5 text-[12px] font-medium text-[#3d5638]">
                {t}
              </span>
            ))}
          </div>
          <p className="text-[12.5px] text-[#4b5b47] leading-[1.9]">
            ひとつに絞らなくて大丈夫。<span className="text-[#1f2a1d] font-medium">Recover でも Refine でも、複数の悩みをまとめて、ひとつの窓口で</span>始められます。何から手をつけるかは、一緒に決めます。
          </p>
        </div>

        {/* Step 02 — 道のりを選ぶ */}
        <div className="on-media max-w-2xl mb-7">
          <div className="flex items-center gap-3 mb-3">
            <span aria-hidden className="block w-8 h-px bg-[#85AB8B]" />
            <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#3d5638] font-medium">Step 02 — 道のりを選ぶ</span>
          </div>
          <h2 className="text-[1.5rem] sm:text-[1.9rem] md:text-[2.2rem] leading-[1.35]" style={{ ...MINCHO, fontWeight: 800 }}>
            向きは、2つ。<span className="text-[#3d5638]">どちらも、整える。</span>
          </h2>
          <p className="mt-3 text-[#4b5b47] text-[13px] sm:text-[14.5px] leading-[1.9]">
            取り戻すのか、深めるのか。出発点は違っても、道のりは一本の線で。
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-3 sm:gap-4 items-stretch">
          {/* Plan 01 — Recover｜取り戻す */}
          <div className="rounded-[1.8rem] bg-[#16241a] text-[#EDF1E8] border border-[#85AB8B]/40 shadow-[0_24px_50px_-26px_rgba(20,32,26,0.7)] p-7 sm:p-8 flex flex-col relative overflow-hidden">
            <div aria-hidden className="absolute -top-16 -right-10 w-64 h-64 rounded-full blur-3xl" style={{ background: "rgba(133,171,139,0.16)" }} />
            <div className="relative flex flex-col h-full">
              <div className="font-mono text-[10.5px] tracking-[0.2em] uppercase text-[#85AB8B] mb-2">Plan 01</div>
              <h3 className="text-[1.4rem] sm:text-[1.6rem] font-bold text-[#EDF1E8] leading-[1.35]" style={MINCHO}>
                Recover<span className="text-[#85AB8B] text-[1.05rem] font-normal ml-2">｜取り戻す</span>
              </h3>
              <div className="mt-2 text-[12px] text-[#9FB0A0]">目安 ¥150,000〜 ・ 専属チーム貸切</div>
              <p className="mt-4 text-[13px] text-[#C9D2C4] leading-[2]">
                誰にも言えなかった悩みから、はじめる。
                見た目の奥にある「本当はどうありたいか」まで、匿名のまま、一緒にほどいていく。
                気になっていることが、複数重なっているほど。ひとつの窓口で。
              </p>
              <div className="mt-auto pt-6">
                <BookingCTA className="w-full text-center bg-[#EDF1E8] hover:bg-white text-[#16241a] text-sm font-semibold px-6 py-3.5 rounded-full transition-colors">
                  Recover を相談する（匿名）
                </BookingCTA>
              </div>
            </div>
          </div>

          {/* Plan 02 — Refine｜深める */}
          <div className="rounded-[1.8rem] bg-white border border-[#1f2a1d]/12 p-7 sm:p-8 flex flex-col">
            <div className="font-mono text-[10.5px] tracking-[0.2em] uppercase text-[#6b7a66] mb-2">Plan 02</div>
            <h3 className="text-[1.4rem] sm:text-[1.6rem] font-bold text-[#1f2a1d] leading-[1.35]" style={MINCHO}>
              Refine<span className="text-[#3d5638] text-[1.05rem] font-normal ml-2">｜深める</span>
            </h3>
            <div className="mt-2 text-[12px] text-[#6b7a66]">目安 ¥150,000〜 ・ 専属チーム貸切</div>
            <p className="mt-4 text-[13px] text-[#4b5b47] leading-[2]">
              困ってはいない。でも、もう一段。
              すでに整っている人が、印象と自信に「意図」を通すための一日。
            </p>
            <div className="mt-auto pt-6">
              <BookingCTA className="w-full text-center bg-[#1f2a1d] hover:bg-[#2a3827] text-white text-sm font-semibold px-6 py-3.5 rounded-full transition-colors">
                Refine を相談する
              </BookingCTA>
            </div>
          </div>
        </div>

        <div className="on-media mt-5 space-y-1.5 text-[12px] text-[#6b7a66] leading-[1.85]">
          <p>どちらも「取扱説明書」として、その後もあなたの記録として育てられます。</p>
          <p>どちらも、ご自身にも、大切な人へのギフトとして贈ることもできます。贈られた方は匿名で選べ、内容は贈り主に開示されません。</p>
          <p className="text-[#9aa79a]">※ {urgentNote}</p>
        </div>
      </div>
    </section>
  );
}
