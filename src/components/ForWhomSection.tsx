// 対象の明確化。PMF検証フェーズでは「広く集める」より「合う人だけを通す」。
// 対象外を先に書くことで、冷やかしを入口で外し、相談の質を上げる。
const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

const FOR = [
  "何度か調べたが、結局なにも変えられていない",
  "人に聞くのが、正直はずかしい",
  "近いうちに、人前に立つ予定がある",
  "自分で選ぶ自信がないので、決めてほしい",
  "東京都内に、土日1日来られる",
];

const NOT_FOR = [
  "東京に来るのが難しい（オンラインのみの対応はしていません）",
  "安く施術だけ受けたい",
  "短期間で、別人のように変わりたい",
  "言われたことを、やる気はない",
  "とりあえず情報だけ集めたい",
];

export default function ForWhomSection() {
  return (
    <section id="for-whom" className="relative z-10 scroll-mt-24 text-[#1f2a1d]">
      <div className="max-w-[880px] mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <p className="font-mono text-[10.5px] tracking-[0.24em] uppercase text-[#3d5638] mb-3">
          For — 誰のためのサービスか
        </p>
        <h2 className="text-[1.45rem] sm:text-[2rem] leading-[1.4]" style={{ ...MINCHO, fontWeight: 800 }}>
          全員には、向いていません。
        </h2>
        <p className="mt-4 text-[13.5px] text-[#4b5b47] leading-[1.95] max-w-[34rem]">
          いま受けられる人数が限られているため、合う方だけにお時間を使います。
          先に、対象をはっきりさせておきます。
        </p>

        <div className="mt-8 grid sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="rounded-[1.4rem] bg-[#16241A] text-[#EDF1E8] p-5 sm:p-6">
            <p className="text-[13.5px] font-bold mb-3" style={MINCHO}>
              こういう方へ
            </p>
            <ul className="space-y-2.5">
              {FOR.map((x) => (
                <li key={x} className="flex gap-2.5 text-[12.5px] leading-[1.85]">
                  <span aria-hidden className="text-[#9ec4a3] shrink-0">✓</span>
                  <span>{x}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 pt-3 border-t border-white/12 text-[11.5px] text-[#9ec4a3] leading-[1.8]">
              25〜40代が中心です。体験は東京都内・土日のみ実施しています。
            </p>
          </div>

          <div className="rounded-[1.4rem] bg-white border border-[#1f2a1d]/10 p-5 sm:p-6">
            <p className="text-[13.5px] font-bold text-[#1f2a1d] mb-3" style={MINCHO}>
              こういう方には、向きません
            </p>
            <ul className="space-y-2.5">
              {NOT_FOR.map((x) => (
                <li key={x} className="flex gap-2.5 text-[12.5px] text-[#5c6b58] leading-[1.85]">
                  <span aria-hidden className="text-[#9aa79a] shrink-0">—</span>
                  <span>{x}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 pt-3 border-t border-[#1f2a1d]/10 text-[11.5px] text-[#6b7a66] leading-[1.8]">
              当てはまる場合は、
              <span className="text-[#1f2a1d]">記事だけ読んで帰っていただいて構いません</span>。
              すべて無料で公開しています。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
