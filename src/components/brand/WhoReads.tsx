import Link from "next/link";
import Slot from "@/components/brand/Slot";
import type { ImageKey } from "@/lib/images";

// 誰が読むのか。
//
// ══════════════════════════════════════════════════
// 顔を出す。ただし、名簿にはしない
// ══════════════════════════════════════════════════
// 「実在の女性が読む」と言っておいて、画面に人が1人もいないと、
// 本当にいるのかが伝わらない。
//
// ただし、審査を通った登録者はまだ0人。
// 顔の横に「26歳 会社員 回答42件」と並べた瞬間、
// それは実在しない人の名簿になる。
//
// 出すのは 顔（イメージと書く）と 年代（実際に指定できる区分）だけ。
// 件数と割合は、貯まるまで出さない。

export const FACES: { key: ImageKey; age: string }[] = [
  { key: "w1", age: "20代前半" },
  { key: "w2", age: "20代後半" },
  { key: "w3", age: "20代後半" },
  { key: "w4", age: "30代" },
  { key: "w5", age: "20代前半" },
];

/**
 * 受付の表の上に置く、短いほう。
 *
 * 「今日いる人」を見せる前に、そもそも誰が読むのかを1行で言う。
 * 長い説明は要らない。顔と、年代と、イメージであることだけ。
 */
export default function WhoReads() {
  return (
    <div className="rounded-card border border-line bg-paper px-5 py-5">
      <p className="text-[13.5px] font-black leading-[1.6] text-slate">
        裏で、こんな女性が読んでいます。
      </p>
      <p className="mt-1.5 text-[12.5px] leading-[1.8] text-steel">
        年齢と立場を確認し、通った方にだけお願いしています。
        名前も連絡先も出しません。出す仕組み自体を作っていません。
      </p>

      {/* 5人を1行に収める。折り返すと「4人と1人」に見えて、
          最後の1人だけ仲間外れのように出る */}
      <ul className="mt-4 grid grid-cols-5 gap-2">
        {FACES.map((f) => (
          <li key={f.key} className="flex min-w-0 flex-col items-center gap-1.5">
            <Slot
              name={f.key}
              rounded="rounded-full"
              className="aspect-square w-full max-w-[64px]"
            />
            <span className="truncate text-[10px] font-bold text-steel sm:text-[11px]">
              {f.age}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-[11px] leading-[1.75] text-steel">
        ※ 写真はイメージです。実際に登録のある方は
        <Link
          href="/answerers"
          className="mx-1 font-bold text-brand underline decoration-line underline-offset-4"
        >
          誰が読むのか
        </Link>
        に出ます。
      </p>
    </div>
  );
}
