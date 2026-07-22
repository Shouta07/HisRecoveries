// スクロール追従の下部固定CTA（Oh my teeth の「空き日程を確認してみる」型）。
// ヒーローのCTAを廃した代わりに、常時ここから相談（→LINE）へ入れる。
import ConsultLink from "@/components/ConsultLink";

export default function StickyConsultBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-3 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] pointer-events-none">
      <ConsultLink className="pointer-events-auto mx-auto flex max-w-[560px] items-center justify-center gap-2 rounded-full bg-[#16241A] hover:bg-[#1c2e21] text-[#EDF1E8] text-[15px] font-bold px-6 py-4 shadow-[0_18px_44px_-14px_rgba(20,32,26,0.75)] transition-colors">
        今の悩みを相談してみる <span aria-hidden>→</span>
      </ConsultLink>
    </div>
  );
}
