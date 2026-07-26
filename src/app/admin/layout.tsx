import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s — His Recoveries Admin" },
  robots: { index: false, follow: false },
};

// 上のバーは最小構成（Studio 中心）。Insights/Data/GSC/GA/Drive は Studio の中から、
// その他ツール（Checks/Asks/Guides/Certified/Eval/Letter）は Studio 下部の「その他」から。
const tabs = [{ href: "/admin/studio", label: "Studio" }];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <nav
        aria-label="admin"
        className="border-b border-hair-line bg-paper/40"
      >
        <div className="mx-auto max-w-[1100px] px-6 sm:px-10 py-3 flex items-center gap-4 sm:gap-6 text-[12px] tracking-[0.1em]">
          <span className="text-sub-gray uppercase">Admin</span>
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="text-ink hover:text-gold transition-colors"
            >
              {t.label}
            </Link>
          ))}
        </div>
      </nav>
      {children}
    </>
  );
}
