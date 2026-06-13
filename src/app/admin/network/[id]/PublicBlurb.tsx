"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  id: string;
  initialBlurb: string;
  initialNotes: string;
  certifiedAt: string | null;
  certifiedYear: number | null;
  status: string;
};

export default function PublicBlurb({
  id,
  initialBlurb,
  initialNotes,
  certifiedAt,
  certifiedYear,
  status,
}: Props) {
  const router = useRouter();
  const [blurb, setBlurb] = useState(initialBlurb);
  const [notes, setNotes] = useState(initialNotes);
  const [pending, setPending] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState("");

  const blurbDirty = useMemo(() => blurb !== initialBlurb, [blurb, initialBlurb]);
  const notesDirty = useMemo(() => notes !== initialNotes, [notes, initialNotes]);

  async function save(field: "public_blurb" | "notes") {
    setError("");
    setPending(true);
    try {
      const body =
        field === "public_blurb"
          ? { public_blurb: blurb }
          : { notes };
      const res = await fetch(`/api/admin/network/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "save failed");
      setSavedAt(new Date());
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "save failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="bg-paper border border-hair-line p-4">
        <p className="logo-type italic text-[10px] tracking-[0.2em] uppercase text-gold mb-3">
          公開ブラブ（認証後 /network に表示）
        </p>
        <textarea
          value={blurb}
          onChange={(e) => setBlurb(e.target.value.slice(0, 600))}
          placeholder="認証後、/network カードに表示される編集者の短文。1〜2 文で。"
          className="w-full bg-cream border border-hair-line text-ink px-3 py-2 font-mincho text-[13.5px] leading-[1.95] focus:outline-none focus:border-gold min-h-[100px] resize-y"
        />
        <div className="mt-2 flex items-center justify-between text-[11px]">
          <span className="text-sub-gray">{blurb.length} / 600</span>
          <button
            type="button"
            onClick={() => save("public_blurb")}
            disabled={pending || !blurbDirty}
            className="bg-ink text-cream hover:bg-gold disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 tracking-[0.06em] transition-colors"
          >
            保存
          </button>
        </div>
        {status === "certified" && (
          <p className="mt-2 text-[10.5px] text-gold">
            ステータス：認証済み（公開中）
            {certifiedAt ? ` · ${certifiedAt}` : ""}
            {certifiedYear ? ` · ${certifiedYear}` : ""}
          </p>
        )}
      </div>

      <div className="bg-paper border border-hair-line p-4">
        <p className="logo-type italic text-[10px] tracking-[0.2em] uppercase text-gold mb-3">
          編集 / 委員会ノート（非公開）
        </p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value.slice(0, 8000))}
          placeholder="覆面審査の所感、委員会の判断、剥奪の理由など"
          className="w-full bg-cream border border-hair-line text-ink px-3 py-2 font-mincho text-[13px] leading-[1.95] focus:outline-none focus:border-gold min-h-[180px] resize-y"
        />
        <div className="mt-2 flex items-center justify-between text-[11px]">
          <span className="text-sub-gray">{notes.length} / 8000</span>
          <button
            type="button"
            onClick={() => save("notes")}
            disabled={pending || !notesDirty}
            className="bg-ink text-cream hover:bg-gold disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 tracking-[0.06em] transition-colors"
          >
            保存
          </button>
        </div>
      </div>

      {savedAt && (
        <p className="text-[11px] text-gold">
          ✓ {savedAt.toLocaleTimeString("ja-JP")} に保存しました
        </p>
      )}
      {error && <p className="text-[11px] text-red-600">{error}</p>}
    </div>
  );
}
