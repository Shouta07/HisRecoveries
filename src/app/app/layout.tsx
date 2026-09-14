import type { Metadata } from "next";
import Shell from "@/components/app/Shell";

// v2（Relationship Companion）の外枠。
//
// 既存20ルートには触っていない。ここは /app 以下で並走させ、
// 完成してから入れ替えるかどうかを決める。
//
// 検索には出さない。中身がまだ空の段階（8段階中7段階が0件）で
// 検索から人が来ると、空の棚に着地することになる。
export const metadata: Metadata = {
  title: "His Recoveries",
  description: "出会ったあとを、大切にする。",
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <Shell>{children}</Shell>;
}
