"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  checkId: string;
  followUpAt: string | null;
};

export default function MarkFollowedUp({ checkId, followUpAt }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [stamp, setStamp] = useState<string | null>(followUpAt);

  async function mark(action: "now" | null) {
    setPending(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/checks/${checkId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ follow_up_at: action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "更新に失敗しました");
      setStamp(action === "now" ? new Date().toISOString() : null);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "更新に失敗しました");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-[11px] text-sub-gray">
        Follow-up:{" "}
        <span className="text-ink">{stamp ? stamp.slice(0, 10) : "未送付"}</span>
      </span>
      {stamp ? (
        <button
          type="button"
          onClick={() => mark(null)}
          disabled={pending}
          className="text-[11px] tracking-[0.08em] uppercase text-ink border border-hair-line hover:border-gold hover:text-gold transition-colors px-2 py-1 disabled:opacity-50"
        >
          取り消し
        </button>
      ) : (
        <button
          type="button"
          onClick={() => mark("now")}
          disabled={pending}
          className="text-[11px] tracking-[0.08em] uppercase text-ink border border-hair-line hover:border-gold hover:text-gold transition-colors px-2 py-1 disabled:opacity-50"
        >
          Follow-up を送付済にする
        </button>
      )}
      {error && (
        <span className="text-[11px] text-red-600">{error}</span>
      )}
    </div>
  );
}
