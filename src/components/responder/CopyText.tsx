"use client";

import { useState } from "react";

export default function CopyText({
  value,
  label,
  note,
}: {
  value: string;
  label: string;
  note?: string;
}) {
  const [done, setDone] = useState(false);

  return (
    <div className="mt-4">
      <p className="select-all break-all rounded-soft border border-line bg-mist px-3.5 py-2.5 text-[12.5px] text-steel">
        {value}
      </p>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            setDone(true);
            window.setTimeout(() => setDone(false), 2000);
          } catch {
            // コピーできない端末もある。長押しで選べるように select-all にしてある。
          }
        }}
        className="mt-2.5 inline-flex min-h-[44px] items-center rounded-pill bg-brand px-5 text-[13.5px] font-bold text-paper shadow-card transition-shadow hover:shadow-card-hover"
      >
        {done ? "コピーしました" : label}
      </button>
      {note && <p className="mt-2.5 text-[11.5px] leading-[1.75] text-steel">{note}</p>}
    </div>
  );
}
