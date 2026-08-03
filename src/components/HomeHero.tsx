// トップの1画面目。写真の区画と、その下の帯を縦に積む。
//
// ── 100svh の全面写真をやめた ─────────────────────
// 以前は写真が1画面目を100%占めていた。実測すると、
// ファーストビューの中に押せるものが1つもなかった。
// 写真の上にボタンを重ねる手もあるが、それをやると
// ボタンが写真に沈むか、写真を汚すかのどちらかになる。
//
// だから写真を上に寄せ、下に無地の帯を作って、そこに入口を置く。
// 写真は資産なので残す。変えるのは比率だけ。
//
// 高さは 100svh。写真は flex-1 で余りを取り、帯は中身ぶんだけ。
// 小さい端末では写真が縮み、帯（＝入口）は最後まで残る。

export default function HomeHero({
  photo,
  band,
}: {
  photo: React.ReactNode;
  band: React.ReactNode;
}) {
  return (
    <header
      id="top"
      className="flex min-h-screen flex-col bg-shironeri"
      style={{ minHeight: "100svh" }}
    >
      <div className="relative min-h-[200px] flex-1 overflow-hidden bg-konjo">
        {photo}
      </div>
      <div className="px-5 pb-7 pt-6 sm:px-12 sm:pb-9 sm:pt-8 lg:px-16">
        <div className="mx-auto max-w-[1080px]">{band}</div>
      </div>
    </header>
  );
}
