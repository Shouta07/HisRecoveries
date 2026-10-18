import type { Viewport } from "next";
import Shell from "@/components/site/Shell";
import "@/app/globals.css";

export const viewport: Viewport = { themeColor: "#F6F1E8" };

/* 来日本旅行的人 向けの面。
 * 日本語の面とは対象が違うので、ルートのレイアウトも分けてある。 */
export default function Layout({ children }: { children: React.ReactNode }) {
  return <Shell lang="zh-Hans">{children}</Shell>;
}
