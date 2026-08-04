// トップの1画面目。
//
// ── PCで見えにくかった理由 ───────────────────────
// 実測すると、見出しは写真の上（左端64px 固定）、その下の帯は
// 中央寄せのコンテナ（1920pxで左端420px）に入っていた。
// つまり画面が広いほど、見出しと入口の左端が最大356pxずれる。
// 視線が2回横に飛ぶので、1画面目に何が書いてあるか掴めなくなる。
//
// さらに写真が縦の76%（1920px時）を占め、文字は左下のいちばん暗い隅、
// 被写体は中央右。構図が左右に割れていた。
//
// ── 直し方 ────────────────────────────────────
// 文字を写真の上に重ねるのをやめ、テキストと写真を別の場所に置く。
//   狭い画面 … 写真（上）→ 文字と入口（下）
//   広い画面 … 文字と入口（左）｜ 写真（右）
// これで左端が必ず揃い、被写体と文字が横に並ぶ。
// 写真の上に白文字を置かなくなるので、覆いの黒も影も要らなくなり、
// 写真そのものが暗くならない。

export default function HomeHero({
  photo,
  content,
}: {
  photo: React.ReactNode;
  content: React.ReactNode;
}) {
  return (
    <header
      id="top"
      className="flex min-h-screen flex-col bg-shironeri lg:grid lg:min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] lg:items-stretch"
      style={{ minHeight: "100svh" }}
    >
      {/* 文字。広い画面では左、狭い画面では写真の下 */}
      <div className="order-2 flex flex-col justify-center px-5 pb-8 pt-7 sm:px-12 sm:pb-10 sm:pt-9 lg:order-1 lg:px-14 lg:py-16 xl:px-20">
        <div className="mx-auto w-full max-w-[560px] lg:mx-0 lg:max-w-[30rem] xl:max-w-[34rem]">
          {content}
        </div>
      </div>

      {/* 写真。狭い画面では上、広い画面では右 */}
      <div className="relative order-1 min-h-[42svh] flex-1 overflow-hidden bg-konjo lg:order-2 lg:min-h-0 lg:flex-none">
        {photo}
      </div>
    </header>
  );
}
