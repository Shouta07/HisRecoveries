import PersonBoard from "@/components/koi/PersonBoard";
import { DEMO_BOARD } from "@/lib/koi/boardDemo";

/* 1画面目の絵。
 *
 * ══════════════════════════════════════════════════
 * 何を見せるかを、入れ替えた
 * ══════════════════════════════════════════════════
 * ここには Before → 実在する異性に相談 → After の3枚を置いていた
 * （components/brand/HeroBoard.tsx）。
 *
 * 見出しとボタンを「整理する」に変えたあとも、
 * すぐ下のこの絵がいちばん大きく
 * 「異性に相談するサービス」と言い続けていた。
 * 絵のほうが強いので、変えた芯が打ち消されていた。
 *
 * 見せるものを、実際の画面にする。
 * 複数のアプリ、複数の相手、それぞれの次の一手。
 * 5秒で「何をする場所か」が分かるのは、言葉よりこちら。
 *
 * ══════════════════════════════════════════════════
 * 実際の画面と、同じ部品を使う
 * ══════════════════════════════════════════════════
 * ここだけ別に作ると、見せている画面と売っている画面がずれる。
 * PersonBoard は /koi/<鍵> が出しているものと同じ。
 * 違うのは中身（見本かどうか）だけ。
 *
 * ══════════════════════════════════════════════════
 * 端末の枠に入れる
 * ══════════════════════════════════════════════════
 * そのまま置くと、ページの一部に見えて「画面」だと分からない。
 * 細い枠と丸みを付けて、持ち歩くものだと分かるようにする。
 * 作り込まない（影と角だけ）。作り込むと、絵のほうが主役になる。
 */

export default function HeroDashboard() {
  return (
    <div className="mx-auto w-full max-w-[22em] px-5 sm:px-0">
      <div className="rounded-[26px] border border-line bg-mist p-3 shadow-card">
        {/* 画面の上。何のアプリを開いているかが分かる程度に */}
        <div className="flex items-center justify-between px-1.5 pb-3 pt-1">
          <span className="text-[12px] font-black text-slate">いま、どうなってる</span>
          <span aria-hidden className="flex gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-line" />
            <span className="h-1.5 w-1.5 rounded-full bg-line" />
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
          </span>
        </div>

        <PersonBoard cards={DEMO_BOARD} />
      </div>

      <p className="mt-2.5 text-center text-[11.5px] leading-[1.7] text-steel">
        ※ 画面の見本です。特定の利用者の記録ではありません。
      </p>
    </div>
  );
}
