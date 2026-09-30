import { GUIDE_VIDEO } from "@/lib/video";

// サービスの説明動画。横型。
//
// ── 押されるまで読まない ──────────────────────────
// preload="none" と表紙で、開いた時点では動画を取りに行かない。
// 見ない人の通信を使わない。
//
// ── 勝手に鳴らさない ──────────────────────────────
// 自動再生はしない。音の出る動画を、読んでいる途中で鳴らさない。
//
// ── 字幕トラックを付けない ────────────────────────
// 画面の吹き出しが、話している言葉そのもの（lib/video.ts）。

export default function GuideVideo() {
  if (!GUIDE_VIDEO.src) return null;
  return (
    <div className="overflow-hidden rounded-card bg-slate shadow-card-hover">
      <video
        src={GUIDE_VIDEO.src}
        poster={GUIDE_VIDEO.poster}
        controls
        preload="none"
        playsInline
        className="block aspect-video w-full"
        aria-label={GUIDE_VIDEO.title}
      />
    </div>
  );
}
