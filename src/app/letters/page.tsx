import type { Metadata } from "next";
import { site } from "@/lib/site";
import LettersClient from "./LettersClient";

export const metadata: Metadata = {
  title: "Letters — 静かなお便り",
  description:
    "His Recoveries への静かなお便り。Male Conditioning の読者が、自分のコンプレックスや整え方について、静かに書き残す場。返信は約束できませんが、必ず読みます。",
  alternates: { canonical: `${site.url}/letters` },
  openGraph: {
    title: `Letters — ${site.name}`,
    description:
      "His Recoveries への静かなお便り。返信は約束できませんが、必ず読みます。",
  },
};

export default function LettersPage() {
  // Default to our own /api/letter endpoint (stores to Supabase if configured,
  // falls through to mailto on the client when empty).
  const endpoint = process.env.NEXT_PUBLIC_LETTERS_ENDPOINT ?? "/api/letter";

  return (
    <div className="mx-auto max-w-[820px] px-6 sm:px-10 pt-16 sm:pt-20 pb-24">
      <header className="mb-12 max-w-reading">
        <h1 className="text-3xl sm:text-5xl font-bold leading-[1.4] text-ink">
          静かなお便り
        </h1>
        <p className="mt-6 font-mincho text-sub-gray text-[0.9375rem] leading-[2]">
          ここは、書きたくなった人のための場所です。
          急かしません。返信を約束もしません。
          それでも、書いて伝えたい言葉があれば、ここに。
        </p>
      </header>

      <LettersClient
        endpoint={endpoint}
        fallbackEmail={site.email}
      />

      <p className="mt-16 font-mincho text-sub-gray text-sm leading-[2.1] max-w-reading">
        返信があるとは限りません。
        それでも、ここに書いた言葉が、書いたあなた自身を少し整える。
        そんな場所でありたい。
      </p>
    </div>
  );
}
