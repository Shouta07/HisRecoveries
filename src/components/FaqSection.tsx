// FAQ — 予約直前の不安を潰す。FAQPage schema で GEO/リッチリザルトにも効かせる。

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

const FAQ = [
  { q: "メイクをしたことが一度もありません。大丈夫ですか？", a: "完全初心者向けです。プロが施術しながら、ご自身で再現できるところまでレッスンします。何も準備は要りません。" },
  { q: "人に知られたくありません。匿名でできますか？", a: "はい。無料相談と印象診断までは、匿名のまま進められます。実名・顔写真は不要で、ニックネームと連絡用の連絡先だけで大丈夫です。すべて完全守秘義務のもとで運営します。" },
  { q: "途中から実名が必要になりますか？", a: "段階を分けています。無料相談と印象診断は、匿名のままで構いません。体験にお申し込みいただき、記録をあなたのものとしてお預かりする段階では、ご本人の同意のうえでお名前を確認させていただきます。同意されない場合、記録はお預かりしません。" },
  { q: "料金はどう決まりますか？", a: "あなたに合わせて組むオーダーメイドのため、費用は内容によります。最初の相談は無料・匿名のまま。印象診断セッション（¥22,000・パッケージお申し込みで全額充当）で内容を伺い、総額の目安と内訳を、契約の前に必ずお伝えします。あとから増える見積りで驚かせることはしません。ご納得のうえで、お申し込みいただけます。" },
  { q: "紹介料や掲載料を、受け取っていますか？", a: "受け取りません。掲載料や紹介料で、おすすめを歪めることはしません。医療機関の比較・順位付けもしません。なお、医療にかかる診療の内容・費用は、各医療機関が決定します。" },
  { q: "予算を伝えたら、それ以上の営業をされませんか？", a: "しません。合意した予算を超える提案をしないことを、私たちの約束にしています。予算はあなたが決め、私たちはその側に立ちます。" },
  { q: "一人で行っても大丈夫ですか？", a: "ほとんどの方がお一人でお越しになります。専属チームがマンツーマンで進行しますので、ご安心ください。" },
  { q: "いま申し込むと、どうなりますか？", a: "現在は先行予約を受付中です。正式なご案内の準備を進めており、準備が整い次第、登録順にご連絡します。もちろん匿名のままで大丈夫です。" },
  { q: "急いでいます。大事な日が近いのですが。", a: "7日以内のご希望は、緊急対応枠でお受けできることがあります。ご予約時に「急ぎ」をお選びください。" },
];

export default function FaqSection() {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <section id="faq" className="relative z-10 scroll-mt-24 text-[#1f2a1d]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <div className="max-w-[860px] mx-auto px-5 sm:px-8 pt-7 sm:pt-14 pb-8">
        <div className="on-media mb-5">
          <div className="flex items-center gap-3 mb-3">
            <span aria-hidden className="block w-8 h-px bg-[#85AB8B]" />
            <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#3d5638] font-medium">FAQ</span>
          </div>
          <h2 className="text-[1.5rem] sm:text-[1.9rem] leading-[1.3]" style={{ ...MINCHO, fontWeight: 800 }}>
            よくある、<span className="text-[#3d5638]">質問。</span>
          </h2>
        </div>

        {/* アコーディオン：初期は畳んで縦を抑える（native details・JS不要・schema維持） */}
        <div className="rounded-[1.4rem] bg-white border border-[#1f2a1d]/10 px-5 sm:px-8 divide-y divide-[#1f2a1d]/10">
          {FAQ.map((f, i) => (
            <details key={f.q} className="group py-4 sm:py-[18px]" {...(i === 0 ? { open: true } : {})}>
              <summary className="flex items-start justify-between gap-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden text-[13.5px] sm:text-[14px] font-bold text-[#1f2a1d] leading-[1.65]">
                <span>{f.q}</span>
                <span aria-hidden className="mt-0.5 shrink-0 text-[#85AB8B] text-[19px] leading-none transition-transform duration-200 group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2.5 text-[13px] text-[#4b5b47] leading-[1.95]">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
