// タシカメ。サービスのマーク。
//
// ── 絵を差し替えた ────────────────────────────────
// 以前は線画を SVG で起こしていた（元の絵のファイルが無かったため）。
// 絵をもらったので、そちらに差し替えた。
//
// ── 小さいところは頭だけ ──────────────────────────
// 全身の絵は、40px を切ると緑の染みになって何か分からない。
// 下タブのボタンは 20px しかない。
// なので 40px 未満では、頭と虫めがねだけを切り出したものを出す。
// どちらも同じ絵から切っているので、別物には見えない。
//
// ── 背景は抜いてある ──────────────────────────────
// 青いボタンの上に置くので、白いままだと四角が乗る。
// 外側からつながっている白だけを消した（虫めがねのガラスと
// おなかの淡い色は残っている）。
//
// ── mood と tone は受け取るだけ ───────────────────
// 線画のときは表情と線の色を描き分けていた。絵になったので、
// どちらも効かない。呼ぶ側を一斉に直すほどのことではないので、
// 受け取って無視する。

export type Mood = "normal" | "thinking" | "going" | "report" | "idle";

/**
 * 全身と、頭だけ。切り替える大きさ。
 *
 * 全身の絵は、64px を切ると何の生き物か分からなくなる。
 * ヘッダーは 46px なので、そこは頭と虫めがねだけを出す。
 */
const HEAD_BELOW = 64;

export default function Tashikame({
  size = 56,
  className = "",
  label,
}: {
  /** 線画のときの名残。いまは効かない */
  mood?: Mood;
  /** 線画のときの名残。いまは効かない */
  tone?: "light" | "dark" | "brand";
  size?: number;
  className?: string;
  /** 読み上げ用。飾りのときは省く */
  label?: string;
}) {
  const small = size < HEAD_BELOW;

  return (
    // next/image を使わない。飾りとして小さく置くだけで、
    // 読み込みの順番を器用に扱う必要がない。
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={small ? "/img/tashikame-mark-128.png" : "/img/tashikame-192.png"}
      width={size}
      height={size}
      alt={label ?? ""}
      aria-hidden={label ? undefined : true}
      decoding="async"
      className={`shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
