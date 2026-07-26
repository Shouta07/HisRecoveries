# @hr/video — Remotion 動画

記事 → 縦動画（Shorts/Reels）の量産（`docs/AI_MARKETING_ENGINE.md` §3-⑤）。

## 使い方

```bash
# 編集プレビュー（ブラウザが開く。テキスト差し替えが即反映）
npm run video:studio            # ルートから（= npm -w @hr/video run studio）

# 書き出し（このパッケージ内で）
cd packages/video
npm run render:jibunmigaki      # → packages/video/out/jibunmigaki.mp4
npm run render:akanuke
```

## 新しい動画を1本足す（数分）

1. `data/xxx.ts` に文言を書く（`RoadmapData` 型。フック・問題・ステップ・締め）。
   - AIに「この記事から RoadmapData のオブジェクトを出して」と指示 → 貼るだけでよい。
2. `Root.tsx` の `VIDEOS` 配列に `{ id: "Xxx", data: xxx }` を1行足す。
3. `remotion render index.ts Xxx out/xxx.mp4 --browser-executable=<chrome>`。

## 構成

| ファイル | 役割 |
|---|---|
| `lib/RoadmapVideo.tsx` | 汎用テンプレート（全動画で共通・触らない） |
| `lib/theme.ts` / `lib/fonts.ts` | ブランド色・Noto Sans JP（`public/fonts` からオフライン読込） |
| `data/*.ts` | 記事1本ぶんの文言だけ |
| `Root.tsx` / `index.ts` | Composition 一覧の登録 |

## レンダリングの前提（CI/ローカル）

Remotion は headless Chromium と ffmpeg が要る。

- このサンドボックスはプリインストール済み → `--browser-executable` で指定。
- まっさらな環境/CIでは、先に `npx remotion install`（Chromium/ffmpeg を取得）。

`out/` は成果物なので gitignore。
