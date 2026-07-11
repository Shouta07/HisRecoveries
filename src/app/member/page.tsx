import type { Metadata } from "next";
import MemberApp from "@/components/MemberApp";
import { site } from "@/lib/site";

// 会員ページ（β・プロトタイプ）。
// 血液検査データ＝要配慮個人情報のため、本番実装は
// 安全な認証・暗号化・明示的同意を前提とする（docs/MEMBER_PLATFORM_SPEC.md）。
// このデモは端末内 localStorage のみで完結し、外部送信しない。
// 検索インデックスには載せない（noindex）。
export const metadata: Metadata = {
  title: "会員ページ（β） | His Recoveries",
  description:
    "血液検査データをもとにした行動のヒントと、あなたに合わせたECマーケットプレイス。※現在はプロトタイプ（デモ）です。",
  robots: { index: false, follow: false },
  alternates: { canonical: `${site.url}/member` },
};

export default function MemberPage() {
  return <MemberApp />;
}
