"use client";

import { useMemo, useState } from "react";

// 出稿用のリンクを作る。
//
// ── なぜ画面にするか ──────────────────────────────
// utm を手で書くと、utm_source=X と utm_source=x が別の行になる。
// 分かれた時点で、その出稿の数字は合算できない。
// 小文字に揃えて、空欄は付けない。それだけのことを、毎回間違える。
//
// ── 着地先を選ばせる ──────────────────────────────
// 広告からトップに落とすか、相談の画面に直接落とすかで率が変わる。
// 比べられるように、どちらも同じ形で作れるようにしておく。

const SOURCES = ["x", "threads", "instagram", "youtube", "google", "meta", "line", "note", "mail"];
const MEDIUMS = ["cpc", "social", "post", "bio", "story", "mail", "affiliate"];

/** utm に入れてよい形に直す。小文字・英数と - _ だけ */
function clean(v: string): string {
  return v
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]/g, "");
}

export default function UtmBuilder({ base }: { base: string }) {
  const [dest, setDest] = useState("/");
  const [source, setSource] = useState("x");
  const [medium, setMedium] = useState("post");
  const [campaign, setCampaign] = useState("");
  const [content, setContent] = useState("");
  const [copied, setCopied] = useState(false);

  const url = useMemo(() => {
    const q = new URLSearchParams();
    const s = clean(source);
    const m = clean(medium);
    const c = clean(campaign);
    const t = clean(content);
    if (s) q.set("utm_source", s);
    if (m) q.set("utm_medium", m);
    if (c) q.set("utm_campaign", c);
    if (t) q.set("utm_content", t);
    const path = dest.startsWith("/") ? dest : `/${dest}`;
    const qs = q.toString();
    return `${base}${path}${qs ? `?${qs}` : ""}`;
  }, [base, dest, source, medium, campaign, content]);

  const ready = Boolean(clean(source) && clean(campaign));

  const field =
    "mt-1.5 w-full rounded-soft border border-line bg-paper px-3 py-2 text-[13.5px] text-slate";

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block">
          <span className="text-[11.5px] text-steel">着地先</span>
          <select value={dest} onChange={(e) => setDest(e.target.value)} className={field}>
            <option value="/">/ （トップ）</option>
            <option value="/ask">/ask （相談を書く画面から）</option>
            <option value="/answerers">/answerers （誰が読むのか）</option>
          </select>
        </label>

        <label className="block">
          <span className="text-[11.5px] text-steel">流入元 utm_source</span>
          <input
            list="utm-sources"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className={field}
          />
          <datalist id="utm-sources">
            {SOURCES.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </label>

        <label className="block">
          <span className="text-[11.5px] text-steel">種類 utm_medium</span>
          <input
            list="utm-mediums"
            value={medium}
            onChange={(e) => setMedium(e.target.value)}
            className={field}
          />
          <datalist id="utm-mediums">
            {MEDIUMS.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </label>

        <label className="block">
          <span className="text-[11.5px] text-steel">施策 utm_campaign</span>
          <input
            value={campaign}
            onChange={(e) => setCampaign(e.target.value)}
            placeholder="2026-04-line-before-send"
            className={field}
          />
        </label>

        <label className="block">
          <span className="text-[11.5px] text-steel">
            見分け utm_content <span className="ml-1">任意</span>
          </span>
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="a / b"
            className={field}
          />
        </label>
      </div>

      <div className="mt-4 rounded-soft border border-line bg-mist px-4 py-3">
        <p className="break-all font-mono text-[12.5px] leading-[1.7] text-slate">{url}</p>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!ready}
          onClick={() => {
            navigator.clipboard?.writeText(url).then(
              () => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1600);
              },
              () => undefined,
            );
          }}
          className="inline-flex min-h-[40px] items-center rounded-pill border border-brand bg-paper px-4 text-[13px] font-bold text-brand disabled:opacity-40"
        >
          {copied ? "コピーしました" : "コピー"}
        </button>
        {!ready && (
          <span className="text-[12px] text-steel">
            流入元と施策名を入れてください（無いと、どの出稿だったか後から分かりません）
          </span>
        )}
      </div>
    </div>
  );
}
