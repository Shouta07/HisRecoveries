import { IMAGES, type ImageKey } from "@/lib/images";

// 写真の枠。
//
// ── 用意できていないものを、それらしく埋めない ────
// 素材サイトの写真も、生成した人物も置かない。
// ファイルが無いあいだは、何を写すかを書いた枠だけを出す。
// public/img/ に置けば、その瞬間から写真になる。
//
// ── next/image を使わない ────────────────────────
// ファイルが存在しない状態でも壊れずに枠を出したいので、
// ここでは背景画像として扱う。差し替えは CSS の1行で済む。

export default function Slot({
  name,
  className = "",
  rounded = "rounded-card",
  children,
}: {
  name: ImageKey;
  className?: string;
  rounded?: string;
  children?: React.ReactNode;
}) {
  const img = IMAGES[name];

  return (
    <div
      className={`relative overflow-hidden bg-mist ${rounded} ${className}`}
      style={{
        backgroundImage: `url(${img.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      role={img.alt ? "img" : undefined}
      aria-label={img.alt || undefined}
      aria-hidden={img.alt ? undefined : true}
    >
      {/* 写真が無いときに見える案内。写真が乗れば隠れる */}
      <span className="pointer-events-none absolute inset-0 -z-0 flex items-center justify-center p-4 text-center text-[11px] leading-[1.6] text-steel">
        {img.note}
      </span>
      {children}
    </div>
  );
}
