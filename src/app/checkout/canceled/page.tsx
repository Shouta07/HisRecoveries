import type { Metadata } from "next";
import Link from "next/link";

// 決済を途中でやめた人が戻ってくる先。
// 引き止めない。迷いが残ったまま払わせないのが、この商品の前提。

export const metadata: Metadata = {
  title: "お支払いを中断しました",
  robots: { index: false, follow: false },
};

export default function CheckoutCanceledPage() {
  return (
    <div className="bg-[#f4f6f2] text-[#1f2a1d] min-h-screen grid place-items-center px-5 py-20">
      <div className="max-w-[520px]">
        <p className="text-[12px] font-bold tracking-[0.14em] uppercase text-[#3d5638] mb-4">
          Canceled
        </p>
        <h1 className="text-[1.6rem] sm:text-[2rem] font-bold leading-[1.4]">
          お支払いは、<br className="sm:hidden" />
          まだ完了していません。
        </h1>
        <p className="mt-5 text-[15px] text-[#3a453a] leading-[2]">
          請求は発生していません。お送りしたリンクは有効期限まで何度でも開けます。
          <br />
          迷いが残っているなら、
          <span className="font-semibold text-[#1f2a1d]">いま決めなくて大丈夫です</span>。
          気になることがあれば、届いたメールにそのままご返信ください。
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/#pricing"
            className="inline-flex items-center gap-2 rounded-full bg-[#16241A] hover:bg-[#1c2e21] text-[#EDF1E8] text-[14px] font-bold px-6 py-3 transition-colors"
          >
            プランの中身を、もう一度見る <span aria-hidden>→</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-[#1f2a1d]/20 hover:border-[#3d5638] text-[#1f2a1d] text-[14px] font-semibold px-6 py-3 transition-colors"
          >
            ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
