"use client";

// スクロール追従の下部固定CTA。
//
// 方針: 相談を前に出さない。まず自分でプランを進められる状態を作り、
// プランナーを読み終えたあたりから初めて現れる（困ったら相談、の順番）。
// 文言も「悩み相談」ではなく、ゴール（理想の日）に寄せる。
import { useEffect, useState } from "react";
import ConsultLink from "@/components/ConsultLink";

export default function StickyConsultBar() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // プランナー（#plan）を通り過ぎたら出す。無ければ1画面分で出す。
    const onScroll = () => {
      const plan = document.getElementById("plan");
      const threshold = plan
        ? plan.offsetTop + plan.offsetHeight * 0.6
        : window.innerHeight;
      setShow(window.scrollY > threshold);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 px-3 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] pointer-events-none transition-all duration-300 ${
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      }`}
      aria-hidden={!show}
    >
      <ConsultLink
        className={`mx-auto flex max-w-[560px] items-center justify-center gap-2 rounded-full bg-[#16241A] hover:bg-[#1c2e21] text-[#EDF1E8] text-[15px] font-bold px-6 py-4 shadow-[0_18px_44px_-14px_rgba(20,32,26,0.75)] transition-colors ${
          show ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        プランを、一緒に詰める <span aria-hidden>→</span>
      </ConsultLink>
    </div>
  );
}
