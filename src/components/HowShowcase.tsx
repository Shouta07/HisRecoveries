// "Webアプリ × オフライン" as one premium composed picture: tilted phone
// mockups (the online system) layered with offline photo panels.
// Photos are branded placeholders; drop real images into /public/media/how later.

const HEAD: React.CSSProperties = {
  fontFamily:
    "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontWeight: 800,
  letterSpacing: "0.01em",
  fontFeatureSettings: '"palt" 1',
};

function Photo({ className = "", rotate = 0 }: { className?: string; rotate?: number }) {
  return (
    <div
      aria-hidden
      className={`relative overflow-hidden rounded-[1.4rem] shadow-[0_24px_50px_-18px_rgba(20,32,26,0.45)] ring-1 ring-black/5 ${className}`}
      style={{
        background: "linear-gradient(135deg,#cdd8c8,#8ea391)",
        transform: `rotate(${rotate}deg)`,
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#16241a" strokeWidth="1.4" className="opacity-25" aria-hidden>
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <circle cx="8.5" cy="9" r="1.6" />
          <path d="M21 16l-5-5L5 21" />
        </svg>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-1/3" style={{ background: "linear-gradient(to top, rgba(14,21,13,0.35), transparent)" }} />
    </div>
  );
}

function PhoneFrame({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`relative w-[176px] sm:w-[212px] rounded-[2.2rem] bg-zinc-900 p-[6px] shadow-[0_40px_70px_-20px_rgba(20,32,26,0.55)] ring-1 ring-black/20 ${className}`}
      style={style}
    >
      {/* side buttons */}
      <span aria-hidden className="absolute -left-[2px] top-16 w-[2px] h-7 rounded-l bg-zinc-700" />
      <span aria-hidden className="absolute -right-[2px] top-20 w-[2px] h-10 rounded-r bg-zinc-700" />
      <div className="rounded-[1.8rem] bg-[#f7f8f7] overflow-hidden">
        <div className="relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-4 bg-zinc-900 rounded-b-xl z-10" />
          {children}
        </div>
      </div>
    </div>
  );
}

function DashboardScreen() {
  return (
    <div>
      <div className="px-3.5 pt-6 pb-2.5 bg-white border-b border-zinc-100 flex items-center justify-between">
        <span className="logo-type text-[11px] text-zinc-900">His Recoveries</span>
        <span className="text-[8.5px] px-2 py-0.5 rounded-full bg-[#e7ede4] text-[#3d5638] font-medium">改善中</span>
      </div>
      <div className="p-3.5 space-y-3">
        <div className="rounded-xl bg-white p-3 shadow-sm">
          <p className="text-[9px] text-[#8a9285] mb-1">いまの状態</p>
          <div className="flex items-end gap-1.5">
            <span className="text-[1.9rem] leading-none font-normal text-[#1f2a1d]">62</span>
            <span className="text-[#a0a89c] text-[10px] mb-1">/ 100</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-[#e2e5dd] overflow-hidden">
            <div className="h-full w-[62%] rounded-full bg-[#3d5638]" />
          </div>
        </div>
        <div className="rounded-xl bg-white p-3 shadow-sm">
          <p className="text-[9px] text-[#8a9285] mb-2">変化の記録</p>
          <div className="flex items-end gap-1 h-10">
            {[35, 42, 38, 50, 55, 60, 72].map((h, i) => (
              <div key={i} className="flex-1 rounded-t-[2px]" style={{ height: `${h}%`, backgroundColor: i >= 5 ? "#3d5638" : "#cbd5d2" }} />
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="w-fit max-w-[80%] rounded-xl rounded-tl-sm bg-[#e7ede4] px-2.5 py-1.5 text-[9px] text-[#134e48]">今週、調子はどうですか？</div>
          <div className="ml-auto w-fit rounded-xl rounded-tr-sm bg-[#3d5638] px-2.5 py-1.5 text-[9px] text-white">少し落ち着いてきました</div>
        </div>
      </div>
      <div className="border-t border-zinc-100 bg-white px-5 py-2 flex justify-between">
        {[true, false, false, false].map((a, i) => (
          <span key={i} className="w-4 h-4 rounded" style={{ backgroundColor: a ? "#3d5638" : "#e4e4e7" }} />
        ))}
      </div>
    </div>
  );
}

function MemberScreen() {
  return (
    <div>
      <div className="px-3.5 pt-6 pb-2.5 bg-white border-b border-zinc-100 flex items-center justify-between">
        <span className="logo-type text-[11px] text-zinc-900">His Recoveries</span>
        <span className="w-4 h-4 rounded-full bg-zinc-200" />
      </div>
      <div className="p-3.5">
        <div className="flex flex-col items-center text-center pb-3">
          <span className="w-12 h-12 rounded-full bg-[#e7ede4] grid place-items-center text-[#3d5638] text-[15px] font-bold mb-1.5">R</span>
          <p className="text-[11px] font-bold text-[#1f2a1d]">会員 マイページ</p>
          <p className="text-[8.5px] text-[#9aa79a]">完全匿名・守秘義務のもと</p>
        </div>
        <button className="w-full rounded-lg bg-[#06C755] text-white text-[10px] font-bold py-2 mb-3">LINEで予約・連絡する</button>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {["予約管理", "チケット", "メッセージ"].map((t) => (
            <div key={t} className="rounded-lg border border-zinc-200 py-2 flex flex-col items-center gap-1">
              <span className="w-4 h-4 rounded bg-[#e7ede4]" />
              <span className="text-[8px] text-[#3a423a]">{t}</span>
            </div>
          ))}
        </div>
        <div className="space-y-px rounded-lg overflow-hidden border border-zinc-100">
          {["予約・面談履歴", "購入・利用履歴", "お客様情報の設定"].map((t) => (
            <div key={t} className="bg-white px-3 py-2.5 flex items-center justify-between text-[9.5px] text-[#3a423a]">
              {t}<span className="text-[#c2c9be]">›</span>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-zinc-100 bg-white px-5 py-2 flex justify-between">
        {[false, false, true, false].map((a, i) => (
          <span key={i} className="w-4 h-4 rounded" style={{ backgroundColor: a ? "#3d5638" : "#e4e4e7" }} />
        ))}
      </div>
    </div>
  );
}

export default function HowShowcase() {
  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-[#1f2a1d]/10 px-4 sm:px-10 py-12 sm:py-16"
      style={{ background: "linear-gradient(180deg,#f3f6f0 0%,#e8efe6 55%,#dfe8da 100%)" }}
    >
      {/* soft ambient blobs */}
      <div aria-hidden className="absolute -top-16 -left-10 w-72 h-72 rounded-full blur-3xl" style={{ background: "rgba(133,171,139,0.25)" }} />
      <div aria-hidden className="absolute -bottom-20 -right-10 w-80 h-80 rounded-full blur-3xl" style={{ background: "rgba(22,36,26,0.10)" }} />

      <div className="relative">
        <div className="text-center mb-3">
          <span className="font-mono text-[11px] tracking-[0.18em] text-[#3d5638] uppercase">How it works</span>
        </div>
        <h3 className="text-center text-[1.5rem] sm:text-[2rem] leading-[1.3] mb-2" style={HEAD}>
          Webアプリ <span className="text-[#85AB8B]">×</span> オフライン。
        </h3>
        <p className="text-center text-[13px] text-[#4b5b47] leading-[1.9] max-w-[30rem] mx-auto mb-10">
          続ける力はアプリで、変える力は人で。両輪を、一枚に。
        </p>

        {/* composed devices + photos */}
        <div className="relative flex items-end justify-center" style={{ perspective: "1400px" }}>
          <Photo className="hidden md:block w-36 h-56 -mr-12 mb-8" rotate={-9} />

          <PhoneFrame
            className="z-10"
            style={{ transform: "rotate(-5deg) translateY(10px)" }}
          >
            <DashboardScreen />
          </PhoneFrame>

          <PhoneFrame
            className="z-20 -ml-8 sm:-ml-10"
            style={{ transform: "rotate(4deg) translateY(-14px) scale(1.03)" }}
          >
            <MemberScreen />
          </PhoneFrame>

          <Photo className="hidden md:block w-36 h-56 -ml-12 mb-8" rotate={9} />
        </div>

        {/* baseline soft shadow */}
        <div aria-hidden className="mx-auto mt-2 h-6 w-[60%] rounded-[50%] blur-xl" style={{ background: "rgba(20,32,26,0.18)" }} />

        {/* labels */}
        <div className="mt-8 flex items-center justify-center gap-5 text-[11.5px] font-semibold">
          <span className="inline-flex items-center gap-1.5 text-[#3d5638]"><span className="w-1.5 h-1.5 rounded-full bg-[#85AB8B]" />ONLINE — Webアプリ</span>
          <span className="text-[#1f2a1d]/30">×</span>
          <span className="inline-flex items-center gap-1.5 text-[#3d5638]"><span className="w-1.5 h-1.5 rounded-full bg-[#85AB8B]" />OFFLINE — 専属伴走</span>
        </div>
      </div>
    </div>
  );
}
