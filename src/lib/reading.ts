// 記事ページの共通ヘルパー。
//
// 目次・読了時間・「同じ状況の人が読んでいる記事」を、記事ページと領域ページで
// 同じ計算で出すために切り出している。
//
// なぜ回遊を作るか：検索から来る人はほぼ記事に着地して、そのまま戻る。
// 1セッションで2本目に進むかどうかが、そのままPVの倍率になる。
// 同じ分野の記事を並べるだけだと「薄毛の人には薄毛の記事」しか出せないので、
// 状況（結婚式・婚活・面接）の軸で分野をまたいで繋ぐ。

import { clusters, type ClusterArticle } from "@/lib/clusters";
import { SITUATIONS, situationsOf } from "@/lib/situations";

/** 見出しから安定した id を作る（目次のアンカー） */
export function headingId(index: number): string {
  return `s${index + 1}`;
}

/**
 * 読了時間（分）。日本語なので文字数で数える。
 * 一般的な日本語の黙読速度 400〜600字/分の下限側を取り、切り上げる。
 */
export function readingMinutes(a: ClusterArticle): number {
  const chars =
    a.lead.length +
    a.summary.join("").length +
    a.sections.reduce((n, s) => n + s.h.length + s.body.length, 0) +
    a.faqs.reduce((n, f) => n + f.q.length + f.a.length, 0);
  return Math.max(1, Math.ceil(chars / 400));
}

/** 概算の文字数（Article schema の wordCount に使う） */
export function charCount(a: ClusterArticle): number {
  return (
    a.lead.length +
    a.sections.reduce((n, s) => n + s.h.length + s.body.length, 0) +
    a.faqs.reduce((n, f) => n + f.q.length + f.a.length, 0)
  );
}

export type SituationLink = {
  situationId: string;
  situationLabel: string;
  items: ClusterArticle[];
};

/**
 * 同じ状況に属する、別分野の記事。
 * 「結婚式に呼ばれた」から来た人に、髪の記事と眉の記事と服の記事を渡す。
 * 分野が同じものは「関連記事」側で出るので、ここでは分野をまたぐものを優先する。
 */
export function sameSituationArticles(a: ClusterArticle, limit = 4): SituationLink[] {
  const ids = situationsOf(a.slug);
  if (ids.length === 0) return [];

  const out: SituationLink[] = [];
  const used = new Set<string>([a.slug]);

  for (const id of ids) {
    const s = SITUATIONS.find((x) => x.id === id);
    if (!s) continue;
    const items = s.slugs
      .filter((slug) => !used.has(slug))
      .map((slug) => clusters.find((c) => c.slug === slug))
      .filter((x): x is ClusterArticle => Boolean(x))
      // 分野をまたぐものを先に
      .sort((p, q) => Number(p.areaId === a.areaId) - Number(q.areaId === a.areaId))
      .slice(0, limit);
    if (items.length === 0) continue;
    items.forEach((x) => used.add(x.slug));
    out.push({ situationId: s.id, situationLabel: s.label, items });
  }

  // 状況が多い記事でも、出すのは2ブロックまで。並べすぎると選べなくなる。
  return out.slice(0, 2);
}
