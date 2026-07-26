# @hr/video — Remotion 動画

2系統ある。

| 系統 | 用途 | 実装 |
|---|---|---|
| **BrandReel** | ブランド認知（Instagram リール・30秒） | `lib/BrandReel.tsx` + `lib/reel/*` |
| **RoadmapVideo** | 記事 → 縦動画の量産（18〜20秒） | `lib/RoadmapVideo.tsx` |

記事量産のほう（`docs/AI_MARKETING_ENGINE.md` §3-⑤）は下の「新しい動画を1本足す」を参照。

## BrandReel（Instagram リール・30秒）

男性ウェルネスブランドの**認知獲得**用。売り込まず、名前を置いて帰る1本。
9:16 / 1080×1920 / 30fps / 900フレーム = 30.0秒ちょうど。

```bash
npm run video:studio                    # プレビュー（Composition "BrandReel"）
npm run render:reel -w @hr/video        # → packages/video/out/brand-reel.mp4
npm run still:reel -w @hr/video -- --frame=470   # 1枚だけ確認したいとき
```

### 構成（尺は `lib/BrandReel.tsx` の `SCENE_FRAMES` 一箇所で決まる）

| # | シーン | フレーム | 秒 | 地色 |
|---|---|---|---|---|
| 1 | もっといい男になりたい | 0–150 | 5.0 | 深緑 |
| 2 | 男性の悩み（肌・体・清潔感） | 150–360 | 7.0 | 深緑 |
| 3 | His Recoveries とは | 360–555 | 6.5 | **明転**（＝回復の合図） |
| 4 | 小さな改善が自信になる | 555–735 | 6.0 | 明 |
| 5 | CTA | 735–900 | 5.5 | 深緑へ戻る |

明暗の反転そのものが演出。地色は `Backdrop` がシーンを跨いで溶かすので、
切り替えの継ぎ目は出ない。

### コンポーネント設計

```
lib/brand.ts            トークン（色・書体・タイポスケール・モーション定数・余白）
lib/reel/fonts.ts       明朝/ゴシック/Cormorant をローカル読込（オフライン可）
lib/reel/stage.tsx      Grain・Glow・Vignette・Backdrop・SceneFrame（器）
lib/reel/motion.tsx     FadeIn・SlowZoom・Stagger（動きはここだけ）
lib/reel/atoms.tsx      Eyebrow・Headline・Body・Rule・Wordmark・ConcernItem
lib/reel/scenes.tsx     Scene 1〜5（絵の決めごと）
lib/BrandReel.tsx       型・尺表・合成
data/reel-brand.ts      文言だけ（ここ以外を触らずに言い回しを変えられる）
```

**色**は `www.hisrecoveries.com` の実装（`src/app/page.tsx` のヒーロー、
`src/app/opengraph-image.tsx`）から採った実測値を `lib/brand.ts` に置いてある。
深緑 `#16241A` / セージ `#85AB8B` / 明部 `#F4F6F2` / 真鍮 `#D9B584`（CTA の罫線のみ）。

**トーン**（Aesop・Kinfolk）の決めごと:

- 見出しは明朝（Shippori Mincho B1）を **weight 400 のまま**大きく使う。太字で殴らない。
- 字間は広く（0.07em〜）、行間は深く（1.6〜2.0）、左右余白は 156px 固定。
- 動きは「文字フェード」と「1.00→1.05 の緩慢なズーム」だけ。`spring` は使わない（跳ねは軽薄に見える）。
- 強調はセージ1色と細い罫線のみ。`accent` に語を入れるとその語だけ色が変わる。

### 文言を変える

`data/reel-brand.ts` だけを編集する。バンドル時に `validateBrandReelData`
（`lib/validate.ts`）が1行の文字数と禁止語（断定・医療・煽り）を検査し、
はみ出しそうな行を Studio のコンソールに警告する。

## RoadmapVideo（記事→動画）の使い方

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

## Playwright（サムネイル・素材キャプチャ）

プリインストール Chromium を `playwright-core` で使う（ブラウザDLなし）。

```bash
# サムネイル(1280x720 PNG・YouTube/OGP)。文言は thumbnails.json。
npm run thumb -w @hr/video skincare      # or all → out/thumb/<slug>.png

# 素材キャプチャ(b-roll)。URLを縦画面でスクショ → public/broll/<name>.png
npm run broll -w @hr/video https://www.hisrecoveries.com/areas/skin areas-skin
```

Chromeの実行ファイルは既定 `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`
（`PW_CHROME` で上書き可）。`out/thumb`・`public/broll` は生成物なので gitignore。

## 構成

| ファイル | 役割 |
|---|---|
| `lib/RoadmapVideo.tsx` | 記事量産の汎用テンプレート（全動画で共通・触らない） |
| `lib/theme.ts` / `lib/fonts.ts` | RoadmapVideo 用のブランド色・Noto Sans JP |
| `lib/BrandReel.tsx` / `lib/reel/*` / `lib/brand.ts` | ブランドリール（30秒）一式 |
| `data/*.ts` | 動画1本ぶんの文言だけ |
| `Root.tsx` / `index.ts` | Composition 一覧の登録 |

書体は `public/fonts` からオフライン読込（Noto Sans JP / Shippori Mincho B1 /
Cormorant Garamond）。`node_modules/@fontsource/*` から woff2 をコピーしたもの。

## レンダリングの前提（CI/ローカル）

Remotion は headless Chromium と ffmpeg が要る。

- このサンドボックスはプリインストール済み → `--browser-executable` で指定。
- まっさらな環境/CIでは、先に `npx remotion install`（Chromium/ffmpeg を取得）。

`out/` は成果物なので gitignore。
