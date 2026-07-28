import type { Metadata } from "next";
import Link from "next/link";
import ConsultEntry from "@/components/ConsultEntry";
import { site } from "@/lib/site";

// 無料相談の入口。受け付けはメール（フォーム）1本に統一する。
// 予約ウィジェットや LINE を並べると入口が割れるので、ここには置かない。
// LINE はお支払い後の伴走でのみ使う（公開サイトには出さない）。

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

export const metadata: Metadata = {
  title: "無料で相談する — 実名不要・返信は3営業日を目処に",
  description:
    "His Recoveries の無料相談。第一印象改善プラン（30日 ¥49,800 税込）が合うかどうかを、申し込む前に確かめられます。実名・顔写真は不要。合わないと思えば、その場でお伝えします。",
  alternates: { canonical: `${site.url}/reserve` },
  robots: { index: true, follow: true },
};

const CHIPS = ["無料", "実名なしでOK", "売り込みません", "秘密は守ります"];

const AFTER = [
  "無料でご相談（メール）。3営業日を目処にご返信します。",
  "合うかどうかを先に確認。合わなければ、そうお伝えします。",
  "実施日（東京都内・土日）を決めて、PayPayでお支払い。",
  "お支払い後に、伴走用のLINEをご案内します。",
];

export default function ReservePage() {
  return (
    <div className="bg-[#f4f6f2] text-[#1f2a1d] min-h-screen">
      {/* ── ヒーロー（深緑・無料相談の説明） ── */}
      <section className="relative overflow-hidden bg-[#16241A] text-[#EDF1E8]">
        <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 95% 75% at 50% 20%, #24382b 0%, #16241A 58%, #0f1a12 100%)" }} />
        <div className="relative max-w-[820px] mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-12 sm:pb-14">
          <nav aria-label="パンくず" className="text-[11.5px] text-[#9FB0A0] mb-8">
            <Link href="/" className="hover:text-[#EDF1E8]">ホーム</Link>
            <span className="mx-1.5">/</span>
            <span className="text-[#EDF1E8]">無料で相談する</span>
          </nav>
          <div className="font-mono text-[11px] tracking-[0.28em] text-[#85AB8B] mb-4">FREE CONSULT — 無料</div>
          <h1 className="text-[#EDF1E8] text-[1.9rem] sm:text-[2.7rem] leading-[1.35]" style={{ ...MINCHO, fontWeight: 800 }}>
            申し込む前に、<br /><span className="text-[#9ec4a3]">合うかどうかを。</span>
          </h1>
          <p className="mt-5 text-[14px] sm:text-[15px] text-[#C9D2C4] leading-[2] max-w-[38rem]">
            <strong className="text-[#EDF1E8] font-semibold">実名・顔写真は不要です。</strong>
            気になっていることをお送りいただければ、3営業日を目処にご返信します。
            <strong className="text-[#EDF1E8] font-semibold">合わないと思えば、その場でそうお伝えします。</strong>
            お支払い後のキャンセルはお受けしていないので、迷いが残っているうちは、お勧めしません。
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

      {/* ── 相談フォーム（入口はここ1本） ── */}
      <div className="max-w-[820px] mx-auto px-5 sm:px-8 pt-10 sm:pt-12 pb-16">
        <div className="rounded-[1.4rem] border border-[#1f2a1d]/10 bg-white/70 p-5 sm:p-6 mb-8">
          <p className="text-[13.5px] font-bold text-[#1f2a1d] mb-1.5" style={MINCHO}>
            お取り扱いは、30日プラン1本だけです。
          </p>
          <p className="text-[12.5px] text-[#4b5b47] leading-[1.9]">
            第一印象改善プラン（30日）¥49,800（税込・先着10名／以降 ¥66,000 税込）。
            実施は東京都内・土日のみ、お支払いはPayPayのみです。
            <Link href="/#pricing" className="ml-1 text-[#3d5638] underline decoration-[#85AB8B]/60 underline-offset-4">
              中身を見る
            </Link>
          </p>
        </div>

        <ConsultEntry />

        {/* この後の流れ */}
        <div className="mt-10 rounded-[1.3rem] bg-[#16241a] text-[#EDF1E8] p-6 sm:p-7">
          <div className="font-mono text-[10.5px] tracking-[0.2em] uppercase text-[#85AB8B] mb-3">After the consult — このあとの流れ</div>
          <ol className="space-y-2.5 text-[13px] text-[#C9D2C4] leading-[1.8]">
            {AFTER.map((t, i) => (
              <li key={t}>
                <span className="text-[#9ec4a3] font-bold">{String(i + 1).padStart(2, "0")}</span>
                　{t}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
