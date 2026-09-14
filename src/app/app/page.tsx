"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { load, hasStarted, KIND_LABEL, type Store, type RecordKind } from "@/lib/relationship";
import { STAGES, stage as getStage } from "@/lib/journey";
import { byStage } from "@/lib/knowledge";
import { Card, Btn, Pill, SectionTitle, Empty, Skeleton, Tag } from "@/components/app/ui";
import { track } from "@/lib/analytics";

// ホーム。
//
// ── 3秒で「記録するアプリ」と分かること ──────────────
// 上から順に、現在地 → 最近どうだったか → いま考えてみること → FOR YOU。
// 記事の一覧は置かない。置いた瞬間に読み物サイトに戻る。
//
// ── 進捗率を出さない ──────────────────────────────
// 「STEP 4/7」「57%」は出さない。恋愛は前に進むほど良いものではない。
// 出すのは「いまどのあたりか」だけ。
//
// ── 空を隠さない ──────────────────────────────
// FOR YOU に出せるものが無い段階では、無いと書く。
// それらしいカードで埋めると、次に来たときに何も変わっていないことがばれる。

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "こんばんは。";
  if (h < 11) return "おはようございます。";
  if (h < 18) return "こんにちは。";
  return "こんばんは。";
}

const CHECKINS: RecordKind[] = ["talk", "met", "moved", "unsure"];

export default function AppHome() {
  const [s, setS] = useState<Store | null>(null);

  useEffect(() => {
    setS(load());
  }, []);

  // 端末の中を読むまでは何も断定しない。
  // サーバーとクライアントで食い違わせないため、最初は骨組みだけ出す。
  if (!s) {
    return (
      <div className="flex flex-col gap-5 pb-6">
        <Skeleton lines={2} />
        <Skeleton lines={4} />
      </div>
    );
  }

  if (!hasStarted()) {
    return (
      <div className="pb-8">
        <h1 className="mt-6 font-display text-[24px] font-bold leading-[1.45] text-charcoal">
          出会ったあとを、
          <br />
          大切にする。
        </h1>
        <p className="mt-4 text-[14.5px] leading-[1.95] text-bodytext">
          出会って、話して、会って、相手を知る。その過程を記録しながら、
          自分の現在地と、次に考えることを整理します。
        </p>
        <div className="mt-7">
          <Btn href="/app/start">はじめる（1分）</Btn>
        </div>
        <p className="mt-4 text-[12.5px] leading-[1.85] text-faint">
          登録は要りません。記録はこの端末の中だけに残ります。
        </p>
      </div>
    );
  }

  const st = s.stage ? getStage(s.stage) : null;
  const idx = st ? STAGES.findIndex((x) => x.id === st.id) : -1;
  const near = STAGES.slice(Math.max(0, idx - 1), idx + 2);
  const forYou = st ? byStage(st.id).slice(0, 3) : [];
  const prompt = st?.prompts[0];

  return (
    <div className="flex flex-col gap-7 pb-6">
      <p className="text-[14px] text-faint">{greeting()}</p>

      {/* 現在地。順位ではなく「いまどのあたりか」 */}
      {st && (
        <section className="rounded-[14px] bg-raised px-4 py-4">
          <p className="text-[12px] text-faint">いまのあたり</p>
          <p className="mt-1 font-display text-[18px] font-bold text-charcoal">{st.label}</p>
          <p className="mt-1.5 text-[13.5px] leading-[1.8] text-bodytext">{st.where}</p>
          <ul className="mt-3.5 flex flex-col gap-2">
            {near.map((n) => {
              const now = n.id === st.id;
              return (
                <li key={n.id} className="flex items-center gap-2.5">
                  <span
                    aria-hidden
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      now ? "bg-coral ring-4 ring-coral-soft" : "bg-hairline"
                    }`}
                  />
                  <span className={`text-[13px] ${now ? "font-bold text-charcoal" : "text-faint"}`}>
                    {n.label}
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-3">
            <Link href="/app/journey" className="text-[13px] text-coral underline underline-offset-4">
              道のりを見る
            </Link>
          </p>
        </section>
      )}

      {/* チェックイン。1タップで記録へ */}
      <section>
        <SectionTitle>最近、どうでしたか？</SectionTitle>
        <div className="mt-3 flex flex-wrap gap-2">
          {CHECKINS.map((k) => (
            <Link key={k} href={`/app/record?kind=${k}`} onClick={() => track("app_checkin", { kind: k })}>
              <Pill>{KIND_LABEL[k]}</Pill>
            </Link>
          ))}
        </div>
      </section>

      {/* いま考えてみること。命令しない */}
      {prompt && (
        <section>
          <Card className="border-coral">
            <p className="text-[12px] text-coral">いま、考えてみること</p>
            <p className="mt-1.5 text-[14.5px] leading-[1.9] text-charcoal">{prompt}</p>
            <div className="mt-3">
              <Btn href="/app/record" variant="ghost">
                3分で振り返る
              </Btn>
            </div>
          </Card>
        </section>
      )}

      {/* FOR YOU。無いときは無いと書く */}
      <section>
        <SectionTitle note={st ? `${byStage(st.id).length}件` : undefined}>FOR YOU</SectionTitle>
        <div className="mt-3 flex flex-col gap-2.5">
          {forYou.length === 0 ? (
            <Empty
              title="この段階に出せるものが、まだありません"
              body={`「${st?.label}」についての経験や調査は、いま集めているところです。集まったらここに出ます。それまでは空のままにしておきます。`}
            />
          ) : (
            forYou.map((k) => (
              <Card key={k.id} as="link" href={k.href ?? "#"}>
                <Tag>{k.type === "GUIDE" ? "考え方" : k.type}</Tag>
                <p className="mt-1.5 text-[14.5px] font-bold leading-[1.6] text-charcoal">{k.title}</p>
                <p className="mt-1 text-[13px] leading-[1.8] text-faint line-clamp-2">{k.summary}</p>
              </Card>
            ))
          )}
        </div>
      </section>

      {s.entries.length > 0 && (
        <p className="text-[12.5px] text-faint">
          これまでの記録 {s.entries.length}件 —{" "}
          <Link href="/app/me" className="text-coral underline underline-offset-4">
            自分を見る
          </Link>
        </p>
      )}
    </div>
  );
}
