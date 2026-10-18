import Link from "next/link";

/* ══════════════════════════════════════════════════
   言語の切り替え
   ══════════════════════════════════════════════════

   ── 言語を変えると、サービスの対象も変わる ──────
   ただの翻訳ではない。

     /    日本語  海外へ一人旅に行く日本人向け
     /en  English 日本へ一人旅に来る人向け
     /zh  简体中文 同上

   行き先も、相談できる中身も違う。
   だから、切り替えたところで「対象が変わったこと」を
   各ページの冒頭で言う（Audience）。

   ── 勝手に飛ばさない ────────────────────────────
   ブラウザーの言語で自動的に転送しない。
   日本語を読む人が英語版を見たいこともあるし、
   日本在住の外国人が日本語版を読むこともある。
   選んだものを優先する。

   ── 携帯でも見つかるところに ────────────────────
   ヘッダーの右と、フッターの頭。2か所に置く。 */

const LANGS: { code: "ja" | "en" | "zh"; href: string; label: string }[] = [
  { code: "ja", href: "/", label: "日本語" },
  { code: "en", href: "/en", label: "English" },
  { code: "zh", href: "/zh", label: "简体中文" },
];

/* ── 濃い面の上では、色を変える ──────────────────
   フッターを深い緑にしたら、選んでいない言語が
   緑の上の灰色になって、ほとんど読めなくなった。

   押せるものが読めないのは、無いのと同じ。
   置く面に合わせて、2通り持つ。 */
export default function LangSwitch({
  current,
  onDark = false,
}: {
  current: "ja" | "en" | "zh";
  onDark?: boolean;
}) {
  return (
    <nav aria-label="Language" className="flex shrink-0 items-center gap-1">
      {LANGS.map((l) => {
        const on = l.code === current;
        const cls = onDark
          ? on
            ? "bg-paper text-brand-deep"
            : "text-paper/75 hover:text-paper"
          : on
            ? "bg-brand text-paper"
            : "text-steel hover:text-brand";
        return (
          <Link
            key={l.code}
            href={l.href}
            hrefLang={l.code}
            aria-current={on ? "true" : undefined}
            className={`min-h-[36px] rounded-pill px-2.5 py-1.5 text-[12px] font-bold leading-[1.4] transition-colors ${cls}`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
