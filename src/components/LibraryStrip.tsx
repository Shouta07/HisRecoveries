// ホーム内のメディア導線。/areas の記事を横に流し（CSSマーキー）、
// 「読みものもある」ことを注意喚起する。ホバー/タッチで一時停止、
// reduce-motion では自動送りを止めて手動スクロールに切替。
import Link from "next/link";
import { complexes } from "@/lib/complexes";
import { clustersByArea } from "@/lib/clusters";

const HEAD: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontWeight: 800,
  fontFeatureSettings: '"palt" 1',
};

type Item = { href: string; title: string; cat: string; accent: string };

// 各領域から最大2本ずつ拾って、横断的なミックスにする。
const items: Item[] = complexes.flatMap((c) =>
  clustersByArea(c.id)
    .filter((a) => a.kind !== "interview")
    .slice(0, 2)
    .map((a) => ({ href: `/areas/${c.id}/${a.slug}`, title: a.title, cat: c.ja, accent: c.accent })),
);

function Card({ it, ariaHidden = false }: { it: Item; ariaHidden?: boolean }) {
  return (
    <Link
      href={it.href}
      aria-hidden={ariaHidden}
      tabIndex={ariaHidden ? -1 : undefined}
      style={{ borderLeftColor: it.accent, borderLeftWidth: 3 }}
      className="group shrink-0 w-[220px] sm:w-[248px] rounded-[1.1rem] bg-white border border-[#1f2a1d]/10 p-4 hover:border-[#3d5638]/40 transition-colors"
    >
      <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold text-[#3d5638]">
        <span aria-hidden className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: it.accent }} />
        {it.cat}
      </span>
      <p className="mt-2 text-[13px] font-bold text-[#1f2a1d] leading-[1.55] line-clamp-2 group-hover:text-[#3d5638] transition-colors" style={HEAD}>
        {it.title}
      </p>
      <span className="mt-2.5 inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#3d5638]">読む <span aria-hidden>→</span></span>
    </Link>
  );
}

export default function LibraryStrip() {
  if (items.length === 0) return null;

  return (
    <section className="relative z-10 text-[#1f2a1d]">
      <div className="max-w-[1100px] mx-auto px-5 sm:px-8 pt-4 pb-10">
        <div className="on-media flex items-end justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span aria-hidden className="block w-8 h-px bg-[#85AB8B]" />
              <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#3d5638] font-medium">Library — 読みもの</span>
            </div>
            <h2 className="text-[1.25rem] sm:text-[1.6rem] leading-[1.4]" style={HEAD}>
              気になることから、<span className="text-[#3d5638]">読む。</span>
            </h2>
          </div>
          <Link href="/areas" className="shrink-0 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#3d5638] hover:opacity-70 transition-opacity whitespace-nowrap">
            すべて見る <span aria-hidden>→</span>
          </Link>
        </div>
      </div>

      {/* 全幅で流す。左右の端はフェードで消す。 */}
      <div className="relative overflow-hidden motion-reduce:overflow-x-auto motion-reduce:[scrollbar-width:none] motion-reduce:[&::-webkit-scrollbar]:hidden">
        <div className="flex w-max gap-3 px-5 animate-marquee hover:[animation-play-state:paused] motion-reduce:animate-none">
          {items.map((it) => <Card key={it.href} it={it} />)}
          {items.map((it) => <Card key={`dup-${it.href}`} it={it} ariaHidden />)}
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[#f0f4ee] to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#f0f4ee] to-transparent" />
      </div>
    </section>
  );
}
