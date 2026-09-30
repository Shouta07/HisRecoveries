import {
  reviewersToday,
  shouldShow,
  openNow,
  whenLabel,
  specialtyLabels,
  STATUS_LABEL,
  TODAY,
  OMAKASE,
  type Reviewer,
} from "@/lib/reviewers/today";
import PlanCta from "@/components/brand/PlanCta";

// 今日、受け付けている人。
//
// ══════════════════════════════════════════════════
// 0人なら、節ごと出さない
// ══════════════════════════════════════════════════
// いま審査を通った人は0人。
// 「現在、受付中の女性はいません」とだけ書いた枠を常設すると、
// 来た全員に、空っぽであることを知らせることになる。
//
// 嘘はつかないが、空の棚をわざわざ見せもしない。
// 1人でも入れば、この節はひとりでに出る。
//
// ══════════════════════════════════════════════════
// 顔を出さない
// ══════════════════════════════════════════════════
// ここで選ぶのは、話す相手ではなく、読んでくれる人。
// 顔写真を並べた時点で、見た目で選ぶ画面になる。
// 出すのは、年代・確認済み・得意な相談・いつ受け付けているか。
//
// ══════════════════════════════════════════════════
// 色だけに頼らない
// ══════════════════════════════════════════════════
// 受付中を緑の点だけで示さない。文字でも書く。

/** トップと同じ幅。page.tsx の Wrap と同じもの（共有部品にはしていない） */
function Wrap({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`mx-auto w-full max-w-[1120px] px-5 sm:px-8 ${className}`}>{children}</div>
  );
}

function Dot({ status }: { status: Reviewer["status"] }) {
  const tone =
    status === "available"
      ? "bg-ok-text"
      : status === "busy"
        ? "bg-brand"
        : "bg-steel/40";
  return <span aria-hidden className={`h-2 w-2 shrink-0 rounded-full ${tone}`} />;
}

export default async function TodayReviewers() {
  const list = await reviewersToday();
  if (!shouldShow(list)) return null;

  const now = openNow(list);

  return (
    <section className="bg-paper">
      <Wrap className="py-12 sm:py-14">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 className="text-huge font-black leading-[1.35] text-slate">{TODAY.head}</h2>
          {/* 人数は、本当にいるときだけ。盛らない */}
          {now > 0 && (
            <span className="rounded-pill bg-ok-tint px-3 py-1 text-[12.5px] font-black text-ok-text">
              いま{now}人 受付中
            </span>
          )}
        </div>
        <p className="mt-3 max-w-[32em] text-[14.5px] leading-[1.85] text-steel">
          {TODAY.lead}
        </p>

        {/* 横に流す。縦に積むと、それだけで1画面を使う */}
        <ul className="-mx-5 mt-7 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 sm:mx-0 sm:px-0">
          {list.map((r) => (
            <li
              key={r.id}
              className="w-[236px] shrink-0 snap-start rounded-card border border-line bg-paper p-4 shadow-card"
            >
              <div className="flex items-center gap-2">
                <Dot status={r.status} />
                <span className="text-[12px] font-bold text-steel">
                  {STATUS_LABEL[r.status]}
                </span>
              </div>

              <p className="mt-2.5 text-[16px] font-black leading-[1.4] text-slate">
                {r.name}
                <span className="ml-1.5 text-[12.5px] font-bold text-steel">
                  {r.ageBand}
                </span>
              </p>

              {r.verified && (
                <p className="mt-1 text-[11.5px] font-bold text-ok-text">✓ 本人確認済み</p>
              )}

              {/* 得意な相談。無ければ出さない（埋めるために書かない） */}
              {r.specialties.length > 0 && (
                <ul className="mt-2.5 flex flex-wrap gap-1.5">
                  {specialtyLabels(r).map((t) => (
                    <li
                      key={t}
                      className="rounded-pill bg-mist px-2.5 py-1 text-[11px] font-bold text-steel"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              )}

              {/* 答えた件数は、実際にあるときだけ */}
              {r.answered > 0 && (
                <p className="mt-2 text-[11.5px] text-steel">これまで{r.answered}件</p>
              )}

              <p className="mt-3 border-t border-line pt-2.5 text-[12px] font-bold text-slate">
                {whenLabel(r)}
              </p>
            </li>
          ))}
        </ul>

        {/* おまかせ。ここが押す場所。
            人を選ばせない。選ばせると、見た目と肩書きで選ぶ画面になる */}
        <div className="mt-7 rounded-card border border-line bg-mist px-5 py-5 sm:px-6">
          <p className="text-[15.5px] font-black leading-[1.6] text-slate">
            {OMAKASE.head}
          </p>
          <p className="mt-2 text-[13.5px] leading-[1.85] text-steel">{OMAKASE.body}</p>
          <p className="mt-2 text-[13px] leading-[1.85] text-steel">{OMAKASE.why}</p>

          <div className="mt-5 max-w-[24em]">
            <PlanCta
              plan="review"
              from="today_reviewers"
              className="min-h-[56px] w-full rounded-pill bg-brand px-8 text-[16px] !text-paper shadow-card"
            >
              今の迷いを確かめる <span aria-hidden className="ml-2">&rarr;</span>
            </PlanCta>
          </div>
        </div>
      </Wrap>
    </section>
  );
}
