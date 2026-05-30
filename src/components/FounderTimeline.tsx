type Entry = {
  era: string;
  age?: string;
  body: string;
  note?: string;
};

const entries: Entry[] = [
  {
    era: "中学・高校",
    age: "12–18",
    body: "手のひらと脇の汗が、教室の机に滲んだ。プリントが波打つたびに、自分の身体が他人より騒がしいことを知った。",
    note: "領域：汗とにおい",
  },
  {
    era: "20代前半",
    age: "20–24",
    body: "皮膚科で多汗症の外用治療を始めた。並行して脇のボトックスを定期で打ち続けた。夏の予定の組み方が、少しずつ変わった。",
    note: "領域：汗とにおい",
  },
  {
    era: "20代中盤",
    age: "24–27",
    body: "ニキビ跡の美容皮膚科に通い始めた。鏡の前で過ごす時間が長く、外を歩く時間が短かった季節。",
    note: "領域：肌と跡 ／ 顔の印象",
  },
  {
    era: "20代後半",
    age: "27–29",
    body: "ワキガの手術を受けた。傷が落ち着くまでの数ヶ月のあいだに、身体の問題と自意識の問題は別物だと、初めて気づいた。",
    note: "領域：汗とにおい ／ 心と余白",
  },
  {
    era: "30代の入口",
    age: "30–",
    body: "身体は静かになった。残った癖と整え方を、毎晩の所作として組み直し始めた。書くことを始めた。",
    note: "領域：心と余白 ／ Practice",
  },
  {
    era: "現在",
    body: "His Recoveries を立ち上げ、自分の通過した時間を低い声で記録している。",
    note: "領域：すべて",
  },
];

/**
 * Personal timeline rendered as an editorial vertical sequence.
 * Used on /recoveries and /founder to give the brand a chronological
 * spine — the lived years behind the 3-recoveries framing.
 */
export default function FounderTimeline() {
  return (
    <ol className="relative border-l border-hair-line pl-8 sm:pl-10 space-y-12">
      {entries.map((e, i) => (
        <li key={i} className="relative">
          <span
            aria-hidden
            className="absolute -left-[5px] top-2 block h-2 w-2 rounded-full bg-gold"
          />
          <div className="flex items-baseline gap-3 mb-3">
            <p className="logo-type italic text-[11px] tracking-[0.3em] uppercase text-gold">
              {e.era}
            </p>
            {e.age && (
              <span className="text-[11px] tracking-[0.06em] text-sub-gray">
                {e.age}
              </span>
            )}
          </div>
          <p className="font-mincho text-[15px] sm:text-base leading-[2.05] text-ink/90 max-w-[34rem]">
            {e.body}
          </p>
          {e.note && (
            <p className="mt-3 text-[11px] tracking-[0.06em] text-sub-gray">
              {e.note}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}
