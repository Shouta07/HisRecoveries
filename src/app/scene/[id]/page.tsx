import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { site } from "@/lib/site";
import { NAME } from "@/lib/voice";
import { SCENES, sceneOf } from "@/lib/scene/problems";
import SceneCard from "@/components/scene/SceneCard";
import Mark from "@/components/brand/Mark";

/* 1場面。
   分布は、答えたあとに口（/api/scene）から返る。
   ここで先に出すと、選ぶ前に見られる。 */

export function generateStaticParams() {
  return SCENES.map((s) => ({ id: s.id }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const s = sceneOf(params.id);
  if (!s) return { title: { absolute: `この場面 — ${NAME}` } };
  const head = `${s.setup[0]} — あなたならどうする？`;
  return {
    title: { absolute: `${head}｜${NAME}` },
    description: `${s.app}・${s.stage}。${s.setup.join("")}選ぶと、同じ場面を見た人がどう分かれたかが出ます。正解は出しません。`,
    alternates: { canonical: `${site.url}/scene/${s.id}` },
    openGraph: {
      type: "article",
      locale: site.locale,
      url: `${site.url}/scene/${s.id}`,
      siteName: NAME,
      title: `${head}｜${NAME}`,
      description: `${s.app}・${s.stage}。選ぶと、同じ場面を見た人がどう分かれたかが出ます。`,
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: NAME }],
    },
  };
}

export default function ScenePage({ params }: { params: { id: string } }) {
  const s = sceneOf(params.id);
  if (!s) notFound();

  const i = SCENES.findIndex((x) => x.id === s.id);
  const next = SCENES[(i + 1) % SCENES.length];

  return (
    <div data-brand className="min-h-screen bg-paper text-slate">
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex w-full max-w-[640px] items-center gap-3 px-5 py-3.5 sm:px-8">
          <Link href="/scene" aria-label="一覧へ" className="shrink-0 text-[18px] font-black text-steel">
            ‹
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <Mark size={28} />
            <span className="text-[15.5px] font-black text-slate">{NAME}</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[640px] px-5 pb-20 pt-7 sm:px-8">
        <SceneCard scene={s} />

        <div className="mt-10 border-t border-line pt-6">
          <Link
            href={`/scene/${next.id}`}
            className="flex min-h-[52px] items-center justify-center rounded-pill border border-line bg-paper px-5 text-[14.5px] font-bold text-slate"
          >
            次の場面へ <span aria-hidden className="ml-2">&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
