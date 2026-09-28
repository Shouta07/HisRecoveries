import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { dbSelect, dbAdminEnabled } from "@/lib/db";
import { isConsultToken } from "@/lib/ask/token";
import {
  category, STATUS_LABEL, PANEL_AGES, RELATIONS, SECOND_ASK, attrLabel,
  type Status, type CategoryId,
} from "@/lib/ask/model";
import { isPlanId, plan as getPlan } from "@/lib/ask/plans";
import { tally, type Answer } from "@/lib/ask/aggregate";
import { AttributeChip } from "@/components/brand/kit";
import Donut from "@/components/brand/Donut";
import Tashikame from "@/components/brand/Tashikame";
import CopyLink from "@/components/ask/CopyLink";
import HelpfulButton from "@/components/ask/HelpfulButton";
import PayButton from "@/components/ask/PayButton";
import WhyAsked from "@/components/ask/WhyAsked";

// 結果 — Human Reaction Report。
//
// ── このサービスの主役の画面 ──────────────────────
// 難しい分析画面にしない。見た瞬間に1つ分かる形にする。
//   リング  何人がどう言ったか
//   共通点  みんなが触れていたこと（書かれたときだけ）
//   個人    一人ひとりの言葉
// 数だけだと理由が分からず、個別だけだと全体が見えない。
//
// ── 結論を書かない ────────────────────────────────
// 「だからこうすべき」は出さない。決めるのは読んだ本人。
//
// ── 割れていることを、悪いことにしない ────────────
// 60/40 は失敗ではない。相手によって受け取り方が変わる、という情報。
//
// ── 支払いが済むまで、結果の体裁にしない ──────────
// 有料にした。払う前の相談は「お支払いへ進む」だけを出す。
// 進めない理由があるときは、その理由を出す。
//
// ── success_url を信用しない ──────────────────────
// ?paid=1 は「Stripe から戻ってきた」以上の意味を持たない。
// URL は手で叩ける。確定させるのは Webhook だけ。

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
  product_type: string | null;
  redacted_kinds: string[] | null;
  summary: string | null;
  created_at: string;
};

const AGE_LABEL: Record<string, string> = {
  "20-24": "20〜24歳",
  "25-29": "25〜29歳",
  "30s": "30代",
  "30-34": "30〜34歳",
  "35-39": "35〜39歳",
  "40-49": "40〜49歳",
  any: "指定なし",
};

/** 支払いが済んでいないもの */
const UNPAID: Status[] = ["draft", "payment_pending"];

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div data-brand className="min-h-screen bg-paper pb-28 text-slate sm:pb-0">
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex w-full max-w-[860px] items-center justify-between gap-4 px-5 py-3.5 sm:px-10">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <Tashikame size={26} />
            <span className="truncate text-[14.5px] font-black">His Recoveries</span>
          </Link>
          <Link
            href="/ask"
            className="inline-flex min-h-[42px] shrink-0 items-center whitespace-nowrap rounded-pill border border-line bg-paper px-5 text-[13.5px] font-bold shadow-card transition-shadow hover:shadow-card-hover"
          >
            もう1件聞く
          </Link>
        </div>
      </header>
      <div className="mx-auto w-full max-w-[860px] px-5 pb-24 pt-9 sm:px-10 sm:pt-12">
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
  searchParams: { new?: string; paid?: string; canceled?: string };
}) {
  if (!isConsultToken(params.token)) notFound();
  const justPaid = searchParams.paid === "1";
  const canceled = searchParams.canceled === "1";

  // この環境にデータベースが無いときは、無いと書く。
  // それらしい見本を出すと、動いていないことに気づけない。
  if (!dbAdminEnabled) {
    return (
      <Shell>
        <h1 className="text-big font-black">相談を受け付けました。</h1>
        <p className="mt-6 max-w-[30em] text-[15.5px] leading-[1.95] text-steel">
          ただし、いまこの環境はデータベースに接続されていません。
          そのため相談は保存されておらず、回答も集まりません。
          接続設定が入ると、この画面に回答が並びます。
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

  const planName = isPlanId(c.product_type) ? getPlan(c.product_type).name : null;
  const whoChips = [
    AGE_LABEL[c.panel_age] ?? "指定なし",
    "女性",
    ...(c.panel_attrs ?? []).map(attrLabel),
  ];

  /* ── まだ払われていない ───────────────────────── */
  if (UNPAID.includes(c.status)) {
    return (
      <Shell>
        <h1 className="text-big font-black">
          {justPaid ? "お支払いを確認しています。" : "あとは、お支払いだけ。"}
        </h1>

        {justPaid ? (
          <>
            <p className="mt-6 max-w-[30em] text-[15.5px] leading-[1.95] text-steel">
              カード会社からの確認を待っています。ふつうは数秒から数分で終わります。
              確認が取れると、この画面に募集の状況が出ます。
              少しあとに、このページを読み込み直してください。
            </p>
            <p className="mt-5 text-[13px] leading-[1.85] text-steel">
              お支払いが済んだかどうかは、こちらで確認してから確定します。
              この画面を開いただけでは確定しません。
            </p>
          </>
        ) : (
          <p className="mt-6 max-w-[30em] text-[15.5px] leading-[1.95] text-steel">
            聞きたいことは保存しました。お支払いが済むと、条件に合う方へ募集を始めます。
            お支払いの前に回答者へ配ることはありません。
          </p>
        )}

        {!justPaid && (
          <PayButton token={params.token} planId={c.product_type} canceled={canceled} />
        )}

        <section className="mt-12 border-t border-line pt-9">
          <p className="text-[12px] font-bold text-steel">聞く内容</p>
          <p className="mt-3 whitespace-pre-wrap text-[16px] font-bold leading-[1.7]">
            {c.is_ab ? `A: ${c.option_a}\nB: ${c.option_b}` : c.body}
          </p>
          <ul className="mt-5 flex flex-wrap gap-1.5">
            {whoChips.map((t) => (
              <li key={t} className="rounded-pill bg-mist px-2.5 py-1 text-[12px] text-steel">
                {t}
              </li>
            ))}
            <li className="rounded-pill bg-mist px-2.5 py-1 text-[12px] font-bold text-steel">
              {c.panel_size}人
            </li>
          </ul>
        </section>

        <CopyLink token={params.token} />
      </Shell>
    );
  }

  /* ── 払われている。結果を出す ─────────────────── */
  const answers = await dbSelect<{
    id: string;
    display_age_band: string;
    verdict: Answer["verdict"];
    pick: Answer["pick"];
    second: Answer["second"];
    comment: string;
    helpful: boolean | null;
  }>(
    `responses?consultation_id=eq.${c.id}&select=id,display_age_band,verdict,pick,second,comment,helpful&order=created_at.asc`,
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
  const good = slices.filter((s) => s.positive);
  const bad = slices.filter((s) => !s.positive);

  return (
    <Shell>
      {c.status === "refunded" && (
        <p className="mb-7 rounded-card border border-line bg-mist px-5 py-4 text-[13.5px] leading-[1.85] text-steel">
          この相談は返金済みです。
        </p>
      )}

      <p className="text-[12px] font-bold tracking-[0.12em] text-brand">HUMAN REACTION REPORT</p>

      <h1 className="mt-3 text-huge font-black">
        {c.is_ab
          ? "AとB、どっち？"
          : c.body.length > 40
            ? `${c.body.slice(0, 40)}…`
            : c.body}
      </h1>

      {/* 誰に聞いたか。このサービスの価値はここ */}
      <ul className="mt-5 flex flex-wrap gap-1.5">
        {whoChips.map((x) => (
          <li key={x}>
            <AttributeChip on>{x}</AttributeChip>
          </li>
        ))}
        <li>
          <AttributeChip>{c.panel_size}人</AttributeChip>
        </li>
      </ul>

      {t.total > 0 ? (
        <>
          <section className="mt-9 rounded-card border border-line bg-paper p-6 shadow-card sm:p-8">
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
              {good.map((s) => (
                <Donut key={s.label} n={s.n} of={t.total} label={s.label} size={140} />
              ))}
              {bad.map((s) => (
                <Donut
                  key={s.label}
                  n={s.n}
                  of={t.total}
                  label={s.label}
                  positive={false}
                  size={108}
                />
              ))}
            </div>

            {/* 2つ目の問い。カテゴリによっては、ここが本当に知りたいこと */}
            {t.second && SECOND_ASK[c.category as CategoryId] && (
              <div className="mt-9 border-t border-line pt-7">
                <p className="text-[14px] leading-[1.85] text-steel">
                  {SECOND_ASK[c.category as CategoryId]}
                </p>
                <p className="mt-3 text-[40px] font-black leading-[0.9] tabular-nums sm:text-[52px]">
                  {t.second.yes}
                  <span className="text-steel"> / {t.second.total}</span>
                  <span className="ml-3 align-middle text-[0.3em] font-bold text-ok-text">
                    はい
                  </span>
                </p>
              </div>
            )}
          </section>

          {waiting > 0 && (
            <p className="mt-5 text-[12.5px] font-bold text-steel">
              あと{waiting}人の回答を待っています
            </p>
          )}

          {/* 割れていることを、悪いことにしない */}
          {t.split && t.total > 1 && (
            <div className="mt-9 rounded-card border border-line bg-mist p-6">
              <p className="text-[19px] font-black leading-[1.6] sm:text-[21px]">
                答えが割れるのも、人に聞く価値。
              </p>
              <p className="mt-3 max-w-[32em] text-[14.5px] leading-[1.9] text-steel">
                どちらが正しいというより、そう感じる人が両方いる、ということです。
                相手によって受け取り方が変わります。決めるのはあなたです。
              </p>
            </div>
          )}
        </>
      ) : (
        <p className="mt-9 max-w-[30em] text-[15.5px] leading-[1.95] text-steel">
          まだ回答はありません。{STATUS_LABEL[c.status]}です。
          回答が入るたびに、この画面に増えていきます。
        </p>
      )}

      {/* 共通していた反応。書かれたときだけ出す */}
      {c.summary && (
        <section className="mt-12">
          <p className="text-[12px] font-bold text-steel">共通していた反応</p>
          <p className="mt-3 border-l-[3px] border-brand pl-5 text-[16.5px] leading-[1.95] sm:text-[18px]">
            {c.summary}
          </p>
        </section>
      )}

      {/* 一人ひとりの言葉 */}
      {list.length > 0 && (
        <section className="mt-12">
          <p className="text-[12px] font-bold text-steel">それぞれの反応</p>
          <ul className="mt-5 flex flex-col gap-3">
            {list.map((a) => {
              const positive = c.is_ab
                ? a.pick === "a"
                : a.verdict === "good" || a.verdict === "ok";
              const verdictLabel =
                (c.is_ab ? t.byPick : t.byVerdict).find(
                  (x) => x.id === (c.is_ab ? a.pick : a.verdict),
                )?.label ?? "—";
              const age = AGE_LABEL[a.ageBand] ?? "—";

              return (
                <li key={a.id} className="rounded-card border border-line bg-paper p-5 shadow-card">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-tint text-[11px] font-black text-brand-deep">
                      {age.replace(/[^0-9〜代]/g, "") || "—"}
                    </span>
                    <span className="text-[12.5px] font-bold">{age}・女性</span>
                    <span
                      className={`rounded-pill px-2.5 py-1 text-[11px] font-bold ${
                        positive ? "bg-ok-tint text-ok-text" : "bg-mist text-steel"
                      }`}
                    >
                      {verdictLabel}
                    </span>
                  </div>
                  <p className="mt-3 text-[15px] leading-[1.9]">{a.comment}</p>
                  {/* この評価が、回答者の実績の唯一の出どころになる。
                      押さなくてもよい。未評価は割合の分母に入れない。 */}
                  <HelpfulButton
                    token={params.token}
                    responseId={a.id}
                    initial={answers.find((x) => x.id === a.id)?.helpful ?? null}
                  />
                </li>
              );
            })}
          </ul>
          <p className="mt-5 text-[12.5px] leading-[1.85] text-steel">
            役に立った回答に印を付けると、その人の実績になります。
            押さなくても構いません。未評価は割合の計算に入れていません。
          </p>
        </section>
      )}

      {/* 結果を見たあとに1問だけ。任意 */}
      {t.total > 0 && <WhyAsked token={params.token} />}

      {/* 聞いた内容 */}
      <section className="mt-14 border-t border-line pt-9">
        <p className="text-[12px] font-bold text-steel">聞いた内容</p>
        <p className="mt-2.5 text-[12px] text-steel">
          {category(c.category as CategoryId).label} / {panelLabel} {c.panel_size}人
          {planName && ` / ${planName}`}
          {c.relation && ` / ${RELATIONS.find((r) => r.id === c.relation)?.label}`}
        </p>
        <p className="mt-4 whitespace-pre-wrap border-l border-line pl-5 text-[14.5px] leading-[1.95] text-steel">
          {c.is_ab ? `A: ${c.option_a}\nB: ${c.option_b}` : c.body}
        </p>
        {c.redacted_kinds && c.redacted_kinds.length > 0 && (
          <p className="mt-4 text-[12px] leading-[1.8] text-steel">
            送る前に伏せたもの: {c.redacted_kinds.join("、")}
          </p>
        )}
      </section>

      <CopyLink token={params.token} />

      <div className="mt-10">
        <Link
          href="/ask"
          className="inline-flex min-h-[56px] w-full items-center justify-center rounded-pill bg-brand px-8 text-[15.5px] font-bold text-paper shadow-card transition-shadow hover:shadow-card-hover"
        >
          もう1件聞く
        </Link>
      </div>
    </Shell>
  );
}
