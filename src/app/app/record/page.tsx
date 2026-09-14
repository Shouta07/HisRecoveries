"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  load, jpDate, FEEL_LABEL, NATURAL_LABEL, LEGACY_KIND_LABEL, type Store,
} from "@/lib/relationship";
import { Node } from "@/components/app/Line";
import { Screen, Ask, Note, Action, Empty, Loading } from "@/components/app/system";
import { track } from "@/lib/analytics";

// 記録の一覧。
//
// ── 一覧表にしない ────────────────────────────────
// 1件ずつを白い角丸カードに入れると、案件の一覧に見える（§04）。
// 縦に1本の線を引いて、その上に置いていく。
// 線は時間そのもので、点が「その日、何か感じた」という印になる。
//
// ── 消すボタンを全部の行に出さない ────────────────
// 前の版は全カードに「この記録を消す」が常時あった。
// 読み返す画面に、消す誘いが毎行あるのはおかしい。消すのは詳細で。

export default function Records() {
  const [s, setS] = useState<Store | null>(null);

  useEffect(() => {
    setS(load());
  }, []);

  if (!s) return <Loading />;

  return (
    <Screen>
      <Ask>記録</Ask>
      <div className="mt-3">
        <Note>
          {s.entries.length > 0
            ? `${s.entries.length}件。この端末の中だけにあります。`
            : "この端末の中だけに残ります。"}
        </Note>
      </div>

      <div className="mt-7">
        <Action href="/app/new" onClick={() => track("app_record_start", { from: "record" })}>
          今日のことを残す
        </Action>
      </div>

      <div className="mt-10">
        {s.entries.length === 0 ? (
          <Empty
            title="まだ記録はありません。"
            body="会った日や、何か感じた日に残してみてください。長い日記は要りません。選ぶだけでも記録になります。"
            action="最初の記録を残す"
            href="/app/new"
          />
        ) : (
          <ol className="relative ml-1 border-l border-hairline pl-6">
            {s.entries.map((e, i) => (
              <li key={e.id} className="relative pb-8 last:pb-0">
                <Node filled={i === 0} />
                <Link href={`/app/record/${e.id}`} className="block">
                  <p className="text-[12.5px] text-faint">{jpDate(e.date)}</p>
                  <p className="mt-1 text-[15.5px] font-bold leading-[1.7] text-charcoal">
                    {e.feel
                      ? FEEL_LABEL[e.feel]
                      : e.kind
                        ? LEGACY_KIND_LABEL[e.kind]
                        : "記録"}
                    {e.natural && (
                      <span className="ml-2.5 text-[13px] font-normal text-faint">
                        自然体：{NATURAL_LABEL[e.natural]}
                      </span>
                    )}
                  </p>
                  {(e.note || e.noticed) && (
                    <p className="mt-1.5 line-clamp-2 text-[14px] leading-[1.9] text-bodytext">
                      {e.note || e.noticed}
                    </p>
                  )}
                  {e.reflect && (
                    <p className="mt-1.5 text-[13px] leading-[1.85] text-faint">
                      あとから：{e.reflect}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>
    </Screen>
  );
}
