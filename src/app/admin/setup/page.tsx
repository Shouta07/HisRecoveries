import type { Metadata } from "next";
import { dbSelect, dbAdminEnabled } from "@/lib/db";
import { LEGAL, missingLegal, canCharge } from "@/lib/legal";
import { stripeEnabled } from "@/lib/stripe";
import { supply, SUPPLY_RATIO } from "@/lib/supply";
import { plan, DEFAULT_PLAN } from "@/lib/ask/plans";

// 公開までに何が残っているか。
//
// ══════════════════════════════════════════════════
// 手順書ではなく、いまの状態を読む
// ══════════════════════════════════════════════════
// 手順を書いた文書はすぐ古くなる。
// 何が入っていて何が入っていないかを、その場で見に行く。
//
// ここに出ているものが全部 ✓ になったら、決済が開く。
//
// ══════════════════════════════════════════════════
// 中身は出さない
// ══════════════════════════════════════════════════
// 鍵も電話番号も、入っているかどうかだけを出す。
// 値そのものは出さない（この画面を開いた人の肩越しに見える）。
//
// /admin は Basic 認証の後ろ（middleware.ts）。

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "公開までの残り — 運営", robots: { index: false } };

type Row = {
  label: string;
  done: boolean;
  /** 何をすればよいか。done のときは出さない */
  how?: string;
  /** どこを触るか */
  where?: string;
};

function Item({ r }: { r: Row }) {
  return (
    <li
      className={`rounded-card border p-5 ${
        r.done ? "border-ok bg-ok-tint" : "border-rose bg-rose-tint"
      }`}
    >
      <p className="flex items-start gap-3">
        <span
          aria-hidden
          className={`mt-[2px] text-[14px] font-black ${r.done ? "text-ok-text" : "text-rose-text"}`}
        >
          {r.done ? "✓" : "—"}
        </span>
        <span className="min-w-0 text-[15px] font-bold text-slate">{r.label}</span>
      </p>
      {!r.done && r.how && (
        <p className="mt-2.5 pl-7 text-[13.5px] leading-[1.9] text-steel">{r.how}</p>
      )}
      {!r.done && r.where && (
        <p className="mt-1.5 pl-7 font-mono text-[12px] text-steel">{r.where}</p>
      )}
    </li>
  );
}

export default async function SetupPage() {
  const miss = missingLegal();
  const p = plan(DEFAULT_PLAN);
  const sup = await supply(p.answers);

  // スキーマが流れているか。新しい列を1つ見に行く。
  let schemaOk = false;
  if (dbAdminEnabled) {
    try {
      await dbSelect<{ id: string }>("consultations?select=journey_step&limit=1");
      schemaOk = true;
    } catch {
      schemaOk = false;
    }
  }

  const rows: Row[] = [
    {
      label: `特定商取引法に基づく表記（残り ${miss.length} 項目）`,
      done: miss.length === 0,
      how: `足りないのは ${miss.map((m) => m.label).join("・")} です。ファイルに直接書くか、環境変数に入れてください。電話番号を公開リポジトリに残したくない場合は、環境変数のほうを使ってください。`,
      where: "src/lib/legal.ts  または  LEGAL_REP_NAME / LEGAL_TEL",
    },
    {
      label: "Stripe の鍵",
      done: stripeEnabled && Boolean(process.env.STRIPE_WEBHOOK_SECRET),
      how: "決済を作る鍵と、Webhook の署名を確かめる鍵。両方が要ります。Webhook の宛先は /api/stripe/webhook です。",
      where: "STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET",
    },
    {
      label: "データベースの接続",
      done: dbAdminEnabled,
      how: "相談も回答も残高も、ここに入ります。接続が無いあいだは、相談を受け取っても保存されません。",
      where: "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY",
    },
    {
      label: "テーブルの作成",
      done: schemaOk,
      how: "supabase/schema.sql を本番に流してください。残高・台帳・出金・共有・紹介のテーブルが増えています。",
      where: "supabase/schema.sql",
    },
    {
      label: `答えてくれる女性（確認済み ${sup.verified}人 / いま答えられる ${sup.online}人）`,
      done: sup.online >= Math.ceil(p.answers * SUPPLY_RATIO),
      how: `1件に${p.answers}人お届けするので、その${SUPPLY_RATIO}倍（${Math.ceil(
        p.answers * SUPPLY_RATIO,
      )}人）が「いま答えられる」状態でないと、買うボタンが出ません。/join から登録してもらい、年齢と立場を確認したうえで active と verified_age を立ててください。`,
      where: "/join → responders.active / verified_age",
    },
  ];

  const left = rows.filter((r) => !r.done).length;

  return (
    <div data-brand className="min-h-screen bg-mist p-5 text-slate sm:p-8">
      <div className="mx-auto w-full max-w-[720px]">
        <h1 className="text-huge font-black">公開までの残り</h1>
        <p className="mt-3 text-[14px] leading-[1.9] text-steel">
          いまの状態をその場で見ています。手順書ではないので、古くなりません。
          値そのものは出していません（入っているかどうかだけ）。
        </p>

        <div
          className={`mt-7 rounded-card border p-5 ${
            left === 0 ? "border-ok bg-ok-tint" : "border-line bg-paper shadow-card"
          }`}
        >
          <p className="text-[15.5px] font-black">
            {left === 0 ? "全部そろっています。" : `あと ${left} つ`}
          </p>
          <p className="mt-2 text-[13.5px] leading-[1.85] text-steel">
            {canCharge()
              ? "決済は開いています。"
              : "決済はまだ開いていません。特定商取引法の表記とStripeの鍵が揃うと開きます。"}
          </p>
        </div>

        <ul className="mt-5 flex flex-col gap-3">
          {rows.map((r) => (
            <Item key={r.label} r={r} />
          ))}
        </ul>

        {/* 特商法の中身。何が入っていて何が空かだけ */}
        <section className="mt-8 rounded-card border border-line bg-paper p-5 shadow-card">
          <p className="text-[13px] font-bold tracking-[0.1em] text-steel">
            特定商取引法に基づく表記
          </p>
          <ul className="mt-4 flex flex-col gap-2">
            {LEGAL.map((f) => (
              <li key={f.key} className="flex items-baseline justify-between gap-4 border-b border-line py-2">
                <span className="min-w-0 text-[13.5px] text-slate">
                  {f.label}
                  {!f.required && <span className="ml-2 text-[11.5px] text-steel">任意</span>}
                </span>
                <span
                  className={`shrink-0 text-[12.5px] font-bold ${
                    f.value ? "text-ok-text" : f.required ? "text-rose-text" : "text-steel"
                  }`}
                >
                  {f.value ? "入っています" : "未記入"}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[11.5px] leading-[1.8] text-steel">
            中身はここに出していません。実際の表記は /legal で確認できます。
          </p>
        </section>

        <p className="mt-8 text-[12px] leading-[1.9] text-steel">
          決済が開くかどうかは lib/legal.ts の canCharge() が決めています。
          画面だけでなく決済のAPIも同じ判定を見ているので、
          ここが揃うまでは、URL を直接叩いても決済は始まりません。
        </p>
      </div>
    </div>
  );
}
