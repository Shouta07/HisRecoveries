import Link from "next/link";

// 成果報酬つきのリンクを含むページの、冒頭の告知。
//
// ステマ規制（景表法・2023年10月〜）が求めているのは
// 「事業者の表示であることが、一般消費者に明瞭に分かること」。
// 記事の末尾や、たたんだ中に隠すのは、書いていないのとほぼ同じ。
// だから本文より先、目に入る位置に、地の色を変えずに1行で置く。

export default function AdNotice() {
  return (
    <p className="mt-6 border-y border-shironezu py-3 text-[12.5px] leading-[1.9] text-ainezu">
      この記事には、成果報酬型の広告（アフィリエイトリンク）が含まれます。
      リンクの横に「広告」と表示しています。掲載の順番は報酬額では決めていません。
      <Link
        href="/disclosure"
        className="ml-1.5 whitespace-nowrap font-bold text-asagi underline decoration-asagi/40 underline-offset-[4px] transition-colors hover:decoration-asagi"
      >
        広告と収益について
      </Link>
    </p>
  );
}
