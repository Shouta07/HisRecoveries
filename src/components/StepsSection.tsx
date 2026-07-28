// お申し込みから当日までの流れ（手続き編）。
//
// PlanPricing が「何をやるか（商品の中身）」なら、ここは「どう始めるか」。
// 決済手段・連絡手段・キャンセル条件を、申し込む前に全部見せる。
// 曖昧なままお金を受け取らない＝クレーム予防の中心。
const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

const STEPS = [
  {
    n: "01",
    t: "無料で相談する",
    d: "フォームから、気になっていることをお送りください。3営業日を目処にご返信します。実名・顔写真は不要です。",
  },
  {
    n: "02",
    t: "合うかどうかを、先に確かめる",
    d: "できること・できないことをお伝えします。合わないと思えば、その場でそう言います。ここまで費用はかかりません。",
  },
  {
    n: "03",
    t: "お見積りと、日程",
    d: "内容が決まったらお見積りをお出しします。ご了承いただけたら、東京都内・土日で実施日を決めます。金額にご納得いただけない場合は、ここでやめていただいて構いません。",
  },
  {
    n: "04",
    t: "LINEでつながる",
    d: "お支払いのあとに、伴走用のLINEをご案内します。当日の持ち物や待ち合わせも、ここでやりとりします。",
  },
  {
    n: "05",
    t: "当日、そして納品",
    d: "1日で整えて、手順の動画・眉の型・服のサイズ表・オーダー資料をお渡しします。実施日から30日間は、LINEで質問していただけます。",
  },
];

const TERMS = [
  ["費用", "サイトに金額は出していません。内容が人によって変わるためです。ご相談のあとに個別のお見積りをお出しします。"],
  ["ご連絡の手段", "お申し込みまではメールです。LINEは、お申し込み後の連絡と、実施後30日間の質問窓口に使います。"],
  ["キャンセル", "お支払い後のキャンセル・返金はお受けできません。日程の変更は、実施日の1週間前まで承ります。ご相談・お見積りの段階なら、いつでもおやめいただけます。"],
];

export default function StepsSection() {
  return (
    <section id="how" className="relative z-10 scroll-mt-24 text-[#1f2a1d] hr-readable">
      <div className="max-w-[1100px] mx-auto px-5 sm:px-8 pt-8 sm:pt-14 pb-6">
        <div className="on-media max-w-2xl mb-7">
          <p className="hr-eyebrow mb-3.5">How to start — はじめかた</p>
          <h2 className="text-[1.5rem] sm:text-[1.9rem] leading-[1.35]" style={{ ...MINCHO, fontWeight: 800 }}>
            無料の相談から、<span className="text-[#3d5638]">5ステップ。</span>
          </h2>
          <p className="mt-3 text-[14.5px] sm:text-[15px] text-[#4b5b47] leading-[1.9]">
費用の決まり方も、連絡の手段も、キャンセルの条件も、申し込む前にすべてお見せします。
          </p>
        </div>

        {/* 縦タイムライン（モバイル最適・線でつなぐ） */}
        <ol className="relative border-l-2 border-[#85AB8B]/35 ml-4 sm:ml-5 space-y-6 mb-7">
          {STEPS.map((s) => (
            <li key={s.n} className="relative pl-6 sm:pl-7">
              <span
                aria-hidden
                className="absolute -left-[13px] top-0 grid place-items-center w-6 h-6 rounded-full bg-[#16241A] text-[#EDF1E8] text-[10px] font-bold font-mono"
              >
                {s.n}
              </span>
              <div className="text-[15.5px] sm:text-[15px] font-bold text-[#1f2a1d] leading-[1.5]" style={MINCHO}>{s.t}</div>
              <p className="mt-1 text-[14px] text-[#4b5b47] leading-[1.9]">{s.d}</p>
            </li>
          ))}
        </ol>

        {/* 前提を1箇所に集約（探させない）。3枚のカードより、1枚の表のほうが短く読める。 */}
        <dl className="rounded-[1.1rem] bg-white border border-[#1f2a1d]/10 px-5 sm:px-6 py-5 mb-9 max-w-2xl">
          {TERMS.map(([t, d], i) => (
            <div
              key={t}
              className={`flex flex-col sm:flex-row sm:gap-4 ${i > 0 ? "mt-3 pt-3 border-t border-[#1f2a1d]/10" : ""}`}
            >
              <dt className="shrink-0 sm:w-[7em] text-[13.5px] font-bold text-[#1f2a1d]" style={MINCHO}>{t}</dt>
              <dd className="mt-0.5 sm:mt-0 text-[13.5px] text-[#5c6b58] leading-[1.85]">{d}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
