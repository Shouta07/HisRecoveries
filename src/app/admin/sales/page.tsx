import type { Metadata } from "next";
import Link from "next/link";
import { dbSelect, dbAdminEnabled } from "@/lib/db";
import { site } from "@/lib/site";
import { PLANS, plan as getPlan, isSellable } from "@/lib/ask/plans";
import { canCharge, whyCannotCharge } from "@/lib/legal";
import UtmBuilder from "@/components/admin/UtmBuilder";

// 販売を回すための画面。
//
// ── 毎朝ここだけ見れば、出稿を増やすか止めるかが決まる ──
// 答えたいのは4つだけ。
//   いくら売れたか / どこで落ちているか /
//   どの流入が売上になったか / 売ったあと返金になっていないか
//
// ── 売上と、イベントの数を混ぜない ────────────────
// 金額は payments（Webhook が確定させたもの）だけを見る。
// ブラウザから送られる purchase_paid は、率の分子にしか使わない。
// 混ぜると、決済が失敗した回まで売上に乗る。
//
// ── 無いものは0と出す ─────────────────────────────
// まだ1件も売れていないなら0。見栄えのために埋めない。

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "販売 — 運営", robots: { index: false } };

const yen = (n: number) => `¥${Math.round(n).toLocaleString()}`;
const rate = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 1000) / 10}%` : "—");

type SalesDay = { day: string; paid_count: number; paid_yen: number; refunded_count: number };
type BySource = {
  source: string;
  landing_path: string | null;
  product_type: string;
  paid_count: number;
  paid_yen: number;
  refunded_count: number;
  last_paid_at: string | null;
};
type FunnelSource = {
  source: string;
  utm_campaign: string | null;
  landed: number;
  plan_viewed: number;
  submitted: number;
  checkout_started: number;
  paid: number;
  blocked: number;
};
type Block = { why: string; plan: string; n: number; last_at: string };

function Card({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-card border border-line bg-paper p-5 shadow-card">
      <h2 className="text-[13px] font-bold tracking-[0.08em] text-steel">{title}</h2>
      {note && <p className="mt-1.5 text-[12px] leading-[1.7] text-steel">{note}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[11.5px] text-steel">{label}</p>
      <p className="mt-1 text-[22px] font-black tabular-nums leading-none text-slate">{value}</p>
      {note && <p className="mt-1 text-[11px] leading-[1.6] text-steel">{note}</p>}
    </div>
  );
}

/** 期間で切って合計する。日付は view 側で date になっている */
function total(rows: SalesDay[], days: number) {
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  from.setDate(from.getDate() - (days - 1));
  const hit = rows.filter((r) => new Date(r.day) >= from);
  const count = hit.reduce((n, r) => n + Number(r.paid_count ?? 0), 0);
  const sum = hit.reduce((n, r) => n + Number(r.paid_yen ?? 0), 0);
  const refunded = hit.reduce((n, r) => n + Number(r.refunded_count ?? 0), 0);
  return { count, sum, refunded, avg: count > 0 ? sum / count : 0 };
}

export default async function SalesPage() {
  const chargeable = canCharge();
  const why = whyCannotCharge();

  if (!dbAdminEnabled) {
    return (
      <div className="mx-auto max-w-[1100px] px-6 py-12 sm:px-10">
        <h1 className="text-[24px] font-black text-slate">販売</h1>
        <p className="mt-4 rounded-card border border-line bg-paper p-5 text-[13.5px] leading-[1.9] text-steel shadow-card">
          Supabase がつながっていません。<code>SUPABASE_URL</code> と{" "}
          <code>SUPABASE_SERVICE_KEY</code> を入れると、ここに売上が出ます。
          <br />
          いま売上を確認するなら Stripe のダッシュボードを見てください。
        </p>
      </div>
    );
  }

  const [daily, bySource, funnel, blocks] = await Promise.all([
    dbSelect<SalesDay>("sales_daily?order=day.desc&limit=60"),
    dbSelect<BySource>("sales_by_source?order=paid_yen.desc&limit=40"),
    dbSelect<FunnelSource>("funnel_by_source?order=landed.desc&limit=25"),
    dbSelect<Block>("checkout_blocks?order=n.desc&limit=12"),
  ]);

  const d1 = total(daily, 1);
  const d7 = total(daily, 7);
  const d30 = total(daily, 30);

  // ファネルは30日ぶんの合計。率の分母を1か所にまとめる。
  const f = funnel.reduce(
    (a, r) => ({
      landed: a.landed + Number(r.landed ?? 0),
      plan_viewed: a.plan_viewed + Number(r.plan_viewed ?? 0),
      submitted: a.submitted + Number(r.submitted ?? 0),
      checkout_started: a.checkout_started + Number(r.checkout_started ?? 0),
      paid: a.paid + Number(r.paid ?? 0),
      blocked: a.blocked + Number(r.blocked ?? 0),
    }),
    { landed: 0, plan_viewed: 0, submitted: 0, checkout_started: 0, paid: 0, blocked: 0 },
  );

  const steps: { label: string; n: number; of: number; hint: string }[] = [
    { label: "着地", n: f.landed, of: 0, hint: "来た人" },
    { label: "料金を見た", n: f.plan_viewed, of: f.landed, hint: "CTAかプランを押した" },
    { label: "相談を書いた", n: f.submitted, of: f.plan_viewed, hint: "本文を送信した" },
    { label: "決済へ進んだ", n: f.checkout_started, of: f.submitted, hint: "Stripeへ送った" },
    { label: "支払った", n: f.paid, of: f.checkout_started, hint: "完了画面まで来た" },
  ];

  const th = "px-3 py-2 text-left text-[11.5px] font-bold text-steel";
  const td = "px-3 py-2 text-[13px] text-slate";
  const tdNum = `${td} text-right tabular-nums`;

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-12 sm:px-10">
      <header className="mb-8">
        <h1 className="text-[26px] font-black leading-[1.3] text-slate">販売</h1>
        <p className="mt-2 text-[13px] leading-[1.8] text-steel">
          増やすか止めるかを、ここだけで決める。金額は Stripe が確定させたものだけを出しています。
        </p>
      </header>

      {!chargeable && (
        <p className="mb-8 rounded-card border border-rose bg-paper p-4 text-[13.5px] leading-[1.9] text-slate shadow-card">
          <strong className="font-black">いま決済できません。</strong>
          {why}。この状態では、どれだけ出稿しても売上は0のままです。
          <Link href="/admin/setup" className="ml-2 font-bold text-brand underline">
            残りを見る
          </Link>
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {(
          [
            ["今日", d1],
            ["7日", d7],
            ["30日", d30],
          ] as const
        ).map(([label, t]) => (
          <Card key={label} title={label}>
            <div className="grid grid-cols-3 gap-3">
              <Stat label="売上" value={yen(t.sum)} />
              <Stat label="件数" value={String(t.count)} />
              <Stat
                label="平均単価"
                value={t.count > 0 ? yen(t.avg) : "—"}
                note={t.refunded > 0 ? `返金 ${t.refunded}件` : undefined}
              />
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-4">
        <Card
          title="どこで落ちているか（30日）"
          note="いちばん率の低い段が、いま直すべきところ。出稿を増やすのは、そのあと。"
        >
          {f.landed === 0 ? (
            <p className="text-[13px] text-steel">まだ着地がありません。</p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {steps.map((s, i) => {
                const r = i === 0 ? 1 : s.of > 0 ? s.n / s.of : 0;
                return (
                  <li key={s.label} className="flex items-center gap-3">
                    <span className="w-[6.5em] shrink-0 text-[12.5px] font-bold text-slate">
                      {s.label}
                    </span>
                    <span className="h-[10px] flex-1 overflow-hidden rounded-pill bg-mist">
                      <span
                        className="block h-full rounded-pill bg-brand"
                        style={{
                          width: `${f.landed > 0 ? Math.max(1.5, (s.n / f.landed) * 100) : 0}%`,
                        }}
                      />
                    </span>
                    <span className="w-[4.5em] shrink-0 text-right text-[13px] font-bold tabular-nums text-slate">
                      {s.n}
                    </span>
                    <span className="w-[7.5em] shrink-0 text-right text-[11.5px] tabular-nums text-steel">
                      {i === 0 ? s.hint : `前段の ${rate(s.n, s.of)}`}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-4">
        <Card
          title="どの流入が売上になったか"
          note="買われた相談に付いている流入元です。広告費はこちらでは分かりません。件数と売上を、媒体側の費用と突き合わせてください。"
        >
          {bySource.length === 0 ? (
            <p className="text-[13px] text-steel">まだ売上がありません。</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] border-collapse">
                <thead>
                  <tr className="border-b border-line">
                    <th className={th}>流入元</th>
                    <th className={th}>着地</th>
                    <th className={th}>プラン</th>
                    <th className={`${th} text-right`}>件数</th>
                    <th className={`${th} text-right`}>売上</th>
                    <th className={`${th} text-right`}>返金</th>
                  </tr>
                </thead>
                <tbody>
                  {bySource.map((r, i) => (
                    <tr key={i} className="border-b border-line last:border-0">
                      <td className={`${td} font-bold`}>{r.source}</td>
                      <td className={`${td} text-steel`}>{r.landing_path ?? "—"}</td>
                      <td className={td}>
                        {isSellable(r.product_type) ? getPlan(r.product_type).name : r.product_type}
                      </td>
                      <td className={tdNum}>{r.paid_count}</td>
                      <td className={`${tdNum} font-bold`}>{yen(Number(r.paid_yen ?? 0))}</td>
                      <td className={tdNum}>{r.refunded_count || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <div className="mt-4">
        <Card
          title="流入元ごとの通り方（30日）"
          note="着地あたり何件買われたか。ここが他より高い流入だけを増やす。"
        >
          {funnel.length === 0 ? (
            <p className="text-[13px] text-steel">まだ着地がありません。</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] border-collapse">
                <thead>
                  <tr className="border-b border-line">
                    <th className={th}>流入元</th>
                    <th className={th}>施策</th>
                    <th className={`${th} text-right`}>着地</th>
                    <th className={`${th} text-right`}>料金</th>
                    <th className={`${th} text-right`}>送信</th>
                    <th className={`${th} text-right`}>決済へ</th>
                    <th className={`${th} text-right`}>購入</th>
                    <th className={`${th} text-right`}>購入率</th>
                  </tr>
                </thead>
                <tbody>
                  {funnel.map((r, i) => (
                    <tr key={i} className="border-b border-line last:border-0">
                      <td className={`${td} font-bold`}>{r.source}</td>
                      <td className={`${td} text-steel`}>{r.utm_campaign ?? "—"}</td>
                      <td className={tdNum}>{r.landed}</td>
                      <td className={tdNum}>{r.plan_viewed}</td>
                      <td className={tdNum}>{r.submitted}</td>
                      <td className={tdNum}>{r.checkout_started}</td>
                      <td className={`${tdNum} font-bold`}>{r.paid}</td>
                      <td className={tdNum}>{rate(Number(r.paid ?? 0), Number(r.landed ?? 0))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {blocks.length > 0 && (
        <div className="mt-4">
          <Card
            title="決済を始められなかった回（30日）"
            note="ここに数が出ているあいだは、出稿しても売上になりません。"
          >
            <ul className="flex flex-col gap-2">
              {blocks.map((b, i) => (
                <li
                  key={i}
                  className="flex items-baseline justify-between gap-4 border-b border-line pb-2 last:border-0"
                >
                  <span className="min-w-0 text-[13px] text-slate">{b.why}</span>
                  <span className="shrink-0 text-[13px] font-bold tabular-nums text-slate">
                    {b.n}回
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      <div className="mt-4">
        <Card
          title="出稿用のリンクを作る"
          note="手で utm を書かないでください。大文字小文字が違うだけで、同じ出稿が別の行に分かれます。"
        >
          <UtmBuilder base={site.url} />
        </Card>
      </div>

      <div className="mt-4">
        <Card title="いま売っているもの" note="料金表に出しているものと、受付前のもの。">
          <ul className="flex flex-col gap-1.5">
            {PLANS.map((p) => (
              <li key={p.id} className="flex items-baseline justify-between gap-4 text-[13px]">
                <span className="min-w-0 text-slate">
                  {p.name}
                  <span className="ml-2 text-steel">{p.answers}人</span>
                </span>
                <span className="shrink-0 tabular-nums text-slate">
                  {yen(p.yen)}
                  {p.from && "〜"}
                  <span className={`ml-3 font-bold ${p.available ? "text-brand" : "text-steel"}`}>
                    {p.available ? "販売中" : "受付前"}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <p className="mt-8 text-[12px] leading-[1.9] text-steel">
        日次の推移は <code>sales_daily</code>、流入元別は <code>sales_by_source</code>。
        採算は <Link href="/admin/economics" className="font-bold text-brand underline">採算と市場</Link>、
        開通の残りは <Link href="/admin/setup" className="font-bold text-brand underline">準備</Link>。
      </p>
    </div>
  );
}
