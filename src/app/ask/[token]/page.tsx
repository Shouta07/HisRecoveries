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
import CopyLink from "@/components/ask/CopyLink";

// 結果。このサービスでいちばん大事な画面。
//
// ── 3つを同時に見せる ────────────────────────────
//   多数決  何人がどう言ったか
//   共通点  みんなが触れていたこと（書かれたときだけ）
//   個人    一人ひとりの言葉
// どれか1つだけだと、意味が変わる。
// 数だけだと理由が分からず、個別だけだと全体が見えない。
//
// ── 結論を書かない ────────────────────────────────
// 「だからこうすべき」は出さない。決めるのは読んだ本人。
//
// ── 揃うまでを隠さない ────────────────────────────
// 何人待ちかを出す。待っている間に何も出さないと、壊れたように見える。

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "回答 — His Recoveries",
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
  "20-24": "20代前半の女性",
  "25-29": "20代後半の女性",
  "30s": "30代の女性",
  "30-34": "30代前半の女性",
  "35-39": "30代後半の女性",
  "40-49": "40代の女性",
  any: "女性",
};

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
        <h1 className="font-display text-[24px] font-bold leading-[1.5] text-charcoal">
          相談を受け付けました。
        </h1>
        <p className="mt-5 text-[15px] leading-[2] text-bodytext">
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
    responders: { attrs: string[] | null } | null;
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
    attrs: a.responders?.attrs ?? [],
  }));
  const t = tally(list, c.is_ab);
  const waiting = Math.max(0, c.panel_size - t.total);

  return (
    <Shell>
      {isNew && (
        <p className="text-[11.5px] font-medium tracking-[0.12em] text-faint">送りました</p>
      )}

      <h1 className="mt-3 font-display text-[24px] font-bold leading-[1.45] text-charcoal sm:text-[28px]">
        {t.total > 0
          ? `女性${t.total}人に聞きました`
          : `女性${c.panel_size}人に聞いています`}
      </h1>

      {/* 多数決 */}
      {t.total > 0 ? (
        <>
          <p className="mt-5 text-[16px] leading-[1.95] text-charcoal">{t.headline}</p>
          <ul className="mt-6 divide-y divide-hairline border-y border-hairline">
            {(c.is_ab ? t.byPick : t.byVerdict)
              .filter((x) => x.n > 0)
              .map((x) => (
                <li key={x.id} className="flex items-center gap-4 py-3">
                  <span className="w-[8.5em] shrink-0 text-[14.5px] text-charcoal">{x.label}</span>
                  <span
                    aria-hidden
                    className="h-[6px] rounded-full bg-accent"
                    style={{ width: `${(x.n / t.total) * 60}%`, minWidth: "8px" }}
                  />
                  <span className="text-[13px] tabular-nums text-faint">{x.n}人</span>
                </li>
              ))}
          </ul>
        </>
      ) : (
        <p className="mt-5 text-[15px] leading-[2] text-bodytext">
          まだ回答はありません。{STATUS_LABEL[c.status]}です。
          回答が入るたびに、この画面に増えていきます。
        </p>
      )}

      {/* 2つ目の問い。カテゴリによっては、ここが本当に知りたいこと */}
      {t.second && SECOND_ASK[c.category as CategoryId] && (
        <section className="mt-9">
          <p className="text-[14.5px] leading-[1.9] text-bodytext">
            {SECOND_ASK[c.category as CategoryId]}
          </p>
          <p className="mt-2.5 text-[17px] font-bold leading-[1.7] text-charcoal">
            {t.second.total}人中{t.second.yes}人が「はい」
          </p>
        </section>
      )}

      {waiting > 0 && t.total > 0 && (
        <p className="mt-4 text-[13px] text-faint">あと{waiting}人の回答を待っています。</p>
      )}

      {/* 共通していた意見。書かれたときだけ出す */}
      {c.summary && (
        <section className="mt-10">
          <h2 className="font-display text-[17px] font-bold text-charcoal">共通していた意見</h2>
          <p className="mt-3 border-l border-accent pl-4 text-[15.5px] leading-[2] text-charcoal">
            {c.summary}
          </p>
        </section>
      )}

      {t.split && t.total > 1 && (
        <p className="mt-6 text-[14px] leading-[1.9] text-bodytext">
          意見が分かれています。どちらが正しいというより、
          そう感じる人が両方いる、ということだと思います。
        </p>
      )}

      {/* 一人ひとりの言葉 */}
      {list.length > 0 && (
        <section className="mt-11">
          <h2 className="font-display text-[17px] font-bold text-charcoal">それぞれの回答</h2>
          <ul className="mt-5 flex flex-col gap-7">
            {list.map((a) => (
              <li key={a.id}>
                <p className="text-[12.5px] text-faint">
                  {AGE_LABEL[a.ageBand] ?? "女性"}
                  {a.attrs.length > 0 && (
                    <span className="ml-2">（{a.attrs.map(attrLabel).join("・")}）</span>
                  )}
                  {a.verdict && (
                    <span className="ml-2.5 text-charcoal">
                      {(c.is_ab ? t.byPick : t.byVerdict).find((x) => x.id === a.verdict)?.label}
                    </span>
                  )}
                  {a.pick && (
                    <span className="ml-2.5 text-charcoal">
                      {t.byPick.find((x) => x.id === a.pick)?.label}
                    </span>
                  )}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-[15px] leading-[2] text-charcoal">
                  「{a.comment}」
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 聞いた内容 */}
      <section className="mt-12 border-t border-hairline pt-8">
        <h2 className="font-display text-[15px] font-bold text-charcoal">聞いた内容</h2>
        <p className="mt-2.5 text-[12.5px] text-faint">
          {category(c.category as never).label} ／{" "}
          {PANEL_AGES.find((p) => p.id === c.panel_age)?.label ?? "女性"} {c.panel_size}人
          {c.panel_attrs && c.panel_attrs.length > 0 && ` ／ ${c.panel_attrs.map(attrLabel).join("・")}`}
          {c.relation && ` ／ ${RELATIONS.find((r) => r.id === c.relation)?.label}`}
        </p>
        <p className="mt-3 whitespace-pre-wrap border-l border-hairline pl-4 text-[14.5px] leading-[1.95] text-bodytext">
          {c.is_ab ? `A: ${c.option_a}\nB: ${c.option_b}` : c.body}
        </p>
        {c.redacted_kinds && c.redacted_kinds.length > 0 && (
          <p className="mt-3 text-[12.5px] leading-[1.85] text-faint">
            送る前に伏せたもの: {c.redacted_kinds.join("、")}
          </p>
        )}
      </section>

      <CopyLink token={params.token} />

      <div className="mt-10">
        <Link
          href="/ask"
          className="inline-flex min-h-[52px] w-full items-center justify-center rounded-[8px] border border-hairline px-5 text-[15px] font-bold text-bodytext transition-colors hover:border-accent hover:text-accent"
        >
          もう1件聞く
        </Link>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ground">
      <div className="mx-auto w-full max-w-[560px] px-5 pb-20 pt-8 sm:px-8 sm:pt-12">
        {children}
      </div>
    </div>
  );
}
