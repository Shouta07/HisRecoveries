// 無料相談 CTA。相談の入口は「匿名Web相談の予約」= /reserve に集約。
import Link from "next/link";

export default function BookingCTA({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href="/reserve" className={className}>
      {children}
    </Link>
  );
}
