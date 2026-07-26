"use client";

// 人生シーン → パッケージ編成 の一続き。
//
// OccasionGrid（目的を選ぶ）と PackagePlanner（組む）は、
// LP 上では別セクションに見えるが、実際にはひとつの導線なので
// 選ばれたシーンをここで持ち、両方に配る。
// page.tsx は server component のままにしておきたいので、
// 状態を持つのはこの薄いクライアント層だけに閉じる。

import { useState } from "react";
import OccasionGrid from "@/components/OccasionGrid";
import PackagePlanner, { type DiagArticle } from "@/components/PackagePlanner";
import type { OccasionId } from "@/lib/occasions";

export default function SceneFlow({ articles }: { articles: Record<string, DiagArticle[]> }) {
  const [occasionId, setOccasionId] = useState<OccasionId | null>(null);

  function pick(id: OccasionId) {
    setOccasionId(id);
    // 選んだら、そのまま組むところまで連れていく（選んで終わり、にしない）。
    if (typeof document !== "undefined") {
      document.getElementById("diagnosis")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function clear() {
    setOccasionId(null);
    if (typeof document !== "undefined") {
      document.getElementById("occasions")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <>
      <OccasionGrid selected={occasionId} onSelect={pick} />
      <PackagePlanner articles={articles} occasionId={occasionId} onClearOccasion={clear} />
    </>
  );
}
