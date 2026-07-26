import React from "react";
import { Composition } from "remotion";
import { Jibunmigaki } from "./compositions/Jibunmigaki";
import { VIDEO } from "./lib/theme";

// 新しい動画はここに <Composition> を足す（記事→動画の量産口）。
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Jibunmigaki"
        component={Jibunmigaki}
        durationInFrames={1020}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />
    </>
  );
};
