import type { Metadata } from "next";
import { dbSelect, dbAdminEnabled } from "@/lib/db";
import { DEFAULT_PLAN } from "@/lib/ask/plans";
import {
  allUnits, waves, REWARDS, URGENCY, priorityBonus, COSTS,
  MIN_MARGIN_RATE, MAX_VARIABLE_RATE, PAYMENT_RATE, AI_COST_YEN, REFUND_RATE,
} from "@/lib/economics";

// 運営用。採算と、いま市場がどうなっているか。
//
// ── 売上ではなく、1注文あたりの限界利益を見る ────
// 売上総額はいくらでも伸ばせる。回答者に払って、決済手数料を引いて、
// 返金と再配信が乗ったあとに何が残るかが、この事業の中身。
//
// ── いない数を作らない ────────────────────────────
// 実績が0なら0と出す。ここで見栄えのために数を入れたら、
// 経営の判断が全部ずれる。
//
// ── 利用者には見せない ────────────────────────────
// /admin は Basic 認証の後ろ（middleware.ts）。

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "採算と市場 — 運営", robots: { index: false } };

const yen = (n: number) => `¥${Math.round(n).toLocaleString()}`;
const pct = (n: number) => `${Math.round(n * 100)}%`;

type Alert = { level: "warn" | "bad"; text: string };

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-card border border-line bg-paper p-5 shadow-card">
      <h2 className="text-[13px] font-bold tracking-[0.1em] text-steel">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[11.5px] text-steel">{label}</p>
      <p className="mt-1 text-[22px] font-black tabular-nums leading-none text-slate">{value}</p>
      {note && <p className="mt-1 text-[11px] text-steel">{note}</p>}
    </div>
  );
}

export default async function EconomicsPage() {
  const units = allUnits();
  const alerts: Alert[] = [];

  // ── 採算の見張り ──
  for (const u of units) {
    if (u.marginRate < MIN_MARGIN_RATE) {
      alerts.push({
        level: "bad",
        text: `${u.plan.name} の限界利益率が ${pct(u.marginRate)}（下限 ${pct(MIN_MARGIN_RATE)}）`,
      });
    }
    if (u.variable / u.plan.yen > MAX_VARIABLE_RATE) {
      alerts.push({ level: "bad", text: `${u.plan.name} の変動費が売価の ${pct(u.variable / u.plan.yen)}` });
    }
  }

  // ── 市場の実データ ──
  let online = 0;
  let responders = 0;
  let verified = 0;
  let openAsks = 0;
  let paidToday = 0;
  let gmvToday = 0;
  let fillRate: number | null = null;

  if (dbAdminEnabled) {
    const now = new Date().toISOString();
    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);

    const rs = await dbSelect<{ available: boolean; available_until: string | null; verified_age: boolean }>(
      "responders?select=available,available_until,verified_age&active=eq.true",
    );
    responders = rs.length;
    verified = rs.filter((r) => r.verified_age).length;
    online = rs.filter(
      (r) => r.available && r.verified_age && (!r.available_until || r.available_until > now),
    ).length;

    const open = await dbSelect<{ id: string }>(
      "consultations?select=id&status=in.(recruiting,collecting)",
    );
    openAsks = open.length;

    const pays = await dbSelect<{ amount: number; payment_status: string }>(
      `payments?select=amount,payment_status&paid_at=gte.${midnight.toISOString()}`,
    );
    const ok = pays.filter((p) => p.payment_status === "paid");
    paidToday = ok.length;
    gmvToday = ok.reduce((n, p) => n + (p.amount ?? 0), 0);

    const done = await dbSelect<{ id: string }>("consultations?select=id&status=eq.completed");
    const started = await dbSelect<{ id: string }>(
      "consultations?select=id&status=in.(recruiting,collecting,completed)",
    );
    fillRate = started.length > 0 ? done.length / started.length : null;
  }

  // ── 市場の見張り ──
  if (dbAdminEnabled) {
    if (verified === 0) {
      alerts.push({ level: "bad", text: "確認済みの回答者が0人。決済できても配れません" });
    } else if (online === 0) {
      alerts.push({ level: "warn", text: "いま答えられる人が0人" });
    }
    if (openAsks > 0 && online < openAsks * 5) {
      alerts.push({ level: "warn", text: `待っている依頼 ${openAsks} 件に対して、答えられる人が足りていません` });
    }
    if (fillRate !== null && fillRate < 0.8) {
      alerts.push({ level: "warn", text: `そろった割合が ${pct(fillRate)}（0.8 を下回っています）` });
    }
  }

  return (
    <div data-brand className="min-h-screen bg-mist p-5 text-slate sm:p-8">
      <div className="mx-auto w-full max-w-[1120px]">
        <h1 className="text-huge font-black">採算と市場</h1>
        <p className="mt-3 max-w-[40em] text-[13.5px] leading-[1.9] text-steel">
          見るのは売上総額ではなく、1注文あたりの限界利益。
          回答者報酬・決済手数料・返金を引いたあとに何が残るか。
          実績が0のところは0と出しています。
        </p>

        {/* アラート */}
        <div className="mt-7">
          {alerts.length === 0 ? (
            <p className="rounded-card border border-ok bg-ok-tint px-5 py-3.5 text-[13.5px] font-bold text-ok-text">
              見張っている項目に、いま引っかかっているものはありません。
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {alerts.map((a) => (
                <li
                  key={a.text}
                  className={`rounded-card border px-5 py-3.5 text-[13.5px] font-bold ${
                    a.level === "bad"
                      ? "border-rose bg-rose-tint text-rose-text"
                      : "border-line bg-paper text-slate"
                  }`}
                >
                  {a.text}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-7 grid gap-4 lg:grid-cols-2">
          <Card title="供給">
            {!dbAdminEnabled ? (
              <p className="text-[13px] text-steel">接続されていません。</p>
            ) : (
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
                <Stat label="今オンライン" value={`${online}`} note="答えられる人" />
                <Stat label="確認済み" value={`${verified}`} note={`登録 ${responders}`} />
                <Stat label="待っている依頼" value={`${openAsks}`} />
                <Stat
                  label="そろった割合"
                  value={fillRate === null ? "—" : pct(fillRate)}
                  note={fillRate === null ? "実績なし" : undefined}
                />
              </div>
            )}
          </Card>

          <Card title="本日">
            {!dbAdminEnabled ? (
              <p className="text-[13px] text-steel">接続されていません。</p>
            ) : (
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
                <Stat label="決済件数" value={`${paidToday}`} />
                <Stat label="売上" value={yen(gmvToday)} />
                <Stat
                  label="平均注文単価"
                  value={paidToday > 0 ? yen(gmvToday / paidToday) : "—"}
                />
              </div>
            )}
          </Card>
        </div>

        {/* プラン別 */}
        <div className="mt-4">
          <Card title="プラン別の採算（1注文あたり）">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[840px] border-collapse text-[12.5px]">
                <thead>
                  <tr className="border-b border-line text-left text-steel">
                    {["プラン", "売価", "回答者", "決済", "AI", "返金", "その他", "変動費", "限界利益", "率", "原価上限"].map(
                      (h) => (
                        <th key={h} className="whitespace-nowrap px-2 py-2.5 font-bold">
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {units.map((u) => (
                    <tr key={u.plan.id} className="border-b border-line">
                      <td className="whitespace-nowrap px-2 py-2.5 font-bold">
                        {u.plan.name}
                        {!u.plan.available && (
                          <span className="ml-2 text-[10.5px] font-normal text-steel">受付前</span>
                        )}
                      </td>
                      <td className="px-2 py-2.5 tabular-nums">{yen(u.plan.yen)}</td>
                      <td className="px-2 py-2.5 tabular-nums">{yen(u.rewardMax)}</td>
                      <td className="px-2 py-2.5 tabular-nums text-steel">{yen(u.payment)}</td>
                      <td className="px-2 py-2.5 tabular-nums text-steel">{yen(u.ai)}</td>
                      <td className="px-2 py-2.5 tabular-nums text-steel">{yen(u.refund)}</td>
                      <td className="px-2 py-2.5 tabular-nums text-steel">{yen(u.misc)}</td>
                      <td className="px-2 py-2.5 tabular-nums">{yen(u.variable)}</td>
                      <td className="px-2 py-2.5 font-black tabular-nums">{yen(u.margin)}</td>
                      <td
                        className={`px-2 py-2.5 font-bold tabular-nums ${
                          u.marginRate >= MIN_MARGIN_RATE ? "text-ok-text" : "text-rose-text"
                        }`}
                      >
                        {pct(u.marginRate)}
                      </td>
                      <td className="px-2 py-2.5 tabular-nums text-steel">{yen(u.capYen)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-[11.5px] leading-[1.8] text-steel">
              決済 {pct(PAYMENT_RATE)} / 返金引当 {pct(REFUND_RATE)} / AI {yen(AI_COST_YEN)}。
              「原価上限」は、案件を作るときに回答者報酬へ使ってよい上限です。
              これを超える設定はビルドで落ちます。
            </p>
          </Card>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Card title="回答者への報酬">
            <table className="w-full border-collapse text-[12.5px]">
              <tbody>
                {REWARDS.map((r) => (
                  <tr key={r.kind} className="border-b border-line">
                    <td className="px-2 py-2.5 font-bold">{r.label}</td>
                    <td className="px-2 py-2.5 tabular-nums">
                      {yen(r.min)} 〜 {yen(r.max)}
                    </td>
                    <td className="px-2 py-2.5 text-steel">{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 text-[11.5px] leading-[1.8] text-steel">
              粗利を守るために報酬を下げることはしません。
              良い回答者が稼げることが、このサービスが速くなる唯一の道です。
              原価を下げるのは、人が価値を出していない作業のほうから。
            </p>
          </Card>

          <Card title="配信の広げ方と、急ぎの上乗せ">
            <p className="text-[12.5px] font-bold">5人ほしいとき</p>
            <ol className="mt-2.5 flex flex-col gap-1.5 text-[12.5px] text-steel">
              {waves(5).map((w, i) => (
                <li key={i}>
                  {i + 1}波目: {w.n}人へ
                  {w.afterMinutes > 0 ? `（${w.afterMinutes}分後、足りなければ）` : "（すぐ）"}
                </li>
              ))}
            </ol>
            <p className="mt-2.5 text-[11.5px] leading-[1.8] text-steel">
              報酬が発生するのは採用した回答だけ。声をかけた人数分を先に確定させません。
            </p>

            <p className="mt-5 text-[12.5px] font-bold">急ぎの上乗せ</p>
            <table className="mt-2 w-full border-collapse text-[12.5px]">
              <tbody>
                {URGENCY.filter((u) => u.addYen > 0).map((u) => (
                  <tr key={u.id} className="border-b border-line">
                    <td className="px-2 py-2 font-bold">{u.label}</td>
                    <td className="px-2 py-2 tabular-nums">+{yen(u.addYen)}</td>
                    <td className="px-2 py-2 tabular-nums text-steel">
                      1人 +{yen(priorityBonus(DEFAULT_PLAN, u))}
                    </td>
                    <td className="px-2 py-2 text-steel">
                      {u.available ? "販売中" : "販売前"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-[11.5px] leading-[1.8] text-steel">
              速さを売るのは、実際に速く返せることを確かめてから。
              担保できないまま売ると、急ぎで買った人を待たせるだけになります。
            </p>
          </Card>
        </div>

        <p className="mt-8 text-[11.5px] leading-[1.9] text-steel">
          この表の数字は lib/economics.ts が唯一の出どころです。
          値段を変えると採算も一緒に動きます。採算が崩れる値段はビルドが通りません。
          部品の構成（誰に何人）は COSTS に書いてあります（いま {Object.keys(COSTS).length} 件）。
        </p>
      </div>
    </div>
  );
}
