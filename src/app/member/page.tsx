import type { Metadata } from "next";
import { cookies } from "next/headers";
import MemberGate from "@/components/MemberGate";
import { site } from "@/lib/site";
import { lineConfigured, MEMBER_COOKIE } from "@/lib/line";

// 会員ページ（β・プロトタイプ）。
// 認証は LINE ログイン（LINE Login v2.1）。将来のコミュニケーションは
// LINE ベースにするため、会員の入口を LINE に寄せる。チャネル未設定の間は
// デモ（擬似ログイン）で動作する。
// 血液検査データ等＝要配慮個人情報のため、本番は Accord 側で安全に扱う
// （docs/ACCORD_PLATFORM_SPEC.md / MEMBER_PLATFORM_SPEC.md）。
// 検索インデックスには載せない（noindex）。
export const metadata: Metadata = {
  title: "会員ページ（β） | His Recoveries",
  description:
    "LINE ログインで使う会員ページ。あなたの物語（相談・来訪・記録）が Accord から映し出されます。※現在はプロトタイプ（デモ）です。",
  robots: { index: false, follow: false },
  alternates: { canonical: `${site.url}/member` },
};

type Session = { name: string; demo?: boolean } | null;

export default function MemberPage() {
  const raw = cookies().get(MEMBER_COOKIE)?.value;
  let session: Session = null;
  if (raw) {
    try { session = JSON.parse(raw); } catch { session = null; }
  }
  return <MemberGate session={session} lineEnabled={lineConfigured()} />;
}
