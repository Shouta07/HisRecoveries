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
    "His Recoveries の無料相談。第一印象改善プラン（30日）が合うかどうかを、申し込む前に確かめられます。実名・顔写真は不要。合わないと思えば、その場でお伝えします。",
  alternates: { canonical: `${site.url}/reserve` },
  robots: { index: true, follow: true },
};

const CHIPS = ["無料", "実名なしでOK", "売り込みません", "秘密は守ります"];

const AFTER = [
  "無料でご相談（メール）。3営業日を目処にご返信します。",
  "合うかどうかを先に確認。合わなければ、そうお伝えします。",
  "内容が決まったら、お見積りをお出しします。",
  "お支払い後に、ご連絡用のLINEをご案内します。",
];

export default function ReservePage() {
  return (
    <div className="bg-[#F1F3F3] text-[#1B2024] min-h-screen">
      {/* ── ヒーロー（深緑・無料相談の説明） ── */}
      <section className="relative overflow-hidden bg-[#2E4A66] text-[#F1F3F3]">
        <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 95% 75% at 50% 20%, #3B5F80 0%, #2E4A66 58%, #223A52 100%)" }} />
        <div className="relative max-w-[820px] mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-12 sm:pb-14">
          <nav aria-label="パンくず" className="text-[12.5px] text-[#8FA6B4] mb-8">
            <Link href="/" className="hover:text-[#F1F3F3]">ホーム</Link>
            <span className="mx-1.5">/</span>
            <span className="text-[#F1F3F3]">無料で相談する</span>
          </nav>
          <div className="hr-eyebrow hr-eyebrow-on-dark mb-4">無料の相談</div>
          <h1 className="text-[#F1F3F3] text-[1.9rem] sm:text-[2.7rem] leading-[1.35]" style={{ ...MINCHO, fontWeight: 700 }}>
            申し込む前に、<br /><span className="text-[#70B0B0]">合うかどうかを。</span>
          </h1>
          <p className="mt-5 text-[15px] sm:text-[15px] text-[#C3D3D6] leading-[2] max-w-[38rem]">
            <strong className="text-[#F1F3F3] font-bold">実名・顔写真は不要です。</strong>
            気になっていることをお送りいただければ、3営業日を目処にご返信します。
            <strong className="text-[#F1F3F3] font-bold">合わないと思えば、その場でそうお伝えします。</strong>
            お支払い後のキャンセルはお受けしていないので、迷いが残っているうちは、お勧めしません。
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            {CHIPS.map((c) => (
              <span key={c} className="rounded-full border border-[#70B0B0]/30 bg-white/[0.06] px-3.5 py-1.5 text-[13.5px] font-normal text-[#D3D7DC]">
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── 相談フォーム（入口はここ1本） ── */}
      <div className="max-w-[820px] mx-auto px-5 sm:px-8 pt-10 sm:pt-12 pb-16">
        <div className="rounded-[1.4rem] border border-[#1B2024]/10 bg-white/70 p-5 sm:p-6 mb-8">
          <p className="text-[15px] font-bold text-[#1B2024] mb-1.5" style={MINCHO}>
            お取り扱いは、30日プラン1本だけです。
          </p>
          <p className="text-[14px] text-[#414A50] leading-[1.9]">
            第一印象改善プラン（30日）の1本のみです。実施は東京都内・土日のみ。
            内容は人によって変わるため、費用はご相談のうえで個別にお見積りします。
            <Link href="/plan" className="ml-1 text-[#2F6F79] underline decoration-[#70B0B0]/60 underline-offset-4">
              中身を見る
            </Link>
          </p>
        </div>

        <ConsultEntry />

        {/* この後の流れ */}
        <div className="mt-10 rounded-[1.3rem] bg-[#2E4A66] text-[#F1F3F3] p-6 sm:p-7">
          <div className="hr-eyebrow hr-eyebrow-on-dark mb-4">このあとの流れ</div>
          <ol className="space-y-2.5 text-[14.5px] text-[#C3D3D6] leading-[1.8]">
            {AFTER.map((t, i) => (
              <li key={t}>
                <span className="text-[#70B0B0] font-bold">{String(i + 1).padStart(2, "0")}</span>
                　{t}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
