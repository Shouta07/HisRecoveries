// Presentational service visuals — no real photos required.
// PhoneMock: a CSS/SVG mockup of the online system (app screen).
// ClinicScene: a flat SVG illustration of the offline consultation room.

const ACCENT = "#0F766E";
const SOFT = "#E6F2F0";

/** Online system — app screen inside a phone frame. */
export function PhoneMock({ className = "" }: { className?: string }) {
  return (
    <div className={`w-[248px] sm:w-[268px] ${className}`}>
      <div className="rounded-[2.3rem] bg-zinc-900 p-2.5 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.35)]">
        <div className="relative rounded-[1.8rem] bg-[#F7F8F7] overflow-hidden">
          {/* notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-zinc-900 rounded-b-2xl z-10" />

          {/* app header */}
          <div className="px-4 pt-7 pb-3 bg-white border-b border-zinc-100 flex items-center justify-between">
            <span className="logo-type text-[14.5px] tracking-[0.04em] text-zinc-900">
              His Recoveries
            </span>
            <span
              className="grid place-items-center w-6 h-6 rounded-full text-[10px] font-bold"
              style={{ backgroundColor: SOFT, color: ACCENT }}
            >
              R
            </span>
          </div>

          <div className="p-4 space-y-3">
            {/* status card */}
            <div className="rounded-2xl bg-white p-3.5 shadow-sm">
              <p className="text-[10px] font-bold text-zinc-400">いまの状態</p>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-[26px] font-extrabold leading-none text-zinc-900">
                  62
                </span>
                <span className="text-[10px] text-zinc-400 mb-1">/ 100 ・ 改善中</span>
              </div>
              <div className="mt-2.5 h-2 rounded-full bg-zinc-100 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: "62%", backgroundColor: ACCENT }} />
              </div>
            </div>

            {/* records mini chart */}
            <div className="rounded-2xl bg-white p-3.5 shadow-sm">
              <p className="text-[10px] font-bold text-zinc-400 mb-2.5">変化の記録</p>
              <div className="flex items-end gap-1.5 h-14">
                {[35, 42, 38, 50, 55, 60, 72].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-[3px]"
                    style={{
                      height: `${h}%`,
                      backgroundColor: i >= 5 ? ACCENT : "#CBD5D2",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* chat */}
            <div className="space-y-1.5">
              <div
                className="w-fit max-w-[80%] rounded-2xl rounded-tl-sm px-3 py-2 text-[11px] leading-[1.5]"
                style={{ backgroundColor: SOFT, color: "#134E48" }}
              >
                今週、調子はどうですか？写真も見ますよ。
              </div>
              <div className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-tr-sm bg-zinc-900 text-white px-3 py-2 text-[11px] leading-[1.5]">
                少し落ち着いてきました
              </div>
            </div>
          </div>

          {/* tab bar */}
          <div className="border-t border-zinc-100 bg-white px-6 py-2.5 flex items-center justify-between">
            {[true, false, false, false].map((active, i) => (
              <span
                key={i}
                className="w-5 h-5 rounded-md"
                style={{ backgroundColor: active ? ACCENT : "#E4E4E7" }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Offline resolution — a calm consultation room (flat SVG illustration). */
export function ClinicScene({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 400 300"
        className="w-full h-auto rounded-3xl"
        role="img"
        aria-label="専属担当との面談・連携クリニックのイメージ"
      >
        <defs>
          <linearGradient id="room" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FBFBFA" />
            <stop offset="100%" stopColor="#EEF3F2" />
          </linearGradient>
          <linearGradient id="win" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#DCEEEB" />
            <stop offset="100%" stopColor="#EAF4F2" />
          </linearGradient>
        </defs>

        {/* room */}
        <rect width="400" height="300" fill="url(#room)" />
        {/* floor */}
        <rect y="232" width="400" height="68" fill="#E3DACd" opacity="0.5" />
        <line x1="0" y1="232" x2="400" y2="232" stroke="#D8D2C6" strokeWidth="1.5" />

        {/* window */}
        <rect x="250" y="44" width="110" height="92" rx="6" fill="url(#win)" stroke="#CBD5D2" strokeWidth="2" />
        <line x1="305" y1="44" x2="305" y2="136" stroke="#CBD5D2" strokeWidth="2" />
        <line x1="250" y1="90" x2="360" y2="90" stroke="#CBD5D2" strokeWidth="2" />

        {/* plant */}
        <rect x="40" y="176" width="34" height="40" rx="4" fill="#C9B79B" />
        <path d="M57 176c-14-6-22-26-14-44 12 10 16 28 14 44z" fill={ACCENT} opacity="0.85" />
        <path d="M57 176c12-8 16-30 6-46-9 12-10 30-6 46z" fill={ACCENT} opacity="0.6" />

        {/* round table */}
        <ellipse cx="200" cy="214" rx="40" ry="12" fill="#D8C7A8" />
        <rect x="196" y="208" width="8" height="20" fill="#C9B79B" />

        {/* left chair (facing right) */}
        <rect x="96" y="170" width="46" height="40" rx="10" fill={ACCENT} />
        <rect x="92" y="150" width="16" height="58" rx="8" fill="#0B5A54" />

        {/* right chair (facing left) */}
        <rect x="258" y="170" width="46" height="40" rx="10" fill="#9FB7B2" />
        <rect x="292" y="150" width="16" height="58" rx="8" fill="#7E9A95" />

        {/* two people (simple) */}
        <circle cx="116" cy="150" r="13" fill="#3F3A33" />
        <rect x="103" y="160" width="26" height="26" rx="10" fill="#534B41" />
        <circle cx="284" cy="150" r="13" fill="#4B5563" />
        <rect x="271" y="160" width="26" height="26" rx="10" fill="#64748B" />
      </svg>

      {/* floating appointment chip */}
      <div className="absolute -bottom-3 left-4 sm:left-6 rounded-2xl bg-white shadow-md px-4 py-2.5 flex items-center gap-2.5">
        <span
          className="grid place-items-center w-7 h-7 rounded-full text-[13.5px]"
          style={{ backgroundColor: SOFT, color: ACCENT }}
          aria-hidden
        >
          ◎
        </span>
        <span className="text-[12.5px] leading-tight">
          <span className="block font-bold text-zinc-900">専属担当との面談</span>
          <span className="block text-zinc-400">オンライン / 対面 ・ 連携クリニック</span>
        </span>
      </div>
    </div>
  );
}
