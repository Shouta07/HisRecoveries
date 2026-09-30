import { NextResponse } from "next/server";

// いま売れる状態かどうかを返す。
//
// ══════════════════════════════════════════════════
// 何にも依存しない
// ══════════════════════════════════════════════════
// 最初は lib/ready.ts を読んでいた。
// そちらは db / stripe / legal を読み、legal は PLANS を読む。
// つまり「アプリのどこかが壊れていると、この口も一緒に落ちる」。
//
// 本番で実際にそうなった（500）。
// 何が足りないかを見るための口が、壊れているときに見られないのでは
// 何の役にも立たない。
//
// ここは process.env だけを見る。
// 判定の中身（何をもって揃ったとするか）は lib/ready.ts と同じだが、
// 読む先を共有しない。壊れ方を道連れにしない。
//
// ══════════════════════════════════════════════════
// 鍵の中身は返さない
// ══════════════════════════════════════════════════
// 返すのは「足りないものの名前」だけ。値は返さない。
//
// ══════════════════════════════════════════════════
// 検索に載せない
// ══════════════════════════════════════════════════
// 運営が見るためのもの。

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** 入っているか。空白だけは「無い」として扱う */
function has(name: string): boolean {
  const v = process.env[name];
  return typeof v === "string" && v.trim().length > 0;
}

export async function GET() {
  const missing: { key: string; label: string }[] = [];

  if (!(has("SUPABASE_URL") && has("SUPABASE_SERVICE_KEY"))) {
    missing.push({ key: "db", label: "相談を保存する先（Supabase）" });
  }
  if (!has("STRIPE_SECRET_KEY")) {
    missing.push({ key: "stripe", label: "お支払いの口（Stripe）" });
  }
  if (!has("STRIPE_WEBHOOK_SECRET")) {
    missing.push({ key: "stripe_webhook", label: "お支払いの確認（Stripe Webhook）" });
  }
  if (!has("LEGAL_REP_NAME")) {
    missing.push({ key: "legal:rep", label: "特定商取引法の表記（代表者）" });
  }
  if (!has("LEGAL_TEL")) {
    missing.push({ key: "legal:tel", label: "特定商取引法の表記（電話番号）" });
  }

  // ここから下は、無くても売れる。揃っていないと使えない機能があるだけ
  const optional: { key: string; label: string }[] = [];
  if (!has("IMAGES_BUCKET")) {
    optional.push({ key: "images", label: "画像の置き場所（非公開バケット名）" });
  }
  if (!has("DAILY_API_KEY")) {
    optional.push({ key: "calls", label: "通話の部屋（Daily）" });
  }

  return NextResponse.json(
    { ready: missing.length === 0, missing, optional },
    { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } },
  );
}
