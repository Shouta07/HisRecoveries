"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { load, clearAll, type Store } from "@/lib/relationship";
import { statsEnabled, setStatsEnabled } from "@/lib/analytics";
import { Screen, Ask, Head, Note, Rule, Action, Loading } from "@/components/app/system";

// 設定（§36）。
//
// ── 消し方を隠さない ──────────────────────────────
// 恋愛の記録は、消したくなる日がある。
// 「設定 → アカウント → データ管理 → 削除」の底に置かない。
// この画面の中に、はっきり置く。
//
// ── 切れないものを「切れます」と書かない ────────────
// 記録は端末の外に出ていないので、学習に使うも何もない。
// 実際に外へ出ているのは匿名の行動計測だけ。切れるのはそこだけ。
// できないことをスイッチにすると、privacy が飾りになる。

export default function Settings() {
  const router = useRouter();
  const [s, setS] = useState<Store | null>(null);
  const [stats, setStats] = useState(true);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    setS(load());
    setStats(statsEnabled());
  }, []);

  if (!s) return <Loading />;

  return (
    <Screen>
      <button
        type="button"
        onClick={() => router.push("/app/me")}
        className="inline-flex min-h-[44px] items-center text-[13.5px] text-faint transition-colors hover:text-accent"
      >
        ← 自分
      </button>

      <div className="mt-3">
        <Ask>
          自分のことだから、
          <br />
          自分で決める。
        </Ask>
      </div>

      <section className="mt-9">
        <Head>記録の置き場所</Head>
        <p className="mt-3 text-[15px] leading-[1.95] text-bodytext">
          記録はこの端末の中（ブラウザの保存領域）にだけあります。
          こちらのサーバーには送っていません。だから、こちらから読むことも、
          復元することもできません。端末やブラウザを変えると、記録は移りません。
        </p>
      </section>

      <div className="mt-10">
        <Rule />
      </div>

      <section className="mt-8">
        <Head>匿名の利用計測</Head>
        <p className="mt-3 text-[15px] leading-[1.95] text-bodytext">
          どの画面で止まりやすいかを直すために、
          「記録を始めた」「記録を残した」といった操作の回数だけを匿名で送っています。
          書いた内容は含みません。ここで止められます。
        </p>
        <button
          type="button"
          role="switch"
          aria-checked={stats}
          onClick={() => {
            const next = !stats;
            setStats(next);
            setStatsEnabled(next);
          }}
          className="mt-4 flex min-h-[52px] w-full items-center justify-between rounded-[8px] border border-hairline px-4 text-left transition-colors hover:border-accent"
        >
          <span className="text-[15px] text-charcoal">利用計測を送る</span>
          <span
            aria-hidden
            className={`relative block h-[26px] w-[44px] shrink-0 rounded-full transition-colors duration-200 ${
              stats ? "bg-accent" : "bg-hairline"
            }`}
          >
            <span
              className={`absolute top-[3px] block h-5 w-5 rounded-full bg-white transition-[left] duration-200 ${
                stats ? "left-[21px]" : "left-[3px]"
              }`}
            />
          </span>
        </button>
      </section>

      <div className="mt-10">
        <Rule />
      </div>

      <section className="mt-8">
        <Head>消す</Head>
        <p className="mt-3 text-[15px] leading-[1.95] text-bodytext">
          1件ずつ消す場合は、その記録を開いてください。
          ここでは、記録と現在地をまとめて消せます。
        </p>
        <p className="mt-3 text-[14px] text-faint">
          いま {s.entries.length}件 あります。
        </p>
        <div className="mt-5">
          {!confirm ? (
            <Action quiet onClick={() => setConfirm(true)}>
              すべての記録を消す
            </Action>
          ) : (
            <div className="rounded-[12px] border border-accent bg-accent-tint px-4 py-4">
              <p className="text-[14.5px] leading-[1.9] text-charcoal">
                記録 {s.entries.length}件と、現在地を消します。元に戻せません。
              </p>
              <div className="mt-4 flex gap-2.5">
                <Action
                  onClick={() => {
                    clearAll();
                    setS(load());
                    setConfirm(false);
                  }}
                >
                  消す
                </Action>
                <Action quiet onClick={() => setConfirm(false)}>
                  やめる
                </Action>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="mt-12">
        <Note>
          個人情報の扱い全般は{" "}
          <Link href="/privacy" className="text-accent underline underline-offset-4">
            プライバシーポリシー
          </Link>{" "}
          に書いています。
        </Note>
      </div>
    </Screen>
  );
}
