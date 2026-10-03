import KoiFace from "@/components/koi/KoiFace";

/* ホームのいちばん上。恋亀が1行だけ言う。
 *
 * ══════════════════════════════════════════════════
 * 数を、そのまま言う
 * ══════════════════════════════════════════════════
 * 「おかえり。今日やることは3件あるで。」
 * 開いた瞬間に、今日の量が分かる。
 *
 * ══════════════════════════════════════════════════
 * 急かさない
 * ══════════════════════════════════════════════════
 * 「まだ3件残ってるで」とは言わない。
 * 残っている、未達、今日中、は使わない。
 * 数えて見せるのは量であって、遅れではない。
 *
 * 0件のときに「やることがありません」と言うと、
 * 何もしていないことを突きつける形になる。
 * そこは別の言い方にする。
 */

export default function Greeting({ count }: { count: number }) {
  const line =
    count === 0
      ? "おかえり。今日は急ぐことは無さそうやで。"
      : `おかえり。今日やることは${count}件あるで。`;

  return (
    <div className="flex items-center gap-3">
      <KoiFace size={52} />
      <p className="min-w-0 flex-1 rounded-card rounded-bl-[6px] bg-paper px-4 py-3 text-[14px] font-bold leading-[1.7] text-slate shadow-card">
        {line}
      </p>
    </div>
  );
}
