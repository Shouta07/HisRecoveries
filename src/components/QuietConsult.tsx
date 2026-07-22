// 「静かな一本」CTA（Mechanism Library 用）。
// 押さない。読み終えた人が、望むなら進める扉があるだけ、という佇まい。
// バナー乱立・ポップアップ・追従・人工的な緊急性は禁止。1ページに1つだけ。
import ConsultLink from "@/components/ConsultLink";

const HEAD: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontWeight: 800,
  fontFeatureSettings: '"palt" 1',
};

export default function QuietConsult() {
  return (
    <aside className="mt-14 rounded-[1.4rem] border border-[#16241A]/12 bg-white px-6 sm:px-8 py-7">
      <p className="text-[1.05rem] sm:text-[1.2rem] leading-[1.7] text-[#16241A]" style={HEAD}>
        仕組みが分かったら、次は、あなたの場合を。
      </p>
      <p className="mt-2.5 text-[13px] text-[#4b5b47] leading-[1.95]">
        ここから先は、人によって違います。急ぐ必要はありません。
        匿名のまま、無料で相談できます。
      </p>
      <ConsultLink className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#16241A]/25 hover:border-[#16241A] text-[#16241A] text-[13.5px] font-semibold px-6 py-3 transition-colors">
        匿名で相談する <span aria-hidden>→</span>
      </ConsultLink>
    </aside>
  );
}
