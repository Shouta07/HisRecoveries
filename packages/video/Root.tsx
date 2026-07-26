import React from "react";
import { Composition } from "remotion";
import { RoadmapVideo, roadmapDuration, type RoadmapData } from "./lib/RoadmapVideo";
import { VIDEO } from "./lib/theme";
import { jibunmigaki } from "./data/jibunmigaki";
import { akanuke } from "./data/akanuke";

// 記事→動画の一覧。新しい動画は data を1つ足して、ここに1行追加するだけ。
const VIDEOS: { id: string; data: RoadmapData }[] = [
  { id: "Jibunmigaki", data: jibunmigaki },
  { id: "Akanuke", data: akanuke },
];

export const RemotionRoot: React.FC = () => {
  return (
    <>
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
