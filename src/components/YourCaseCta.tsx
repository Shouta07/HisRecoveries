// 記事末のCTA。「無料相談」への段差が大きすぎるため、あいだに
// 「あなたの場合は、これが何番目か」という一段を置く。
//
// 記事は「何をやるか」までは渡す。しかし「あなたの場合の順番と期日」は
// 一人ひとり違う ＝ そこがサービスの価値。情報収集層 → 検討層 への橋。
import Link from "next/link";
import ConsultLink from "@/components/ConsultLink";

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

export default function YourCaseCta({
  /** 記事のテーマ（例: メンズメイク）。文中に自然に差し込む */
  topic,
  /** 計測用の領域ID */
  market,
}: {
  topic?: string;
  market?: string;
}) {
  const subject = topic ? `「${topic}」` : "この記事の内容";

  return (
    <aside className="mt-14 rounded-[1.4rem] bg-[#16241A] text-[#EDF1E8] px-6 sm:px-8 py-7">
      <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-[#85AB8B]">
        ただし、順番は人によって違います
      </p>
      <h2 className="mt-2.5 text-[1.15rem] sm:text-[1.4rem] leading-[1.5]" style={{ ...MINCHO, fontWeight: 800 }}>
        {subject}は、
        <br className="sm:hidden" />
        あなたの場合、何番目にやるべきか。
      </h2>
      <p className="mt-3 text-[14px] sm:text-[14.5px] text-[#C9D2C4] leading-[1.95]">
        同じ悩みでも、迎えたい日・現在地・かけられる時間で、最初の一手は変わります。
        効くまでに時間がかかるものを後回しにすると、間に合いません。
        30秒で、あなたの順番を並べ替えます。
      </p>

      <div className="mt-5 flex flex-wrap gap-2.5">
        <Link
          href="/#plan"
          className="inline-flex items-center gap-2 rounded-full bg-[#EDF1E8] hover:bg-white text-[#16241A] text-[14.5px] font-bold px-6 py-3 transition-colors"
        >
          自分の順番を診断する（無料） <span aria-hidden>→</span>
        </Link>
        <ConsultLink
          market={market}
          className="inline-flex items-center gap-2 rounded-full border border-[#EDF1E8]/30 hover:border-[#EDF1E8] text-[#EDF1E8] text-[14.5px] font-semibold px-6 py-3 transition-colors"
        >
          直接、相談する <span aria-hidden>→</span>
        </ConsultLink>
      </div>
    </aside>
  );
}
