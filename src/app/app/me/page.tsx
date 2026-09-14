"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { load, insight, FEEL_LABEL, NATURAL_LABEL, type Store } from "@/lib/relationship";
import { stage as getStage } from "@/lib/journey";
import { JourneyLine } from "@/components/app/Line";
import { Screen, Ask, Head, Note, Rule, Quiet, Empty, Loading } from "@/components/app/system";

// 自分（§21・§22）。
//
// ── マイページにしない ────────────────────────────
// 前の版は画面の7割が記録の一覧で、設定もここにあった。
// 一覧は「記録」へ、設定は⚙︎へ移した。ここに残すのは、分かってきたことだけ。
//
// ── 診断しない ────────────────────────────────
// 「あなたは○○タイプ」を出さない（§23）。
// 出すのは、本人が書いた言葉から数えられることだけ。
// 言い切らない。「〜という記録が増えています」で止める。
//
// ── 足りないときは足りないと書く ────────────────────
// 記録が3件に満たないうちは、何も言わない。
// 2件で「傾向」と書いたら、それは傾向ではなく感想。

export default function Me() {
  const [s, setS] = useState<Store | null>(null);

  useEffect(() => {
    setS(load());
  }, []);

  if (!s) return <Loading />;

  const found = insight(s);
  const st = s.stage ? getStage(s.stage) : null;

  // よく残している言葉。書かれたものをそのまま数えるだけで、点は付けない。
  const tally = new Map<string, number>();
  for (const e of s.entries) {
    if (e.feel) tally.set(FEEL_LABEL[e.feel], (tally.get(FEEL_LABEL[e.feel]) ?? 0) + 1);
  }
  // 1件しかないのに「よく残している」とは書けない。
  // 傾向を名乗る下限は、insight と同じ3件にそろえる。
  // さらに、2回以上書かれたものだけを出す。
  // 全部「1回」が並んだ一覧は、頻度ではなく、ただの記録の書き写し。
  const enough = s.entries.length >= 3;
  const top = enough
    ? [...tally.entries()].filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]).slice(0, 3)
    : [];
  const naturalYesRaw = s.entries.filter((e) => e.natural === "yes").length;
  const naturalYes = enough && naturalYesRaw >= 2 ? naturalYesRaw : 0;

  return (
    <Screen>
      <div className="flex items-start justify-between gap-4">
        <Ask>自分</Ask>
        {/* 歯車の絵を置かない。
            線1本で歯車を描くと、明るさ調整にも星にも見える。
            ここは迷わせる場所ではないので、言葉で書く。 */}
        <Link
          href="/app/me/settings"
          className="-mr-1 mt-2 inline-flex min-h-[44px] shrink-0 items-center text-[13px] text-faint transition-colors hover:text-accent"
        >
          設定
        </Link>
      </div>

      <section className="mt-9">
        <Head>最近のあなた</Head>
        <div className="mt-4">
          {found ? (
            <p className="border-l border-accent pl-4 text-[16px] leading-[2] text-charcoal">
              {found}
            </p>
          ) : (
            <Empty
              title="まだ、決めつけません。"
              body="いくつか記録が増えると、あなた自身の傾向が少しずつ見えてきます。いまは記録が少ないので、何も言わないでおきます。"
              action={s.entries.length === 0 ? "最初の記録を残す" : "記録を残す"}
              href="/app/new"
            />
          )}
        </div>
      </section>

      {(top.length > 0 || naturalYes > 0) && (
        <section className="mt-10">
          <Head>よく残している言葉</Head>
          <ul className="mt-4 flex flex-col gap-2.5">
            {top.map(([l, n]) => (
              <li key={l} className="flex items-baseline justify-between gap-4">
                <span className="text-[15px] text-charcoal">{l}</span>
                <span className="text-[13px] tabular-nums text-faint">{n}回</span>
              </li>
            ))}
            {naturalYes > 0 && (
              <li className="flex items-baseline justify-between gap-4">
                <span className="text-[15px] text-charcoal">自然体でいられた</span>
                <span className="text-[13px] tabular-nums text-faint">{naturalYes}回</span>
              </li>
            )}
          </ul>
          <div className="mt-3">
            <Note>数えているだけです。多いほど良い、という数字ではありません。</Note>
          </div>
        </section>
      )}

      <div className="mt-11">
        <Rule />
      </div>

      <section className="mt-8">
        <JourneyLine current={s.stage} />
        <div className="mt-4 flex items-baseline justify-between gap-4">
          <p className="text-[13.5px] text-bodytext">
            {st ? `いまは「${st.label}」のあたり` : "現在地は、まだ決めていません"}
          </p>
          <Quiet href="/app/journey">道のり</Quiet>
        </div>
      </section>

      <section className="mt-9">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-[14.5px] text-bodytext">これまでの記録 {s.entries.length}件</p>
          <Quiet href="/app/record">読み返す</Quiet>
        </div>
      </section>

      <div className="mt-12">
        <Note>
          記録はこの端末の中だけにあります。こちらには送られていません。
          端末を変えると、記録は移りません。
        </Note>
      </div>
    </Screen>
  );
}
