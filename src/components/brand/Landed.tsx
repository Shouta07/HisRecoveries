"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

// 来訪を1回だけ数える。
//
// ── なぜ要るか ────────────────────────────────────
// 購入率の分母。これが無いと、広告の管理画面のクリック数を
// 分母にするしかなくなる。クリックと着地は一致しない（戻る・重い・
// 読み込み前に離れる）ので、増やすか止めるかの判断が数%ずれる。
//
// ── 1来訪につき1回 ────────────────────────────────
// ページを移るたびに送ると、よく読む人ほど分母を膨らませて、
// 率が下がって見える。sessionStorage で1回に絞る。
//
// ── PVは追わない ──────────────────────────────────
// 送るのは最初の1回と、どこに着地したかだけ。

const KEY = "hr_landed";

export default function Landed() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem(KEY) === "1") return;
      sessionStorage.setItem(KEY, "1");
    } catch {
      // プライベートウィンドウなどで読めないことがある。
      // そのときは数えない（二重に数えるより、数えないほうがまし）。
      return;
    }
    track("site_landed", { path: window.location.pathname });
  }, []);

  return null;
}
