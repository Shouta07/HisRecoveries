"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  endpoint: string; // e.g. /api/admin/checks/{id}
  current: string;
  options: { value: string; label: string }[];
};

export default function StatusBar({ endpoint, current, options }: Props) {
  const router = useRouter();
  const [value, setValue] = useState(current);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function update(next: string) {
    if (next === value) return;
    setPending(true);
    setError("");
    try {
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "update failed");
      setValue(next);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "update failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="inline-flex flex-wrap items-center gap-1.5">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => update(o.value)}
            disabled={pending}
            className={`text-[10px] tracking-[0.1em] uppercase px-2 py-1 border transition-colors disabled:opacity-50 ${
              active
                ? "border-gold text-gold bg-paper"
                : "border-hair-line text-sub-gray hover:border-gold hover:text-gold"
            }`}
            aria-pressed={active}
          >
            {o.label}
          </button>
        );
      })}
      {error && <span className="ml-2 text-[10px] text-red-600">{error}</span>}
    </div>
  );
}
