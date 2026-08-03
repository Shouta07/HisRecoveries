"use client";

// 右上のアイコンから開く、検索のシート。
//
// 常設をやめた代わりに、開いたときは窮屈にしない。
// 1条件1行、縦に4つ。半分の幅に押し込む必要がなくなったので、
// 「いまの状況をえらぶ」のような省略しない言い方に戻している。
//
// 閉じ方は3つ（閉じる・背景をタップ・Esc）。どれかは必ず見つかる。
// 「◯本をみる」を押すと閉じて、トップの記事一覧へ送る。
//
// スマホは上から降りてくるシート、デスクトップは画面中央のダイアログ。
// 幅1500pxの画面で上端に貼り付くと、視線の位置から遠すぎる。

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { type Option, useSearch } from "./SearchProvider";
import type { SituationId } from "@/lib/situations";
import type { StageId } from "@/lib/stages";

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

/* 1行＝1条件。ネイティブの <select> ではなく自前にしているのは、
   件数を併記したいのと、0件になる選択肢を押せなくしたいため
   （選んでから空振りするのを防ぐ）。ロールは listbox で担保する。 */
function Row({
  id,
  placeholder,
  options,
  value,
  onChange,
}: {
  id: string;
  placeholder: string;
  options: Option[];
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value) ?? null;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div ref={box} className="relative">
      <button
        id={id}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-[54px] w-full items-center justify-between gap-3 px-4 text-left text-[15px] transition-colors hover:bg-shironeri/60"
      >
        <span className={`truncate ${selected ? "font-bold text-sumi" : "text-ainezu"}`}>
          {selected ? selected.label : placeholder}
        </span>
        <span
          aria-hidden
          className={`shrink-0 text-[10px] text-ainezu transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          ▼
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={placeholder}
          className="absolute inset-x-0 top-full z-10 mt-px max-h-[15rem] overflow-y-auto border border-sumi/15 bg-hakuji shadow-[0_18px_40px_-24px_rgba(31,30,27,0.6)]"
        >
          {selected && (
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
              className="block w-full border-b border-shironezu px-4 py-3 text-left text-[13.5px] text-asagi hover:bg-shironeri"
            >
              指定しない
            </button>
          )}
          {options.map((o) => {
            const on = o.value === value;
            return (
              <button
                key={o.value}
                type="button"
                role="option"
                aria-selected={on}
                disabled={o.count === 0 && !on}
                onClick={() => {
                  onChange(on ? null : o.value);
                  setOpen(false);
                }}
                className={`flex w-full items-baseline justify-between gap-3 border-b border-shironezu px-4 py-3 text-left text-[14.5px] transition-colors last:border-b-0 ${
                  on
                    ? "bg-konjo text-shironeri"
                    : o.count === 0
                      ? "cursor-not-allowed text-ainezu/45"
                      : "text-keshizumi hover:bg-shironeri hover:text-asagi"
                }`}
              >
                <span>{o.label}</span>
                <span className={`shrink-0 text-[12px] tabular-nums ${on ? "text-shironeri/70" : "text-ainezu"}`}>
                  {o.count}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function SearchSheet() {
  const s = useSearch();
  const router = useRouter();
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!s.open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") s.setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [s]);

  // 開いたら最初の項目に焦点を移す（キーボードだけで閉じられるように）
  useEffect(() => {
    if (s.open) panel.current?.querySelector<HTMLElement>("button")?.focus();
  }, [s.open]);

  if (!s.open) return null;

  const show = () => {
    s.setOpen(false);
    if (window.location.pathname === "/") {
      document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      const p = new URLSearchParams();
      if (s.situation) p.set("s", s.situation);
      if (s.stage) p.set("age", s.stage);
      if (s.area) p.set("area", s.area);
      if (s.q.trim()) p.set("q", s.q.trim());
      const qs = p.toString();
      router.push(`/${qs ? `?${qs}` : ""}#index`);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] sm:grid sm:place-items-center sm:p-6">
      <button
        type="button"
        aria-label="検索を閉じる"
        onClick={() => s.setOpen(false)}
        className="absolute inset-0 bg-sumi/40 backdrop-blur-[2px]"
      />

      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="記事をさがす"
        className="absolute inset-x-0 top-0 max-h-[100svh] overflow-y-auto border-b border-shironezu bg-shironeri sm:relative sm:inset-auto sm:max-h-[calc(100svh-3rem)] sm:w-full sm:max-w-[520px] sm:rounded-[2px] sm:border sm:shadow-[0_40px_80px_-40px_rgba(31,30,27,0.6)]"
      >
        <div className="mx-auto max-w-[560px] px-5 py-6 sm:px-7 sm:py-7">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-[18px] sm:text-[20px]" style={{ ...MINCHO, fontWeight: 700 }}>
              記事をさがす
            </h2>
            <button
              type="button"
              onClick={() => s.setOpen(false)}
              className="text-[13px] text-ainezu transition-colors hover:text-asagi"
            >
              閉じる
            </button>
          </div>

          <div className="mt-5 divide-y divide-shironezu rounded-[2px] border border-shironezu bg-hakuji">
            <Row
              id="f-situation"
              placeholder="いまの状況をえらぶ"
              options={s.situationOptions}
              value={s.situation}
              onChange={(v) => s.setSituation(v as SituationId | null)}
            />
            <Row
              id="f-stage"
              placeholder="年代をえらぶ"
              options={s.stageOptions}
              value={s.stage}
              onChange={(v) => s.setStage(v as StageId | null)}
            />
            <Row
              id="f-area"
              placeholder="分野をえらぶ"
              options={s.areaOptions}
              value={s.area}
              onChange={s.setArea}
            />
            <div>
              <input
                id="q"
                type="search"
                value={s.q}
                onChange={(e) => s.setQ(e.target.value)}
                placeholder="言葉でさがす"
                aria-label="言葉でさがす"
                className="h-[54px] w-full bg-transparent px-4 text-[16px] text-sumi outline-none placeholder:text-ainezu focus:bg-shironeri/60"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={show}
            className="mt-4 flex h-[52px] w-full items-center justify-center gap-2 rounded-[2px] bg-konjo text-[15px] font-bold text-shironeri transition-colors hover:bg-konjo/90"
          >
            <span>
              <span className="tabular-nums">{s.total}</span>本をみる
            </span>
            <span aria-hidden>→</span>
          </button>

          {s.hasFilter && (
            <button
              type="button"
              onClick={s.clearAll}
              className="mt-4 text-[13.5px] text-asagi underline decoration-asagi/40 underline-offset-[5px] transition-colors hover:decoration-asagi"
            >
              すべて解除
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
