import type { Metadata } from "next";
import { site } from "@/lib/site";
import ApplyClient from "./ApplyClient";

export const metadata: Metadata = {
  title: "Recovery Certified — 認証申請",
  description:
    "Recovery Certified Network の認証申請。クリニック・サロン・ジム・専門家からのお申し込みフォーム。",
  robots: { index: false, follow: false },
  alternates: { canonical: `${site.url}/network/apply` },
};

export default function NetworkApplyPage() {
  return <ApplyClient />;
}
