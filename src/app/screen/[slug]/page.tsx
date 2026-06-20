import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllScreenings, getScreening } from "@/lib/screenings";
import { site } from "@/lib/site";
import ScreenClient from "./ScreenClient";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getAllScreenings().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const s = getScreening(params.slug);
  if (!s) return {};
  const url = `${site.url}/screen/${s.slug}`;
  return {
    title: `${s.title}（${s.durationMinutes}分・5問）— His Recoveries`,
    description: s.intro,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: s.title,
      description: s.intro,
      url,
    },
  };
}

export default function ScreenSlugPage({ params }: { params: Params }) {
  const s = getScreening(params.slug);
  if (!s) notFound();
  return <ScreenClient screening={s} />;
}
