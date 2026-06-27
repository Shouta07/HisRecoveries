// "Webアプリ × オフライン" as one composed picture: tilted phone mockups
// (the online system) layered with offline photo panels — hacomono-style.
// Photos are branded placeholders; drop real images into /public/media/how later.

function Photo({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`relative overflow-hidden rounded-2xl shadow-xl ring-1 ring-black/5 ${className}`}
      style={{ background: "linear-gradient(135deg,#cdd8c8,#9fb0a0)" }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#16241a" strokeWidth="1.4" className="opacity-30" aria-hidden>
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <circle cx="8.5" cy="9" r="1.6" />
          <path d="M21 16l-5-5L5 21" />
        </svg>
      </div>
    </div>
  );
}

function PhoneFrame({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`w-[180px] sm:w-[210px] rounded-[2rem] bg-zinc-900 p-2 shadow-[0_30px_60px_-18px_rgba(0,0,0,0.4)] ${className}`}>
      <div className="rounded-[1.6rem] bg-[#f7f8f7] overflow-hidden">
        <div className="relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-4 bg-zinc-900 rounded-b-xl z-10" />
          {children}
        </div>
      </div>
    </div>
  );
}

/** App dashboard screen */
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

/** Member / mypage screen (offline link, reservations) */
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
    <div className="relative overflow-hidden rounded-[2rem] bg-[#eef1ea] border border-[#1f2a1d]/10 px-4 sm:px-8 py-12 sm:py-16">
      {/* labels */}
      <div className="flex items-center justify-center gap-4 mb-8 text-[11px] font-semibold tracking-[0.08em]">
        <span className="text-[#3d5638]">ONLINE — Webアプリ</span>
        <span className="text-[#1f2a1d]/30">×</span>
        <span className="text-[#3d5638]">OFFLINE — 専属伴走</span>
      </div>

      <div className="relative flex items-center justify-center">
        {/* back-left offline photo */}
        <Photo className="hidden md:block w-40 h-60 -rotate-[8deg] -mr-10 mt-6" />

        {/* phones */}
        <PhoneFrame className="-rotate-[5deg] z-10 relative">
          <DashboardScreen />
        </PhoneFrame>
        <PhoneFrame className="rotate-[4deg] -ml-8 sm:-ml-10 mt-10 z-20 relative">
          <MemberScreen />
        </PhoneFrame>

        {/* back-right offline photo */}
        <Photo className="hidden md:block w-40 h-60 rotate-[8deg] -ml-10 mt-6" />
      </div>

      <p className="mt-10 text-center text-[13px] text-[#4b5b47] leading-[1.9] max-w-[34rem] mx-auto">
        セルフ診断・記録・連絡はアプリで。診断・改善設計・定着は、専属担当と専門家がオフラインで。
        <span className="text-[#1f2a1d] font-semibold"> 両輪を、一枚に。</span>
      </p>
    </div>
  );
}
