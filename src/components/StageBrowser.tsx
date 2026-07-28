import Link from "next/link";
import { STAGES, stageCounts } from "@/lib/stages";

// ライフステージから記事に入る導線。
//
// 領域（髪・肌）や目的（自信・選ばれたい）より、年代のほうが自己同定が速い。
// 「20代」「30代」は自分がどれかを迷わないので、クリックまでが短い。
//
// 0本のステージも消さない。手薄な場所が見えているほうが、
// 次に何を書くかが決まる（レガシー期は取材で埋める領域）。

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

export default function StageBrowser({ compact = false }: { compact?: boolean }) {
  const counts = stageCounts();

  return (
    <div className="hr-readable">
      <p className="hr-eyebrow mb-3.5">Life stage — 年代から探す</p>
      <h2
        className="text-[1.45rem] sm:text-[2rem] leading-[1.45]"
        style={{ ...MINCHO, fontWeight: 800 }}
      >
        悩みの名前より、<br className="sm:hidden" />
        年代で探すほうが早い。
      </h2>
      {!compact && (
        <p className="mt-4 text-[14.5px] text-[#4b5b47] leading-[1.95] max-w-[36rem]">
          男性が見た目を気にし始めるのは、年齢そのものではなく
          <strong className="text-[#1f2a1d]">その年代で初めて突きつけられること</strong>
          がきっかけになります。20代は見られる場に出たとき、30代は昔と違うと気づいたとき。
        </p>
      )}

      <ul className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {STAGES.map((s) => {
          const n = counts[s.id];
          const empty = n === 0;
          return (
            <li key={s.id}>
              <Link
                href={`/stages/${s.id}`}
                className={`group flex h-full flex-col rounded-[1.2rem] border px-5 py-5 transition-all ${
                  empty
                    ? "bg-white/50 border-dashed border-[#1f2a1d]/20"
                    : "bg-white border-[#1f2a1d]/10 hover:border-[#3d5638]/40 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_-24px_rgba(20,32,26,0.5)]"
                }`}
                style={empty ? undefined : { borderLeftColor: s.accent, borderLeftWidth: 3 }}
              >
                <div className="flex items-baseline gap-2.5">
                  <span className="hr-figure font-mono text-[13px] font-bold text-[#B98A3C]">
                    {s.n}
                  </span>
                  <span className="text-[11.5px] font-semibold text-[#6b7a66] tracking-[0.04em]">
                    {s.age}
                  </span>
                </div>
                <p
                  className="mt-2 text-[16px] font-bold text-[#1f2a1d] leading-[1.5] group-hover:text-[#3d5638] transition-colors"
                  style={MINCHO}
                >
                  {s.label}
                </p>
                <p className="mt-2 text-[13px] text-[#5c6b58] leading-[1.85] flex-1">{s.hook}</p>
                <p
                  className={`mt-3.5 font-mono text-[11px] tracking-[0.06em] ${
                    empty ? "text-[#9aa79a]" : "text-[#B98A3C]"
                  }`}
                >
                  {empty ? "準備中（取材でつくります）" : `${n} 本`}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
