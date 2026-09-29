// 値段の組み方。
//
// ── 1か所に決める ─────────────────────────────────
// 値段はこの製品の主役なので、出るたびに違う組み方をしない。
// ¥ の大きさ、桁区切り、「〜」の付け方を、ここだけで決める。
//
// ── ¥ は数字より小さく ────────────────────────────
// 同じ大きさで並べると、記号のほうが目立って金額が読みにくい。
// 少し小さく、少し上げる。値段の見え方はこれで変わる。
//
// ── 数字は端末のUI書体 ────────────────────────────
// 日本語書体のラテンは本文に混ざる前提で作られていて、数字が細い。
// font-num（tailwind.config.ts）で、桁の揃った太い数字に替える。

export default function Yen({
  yen,
  /** 「〜」を付ける（下限だけ決まっているもの） */
  from = false,
  /** 足すものとして出す（+¥1,000） */
  plus = false,
  className = "",
}: {
  yen: number;
  from?: boolean;
  plus?: boolean;
  className?: string;
}) {
  return (
    <span className={`num inline-flex items-baseline font-num ${className}`}>
      {plus && <span className="mr-[0.04em] text-[0.7em] font-bold">+</span>}
      <span className="mr-[0.06em] text-[0.64em] font-bold">¥</span>
      <span>{yen.toLocaleString()}</span>
      {from && <span className="ml-[0.08em] text-[0.55em] font-bold opacity-70">〜</span>}
    </span>
  );
}
