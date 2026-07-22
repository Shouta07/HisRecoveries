// 無料相談リンク（アンカー型）。
// LINE 設定あり → 直接 LINE 遷移（別タブ）。未設定 → /apply にフォールバック。
// クリック型の CTA は BookingCTA、テキスト/インラインのリンクはこちらを使う。
import { site } from "@/lib/site";

export default function ConsultLink({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const line = site.line.addFriendUrl;
  if (line) {
    return (
      <a href={line} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return (
    <a href="/apply" className={className}>
      {children}
    </a>
  );
}
