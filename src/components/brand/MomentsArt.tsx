import { hasPublicFile } from "@/lib/publicFile";

// 「こんな瞬間、ありませんか？」の絵。
//
// ══════════════════════════════════════════════════
// 絵があれば出す。無ければ、無いまま出す
// ══════════════════════════════════════════════════
// 画像のパスを直に書くと、ファイルが置かれるまでのあいだ、
// 壊れた画像の印が出続ける。
// サーバー側で1回だけ確かめて、無ければ何も出さない。
//
// 置く場所:  public/img/moments.png
// 置いた瞬間に、次のビルドから出る。
//
// ══════════════════════════════════════════════════
// 絵で、下の一覧を置き換えない
// ══════════════════════════════════════════════════
// 吹き出しの中の言葉は、画像に焼き込まれている。
// 画像にすると、こうなる。
//   読み上げに乗らない（何が書いてあるか分からない）
//   検索に乗らない（8つの場面の言葉が全部消える）
//   押せない（いまは8つとも、その場面の相談へ入る口になっている）
//   390px 幅だと、吹き出し8個の文字が読めない
//
// 絵は「自分のことだ」と思わせるためのもので、
// 一覧は、思ったその場から始めるためのもの。役割が違う。
// 絵を上に置いて、一覧はそのまま残す。

export default function MomentsArt({ alt }: { alt: string }) {
  // public/ の中を見る。ビルドのときに1回だけ動く
  const file = "/img/moments.png";
  if (!hasPublicFile(file)) return null;

  return (
    <div className="mt-6 overflow-hidden rounded-card border border-line bg-sky shadow-card">
      {/* 幅いっぱい。縦横比は画像そのものに任せる
          （決め打ちすると、差し替えたときに切れる） */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={file}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="block h-auto w-full"
      />
    </div>
  );
}
