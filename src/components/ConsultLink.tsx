// 無料相談リンク。相談の入口は「匿名Web相談の予約」= /reserve に集約。
// （/reserve が TimeRex 埋め込み or LINE/フォームのフォールバックを出し分ける）
import Link from "next/link";

export default function ConsultLink({
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
