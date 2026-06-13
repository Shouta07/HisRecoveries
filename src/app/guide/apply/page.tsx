import type { Metadata } from "next";
import { site } from "@/lib/site";
import ApplyClient from "./ApplyClient";

export const metadata: Metadata = {
  title: "Recovery Guide — お申し込み",
  description: "Recovery Guide のお申し込みフォーム。",
  robots: { index: false, follow: false },
  alternates: { canonical: `${site.url}/guide/apply` },
};

export default function GuideApplyPage() {
  return <ApplyClient />;
}
