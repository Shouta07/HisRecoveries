"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { STAGES, AGE_GROUPS, type StageId, type AgeGroup } from "@/lib/journey";
import { all, byStage, PERSPECTIVE_LABEL, TYPE_LABEL, type Perspective, type Knowledge } from "@/lib/knowledge";
import { load } from "@/lib/relationship";
import { Screen, Ask, Head, Note, Rule, Chip, Empty, Loading, Mark } from "@/components/app/system";
import { track } from "@/lib/analytics";

// 知る（§20）。
//
// ── 記事一覧にしない ──────────────────────────────
// 前の版は、年代6＋段階9＋視点6＝21個のチップが画面の先頭にあった。
// 開いた人は、読む前に条件を組む作業をさせられていた。
// 先に出すのは「いまのあなたに」。絞り込みは畳んで下に置く。
//
// ── 一人の経験を、全員の正解にしない（§17）──────────
// 出典の種類（経験／データ／専門家／調査）を必ず添える。
// 経験談が並ぶときは、並んでいること自体が「答えは一つではない」になる。

const PERSPECTIVES: Perspective[] = ["male", "female", "expert", "data", "editorial"];

function Item({ k, stage }: { k: Knowledge; stage: StageId | null }) {
  return (
    <li>
      <Link
        href={k.href ?? k.source?.url ?? "#"}
        onClick={() => track("app_knowledge_open", { stage: stage ?? "none", type: k.type })}
        className="block"
      >
        <span className="flex flex-wrap items-baseline gap-2.5">
          <Mark>{TYPE_LABEL[k.type]}</Mark>
          <Mark>{PERSPECTIVE_LABEL[k.perspective]}</Mark>
          {k.asOf && <Mark>{k.asOf}時点</Mark>}
        </span>
        <p className="mt-1.5 text-[15.5px] font-bold leading-[1.7] text-charcoal">{k.title}</p>
        <p className="mt-1 line-clamp-2 text-[14px] leading-[1.9] text-faint">{k.summary}</p>
        {k.source && <p className="mt-1 text-[12px] text-faint">出典：{k.source.name}</p>}
      </Link>
    </li>
  );
}

export default function KnowledgePage() {
  const [ready, setReady] = useState(false);
  const [here, setHere] = useState<StageId | null>(null);
  const [age, setAge] = useState<AgeGroup | "all">("all");
  const [stage, setStage] = useState<StageId | "all">("all");
  const [persp, setPersp] = useState<Perspective | "all">("all");

  useEffect(() => {
    const s = load();
    setHere(s.stage);
    if (s.age) setAge(s.age);
    setReady(true);
  }, []);

  const forYou = useMemo(() => (here ? byStage(here).slice(0, 4) : []), [here]);
  const items = useMemo(
    () =>
      all().filter(
        (k) =>
          (stage === "all" || k.stage === stage) &&
          (persp === "all" || k.perspective === persp) &&
          (age === "all" || k.age === null || k.age === age),
      ),
    [age, stage, persp],
  );

  if (!ready) return <Loading />;

  return (
    <Screen>
      <Ask>いまのあなたに</Ask>

      <div className="mt-7">
        {forYou.length === 0 ? (
          <Empty
            title={
              here
                ? `「${STAGES.find((s) => s.id === here)?.label}」のものは、まだありません。`
                : "現在地が決まると、ここが変わります。"
            }
            body={
              here
                ? "この段階の経験・専門家の見解・調査は、いま集めているところです。数を揃えるために、それらしいものを置くことはしません。下から他の段階のものを見られます。"
                : "道のりで「いまはこのあたり」を選ぶと、その時期のものから先に出します。"
            }
            action={here ? undefined : "道のりを見る"}
            href={here ? undefined : "/app/journey"}
          />
        ) : (
          <ul className="flex flex-col gap-6">
            {forYou.map((k) => (
              <Item key={k.id} k={k} stage={here} />
            ))}
          </ul>
        )}
      </div>

      <div className="mt-11">
        <Rule />
      </div>

      {/* 絞り込みは Secondary。畳んだまま置く（§20）*/}
      <section className="mt-7">
        <div className="flex items-baseline justify-between gap-4">
          <Head>すべて</Head>
          <span className="text-[12.5px] tabular-nums text-faint">{items.length}件</span>
        </div>

        <details className="group mt-3">
          <summary className="inline-flex min-h-[44px] cursor-pointer list-none items-center text-[13.5px] text-faint transition-colors hover:text-accent">
            絞り込む
            <span aria-hidden className="ml-1.5 text-[11px] group-open:hidden">
              ＋
            </span>
            <span aria-hidden className="ml-1.5 hidden text-[11px] group-open:inline">
              −
            </span>
          </summary>
          <div className="mt-3 flex flex-col gap-2.5">
            <div className="flex flex-wrap gap-2">
              <Chip on={age === "all"} onClick={() => setAge("all")}>
                すべての年代
              </Chip>
              {AGE_GROUPS.map((a) => (
                <Chip key={a} on={age === a} onClick={() => setAge(a)}>
                  {a}
                </Chip>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Chip on={stage === "all"} onClick={() => setStage("all")}>
                すべての時期
              </Chip>
              {STAGES.map((s) => (
                <Chip key={s.id} on={stage === s.id} onClick={() => setStage(s.id)}>
                  {s.label}
                </Chip>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Chip on={persp === "all"} onClick={() => setPersp("all")}>
                すべての立場
              </Chip>
              {PERSPECTIVES.map((p) => (
                <Chip key={p} on={persp === p} onClick={() => setPersp(p)}>
                  {PERSPECTIVE_LABEL[p]}
                </Chip>
              ))}
            </div>
          </div>
        </details>

        <div className="mt-7">
          {items.length === 0 ? (
            <Empty
              title="この条件に当てはまるものは、ありません。"
              body="条件を1つ外すと見つかるかもしれません。数を揃えるために、それらしいものを置くことはしていません。"
            />
          ) : (
            <ul className="flex flex-col gap-6">
              {items.slice(0, 30).map((k) => (
                <Item key={k.id} k={k} stage={here} />
              ))}
            </ul>
          )}
        </div>

        <div className="mt-8">
          <Note>
            いま出ているものは、すべて「自分を整える」時期の話です。
            出会ったあとの時期については、まだ集まっていません。
            一人の経験を、全員の正解として出すことはしません。
          </Note>
        </div>
      </section>
    </Screen>
  );
}
