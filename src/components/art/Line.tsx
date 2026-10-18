/* ══════════════════════════════════════════════════
   線画
   ══════════════════════════════════════════════════

   ── 写真の代わりに、線で描く ────────────────────
   見本には、一人旅の人・ピラミッド・九份の写真が入っていた。
   どれも置いていない。

   素材サイトの写真を「運営者が行ったところ」として並べると、
   読む人には、本人が撮ったものと区別がつかない。
   行った証拠として見せているのに、行っていない写真になる。

   実物が入るまでは、線で描く。
   線画は「こういう場面」の説明であって、
   どこで撮ったかを主張しない。

   ── 1本の太さで通す ────────────────────────────
   全部 1.6 の線で、角は丸。塗りは使わない。
   太さが混ざると、別々の素材を貼り合わせたように見える。

   色は currentColor。置いた場所の文字色をそのまま拾う。
   濃い面の上でも、そのまま使える。 */

type P = { className?: string; size?: number };

function Svg({ children, className, size = 120 }: P & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 120 100"
      width={size}
      height={(size * 100) / 120}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      {children}
    </svg>
  );
}

/** 出発前。机に向かって、調べながら考えている */
export function ArtPlanning(p: P) {
  return (
    <Svg {...p}>
      {/* 机 */}
      <path d="M14 82h92" />
      {/* ノートパソコン */}
      <path d="M46 82V60a3 3 0 0 1 3-3h30a3 3 0 0 1 3 3v22" />
      <path d="M41 82h47" />
      <path d="M53 63h22M53 69h16" />
      {/* 人（後ろ姿・肩と頭） */}
      <circle cx="33" cy="48" r="8" />
      <path d="M21 82c0-9 5-15 12-15s12 6 12 15" />
      {/* 思いついたこと（紙ひこうき） */}
      <path d="M86 26l18 7-8 4-2 8-8-19z" />
      <path d="M96 37l-4 6" />
      {/* 鉢植え */}
      <path d="M100 82v-9M100 73c-5 0-8-3-8-7 4 0 8 3 8 7zM100 73c5 0 8-3 8-7-4 0-8 3-8 7z" />
    </Svg>
  );
}

/** 旅先。分かれ道の前で、地図を見ている */
export function ArtCrossroads(p: P) {
  return (
    <Svg {...p}>
      <path d="M14 86h92" />
      {/* 道しるべ */}
      <path d="M80 86V34" />
      <path d="M80 40h22l-5 6 5 6H80z" />
      <path d="M80 56H58l5 6-5 6h22z" />
      {/* 人（背負い袋） */}
      <circle cx="36" cy="40" r="8" />
      <path d="M24 86c0-12 5-20 12-20s12 8 12 20" />
      <path d="M46 52c6 1 9 5 9 11s-3 9-7 9" />
      {/* 手元の紙 */}
      <path d="M22 60l12-4v12l-12 4z" />
    </Svg>
  );
}

/** 旅先の夜。ひと息ついて、今日あったことを思い返している */
export function ArtEvening(p: P) {
  return (
    <Svg {...p}>
      <path d="M14 86h92" />
      {/* 窓の外（塔のある街） */}
      <path d="M86 86V52l9-16 9 16v34" />
      <path d="M90 66h10M90 76h10" />
      {/* 小さなテーブル */}
      <path d="M24 86V66h34v20" />
      <path d="M20 66h42" />
      {/* 人（横向き） */}
      <circle cx="40" cy="36" r="8" />
      <path d="M30 66c0-10 4-16 10-16s10 6 10 16" />
      {/* カップ */}
      <path d="M62 60h10v6a5 5 0 0 1-10 0z" />
      <path d="M72 62h3a2 2 0 0 1 0 4h-3" />
      <path d="M65 54c0-2 2-2 2-4M69 54c0-2 2-2 2-4" />
    </Svg>
  );
}

/** 出発前。画面ごしに話している */
export function ArtMeet(p: P) {
  return (
    <Svg {...p}>
      {/* 画面 */}
      <rect x="20" y="22" width="80" height="52" rx="4" />
      <path d="M12 80h96" />
      <path d="M46 74l-2 6h32l-2-6" />
      {/* 相手の顔 */}
      <circle cx="60" cy="43" r="8" />
      <path d="M47 64c0-8 6-13 13-13s13 5 13 13" />
      {/* 通話中の印 */}
      <circle cx="30" cy="31" r="2.6" />
      {/* 画面の隅の小窓 */}
      <rect x="80" y="54" width="14" height="12" rx="2" />
      <circle cx="87" cy="59" r="2.4" />
    </Svg>
  );
}

/** 旅行中。手元の端末でやりとりしている */
export function ArtChat(p: P) {
  return (
    <Svg {...p}>
      {/* 端末 */}
      <rect x="36" y="12" width="48" height="80" rx="6" />
      <path d="M54 19h12" />
      {/* 吹き出し（相手） */}
      <path d="M44 34h22a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H50l-6 5v-5a3 3 0 0 1-3-3v-8a3 3 0 0 1 3-3z" />
      {/* 吹き出し（自分） */}
      <path d="M76 58H56a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h14l6 5v-5a3 3 0 0 0 3-3v-8a3 3 0 0 0-3-3z" />
    </Svg>
  );
}

/* ── 見出しの下に引く線 ────────────────────────────
   金色。文字には使わない（白の上で 1.83:1）。
   下線なので、読めなくてよい。 */
export function Underline({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 8"
      preserveAspectRatio="none"
      aria-hidden
      className={`h-2 w-[84px] ${className}`}
    >
      <path
        d="M1 5.5c22-3 44-4 58-3s36 3 60 1"
        fill="none"
        stroke="#E9B949"
        strokeWidth={4}
        strokeLinecap="round"
      />
    </svg>
  );
}
