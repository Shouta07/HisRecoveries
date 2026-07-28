import type { Metadata } from "next";
import Link from "next/link";
import CheckoutIssuer from "@/components/admin/CheckoutIssuer";
import { stripeEnabled, stripeLiveMode, stripeWebhookEnabled } from "@/lib/stripe";
import { founderSeatsLeft, ordersEnabled, recentOrders } from "@/lib/orders";
import { FOUNDER_SEATS, yen } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const STATUS_JA: Record<string, string> = {
  issued: "発行済（未入金）",
  paid: "入金済",
  expired: "期限切れ",
  canceled: "取消",
};

export default async function AdminCheckoutPage() {
  const [seatsLeft, orders] = await Promise.all([
    founderSeatsLeft(),
    ordersEnabled ? recentOrders(20) : Promise.resolve([]),
  ]);
  const paid = orders.filter((o) => o.status === "paid");
  const revenue = paid.reduce((sum, o) => sum + (o.amount ?? 0), 0);

  return (
    <main className="mx-auto max-w-[1100px] px-6 sm:px-10 py-10">
      <header className="mb-8">
        <p className="text-[11px] tracking-[0.22em] uppercase text-sub-gray mb-2">
          Checkout — お支払いリンクの発行
        </p>
        <h1 className="text-[1.6rem] font-bold text-ink leading-[1.4]">
          相談で合うことを確かめてから、リンクを渡す。
        </h1>
        <p className="mt-3 text-[12.5px] text-sub-gray leading-[1.9] max-w-[46rem]">
          公開サイトに「今すぐ購入」ボタンは置いていません。決済リンクを作れるのはこの画面だけで、
          金額はサーバー側の定義（<code className="text-ink">src/lib/pricing.ts</code>）から取ります。
          設計は <code className="text-ink">docs/PAYMENTS_SECURITY.md</code> に書いてあります。
        </p>
      </header>

      {/* 設定状況 — 未設定のまま運用に入らないための可視化 */}
      <div className="grid sm:grid-cols-4 gap-3 mb-8">
        {[
          {
            t: "Stripe",
            v: stripeEnabled ? (stripeLiveMode ? "本番（LIVE）" : "テストモード") : "未設定",
            ok: stripeEnabled,
          },
          { t: "Webhook", v: stripeWebhookEnabled ? "有効" : "未設定", ok: stripeWebhookEnabled },
          { t: "注文DB", v: ordersEnabled ? "接続済" : "未接続", ok: ordersEnabled },
          {
            t: "先着枠",
            v: `残り ${seatsLeft} / ${FOUNDER_SEATS}`,
            ok: seatsLeft > 0,
          },
        ].map((s) => (
          <div key={s.t} className="border border-hair-line bg-paper/40 px-4 py-3">
            <div className="text-[10.5px] tracking-[0.14em] uppercase text-sub-gray">{s.t}</div>
            <div className={`mt-1 text-[13px] font-semibold ${s.ok ? "text-ink" : "text-[#a3402f]"}`}>
              {s.v}
            </div>
          </div>
        ))}
      </div>

      {!stripeEnabled && (
        <div className="mb-8 border border-[#a3402f]/30 bg-[#f7ece9] px-5 py-4 text-[12.5px] text-[#a3402f] leading-[1.9]">
          <p className="font-semibold mb-1">Stripe が未設定です。</p>
          <p>
            Vercel の環境変数に <code>STRIPE_SECRET_KEY</code> と{" "}
            <code>STRIPE_WEBHOOK_SECRET</code> を設定してください。
            手順は <code>docs/PAYMENTS_SECURITY.md</code> にあります。
          </p>
        </div>
      )}

      <section className="border border-hair-line bg-white p-5 sm:p-6 mb-10">
        <CheckoutIssuer seatsLeft={seatsLeft} />
      </section>

      {/* 実績 */}
      <section>
        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1 mb-4">
          <h2 className="text-[13px] tracking-[0.12em] uppercase text-sub-gray">最近の注文</h2>
          <span className="text-[12px] text-ink">
            入金済 {paid.length} 件 ／ 累計 {yen(revenue)}
          </span>
        </div>

        {!ordersEnabled ? (
          <p className="border border-dashed border-hair-line px-5 py-6 text-[12.5px] text-sub-gray leading-[1.9]">
            Supabase が未接続のため、注文の記録と先着枠のカウントができません。
            <code className="mx-1 text-ink">supabase/schema.sql</code>
            の orders テーブルを作成し、SUPABASE_SERVICE_KEY を設定してください。
          </p>
        ) : orders.length === 0 ? (
          <p className="border border-dashed border-hair-line px-5 py-6 text-[12.5px] text-sub-gray">
            まだ発行された決済リンクはありません。
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12px] border-collapse">
              <thead>
                <tr className="text-left text-sub-gray border-b border-hair-line">
                  <th className="py-2 pr-4 font-medium">状態</th>
                  <th className="py-2 pr-4 font-medium">価格</th>
                  <th className="py-2 pr-4 font-medium">宛先</th>
                  <th className="py-2 pr-4 font-medium">実施日</th>
                  <th className="py-2 pr-4 font-medium">発行</th>
                  <th className="py-2 font-medium">メモ</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.stripe_session_id} className="border-b border-hair-line/60 align-top">
                    <td className="py-2.5 pr-4 whitespace-nowrap">
                      <span className={o.status === "paid" ? "text-ink font-semibold" : "text-sub-gray"}>
                        {STATUS_JA[o.status] ?? o.status}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 whitespace-nowrap text-ink">
                      {yen(o.amount)}
                      <span className="ml-1 text-sub-gray">{o.tier === "founder" ? "先着" : "通常"}</span>
                    </td>
                    <td className="py-2.5 pr-4 text-ink">
                      {o.display_name ? `${o.display_name}　` : ""}
                      <span className="text-sub-gray">{o.email}</span>
                    </td>
                    <td className="py-2.5 pr-4 whitespace-nowrap text-sub-gray">
                      {o.scheduled_for ?? "—"}
                    </td>
                    <td className="py-2.5 pr-4 whitespace-nowrap text-sub-gray">
                      {o.created_at ? new Date(o.created_at).toLocaleDateString("ja-JP") : "—"}
                    </td>
                    <td className="py-2.5 text-sub-gray">{o.note ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="mt-10 text-[11.5px] text-sub-gray">
        <Link href="/admin/studio" className="hover:text-gold transition-colors">
          ← Studio に戻る
        </Link>
      </p>
    </main>
  );
}
