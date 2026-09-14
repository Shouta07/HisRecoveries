"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { STAGES, stage as getStage, type StageId } from "@/lib/journey";
import { byStage } from "@/lib/knowledge";
import { load, setStage } from "@/lib/relationship";
import { JourneyLine } from "@/components/app/Line";
import { Screen, Ask, Head, Label, Note, Rule, Action, Empty, Loading, Mark } from "@/components/app/system";
import { track } from "@/lib/analytics";

// 道のり（§09・§10）。
//
// ── 進捗管理画面にしない ──────────────────────────
// 前の版は8段階が縦にカードで並び、右端に件数が出て、開くと畳まれた中身が出た。
// それは営業のパイプラインの形。下タブからも外した。
//
// ── 一本の静かな道にする ──────────────────────────
// 線を1本引いて、点を置く。いまいるところだけ少し大きい。
// 線は塗り分けない。右に行くほど良い、という意味を作らないため。
//
// ── 曖昧さを許す ────────────────────────────────
// 「45% COMPLETE」も「STEP 3」も無い。
// 出るのは「いまは『会う』のあたり」まで。

export default function Journey() {
  const [here, setHere] = useState<StageId | null>(null);
  const [look, setLook] = useState<StageId | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const s = load();
    setHere(s.stage);
    setLook(s.stage ?? "prepare");
    setReady(true);
  }, []);

  if (!ready || !look) return <Loading />;

  const s = getStage(look);
  const items = byStage(look).slice(0, 3);
  const isHere = here === look;

  return (
    <Screen>
      <Ask>関係には、いろんな途中がある。</Ask>
      <div className="mt-4">
        <Note>
          順位ではありません。戻ることも、止まることも、やめることもあります。
          早く次へ進むための道ではありません。
        </Note>
      </div>

      {/* 線。点を押すと、その時期のことが下に出る */}
      <div className="mt-10">
        <JourneyLine
          current={here}
          onPick={(id) => {
            setLook(id);
            track("app_journey_open", { stage: id });
          }}
        />
        <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <p className="text-[13.5px] text-bodytext">
            {here ? `いまは「${getStage(here).label}」のあたり` : "現在地は、まだ決めていません"}
          </p>
          {!isHere && <Mark>見ているのは「{s.label}」</Mark>}
        </div>
      </div>

      <div className="mt-9">
        <Rule />
      </div>

      {/* 見ている時期のこと */}
      <section className="mt-8">
        <Label>{isHere ? "いまのあたり" : "この時期"}</Label>
        <h2 className="mt-2.5 font-display text-[22px] font-bold leading-[1.5] text-charcoal">
          {s.label}
        </h2>
        <p className="mt-2.5 text-[15px] leading-[1.95] text-bodytext">{s.where}</p>

        <div className="mt-8">
          <Head>よくある迷い</Head>
          <ul className="mt-3 flex flex-col gap-2">
            {s.doubts.map((d) => (
              <li key={d} className="flex gap-2.5 text-[14.5px] leading-[1.9] text-bodytext">
                <span aria-hidden className="mt-[11px] h-px w-3 shrink-0 bg-hairline" />
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8">
          <Head>考えてみること</Head>
          {s.prompts.map((p) => (
            <p key={p} className="mt-3 text-[15px] leading-[1.95] text-charcoal">
              {p}
            </p>
          ))}
        </div>

        <div className="mt-8">
          <Head>この時期のもの</Head>
          <div className="mt-4">
            {items.length === 0 ? (
              <Empty
                title="まだありません。"
                body="この時期の経験・専門家の見解・調査は、いま集めているところです。集まっていないものを、それらしく埋めることはしません。"
              />
            ) : (
              <ul className="flex flex-col gap-5">
                {items.map((k) => (
                  <li key={k.id}>
                    <Link
                      href={k.href ?? "#"}
                      onClick={() => track("app_knowledge_open", { stage: look, type: k.type })}
                      className="block"
                    >
                      <Mark>考え方</Mark>
                      <p className="mt-1 text-[14.5px] font-bold leading-[1.7] text-charcoal">
                        {k.title}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {!isHere && (
          <div className="mt-10">
            <Action
              quiet
              onClick={() => {
                setStage(look);
                setHere(look);
                track("app_stage_changed", { stage: look });
              }}
            >
              いまは、このあたりにする
            </Action>
          </div>
        )}
      </section>
    </Screen>
  );
}
