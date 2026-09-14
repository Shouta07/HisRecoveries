"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  getEntry, removeEntry, setReflect, load, jpDate,
  FEEL_LABEL, NATURAL_LABEL, LEGACY_KIND_LABEL, LEGACY_AGAIN_LABEL,
  type Entry,
} from "@/lib/relationship";
import { questionFor, NEXT_BY_STAGE } from "@/lib/reflection";
import { byStage } from "@/lib/knowledge";
import { Screen, Ask, Head, Label, Note, Rule, Action, Quiet, Loading, Mark } from "@/components/app/system";
import { track } from "@/lib/analytics";

// 記録ひとつ（§13）。保存直後もここに着く。
//
// ── 最初に見せるのは、自分が書いたこと ────────────────
// 保存した瞬間に分析を出さない。出すと、書いたことより
// こちらの解釈のほうが大きく見える。
//
// ── 派手な完了演出を出さない ──────────────────────
// 紙吹雪も効果音も出さない。「残しました。」とだけ書く。
// ここで盛り上げると、次の日に開いたときの温度差が大きくなる。
//
// ── 振り返りは「問い」だけ ────────────────────────
// 相性も脈も出さない。問いを1つ置いて、書きたければ書ける欄を添える。

function Line({ children }: { children: React.ReactNode }) {
  return <p className="text-[15px] leading-[1.95] text-charcoal">{children}</p>;
}

function Detail() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const isNew = search.get("new") === "1";

  const [e, setE] = useState<Entry | null | undefined>(undefined);
  const [reflect, setR] = useState("");
  const [savedNote, setSavedNote] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [stage, setStage] = useState<ReturnType<typeof load>["stage"]>(null);

  useEffect(() => {
    const found = getEntry(params.id);
    setE(found);
    setR(found?.reflect ?? "");
    setStage(load().stage);
  }, [params.id]);

  if (e === undefined) return <Loading />;

  if (e === null) {
    return (
      <Screen>
        <Ask>その記録は、見つかりませんでした。</Ask>
        <div className="mt-6">
          <Note>
            記録はこの端末の中だけにあります。端末を変えたか、消したあとかもしれません。
          </Note>
        </div>
        <div className="mt-8">
          <Action href="/app/record" quiet>
            記録の一覧へ
          </Action>
        </div>
      </Screen>
    );
  }

  const q = questionFor(e);
  const related = stage ? byStage(stage).slice(0, 2) : [];
  const nexts = stage ? NEXT_BY_STAGE[stage] : [];

  return (
    <Screen>
      {isNew ? (
        <>
          <Label>残しました</Label>
          <div className="mt-5">
            <Ask>{jpDate(e.date)}の記録</Ask>
          </div>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={() => router.push("/app/record")}
            className="inline-flex min-h-[44px] items-center text-[13.5px] text-faint transition-colors hover:text-accent"
          >
            ← 記録
          </button>
          <div className="mt-3">
            <Label>{jpDate(e.date)}</Label>
          </div>
        </>
      )}

      {/* 自分が書いたこと。ここがこの画面の主役 */}
      <div className="mt-7 flex flex-col gap-2.5 border-l border-accent pl-4">
        {e.feel && <Line>{FEEL_LABEL[e.feel]}</Line>}
        {e.natural && <Line>自然体でいられた：{NATURAL_LABEL[e.natural]}</Line>}
        {e.kind && <Line>{LEGACY_KIND_LABEL[e.kind]}</Line>}
        {e.again && <Line>{LEGACY_AGAIN_LABEL[e.again]}</Line>}
        {e.noticed && (
          <p className="text-[15px] leading-[1.95] text-bodytext">「{e.noticed}」</p>
        )}
        {e.note && <p className="text-[15px] leading-[1.95] text-bodytext">「{e.note}」</p>}
        {!e.feel && !e.natural && !e.noticed && !e.note && !e.kind && (
          <Note>選択も記述もない記録です。残したこと自体は残ります。</Note>
        )}
      </div>

      <div className="mt-9">
        <Rule />
      </div>

      {/* 振り返り。答えではなく問い（§14）*/}
      <section className="mt-7">
        <Head>少し振り返ってみる</Head>
        <p className="mt-3.5 text-[16px] font-bold leading-[1.85] text-charcoal">「{q.q}」</p>
        {q.why && <p className="mt-2 text-[13px] text-faint">{q.why}</p>}
        <textarea
          rows={4}
          value={reflect}
          onChange={(ev) => {
            setR(ev.target.value);
            setSavedNote(false);
          }}
          placeholder="思いついたことがあれば。書かなくても構いません"
          className="mt-4 w-full rounded-[8px] border border-hairline bg-surface px-4 py-3.5 text-[15px] leading-[1.95] text-charcoal outline-none transition-colors duration-200 placeholder:text-faint/70 focus:border-accent"
        />
        <div className="mt-3 flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              const next = setReflect(e.id, reflect);
              if (next) setE(next);
              setSavedNote(true);
              track("app_reflect_open", { from: "detail" });
            }}
            className="inline-flex min-h-[44px] items-center rounded-[8px] border border-hairline px-5 text-[14px] text-bodytext transition-colors hover:border-accent hover:text-accent"
          >
            書き足す
          </button>
          {savedNote && <span className="motion-safe:animate-hr-fade text-[13px] text-faint">残しました。</span>}
        </div>
      </section>

      {/* 次に考えること。進むことだけを正解にしない（§15）*/}
      {nexts.length > 0 && (
        <section className="mt-10">
          <Head>次に考えること</Head>
          <ul className="mt-3.5 flex flex-col gap-2.5">
            {nexts.map((n) => (
              <li key={n} className="flex gap-2.5 text-[14.5px] leading-[1.9] text-bodytext">
                <span aria-hidden className="mt-[11px] h-px w-3 shrink-0 bg-hairline" />
                <span>{n}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3">
            <Note>どれかを選ぶ必要はありません。進まないことも、いまの選択です。</Note>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-10">
          <Head>似た時期の人のもの</Head>
          <ul className="mt-4 flex flex-col gap-4">
            {related.map((k) => (
              <li key={k.id}>
                <Link
                  href={k.href ?? "#"}
                  onClick={() => track("app_knowledge_open", { stage: stage ?? "none", type: k.type })}
                  className="block"
                >
                  <Mark>考え方</Mark>
                  <p className="mt-1 text-[14.5px] font-bold leading-[1.7] text-charcoal">{k.title}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-12 flex flex-col gap-3">
        <Action href={isNew ? "/app" : "/app/record"} quiet>
          {isNew ? "今日に戻る" : "記録の一覧へ"}
        </Action>
        {!confirm ? (
          <button
            type="button"
            onClick={() => setConfirm(true)}
            className="min-h-[44px] text-[13px] text-faint transition-colors hover:text-accent"
          >
            この記録を消す
          </button>
        ) : (
          <div className="rounded-[12px] border border-accent bg-accent-tint px-4 py-4">
            <p className="text-[14px] leading-[1.9] text-charcoal">
              この記録を消します。元に戻せません。
            </p>
            <div className="mt-3.5 flex gap-2.5">
              <Action
                onClick={() => {
                  removeEntry(e.id);
                  router.replace("/app/record");
                }}
              >
                消す
              </Action>
              <Action quiet onClick={() => setConfirm(false)}>
                やめる
              </Action>
            </div>
          </div>
        )}
      </div>
    </Screen>
  );
}

export default function RecordDetail() {
  return (
    <Suspense fallback={<Loading />}>
      <Detail />
    </Suspense>
  );
}
