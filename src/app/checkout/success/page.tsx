import type { Metadata } from "next";
import Link from "next/link";
import { retrieveSession } from "@/lib/stripe";
import { yen } from "@/lib/pricing";

// お支払い完了。
// URLの session_id を信用せず、Stripe に問い合わせて payment_status を確かめる。
// （URLを直接開いただけの人に「完了」を見せない）

export const metadata: Metadata = {
  title: "お支払いが完了しました",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const NEXT = [
  "このあと、ご登録のメールアドレスに領収書が届きます（Stripeから自動送信）。",
  "1営業日以内に、ご連絡用のLINEのご案内をメールでお送りします。",
  "当日の持ち物と待ち合わせは、LINEでご連絡します。",
  "日程の変更は、実施日の1週間前まで承ります。",
];

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const session = searchParams.session_id
    ? await retrieveSession(searchParams.session_id)
    : null;
  const paid = session?.payment_status === "paid";

  return (
    <div className="bg-[#f4f6f2] text-[#1f2a1d] min-h-screen">
      <section className="relative overflow-hidden bg-[#16241A] text-[#EDF1E8]">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 95% 75% at 50% 20%, #24382b 0%, #16241A 58%, #0f1a12 100%)",
          }}
        />
        <div className="relative max-w-[720px] mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-14">
          {paid ? (
            <>
              <div className="mb-6 grid place-items-center w-14 h-14 rounded-full bg-[#9ec4a3] text-[#16241A]">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h1 className="text-[1.8rem] sm:text-[2.4rem] font-bold leading-[1.35]">
                お支払いを、<br className="sm:hidden" />
                受け取りました。
              </h1>
              <p className="mt-5 text-[15px] text-[#C9D2C4] leading-[2]">
                これで実施日が確定しました。
                {typeof session?.amount_total === "number" && (
                  <>
                    　お支払い金額は
                    <span className="text-[#EDF1E8] font-semibold">
                      {yen(session.amount_total)}（税込）
                    </span>
                    です。
                  </>
                )}
              </p>
            </>
          ) : (
            <>
              <h1 className="text-[1.7rem] sm:text-[2.2rem] font-bold leading-[1.35]">
                お支払いの確認が、<br className="sm:hidden" />
                取れませんでした。
              </h1>
              <p className="mt-5 text-[15px] text-[#C9D2C4] leading-[2]">
                決済が完了していないか、リンクの有効期限が切れている可能性があります。
                お手数ですが、お送りしたメールからもう一度お試しいただくか、
                そのままご返信ください。二重に請求されることはありません。
              </p>
            </>
          )}
        </div>
      </section>

      {paid && (
        <div className="max-w-[720px] mx-auto px-5 sm:px-8 py-12 sm:py-16">
          <p className="text-[12px] font-bold tracking-[0.14em] uppercase text-[#3d5638] mb-4">
            このあとの流れ
          </p>
          <ol className="space-y-4">
            {NEXT.map((t, i) => (
              <li key={t} className="flex gap-4">
                <span className="shrink-0 grid place-items-center w-7 h-7 rounded-full bg-[#16241A] text-[#EDF1E8] text-[11px] font-bold">
                  {i + 1}
                </span>
                <p className="pt-0.5 text-[15px] text-[#3a453a] leading-[1.9]">{t}</p>
              </li>
            ))}
          </ol>

          <div className="mt-10 rounded-[1.2rem] border border-[#1f2a1d]/10 bg-white px-6 py-5">
            <p className="text-[14px] text-[#3a453a] leading-[1.95]">
              ご不明な点があれば、届いたメールにそのままご返信ください。
              お支払い後のキャンセル・返金はお受けできませんが、
              <span className="font-semibold text-[#1f2a1d]">日程の変更は実施日の1週間前まで</span>
              承ります。
            </p>
          </div>

          <p className="mt-8 text-[13px]">
            <Link href="/" className="text-[#3d5638] underline decoration-[#85AB8B]/60 underline-offset-4">
              ホームに戻る
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
