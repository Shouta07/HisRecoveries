// Studio（管理・分析）のデータ層。
// 記事（clusters）と、生成済み動画（packages/video）を突き合わせて、
// 「何が記事化され、何が動画化され、どこが手薄か」を数字で見えるようにする。
//
// 動画は別パッケージ（@hr/video / packages/video）で、Web からは直接 import
// できないため、ここに **手動レジストリ** を持つ。packages/video/Root.tsx の
// VIDEOS に1行足したら、ここにも1行足す（source = 元記事の areaId/slug）。

import { clusters, type ClusterArticle } from "./clusters";

// ── /areas のエリア表示名（clusters の areaId 用） ──────────────────
export const AREA_LABELS: Record<string, string> = {
  impression: "第一印象",
  hair: "髪・薄毛",
  skin: "肌",
  face: "顔",
  "body-hair": "髭・体毛",
  mind: "メンタル",
};

export function areaLabel(areaId: string): string {
  return AREA_LABELS[areaId] ?? areaId;
}

// ── 生成済み動画レジストリ（packages/video を反映） ─────────────────
export type VideoStatus = "rendered" | "draft";

export type VideoEntry = {
  /** Remotion コンポジションID（packages/video/Root.tsx の id と一致） */
  compositionId: string;
  /** 動画の見出し（管理用の呼び名） */
  title: string;
  /** 元記事 */
  areaId: string;
  slug: string;
  /** 尺（秒・目安） */
  seconds: number;
  /** レンダリング状態。out/ に mp4 を出したら "rendered"。 */
  status: VideoStatus;
  /** レンダリングコマンド（packages/video で実行） */
  renderScript: string;
  format: "short"; // 9:16 縦（Threads/Reels/Shorts）
};

export const VIDEO_REGISTRY: VideoEntry[] = [
  {
    compositionId: "Jibunmigaki",
    title: "自分磨き、何から？",
    areaId: "impression",
    slug: "otoko-jibunmigaki-hajimekata",
    seconds: 18,
    status: "rendered",
    renderScript: "npm run render:jibunmigaki -w @hr/video",
    format: "short",
  },
  {
    compositionId: "Akanuke",
    title: "垢抜けは、要素の入れ替え",
    areaId: "impression",
    slug: "men-akanuke-junban",
    seconds: 18,
    status: "rendered",
    renderScript: "npm run render:akanuke -w @hr/video",
    format: "short",
  },
];

// ── 突き合わせ ─────────────────────────────────────────────────────
export type StudioRow = {
  areaId: string;
  slug: string;
  title: string;
  track: "recover" | "refine" | undefined;
  kind: ClusterArticle["kind"];
  href: string;
  video: VideoEntry | undefined;
};

export type TrackStat = { recover: number; refine: number; untracked: number };

export type StudioData = {
  rows: StudioRow[];
  totals: {
    articles: number;
    videos: number;
    videosRendered: number;
    coveragePct: number; // 記事のうち動画がある割合
  };
  track: TrackStat;
  /** track 別の動画本数（Refine が動画向き＝SNSで育てる） */
  trackVideos: TrackStat;
  /** areaId 別の記事数・動画数 */
  byArea: {
    areaId: string;
    label: string;
    articles: number;
    videos: number;
    recover: number;
    refine: number;
  }[];
  /** 動画が無い Refine 記事（＝次に動画化すべき候補） */
  refineWithoutVideo: StudioRow[];
};

function keyOf(areaId: string, slug: string): string {
  return `${areaId}/${slug}`;
}

export function buildStudioData(): StudioData {
  const videoByKey = new Map<string, VideoEntry>();
  for (const v of VIDEO_REGISTRY) videoByKey.set(keyOf(v.areaId, v.slug), v);

  const rows: StudioRow[] = clusters.map((c) => ({
    areaId: c.areaId,
    slug: c.slug,
    title: c.title,
    track: c.track,
    kind: c.kind,
    href: `/areas/${c.areaId}/${c.slug}`,
    video: videoByKey.get(keyOf(c.areaId, c.slug)),
  }));

  const track: TrackStat = { recover: 0, refine: 0, untracked: 0 };
  const trackVideos: TrackStat = { recover: 0, refine: 0, untracked: 0 };
  for (const r of rows) {
    const bucket = r.track ?? "untracked";
    track[bucket] += 1;
    if (r.video) trackVideos[bucket] += 1;
  }

  const areaMap = new Map<
    string,
    { articles: number; videos: number; recover: number; refine: number }
  >();
  for (const r of rows) {
    const cur =
      areaMap.get(r.areaId) ?? { articles: 0, videos: 0, recover: 0, refine: 0 };
    cur.articles += 1;
    if (r.video) cur.videos += 1;
    if (r.track === "recover") cur.recover += 1;
    if (r.track === "refine") cur.refine += 1;
    areaMap.set(r.areaId, cur);
  }
  const byArea = [...areaMap.entries()]
    .map(([areaId, v]) => ({ areaId, label: areaLabel(areaId), ...v }))
    .sort((a, b) => b.articles - a.articles);

  const videosRendered = VIDEO_REGISTRY.filter((v) => v.status === "rendered").length;
  const articles = rows.length;
  const videos = VIDEO_REGISTRY.length;

  const refineWithoutVideo = rows.filter((r) => r.track === "refine" && !r.video);

  return {
    rows,
    totals: {
      articles,
      videos,
      videosRendered,
      coveragePct: articles ? Math.round((videos / articles) * 100) : 0,
    },
    track,
    trackVideos,
    byArea,
    refineWithoutVideo,
  };
}
