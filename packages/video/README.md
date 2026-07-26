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
npm run render:skincare
npm run render:shukan
npm run render:all              # 全部まとめて
```

現在の在庫: Jibunmigaki / Akanuke / Skincare / Shukan（すべて 9:16・18〜20秒）。

## 新しい動画を1本足す（数分）— AIで量産する

1. **AIに記事から `RoadmapData`(JSON) を生成させる。** 指示書は `PROMPT.md`
   （型・文字数制約・ブランドのトーンを固定してある）。出力を `data/xxx.ts` に貼る。
2. `Root.tsx` の `VIDEOS` 配列に `{ id: "Xxx", data: xxx }` を1行足す。
   - バンドル時に `lib/validate.ts` が自動検査。はみ出し・禁止語はログに警告。
3. Web の Studio に出すなら `src/lib/studio.ts` の `VIDEO_REGISTRY` にも1行。
4. `npm run render:xxx`（`package.json` に1行足す）。

## ナレーション（VOICEVOX）

無音でも成立するが、VOICEVOX で音声を載せられる（`Audio` 対応済み）。

```bash
# 1) ローカルで VOICEVOX を起動（エンジンが http://127.0.0.1:50021 で待受）
# 2) 台本 narration/<slug>.txt（1行1文）を合成 → public/audio/<slug>.wav
npm run voice -w @hr/video skincare        # speaker 既定=13(青山龍星)
#   話者変更: npm run voice -w @hr/video skincare 11
# 3) data/<slug>.ts に  audioSrc: "audio/<slug>.wav"  を足す
# 4) npm run render:skincare
```

音声(`public/audio/`)は容量が大きいので gitignore（ローカル生成）。CI で音声付き
書き出しをするなら、synth ステップを足すか wav を artifact 化する。

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
