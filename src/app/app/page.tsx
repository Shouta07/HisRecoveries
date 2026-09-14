"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  load,
  hasStarted,
  jpDate,
  FEEL_LABEL,
  NATURAL_LABEL,
  LEGACY_KIND_LABEL,
  type Store,
} from "@/lib/relationship";
import { stage as getStage } from "@/lib/journey";
import { todaysAsk } from "@/lib/today";
import { questionFor } from "@/lib/reflection";
import { byStage } from "@/lib/knowledge";
import { JourneyLine } from "@/components/app/Line";
import {
  Screen, Ask, Head, Label, Note, Rule, Action, Quiet, Empty, Loading, Mark,
} from "@/components/app/system";
import { track } from "@/lib/analytics";

// 今日（§07）。
//
// ── ダッシュボードにしない ────────────────────────
// カードを並べない。数字を並べない。
// 上から順に、日付 → 問い → 残す → 直近の記録 → 次に考えること → 道のり。
// 6つ以上は置かない。
//
// ── 最初に見えるのは問い ──────────────────────────
// このプロダクトで最も大きい文字は、問い。
// 開いた人が最初にすることは、読むことではなく、思い出すこと。
//
// ── 記録を必ず見せる ──────────────────────────────
// 前の版は記録を4件持っていても「4件」という数字しか出していなかった。
// 自分が書いた言葉が返ってこないと、書く意味が感じられない。

function brandDate(d: Date): string {
  const w = ["日", "月", "火", "水", "木", "金", "土"][d.getDay()];
  return `${d.getMonth() + 1}月${d.getDate()}日（${w}）`;
}

export default function Today() {
  const [s, setS] = useState<Store | null>(null);
  const [now, setNow] = useState<Date | null>(null);

  // 端末の中を読むまでは何も断定しない。
  // サーバーとクライアントで食い違わせないため、最初は骨組みだけ出す。
  useEffect(() => {
    setS(load());
    setNow(new Date());
  }, []);

  if (!s || !now) return <Loading />;

  /* ── はじめて（§33）────────────────────────────
     長い説明を読ませない。名前、一行、短い説明、CTA。それだけ。 */
  if (!hasStarted()) {
    return (
      <Screen>
        <Label>HIS RECOVERIES</Label>
        <div className="mt-10">
          <Ask>
            出会ったあとを、
            <br />
            大切にする。
          </Ask>
        </div>
        <div className="mt-6">
          <p className="text-[15px] leading-[1.95] text-bodytext">
            会ったこと、感じたことを残しながら、
            自分の関係のつくり方を少しずつ知っていく場所です。
          </p>
        </div>
        <div className="mt-10 flex flex-col gap-3">
          <Action href="/app/start">はじめる</Action>
          <Action href="/app/knowledge" quiet>
            まず見てみる
          </Action>
        </div>
        <div className="mt-10">
          <Note>
            登録は要りません。記録はこの端末の中だけに残り、こちらには送られません。
          </Note>
        </div>
      </Screen>
    );
  }

  const t = todaysAsk(s, now);
  const last = s.entries[0];
  const st = s.stage ? getStage(s.stage) : null;
  const related = st ? byStage(st.id).slice(0, 2) : [];

  return (
    <Screen>
      <div className="flex items-baseline justify-between gap-4">
        <Label>HIS RECOVERIES</Label>
        <Note>{brandDate(now)}</Note>
      </div>

      {/* 問い。1画面にひとつ */}
      <div className="mt-9">
        <Ask>
          {t.ask.split("\n").map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </Ask>
        {t.note && <p className="mt-3 text-[13.5px] leading-[1.9] text-faint">{t.note}</p>}
      </div>

      <div className="mt-7">
        <Action href="/app/new" onClick={() => track("app_record_start", { from: "today" })}>
          今日のことを残す
        </Action>
        <div className="mt-2.5">
          <Note>30秒ほどで終わります。書くことが無ければ、選ぶだけでも。</Note>
        </div>
      </div>

      <div className="mt-10">
        <Rule />
      </div>

      {/* 直近の記録。自分が書いた言葉をそのまま返す */}
      <section className="mt-7">
        <Head>最近の記録</Head>
        <div className="mt-4">
          {!last ? (
            <Empty
              title="まだ記録はありません。"
              body="会った日や、何か感じた日に残してみてください。"
              action="最初の記録を残す"
              href="/app/new"
            />
          ) : (
            <Link href={`/app/record/${last.id}`} className="block">
              <p className="text-[12.5px] text-faint">{jpDate(last.date)}</p>
              <p className="mt-1.5 text-[16px] font-bold leading-[1.8] text-charcoal">
                {last.feel ? FEEL_LABEL[last.feel] : last.kind ? LEGACY_KIND_LABEL[last.kind] : "記録"}
                {last.natural && (
                  <span className="ml-2.5 text-[13px] font-normal text-faint">
                    自然体：{NATURAL_LABEL[last.natural]}
                  </span>
                )}
              </p>
              {(last.note || last.noticed) && (
                <p className="mt-2 line-clamp-3 text-[14.5px] leading-[1.9] text-bodytext">
                  {last.note || last.noticed}
                </p>
              )}
            </Link>
          )}
        </div>
      </section>

      {/* 次に考えてみること。答えではなく問いを返す（§14）*/}
      {last && (
        <section className="mt-9">
          <Head>次に考えてみること</Head>
          <p className="mt-3 text-[15px] leading-[1.95] text-charcoal">
            「{questionFor(last).q}」
          </p>
          <div className="mt-1">
            <Quiet
              href={`/app/record/${last.id}`}
              onClick={() => track("app_reflect_open", { from: "today" })}
            >
              少し考えてみる
            </Quiet>
          </div>
        </section>
      )}

      <div className="mt-10">
        <Rule />
      </div>

      {/* 道のり。線を1本引くだけ。割合も順位も出さない（§10）*/}
      <section className="mt-7">
        <JourneyLine current={s.stage} />
        <div className="mt-4 flex items-baseline justify-between gap-4">
          <p className="text-[13.5px] text-bodytext">
            {st ? `いまは「${st.label}」のあたり` : "現在地は、まだ決めていません"}
          </p>
          <Quiet href="/app/journey" onClick={() => track("app_journey_open", { stage: s.stage ?? "none" })}>
            道のり
          </Quiet>
        </div>
      </section>

      {/* 似た時期の人のもの。無ければ、何も置かない */}
      {related.length > 0 && (
        <section className="mt-9">
          <Head>似た時期の人のもの</Head>
          <ul className="mt-4 flex flex-col gap-4">
            {related.map((k) => (
              <li key={k.id}>
                <Link href={k.href ?? "#"} className="block">
                  <Mark>考え方</Mark>
                  <p className="mt-1 text-[14.5px] font-bold leading-[1.7] text-charcoal">
                    {k.title}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Screen>
  );
}
