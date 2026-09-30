"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";

// サービス紹介の動画。
//
// ══════════════════════════════════════════════════
// 最初から iframe を置かない
// ══════════════════════════════════════════════════
// YouTube の埋め込みは、置いただけで1MB近く読み込む。
// このサイトは Web フォントすら使っていないので、
// トップでいちばん重いものが紹介動画になってしまう。
//
// しかも、再生していない人にも Cookie が入る。
// 見ていないのに追跡が始まるのは、こちらの筋が通らない。
//
// なので、最初は画像とボタンだけ置く。
// 押されたときに初めて iframe を作る。
// 押さなかった人には、何も読み込まれず、何も入らない。
//
// ══════════════════════════════════════════════════
// nocookie のほうを使う
// ══════════════════════════════════════════════════
// 再生した人にも、余計なものは入れない。
// youtube-nocookie.com は、再生するまで追跡用の Cookie を置かない。
//
// ══════════════════════════════════════════════════
// 画像が出なくても、壊れて見えないようにする
// ══════════════════════════════════════════════════
// サムネイルは YouTube 側から読む。
// 読めなかったとき（回線・広告ブロック・地域）に
// 白い枠と壊れた画像が残ると、ただの不具合に見える。
// 下地を先に塗っておいて、画像はその上に重ねる。
//
// ══════════════════════════════════════════════════
// 自動再生しない
// ══════════════════════════════════════════════════
// 勝手に音が出るのは、それだけで閉じられる。
// 押したときだけ、押した人の操作として再生する。

/** 動画のID（youtu.be/ のうしろ） */
const ID = "01RlW6YOeC4";

export default function VideoEmbed({
  title,
  caption,
}: {
  /** 読み上げと、再生前に出す見出し */
  title: string;
  /** 動画の下に出す1行。何の動画かを、見る前に分かるように */
  caption?: string;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <figure className="m-0">
      <div
        // 16:9。高さを先に決めておかないと、
        // 読み込みのたびに下の要素が飛ぶ
        className="relative aspect-video w-full overflow-hidden rounded-card bg-sky shadow-card"
      >
        {playing ? (
          <iframe
            // 押されてから作る。ここに来るまで通信は起きない
            src={`https://www.youtube-nocookie.com/embed/${ID}?autoplay=1&rel=0&playsinline=1&modestbranding=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              track("video_played", { id: ID });
              setPlaying(true);
            }}
            aria-label={`${title}を再生する`}
            className="group absolute inset-0 h-full w-full cursor-pointer"
          >
            {/* サムネイル。読めなくても、下地（bg-sky）が残る。
                next/image を使わないのは、YouTube のサムネイルが外部にあるため。
                使うには next.config でドメインを許可して、こちらのサーバーを
                通して配ることになる。押されるか分からない画像のために
                配信を1つ増やさない。 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://i.ytimg.com/vi/${ID}/maxresdefault.jpg`}
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
              onError={(e) => {
                // maxres が無い動画がある。標準のほうへ落とす。
                // それも無ければ、下地だけ残す（壊れた画像を出さない）
                const img = e.currentTarget;
                if (img.dataset.fallback === "1") {
                  img.style.display = "none";
                  return;
                }
                img.dataset.fallback = "1";
                img.src = `https://i.ytimg.com/vi/${ID}/hqdefault.jpg`;
              }}
            />

            {/* 画像の上に文字を出すので、少しだけ暗くする。
                暗くしないと、明るい場面で再生ボタンが消える */}
            <span
              aria-hidden
              className="absolute inset-0 bg-slate/25 transition-colors group-hover:bg-slate/35"
            />

            {/* 再生の印。ブランドの青で、丸1つだけ */}
            <span
              aria-hidden
              className="absolute left-1/2 top-1/2 flex h-[64px] w-[64px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand shadow-card transition-transform group-hover:scale-[1.06] sm:h-[76px] sm:w-[76px]"
            >
              {/* 三角。右にずらしてあるのは、
                  三角の重心が左に寄って見えるため */}
              <svg
                viewBox="0 0 24 24"
                className="ml-[3px] h-[26px] w-[26px] sm:h-[30px] sm:w-[30px]"
                fill="currentColor"
                style={{ color: "#FFFFFF" }}
              >
                <path d="M8 5.5v13l11-6.5z" />
              </svg>
            </span>

            <span className="absolute inset-x-0 bottom-0 px-4 pb-3.5 pt-10 text-left text-[13px] font-bold leading-[1.6] text-paper sm:px-5 sm:pb-4 sm:text-[15px]">
              {title}
            </span>
          </button>
        )}
      </div>

      {caption && (
        <figcaption className="mt-2.5 text-[12px] leading-[1.75] text-steel">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/* ── 公開の前に止めること ───────────────────────── */
{
  // IDの形。YouTube の動画IDは11文字。
  // URL をまるごと貼ってしまう間違いを、ここで止める
  // （貼ると src が二重になって、黙って再生できなくなる）。
  if (!/^[A-Za-z0-9_-]{11}$/.test(ID)) {
    throw new Error(`動画のIDの形が不正です（${ID}）。youtu.be/ のうしろの11文字だけを入れてください`);
  }
}
