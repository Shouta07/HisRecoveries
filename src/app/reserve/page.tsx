import type { Metadata } from "next";
import Link from "next/link";
import ConsultEntry from "@/components/ConsultEntry";
import { site } from "@/lib/site";

// TimeRex / Calendly 等の予約ウィジェットURL。設定された瞬間に埋め込みが出る。
// 未設定の間は LINE / フォームのフォールバックで受け付ける（壊れない）。
const BOOKING_URL = process.env.NEXT_PUBLIC_TIMEREX_URL ?? "";

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

export const metadata: Metadata = {
  title: "無料相談を予約 — 匿名・15分",
  description:
    "His Recoveries の無料相談（15分）。カメラオフ・表示名なしでOK。正体を明かさず、悩みと現在地を一緒に整理します。",
  alternates: { canonical: `${site.url}/reserve` },
  robots: { index: true, follow: true },
};

const CHIPS = ["カメラオフOK", "表示名なしOK", "無料", "秘密は守る"];

export default function ReservePage() {
  return (
    <div className="bg-[#f4f6f2] text-[#1f2a1d] min-h-screen">
      {/* ── ヒーロー（深緑・匿名Web相談の説明） ── */}
      <section className="relative overflow-hidden bg-[#16241A] text-[#EDF1E8]">
        <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 95% 75% at 50% 20%, #24382b 0%, #16241A 58%, #0f1a12 100%)" }} />
        <div className="relative max-w-[820px] mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-12 sm:pb-14">
          <nav aria-label="パンくず" className="text-[11.5px] text-[#9FB0A0] mb-8">
            <Link href="/" className="hover:text-[#EDF1E8]">ホーム</Link>
            <span className="mx-1.5">/</span>
            <span className="text-[#EDF1E8]">無料相談を予約</span>
          </nav>
          <div className="font-mono text-[11px] tracking-[0.28em] text-[#85AB8B] mb-4">FREE CONSULT — 15分・無料</div>
          <h1 className="text-[#EDF1E8] text-[1.9rem] sm:text-[2.7rem] leading-[1.35]" style={{ ...MINCHO, fontWeight: 800 }}>
            匿名のまま、<br /><span className="text-[#9ec4a3]">まず15分。</span>
          </h1>
          <p className="mt-5 text-[14px] sm:text-[15px] text-[#C9D2C4] leading-[2] max-w-[38rem]">
            <strong className="text-[#EDF1E8] font-semibold">カメラオフ・表示名なしでOK。</strong>
            正体を明かさずに、悩みと「現在地」を一緒に整理します。何から・どの順で進むかの地図を、この15分で。
            売り込みません。もちろん無料です。
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            {CHIPS.map((c) => (
              <span key={c} className="rounded-full border border-[#85AB8B]/30 bg-white/[0.06] px-3.5 py-1.5 text-[12px] font-medium text-[#D7DED2]">
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── 予約（TimeRex 埋め込み or フォールバック） ── */}
      <div className="max-w-[820px] mx-auto px-5 sm:px-8 pt-10 sm:pt-12 pb-16">
        {BOOKING_URL ? (
          <div className="rounded-[1.4rem] overflow-hidden border border-[#1f2a1d]/10 bg-white">
            <iframe
              src={BOOKING_URL}
              title="日程を選ぶ"
              className="w-full h-[720px] sm:h-[760px]"
              style={{ border: "0" }}
              loading="lazy"
            />
          </div>
        ) : (
          <div>
            <div className="rounded-[1.4rem] border border-dashed border-[#1f2a1d]/20 bg-white/70 p-6 sm:p-7 mb-8">
              <p className="text-[13.5px] font-bold text-[#1f2a1d] mb-1.5" style={MINCHO}>日程調整（Web相談）は、まもなく公開します。</p>
              <p className="text-[12.5px] text-[#4b5b47] leading-[1.9]">
                いまはメールで受け付けています。ご希望の時間帯を添えていただければ、こちらから日程をご案内します。
              </p>
            </div>
            <ConsultEntry />
          </div>
        )}

        {/* この後の流れ */}
        <div className="mt-10 rounded-[1.3rem] bg-[#16241a] text-[#EDF1E8] p-6 sm:p-7">
          <div className="font-mono text-[10.5px] tracking-[0.2em] uppercase text-[#85AB8B] mb-3">After the consult</div>
          <ol className="space-y-2.5 text-[13px] text-[#C9D2C4] leading-[1.8]">
            <li><span className="text-[#9ec4a3] font-bold">01</span>　匿名Web相談（15分・無料）で、地図を一緒に。</li>
            <li><span className="text-[#9ec4a3] font-bold">02</span>　進むなら、相互の秘密保持契約（NDA）。記録はあなたのもの。</li>
            <li><span className="text-[#9ec4a3] font-bold">03</span>　LINEで体験へ。プロチームと、記録・進捗はLINEで続く。</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
