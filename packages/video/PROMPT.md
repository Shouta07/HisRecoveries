# 記事 → Shorts（Remotion）量産プロンプト

一次情報の記事1本を、縦動画（9:16 Shorts / Reels）の `RoadmapData`(JSON) に変換する
ための AI 指示書。出力は `data/<slug>.ts` にそのまま貼れる形にする。生成後は
`lib/validate.ts` の `validateRoadmapData` で機械チェック（バンドル時にも自動で走る）。

## これは何のテンプレか

「整える順番」型。悩み → 順番に3〜4手 → 締め、という構成の記事に合う
（例：「◯◯は何から？」「××の順番」「習慣の作り方」）。効果を語る記事や
比較記事には向かない（別テンプレを使う）。

## 出力する型

```ts
export const <slug>: RoadmapData = {
  eyebrow: "His Recoveries",
  hook:    [{ text: "…" }, { text: "…" }],        // 大見出し（1〜2行・掴み）
  problem: {
    lead:  [{ text: "…" }, { text: "…" }],        // 弱い前振り
    punch: [{ text: "…" }, { text: "…", accent: "…" }], // 言い切り。accentは1語だけ強調
  },
  steps: [                                         // 3〜4手（最大6）
    { n: "01", t: "短い見出し", d: "一文の補足。" },
    …
  ],
  close: {
    lead:  [{ text: "…" }],                        // 引き
    punch: [{ text: "…", accent: "…" }],           // 締めの一言
  },
};
```

## 制約（validate.ts と一致・破ると弾かれる）

- 文字数目安（大フォントで折り返すと崩れる）:
  hook/lead 1行 ≤ 12 / problem.punch ≤ 14 / close.punch ≤ 14 /
  step.t ≤ 16 / step.d ≤ 42。
- steps は 3〜4 を推奨（最大6）。1手＝1メッセージ。
- `accent` は必ず text に含まれる1語。強調は各パンチで1語まで。

## トーン（ブランド絶対ルール）

- **断定・医療表現をしない**（治る/若返る/必ず/絶対/確実/ビフォーアフター）＝薬機法・景表法。
- **煽らない・責めない・見下さない**（ダサい/不潔/老けてる/情けない/男はみんな 禁止）。
- 静かに、順番だけを置く。「一気にやらない・1つずつ」の設計思想を締めに滲ませる。
- 一次情報（記事）の範囲を超える新事実を作らない。記事の要点を圧縮するだけ。

## 手順

1. 対象記事（`/areas/<areaId>/<slug>`）の要点・順番を抽出。
2. 上記の型で JSON を生成（制約・トーン厳守）。
3. `data/<slug>.ts` に保存 → `Root.tsx` の `VIDEOS` に1行追加。
4. `src/lib/studio.ts`（Web側）の `VIDEO_REGISTRY` にも1行追加（Studio に出す）。
5. `npm run render:<slug> -w @hr/video` で書き出し。警告が出たら文言を直す。
