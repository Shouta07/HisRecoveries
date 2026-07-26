import React from "react";
import { Composition } from "remotion";
import { RoadmapVideo, roadmapDuration, type RoadmapData } from "./lib/RoadmapVideo";
import { BrandReel, brandReelDuration } from "./lib/BrandReel";
import { validateRoadmapData, validateBrandReelData } from "./lib/validate";
import { VIDEO } from "./lib/theme";
import { REEL } from "./lib/brand";
import { reelBrand } from "./data/reel-brand";
import { jibunmigaki } from "./data/jibunmigaki";
import { akanuke } from "./data/akanuke";
import { skincare } from "./data/skincare";
import { shukan } from "./data/shukan";

// 記事→動画の一覧。新しい動画は data を1つ足して、ここに1行追加するだけ。
// AI に data(JSON) を生成させる場合の型・制約は PROMPT.md、検査は lib/validate.ts。
const VIDEOS: { id: string; data: RoadmapData }[] = [
  { id: "Jibunmigaki", data: jibunmigaki },
  { id: "Akanuke", data: akanuke },
  { id: "Skincare", data: skincare },
  { id: "Shukan", data: shukan },
];

// バンドル時に全 data を検証。壊れ・はみ出し・禁止語があればログに出す（量産の安全網）。
for (const { id, data } of VIDEOS) {
  const errors = validateRoadmapData(data);
  if (errors.length > 0) {
    // eslint-disable-next-line no-console
    console.warn(`[roadmap:${id}] 検証エラー:\n  - ${errors.join("\n  - ")}`);
  }
}

// ブランドリール（記事→動画の量産テンプレとは別系統。30秒・認知獲得用）。
{
  const errors = validateBrandReelData(reelBrand);
  if (errors.length > 0) {
    // eslint-disable-next-line no-console
    console.warn(`[reel:BrandReel] 検証エラー:\n  - ${errors.join("\n  - ")}`);
  }
}

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="BrandReel"
        component={BrandReel}
        durationInFrames={brandReelDuration()}
        fps={REEL.fps}
        width={REEL.width}
        height={REEL.height}
        defaultProps={{ data: reelBrand }}
      />

      {VIDEOS.map(({ id, data }) => (
        <Composition
          key={id}
          id={id}
          component={RoadmapVideo}
          durationInFrames={roadmapDuration(data)}
          fps={VIDEO.fps}
          width={VIDEO.width}
          height={VIDEO.height}
          defaultProps={{ data }}
        />
      ))}
    </>
  );
};
