"use client";

import { useEffect, useRef } from "react";

/**
 * Boomerang background video: plays forward once while capturing frames,
 * then ping-pongs (forward↔reverse) on a canvas for a seamless loop.
 * Ported from the Claude Design "His Recoveries Boomerang Hero" export.
 * Respects prefers-reduced-motion (shows the first frame, no motion).
 */
export default function BoomerangVideo({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const reduce =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    const frames: HTMLCanvasElement[] = [];
    let capturing = true;
    let rafId = 0;
    let playId = 0;
    let lastTime = -1;
    const MAX_WIDTH = 960;

    const captureFrame = () => {
      if (!capturing || video.readyState < 2) return;
      if (video.currentTime === lastTime) return;
      lastTime = video.currentTime;
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (!vw || !vh) return;
      const scale = Math.min(1, MAX_WIDTH / vw);
      const w = Math.round(vw * scale);
      const h = Math.round(vh * scale);
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const cx = c.getContext("2d");
      if (!cx) return;
      cx.drawImage(video, 0, 0, w, h);
      frames.push(c);
    };

    const hasVFC = typeof video.requestVideoFrameCallback === "function";

    const rafLoop = () => {
      captureFrame();
      if (capturing) rafId = requestAnimationFrame(rafLoop);
    };
    const vfcLoop = () => {
      captureFrame();
      if (capturing && video.requestVideoFrameCallback)
        video.requestVideoFrameCallback(vfcLoop);
    };

    const startBoomerang = () => {
      const cv = canvasRef.current;
      if (!cv || frames.length === 0) return;
      video.style.display = "none";
      cv.style.display = "block";
      const ctx = cv.getContext("2d");
      if (!ctx) return;
      cv.width = frames[0].width;
      cv.height = frames[0].height;
      let index = 0;
      let direction = 1;
      let last = performance.now();
      const interval = 1000 / 30;
      const render = (now: number) => {
        if (now - last >= interval) {
          last = now;
          ctx.drawImage(frames[index], 0, 0);
          index += direction;
          if (index >= frames.length - 1) {
            index = frames.length - 1;
            direction = -1;
          } else if (index <= 0) {
            index = 0;
            direction = 1;
          }
        }
        playId = requestAnimationFrame(render);
      };
      playId = requestAnimationFrame(render);
    };

    const onEnded = () => {
      capturing = false;
      startBoomerang();
    };

    const onLoaded = () => {
      if (reduce) {
        // Show a single still frame, no motion.
        video.currentTime = 0.01;
        return;
      }
      video.play().catch(() => {});
      if (hasVFC) video.requestVideoFrameCallback(vfcLoop);
      else rafId = requestAnimationFrame(rafLoop);
    };

    video.addEventListener("loadedmetadata", onLoaded);
    video.addEventListener("ended", onEnded);
    if (video.readyState >= 1) onLoaded();

    return () => {
      capturing = false;
      if (rafId) cancelAnimationFrame(rafId);
      if (playId) cancelAnimationFrame(playId);
      video.removeEventListener("loadedmetadata", onLoaded);
      video.removeEventListener("ended", onEnded);
    };
  }, [src]);

  return (
    <>
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover"
        style={{ display: "block" }}
        muted
        playsInline
        preload="auto"
        aria-hidden
      />
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover"
        style={{ display: "none" }}
        aria-hidden
      />
    </>
  );
}
