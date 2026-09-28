// 見出しの右に添える印。
// 手で引いた線のニュアンスを出す。装飾なので読み上げない。

export default function Flourish({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 28 22"
      className={`inline-block h-[0.7em] w-[0.9em] shrink-0 align-middle ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
    >
      <path d="M3 15C7 9 10 5 13 3" />
      <path d="M12 18C16 12 19 8 22 6" />
      <path d="M22 17C24 14 25 12 26 11" />
    </svg>
  );
}
