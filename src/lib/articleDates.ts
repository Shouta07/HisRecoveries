// 記事ごとの公開日。
//
// これまで全55本が datePublished: "2026-06-01" のハードコードで、
// 55本すべてが同じ日に公開されたことになっていた。検索結果に出る日付も、
// 「新しい記事」の並びも、そこから正しく作れない。
//
// 値は git の履歴から取った。各 slug が最初にコミットされた日＝公開日。
// 推測ではなく実際の記録なので、ここに嘘は入らない。
//
// ── 記事を足したとき ──────────────────────────────────
// このファイルに slug と日付を足す。書き忘れると PUBLISHED_AT の参照が
// undefined になり、記事ページは日付を出さない（間違った日付は出ない）。
//
// ── 更新日を書いていない理由 ────────────────────────────
// 「いつ中身が変わったか」を git から正確に取る方法がない
// （タイトルや本文の修正は slug を含まない行の変更として入るため）。
// 確かめられないものは書かない、という方針でここは公開日だけにしている。

export const PUBLISHED_AT: Record<string, string> = {
  "aga-early-signs": "2026-07-08",
  "aga-self-check": "2026-07-08",
  "fuke-mie-genin": "2026-07-08",
  "mayu-totonoe": "2026-07-08",
  "mens-makeup-hajimete": "2026-07-08",
  "nikibiato-genin": "2026-07-08",
  "omiai-fukusou-men": "2026-07-08",
  "otona-nikibi-genin": "2026-07-08",
  "seiketsukan-tsukurikata": "2026-07-08",
  "shashin-utsuri": "2026-07-08",
  "taimou-koi-genin": "2026-07-08",
  "men-akanuke-junban": "2026-07-10",
  "otoko-jibunmigaki-hajimekata": "2026-07-10",
  "30dai-seiketsukan": "2026-07-11",
  "aga-kensa-wakaru": "2026-07-11",
  "aga-online-nagare": "2026-07-11",
  "date-zenjitsu-mijitaku": "2026-07-11",
  "fuku-size-silhouette": "2026-07-11",
  "hyoujou-egao-tsukurikata": "2026-07-11",
  "kokkaku-ni-awaseru": "2026-07-11",
  "kusege-ikasu-kamigata": "2026-07-11",
  "mens-hairstyle-seiketsukan": "2026-07-11",
  "mens-skincare-junban": "2026-07-11",
  "mensetsu-daiichiinsho": "2026-07-11",
  "mitame-jishin": "2026-07-11",
  "rinkaku-betsu-kamigata": "2026-07-11",
  "shiraga-bokashi": "2026-07-11",
  "shisei-insho-neko-ze": "2026-07-11",
  "shukan-shikumi": "2026-07-11",
  "sleep-totonoe": "2026-07-11",
  "tsukare-gao-kuma": "2026-07-11",
  "tsukare-ketsueki-genchi": "2026-07-11",
  "aga-counseling-kakunin": "2026-07-13",
  "dousoukai-mitame-junbi": "2026-07-13",
  "eigyou-business-daiichiinsho": "2026-07-13",
  "hifuka-biyou-self-seiri": "2026-07-13",
  "kaerareru-yousso-junban": "2026-07-13",
  "kekkonshiki-mijitaku-men": "2026-07-13",
  "nioi-taishu-care-seiketsukan": "2026-07-13",
  "totonoeru-herasu-erabu": "2026-07-13",
  "aohige-genin-taisho": "2026-07-15",
  "hourei-sen-kininaru": "2026-07-15",
  "jiko-toushi-doko-kara": "2026-07-15",
  "kenkou-shindan-genchi": "2026-07-15",
  "mukumi-gao-asa": "2026-07-15",
  "otoko-kansou-inner-dry": "2026-07-15",
  "sunege-udege-totonoe": "2026-07-15",
  "tsukare-yasusa-toshi": "2026-07-15",
  "aga-hiyou-kangae": "2026-07-21",
  "datsumou-hiyou-kangae": "2026-07-21",
  "hatsu-date-fukusou": "2026-07-22",
  "kanojo-dekinai-mitame": "2026-07-22",
  "machikon-gokon-midashinami": "2026-07-22",
  "matching-app-shashin": "2026-07-22",
  "seiketsukan-shoutai-5": "2026-07-22",
};

/** 公開日（YYYY-MM-DD）。未登録なら undefined */
export function publishedAt(slug: string): string | undefined {
  return PUBLISHED_AT[slug];
}

/** 表示用（2026.07.08） */
export function formatDate(d: string): string {
  return d.replace(/-/g, ".");
}

/** 新しい順に並べ替える。日付が同じものは元の順（編集の並び）を保つ */
export function byNewest<T extends { slug: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => (PUBLISHED_AT[b.slug] ?? "").localeCompare(PUBLISHED_AT[a.slug] ?? ""));
}
