"use client";

// スクロール追従の下部固定CTA。
//
// 「人はサイトをじっくり見ない」前提に立つと、常に見えているボタンが
// 一番よく押される。だからここは、いま画面のどこにいるかで文言を変える。
//
//  価格より前 … まだ判断材料がない → 「自分のプランを見る」
//  価格より後 … 中身も値段も見た  → 「無料で相談する」
//
// 同じ文言を出し続けると、読み終えた人に「もう見た」と無視される。
import { useEffect, useState } from "react";
import Link from "next/link";
import { PLAN } from "@/lib/pricing";

type Stage = "hidden" | "plan" | "consult";

export default function StickyConsultBar() {
  const [stage, setStage] = useState<Stage>("hidden");

  useEffect(() => {
    const onScroll = () => {
      const plan = document.getElementById("plan");
      const pricing = document.getElementById("pricing");
      const y = window.scrollY;

      const planPassed = plan
        ? y > plan.offsetTop + plan.offsetHeight * 0.6
        : y > window.innerHeight;
      // 価格ブロックを半分まで読んだら、相談へ切り替える
      const pricingPassed = pricing
        ? y > pricing.offsetTop + pricing.offsetHeight * 0.5
        : false;

      setStage(pricingPassed ? "consult" : planPassed ? "plan" : "hidden");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const show = stage !== "hidden";
  const consult = stage === "consult";

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 px-3 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] pointer-events-none transition-all duration-300 ${
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      }`}
      aria-hidden={!show}
    >
      <Link
        href={consult ? "/reserve" : "/#plan"}
        className={`mx-auto flex max-w-[560px] items-center justify-between gap-3 rounded-full bg-[#1E2A38] hover:bg-[#2A3849] text-[#F3F0EA] px-5 sm:px-6 py-3.5 shadow-[0_18px_44px_-14px_rgba(20,32,26,0.75)] transition-colors ${
          show ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <span className="flex flex-col items-start leading-tight">
          <span className="text-[15px] font-bold">
            {consult ? "まず無料で相談する" : "30秒で、自分のプランを見る"}
          </span>
          <span className="mt-0.5 text-[11px] text-[#8E979E]">
            {consult
              ? `${PLAN.days}日 ／ ${PLAN.where}・${PLAN.when} ／ 費用は個別見積`
              : "登録不要・そのまま見られます"}
          </span>
        </span>
        <span
          aria-hidden
          className="shrink-0 grid place-items-center w-9 h-9 rounded-full bg-[#C28863] text-[#1E2A38] text-[16px] font-bold"
        >
          →
        </span>
      </Link>
    </div>
  );
}
