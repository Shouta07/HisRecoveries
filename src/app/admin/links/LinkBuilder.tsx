"use client";

// SNSに貼るリンクを作る。
//
// ── なぜ道具にするのか ────────────────────────────
// 計測の受け口（captureUtm → 全イベントに first-touch を付ける）は
// もう動いている。足りないのは、投稿側が同じ言葉でタグを付けること。
// 手で書くと threads / Threads / thread が混ざり、
// チャネル別の集計がその時点で使えなくなる。
// 語彙を固定した道具にしておけば、混ざりようがない。
//
// ── 何を測りたいのか ─────────────────────────────
//   source  … どのSNSから来たか
//   medium  … 投稿の種類（悩み / 選択肢 / 一次情報 / 思想）
//   content … どの投稿か（自分で決める短い識別子）
// この3つが揃うと「Threadsの一次情報投稿は、診断完了まで届くのか」が
// 分かる。フォロワー数では分からないことがここで分かる。

import { useMemo, useState } from "react";
import { site } from "@/lib/site";

const SOURCES = [
  { v: "threads", label: "Threads" },
  { v: "instagram", label: "Instagram" },
  { v: "youtube", label: "YouTube" },
  { v: "x", label: "X" },
  { v: "note", label: "note" },
] as const;

// 投稿の4カテゴリ。比率どおりに出せているかを、あとで集計で確かめる
const MEDIUMS = [
  { v: "empathy", label: "① 悩み・共感（40%）" },
  { v: "choices", label: "② 選択肢整理（30%）" },
  { v: "primary", label: "③ 一次情報（20%）" },
  { v: "voice", label: "④ 思想（10%）" },
] as const;

const DESTS = [
  { v: "/check", label: "診断（いちばん短い導線）" },
  { v: "/", label: "トップ" },
  { v: "/areas/impression", label: "分野：第一印象" },
  { v: "/areas/hair", label: "分野：薄毛・AGA" },
  { v: "/areas/skin", label: "分野：ニキビ・肌" },
] as const;

export default function LinkBuilder() {
  const [source, setSource] = useState<string>("threads");
  const [medium, setMedium] = useState<string>("empathy");
  const [dest, setDest] = useState<string>("/check");
  const [content, setContent] = useState("");
  const [copied, setCopied] = useState(false);

  // 正規化した識別子。日本語や記号は落ちるので、落ちた結果を見せる。
  // 黙って捨てると、投稿ごとの識別子が全部同じになっていることに気づけない。
  const slug = useMemo(
    () =>
      content
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/^-|-$/g, ""),
    [content],
  );

  const url = useMemo(() => {
    const u = new URL(dest, site.url);
    u.searchParams.set("utm_source", source);
    u.searchParams.set("utm_medium", medium);
    if (slug) u.searchParams.set("utm_content", slug);
    return u.toString();
  }, [source, medium, dest, slug]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* クリップボードが使えない環境では、下のURLを手で選んでもらう */
    }
  };

  const box = "w-full border border-shironezu bg-hakuji px-3 py-2.5 text-[14px]";

  return (
    <div className="mt-8 max-w-[640px]">
      <div className="flex flex-col gap-5">
        <label className="block">
          <span className="text-[12.5px] text-ainezu">どのSNSに貼るか</span>
          <select className={`mt-1.5 ${box}`} value={source} onChange={(e) => setSource(e.target.value)}>
            {SOURCES.map((s) => (
              <option key={s.v} value={s.v}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-[12.5px] text-ainezu">投稿の種類</span>
          <select className={`mt-1.5 ${box}`} value={medium} onChange={(e) => setMedium(e.target.value)}>
            {MEDIUMS.map((m) => (
              <option key={m.v} value={m.v}>
                {m.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-[12.5px] text-ainezu">着地先</span>
          <select className={`mt-1.5 ${box}`} value={dest} onChange={(e) => setDest(e.target.value)}>
            {DESTS.map((d) => (
              <option key={d.v} value={d.v}>
                {d.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-[12.5px] text-ainezu">
            投稿の識別子（任意・半角英数）
          </span>
          <input
            className={`mt-1.5 ${box}`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="0803-yameta-tsuki"
          />
          <span className="mt-1 block text-[12px] text-ainezu">
            日付＋内容が分かる短い語。同じ投稿を貼り直すときも同じ語を使う
          </span>
          {content.trim() !== "" && slug !== content.trim().toLowerCase() && (
            <span className="mt-1 block text-[12px] text-konjo">
              半角英数に直しました：{slug || "（空になりました。英数で入れ直してください）"}
            </span>
          )}
        </label>
      </div>

      <div className="mt-7 border border-shironezu bg-hakuji px-4 py-4">
        <p className="text-[12.5px] text-ainezu">貼るURL</p>
        <p className="mt-2 break-all text-[13.5px] leading-[1.85] text-sumi">{url}</p>
        <button
          type="button"
          onClick={copy}
          className="mt-4 border border-asagi bg-asagi px-5 py-2.5 text-[14px] font-bold text-shironeri transition-colors hover:bg-transparent hover:text-asagi"
          aria-live="polite"
        >
          {copied ? "コピーしました" : "コピー"}
        </button>
      </div>
    </div>
  );
}
