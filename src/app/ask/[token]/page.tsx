import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { dbSelect, dbAdminEnabled } from "@/lib/db";
import { isConsultToken } from "@/lib/ask/token";
import {
  category, STATUS_LABEL, PANEL_AGES, RELATIONS, SECOND_ASK, attrLabel,
  type Status, type CategoryId,
} from "@/lib/ask/model";
import { tally, type Answer } from "@/lib/ask/aggregate";
import { Eyebrow, ReactionCard, ResultDistribution, AttributeChip } from "@/components/brand/kit";
import CopyLink from "@/components/ask/CopyLink";

// 結果 — Human Reaction Report。
//
// ── このサービスの主役の画面 ──────────────────────
// 回答一覧ではなく、1枚の報告として見せる。
//   多数決  何人がどう言ったか
//   共通点  みんなが触れていたこと（書かれたときだけ）
//   個人    一人ひとりの言葉
// どれか1つだけだと意味が変わる。
// 数だけだと理由が分からず、個別だけだと全体が見えない。
//
// ── 結論を書かない ────────────────────────────────
// 「だからこうすべき」は出さない。決めるのは読んだ本人。
//
// ── 割れていることを、悪いことにしない ────────────
// 60/40 は失敗ではない。相手によって受け取り方が変わる、という情報。
//
// ── 部品はトップと同じものを使う ────────────────
// 広告の見た目と中身が食い違わないように、
// ReactionCard も ResultDistribution もトップと同一。

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Human Reaction Report — His Recoveries",
  robots: { index: false, follow: false },
};

type Row = {
  id: string;
  category: string;
  body: string;
  option_a: string | null;
  option_b: string | null;
  is_ab: boolean;
  asker_age_band: string | null;
  other_age_band: string | null;
  relation: string | null;
  panel_age: string;
  panel_attrs: string[] | null;
  panel_size: number;
  status: Status;
  redacted_kinds: string[] | null;
  summary: string | null;
  created_at: string;
};

const AGE_LABEL: Record<string, string> = {
  "20-24": "20-24",
  "25-29": "25-29",
  "30s": "30s",
  "30-34": "30-34",
  "35-39": "35-39",
  "40-49": "40-49",
  any: "—",
};

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div data-brand className="min-h-screen bg-bone text-void">
      <header className="border-b border-rule">
        <div className="mx-auto flex w-full max-w-[860px] items-center justify-between gap-4 px-6 py-4 sm:px-10">
          <Link href="/" className="text-[14px] font-black uppercase tracking-[0.1em]">
            His Recoveries
          </Link>
          <Link
            href="/ask"
            className="inline-flex min-h-[40px] items-center border border-void px-4 text-[11.5px] font-bold uppercase tracking-[0.14em] transition-colors hover:bg-void hover:text-bone"
          >
            もう1件聞く
          </Link>
        </div>
      </header>
      <div className="mx-auto w-full max-w-[860px] px-6 pb-24 pt-10 sm:px-10 sm:pt-14">
        {children}
      </div>
    </div>
  );
}

export default async function ResultPage({
  params,
  searchParams,
}: {
  params: { token: string };
  searchParams: { new?: string };
}) {
  if (!isConsultToken(params.token)) notFound();
  const isNew = searchParams.new === "1";

  // この環境にデータベースが無いときは、無いと書く。
  // それらしい見本を出すと、動いていないことに気づけない。
  if (!dbAdminEnabled) {
    return (
      <Shell>
        <Eyebrow>Received</Eyebrow>
        <h1 className="mt-6 text-big font-black text-void">相談を受け付けました。</h1>
        <p className="mt-7 max-w-[30em] text-[16px] leading-[1.95] text-ash">
          ただし、いまこの環境はデータベースに接続されていません。
          そのため相談は保存されておらず、回答も集まりません。
          接続設定（Supabase）が入ると、この画面に回答が並びます。
        </p>
        <CopyLink token={params.token} />
      </Shell>
    );
  }

  const rows = await dbSelect<Row>(
    `consultations?token=eq.${encodeURIComponent(params.token)}&select=*`,
  );
  const c = rows[0];
  if (!c) notFound();

  const answers = await dbSelect<{
    id: string;
    display_age_band: string;
    verdict: Answer["verdict"];
    pick: Answer["pick"];
    second: Answer["second"];
    comment: string;
  }>(
    `responses?consultation_id=eq.${c.id}&select=id,display_age_band,verdict,pick,second,comment&order=created_at.asc`,
  );

  const list: Answer[] = answers.map((a) => ({
    id: a.id,
    ageBand: a.display_age_band,
    verdict: a.verdict,
    pick: a.pick,
    second: a.second,
    comment: a.comment,
    attrs: [],
  }));
  const t = tally(list, c.is_ab);
  const waiting = Math.max(0, c.panel_size - t.total);
  const panelLabel = PANEL_AGES.find((p) => p.id === c.panel_age)?.label ?? "女性";

  const slices = (c.is_ab ? t.byPick : t.byVerdict)
    .filter((x) => x.n > 0)
    .map((x) => ({
      label: x.label,
      n: x.n,
      positive: c.is_ab ? x.id === "a" : x.id === "good" || x.id === "ok",
    }));

  return (
    <Shell>
      {isNew && <Eyebrow>Sent</Eyebrow>}

      <h1 className="mt-5 text-huge font-black text-void">
        {t.total > 0 ? (
          <>
            {t.total}人が
            <br />
            答えました。
          </>
        ) : (
          <>
            {c.panel_size}人に
            <br />
            聞いています。
          </>
        )}
      </h1>

      {/* 誰に聞いたか。この製品の価値はここ */}
      <ul className="mt-8 flex flex-wrap gap-2">
        <li>
          <AttributeChip on>{AGE_LABEL[c.panel_age] ?? "—"}</AttributeChip>
        </li>
        <li>
          <AttributeChip on>Women</AttributeChip>
        </li>
        {(c.panel_attrs ?? []).map((a) => (
          <li key={a}>
            <AttributeChip on>{attrLabel(a)}</AttributeChip>
          </li>
        ))}
        <li>
          <AttributeChip>{c.panel_size} people</AttributeChip>
        </li>
      </ul>

      {t.total > 0 ? (
        <>
          <section className="mt-12 border border-void p-6 sm:p-9">
            <ResultDistribution slices={slices} total={t.total} />

            {/* 2つ目の問い。カテゴリによっては、ここが本当に知りたいこと */}
            {t.second && SECOND_ASK[c.category as CategoryId] && (
              <div className="mt-10 border-t border-rule pt-8">
                <p className="text-[14.5px] leading-[1.85] text-ash">
                  {SECOND_ASK[c.category as CategoryId]}
                </p>
                <p className="mt-3 text-[44px] font-black leading-[0.9] tracking-[-0.04em] tabular-nums text-void sm:text-[56px]">
                  {t.second.yes}
                  <span className="text-ash"> / {t.second.total}</span>
                  <span className="ml-3 text-[0.32em] font-bold uppercase tracking-[0.16em] align-middle">
                    Yes
                  </span>
                </p>
              </div>
            )}
          </section>

          {waiting > 0 && (
            <p className="mt-5 text-[12.5px] font-bold uppercase tracking-[0.14em] text-ash">
              あと{waiting}人の回答を待っています
            </p>
          )}

          {/* 割れていることを、悪いことにしない */}
          {t.split && t.total > 1 && (
            <div className="mt-10 border-t border-void pt-8">
              <p className="text-[20px] font-bold leading-[1.6] sm:text-[24px]">
                意見が分かれました。
              </p>
              <p className="mt-3 max-w-[30em] text-[15px] leading-[1.95] text-ash">
                どちらが正しいというより、そう感じる人が両方いる、ということです。
                相手によって受け取り方が変わることが分かります。
              </p>
            </div>
          )}
        </>
      ) : (
        <p className="mt-10 max-w-[30em] text-[16px] leading-[1.95] text-ash">
          まだ回答はありません。{STATUS_LABEL[c.status]}です。
          回答が入るたびに、この画面に増えていきます。
        </p>
      )}

      {/* 共通していた反応。書かれたときだけ出す */}
      {c.summary && (
        <section className="mt-12">
          <Eyebrow>共通していた反応</Eyebrow>
          <p className="mt-4 border-l-2 border-void pl-5 text-[17px] leading-[1.95] sm:text-[19px]">
            {c.summary}
          </p>
        </section>
      )}

      {/* 一人ひとりの言葉 */}
      {list.length > 0 && (
        <section className="mt-14">
          <Eyebrow>それぞれの反応</Eyebrow>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {list.map((a, i) => (
              <ReactionCard
                key={a.id}
                className="max-w-none"
                tilt={i % 2 === 0 ? -0.6 : 0.6}
                r={{
                  age: AGE_LABEL[a.ageBand] ?? "—",
                  attrs: ["Woman", ...a.attrs.map(attrLabel)].slice(0, 3),
                  verdict:
                    (c.is_ab ? t.byPick : t.byVerdict).find(
                      (x) => x.id === (c.is_ab ? a.pick : a.verdict),
                    )?.label ?? "—",
                  positive: c.is_ab ? a.pick === "a" : a.verdict === "good" || a.verdict === "ok",
                  comment: a.comment,
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* 聞いた内容 */}
      <section className="mt-16 border-t border-rule pt-10">
        <Eyebrow>聞いた内容</Eyebrow>
        <p className="mt-3 text-[12px] font-bold uppercase tracking-[0.14em] text-ash">
          {category(c.category as CategoryId).label} / {panelLabel} {c.panel_size}
          {c.relation && ` / ${RELATIONS.find((r) => r.id === c.relation)?.label}`}
        </p>
        <p className="mt-5 whitespace-pre-wrap border-l border-rule pl-5 text-[15px] leading-[1.95] text-ash">
          {c.is_ab ? `A: ${c.option_a}\nB: ${c.option_b}` : c.body}
        </p>
        {c.redacted_kinds && c.redacted_kinds.length > 0 && (
          <p className="mt-4 text-[12px] leading-[1.8] text-ash">
            送る前に伏せたもの: {c.redacted_kinds.join("、")}
          </p>
        )}
      </section>

      <CopyLink token={params.token} />

      <div className="mt-12">
        <Link
          href="/ask"
          className="inline-flex min-h-[58px] w-full items-center justify-center bg-void px-8 text-[14px] font-bold uppercase tracking-[0.14em] text-bone transition-colors hover:bg-lime hover:text-void"
        >
          もう1件聞く
        </Link>
      </div>
    </Shell>
  );
}
