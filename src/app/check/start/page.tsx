import type { Metadata } from "next";
import {
  CHECK_QUESTIONS,
  CHECK_SECTIONS,
} from "@/lib/checkQuestions";
import { site } from "@/lib/site";
import StartClient from "./StartClient";

export const metadata: Metadata = {
  title: "Recovery Check — 観察を始める",
  description:
    "Recovery Check の 30 問。診断ではなく、自分の状態を静かに整理するための時間。",
  robots: { index: false, follow: false },
  alternates: { canonical: `${site.url}/check/start` },
};

export default function StartPage() {
  return (
    <StartClient
      sections={CHECK_SECTIONS.map((s) => ({ id: s.id, label: s.label }))}
      questions={CHECK_QUESTIONS}
    />
  );
}
