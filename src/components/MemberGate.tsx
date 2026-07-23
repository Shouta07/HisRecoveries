"use client";

// /member を LINE LIFF として動かすゲート。
// - NEXT_PUBLIC_LIFF_ID が設定され、LINE の中（またはLIFFブラウザ）で開かれた場合：
//   liff.init → 未ログインなら liff.login() → プロフィール取得 → ダッシュボード表示。
// - LIFF ID 未設定／取得失敗時：従来の cookie セッション（デモ/サーバーLINEログイン）に
//   フォールバックする（壊れない）。
//
// ※ 表示データ（Accord フィード）は現状デモ。実データは lineUserId を鍵に
//    バックエンド（Accord API）から取得する設計（別途）。ここでは認証の配線までを担う。
import { useEffect, useState } from "react";
import liff from "@line/liff";
import MemberApp from "@/components/MemberApp";

type Session = { name: string; demo?: boolean } | null;

export default function MemberGate({
  session,
  lineEnabled,
}: {
  session: Session;
  lineEnabled: boolean;
}) {
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID ?? "";
  const [phase, setPhase] = useState<"init" | "ready" | "fallback">(
    liffId ? "init" : "fallback",
  );
  const [liffSession, setLiffSession] = useState<Session>(null);

  useEffect(() => {
    if (!liffId) return;
    let cancelled = false;
    (async () => {
      try {
        await liff.init({ liffId });
        if (!liff.isLoggedIn()) {
          liff.login(); // LINE ログインへリダイレクト
          return;
        }
        const p = await liff.getProfile();
        if (cancelled) return;
        setLiffSession({ name: p.displayName });
        setPhase("ready");
      } catch {
        if (!cancelled) setPhase("fallback");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [liffId]);

  if (liffId && phase === "init") {
    return (
      <div className="mx-auto max-w-[420px] px-6 py-24 text-center">
        <div className="mx-auto mb-4 h-7 w-7 rounded-full border-2 border-[#85AB8B]/40 border-t-[#3d5638] animate-spin" />
        <p className="text-[13px] text-[#6b7a66] leading-[1.9]">LINE と連携しています…</p>
      </div>
    );
  }

  // LIFF 認証済みなら LINE プロフィールのセッション、そうでなければ従来セッション。
  const effective = phase === "ready" ? liffSession : session;
  return <MemberApp session={effective} lineEnabled={lineEnabled || !!liffId} />;
}
