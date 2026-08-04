import Link from "next/link";
import { evaluate, summarize, type Answers } from "@/lib/check";
import { encodeAnswers, isComplete } from "@/lib/checkLink";

// 診断の出力を、答える前に見せる。
//
// ── なぜ要るか ────────────────────────────────
// トップに出ていたのは「問い」（6つの選択肢）と「説明」だけで、
// 返ってくるものは5問答えたあとにしか出なかった。
// つまり、何をしてくれるサイトなのかを、文章で説明していただけだった。
//
// ── 作り物にしない ──────────────────────────────
// ここに出しているのは、本物の診断関数 evaluate() の戻り値をそのまま
// 描いたもの。手で書いた「それらしい例」ではない。
// だから診断のロジックを変えれば、この面も一緒に変わる。
// ずれることがない代わりに、勝手にきれいに見せることもできない。
//
// ── どの答えを例にするか ─────────────────────────
// 30代前半・髪・実年齢より上に見られたくない・月1万円・3ヶ月。
// 読者の中心に近く、かつ「予算と期限で選択肢が絞られる」ことが
// 出力に現れる組み合わせを選んだ。
// どう答えたかは隠さず、そのまま上に出す。
// 答えを伏せて結果だけ見せると、都合のいい例に見える。

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

/** 例に使う回答。ここを変えれば、下に出る中身も全部変わる */
const SAMPLE: Answers = {
  c1: "hair",
  c2: "young",
  b1: "30e",
  b4: "10000",
  b5: "12",
};

/** 上に出す「どう答えたか」。SAMPLE と対応させる */
const SAMPLE_LABELS = ["30代前半", "髪・薄毛", "実年齢より上に見られたくない", "月1万円まで", "3ヶ月くらい"];

// 例の回答が欠けていると、結果が出ないまま空の枠が並ぶ。
// 気づかないまま公開されるのがいちばん困るので、読み込んだ時点で落とす。
if (!isComplete(SAMPLE)) {
  throw new Error("見本の回答が本体5問を満たしていません（トップに空の結果が出ます）");
}

export default function SampleResult() {
  const r = evaluate(SAMPLE);
  const link = `/check?r=${encodeURIComponent(encodeAnswers(SAMPLE))}`;

  return (
    <section className="mx-auto max-w-[1080px] px-5 pt-12 sm:px-8 sm:pt-[88px] lg:px-12 lg:pt-[120px]">
      <h2 className="text-[21px] leading-[1.55] sm:text-[26px]" style={{ ...MINCHO, fontWeight: 700 }}>
        こういうものが出ます
      </h2>
      <p className="mt-4 max-w-[34em] text-[15.5px] leading-[2.05] text-keshizumi sm:mt-5 sm:text-[16px]">
        説明ではなく、実物です。下は、次のように答えた場合に実際に出る結果を、
        そのまま載せたものです。
      </p>

      <div className="mt-7 border border-shironezu bg-hakuji sm:mt-9">
        {/* 入力。伏せない */}
        <div className="border-b border-shironezu px-5 py-4 sm:px-7 sm:py-5">
          <p className="text-[12.5px] text-ainezu">答えた内容</p>
          <ul className="mt-2.5 flex flex-wrap gap-x-2 gap-y-2">
            {SAMPLE_LABELS.map((l) => (
              <li
                key={l}
                className="border border-shironezu bg-shironeri px-2.5 py-1 text-[12.5px] text-keshizumi"
              >
                {l}
              </li>
            ))}
          </ul>
        </div>

        {/* 出力 */}
        <div className="px-5 py-6 sm:px-7 sm:py-7">
          <p className="text-[13px] text-asagi">診断の結果</p>
          <p
            className="mt-2 text-[20px] leading-[1.55] sm:text-[24px]"
            style={{ ...MINCHO, fontWeight: 700 }}
          >
            {summarize(r)}
          </p>

          <p className="mt-6 text-[12.5px] text-ainezu">手をつける順番</p>
          <ol className="mt-2.5 flex flex-col gap-2.5">
            {r.steps.slice(0, 4).map((s) => (
              <li key={s.n} className="flex items-baseline gap-3">
                <span className="w-[1.4em] shrink-0 text-[12.5px] tabular-nums text-asagi">
                  {s.n}
                </span>
                <span className="flex-1">
                  <span className="block text-[15.5px] leading-[1.6]" style={{ ...MINCHO, fontWeight: 700 }}>
                    {s.label}
                  </span>
                  <span className="mt-1 block text-[13.5px] leading-[1.9] text-ainezu">{s.why}</span>
                </span>
              </li>
            ))}
            {r.steps.length > 4 && (
              <li className="pl-[calc(1.4em+0.75rem)] text-[13px] text-ainezu">
                ほか{r.steps.length - 4}件
              </li>
            )}
          </ol>

          <p className="mt-6 text-[12.5px] text-ainezu">今月やること、3つだけ</p>
          <ul className="mt-2.5 flex flex-col gap-2">
            {r.thisMonth.map((t) => (
              <li key={t.text} className="flex items-baseline gap-3 text-[14.5px] leading-[1.9]">
                <span className="shrink-0 text-[12.5px] text-asagi">{t.when}</span>
                <span className="text-keshizumi">{t.text}</span>
              </li>
            ))}
          </ul>

          {/* 売っていない側にしか書けない部分なので、見本でも必ず出す */}
          {r.skip.length > 0 && (
            <>
              <p className="mt-6 text-[12.5px] text-ainezu">いまは、やらなくていいこと</p>
              <ul className="mt-2.5 flex flex-col gap-2">
                {r.skip.slice(0, 2).map((s) => (
                  <li key={s.label} className="text-[14.5px] leading-[1.9] text-keshizumi">
                    <span className="font-bold text-sumi">{s.label}</span>
                    <span className="text-ainezu">　{s.reason}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      <p className="mt-5 flex flex-wrap items-baseline gap-x-6 gap-y-3">
        <Link
          href={link}
          className="text-[15px] font-bold text-asagi underline decoration-asagi/40 underline-offset-[6px] transition-colors hover:decoration-asagi"
        >
          この例の結果をぜんぶ見る
          <span aria-hidden> →</span>
        </Link>
        <Link
          href="/check"
          className="text-[15px] font-bold text-asagi underline decoration-asagi/40 underline-offset-[6px] transition-colors hover:decoration-asagi"
        >
          自分のを出す（5問・30秒）
          <span aria-hidden> →</span>
        </Link>
      </p>

      <p className="mt-5 max-w-[34em] text-[13px] leading-[1.95] text-ainezu">
        答えが変われば、順番も、今月やることも変わります。
        効果を約束するものではなく、何から手をつけるかを決めるためのものです。
      </p>
    </section>
  );
}
