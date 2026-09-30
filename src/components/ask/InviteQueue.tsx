"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { category, isCategoryId } from "@/lib/ask/model";
import type { OpenInvite } from "@/lib/responder/queue";
import { track } from "@/lib/analytics";

// 答える人が、自分で案件を取る画面。
//
// ══════════════════════════════════════════════════
// 選べること
// ══════════════════════════════════════════════════
// ノルマも指名もない、と約束している。
// だから「割り当てられた仕事」ではなく「取れる仕事」に見せる。
// 取らなくても構わない、が伝わる置き方にする。
//
// ══════════════════════════════════════════════════
// 本文は出さない
// ══════════════════════════════════════════════════
// 一覧で全部読ませない。取ってから読めばよい。
// 何の相談で、誰の話で、どのくらいかが分かれば足りる。
//
// ══════════════════════════════════════════════════
// 取り合いに負けたとき
// ══════════════════════════════════════════════════
// 「エラーが発生しました」で終わらせない。
// もう取られた、確認がまだ、受けない設定にしてある。
// どれなのかで、次にやることが違う。

export default function InviteQueue({
  token,
  items,
}: {
  token: string;
  items: OpenInvite[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [gone, setGone] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const list = items.filter((x) => !gone.includes(x.id));

  async function take(id: string) {
    if (busy) return;
    setBusy(id);
    setError(null);
    try {
      const res = await fetch("/api/responder/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, invite: id }),
      });
      const j = await res.json();
      if (!res.ok || !j.reply) {
        // 取り合いに負けただけ。消して、次へ進めるようにする。
        setError(j.error ?? "取れませんでした");
        setGone((g) => [...g, id]);
        setBusy(null);
        return;
      }
      track("invite_claimed", {});
      router.push(`/r/${j.reply}`);
    } catch {
      setError("通信できませんでした。もう一度お試しください。");
      setBusy(null);
    }
  }

  if (list.length === 0) {
    return (
      <div className="rounded-card border border-line bg-mist px-5 py-5">
        <p className="text-[14px] font-bold text-slate">いま答えられる相談はありません</p>
        <p className="mt-2 text-[13px] leading-[1.85] text-steel">
          新しい相談が来ると、ここに出ます。取らなくても構いません。
        </p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <p className="mb-3 rounded-soft bg-mist px-4 py-3 text-[13px] leading-[1.8] text-slate">
          {error}
        </p>
      )}

      <ul className="flex flex-col gap-2.5">
        {list.map((x) => (
          <li
            key={x.id}
            className="rounded-card border border-line bg-paper px-4 py-4 shadow-card"
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-[13.5px] font-black text-slate">
                {isCategoryId(x.category) ? category(x.category).label : x.category}
              </span>
              {x.is_ab && (
                <span className="rounded-pill bg-brand-tint px-2 py-1 text-[10.5px] font-bold text-brand-deep">
                  AとBを比べる
                </span>
              )}
            </div>

            <p className="mt-1.5 text-[12.5px] leading-[1.75] text-steel">
              {x.asker_age_band ? `${x.asker_age_band}歳の男性` : "年代は未回答"}
              {x.other_age_band && ` / 相手は${x.other_age_band}歳`}
            </p>
            <p className="mt-0.5 text-[12px] text-steel">
              30秒で読めます。答えるのは3〜5分です。
            </p>

            <button
              type="button"
              onClick={() => take(x.id)}
              disabled={busy !== null}
              className="mt-3 inline-flex min-h-[48px] w-full items-center justify-center rounded-pill bg-brand px-5 text-[14.5px] font-bold text-paper shadow-card disabled:bg-mist disabled:text-steel"
            >
              {busy === x.id ? "取っています…" : "これに答える"}
            </button>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-[12px] leading-[1.8] text-steel">
        取らなくても構いません。ノルマはありません。
      </p>
    </div>
  );
}
