# His Recoveries

半歩先からの記録。

このリポジトリは、メディアサイト **His Recoveries** の Next.js 実装です。
記事は Markdown で `content/articles/` に置き、Git で管理します。

---

## 技術スタック

| 区分 | 採用 | 選定理由 |
|---|---|---|
| フレームワーク | Next.js 14 (App Router) | SSG / ISR / 軽量ルーティング、Vercel と相性が良い |
| 言語 | TypeScript | 型安全性と保守性 |
| スタイリング | Tailwind CSS | 余白とタイポグラフィを精密に制御できる |
| コンテンツ管理 | Markdown + Git | 外部 SaaS への依存をなくし、記事執筆の摩擦を最小化 |
| ホスティング | Vercel | 無料枠、自動デプロイ、CDN |
| アナリティクス | Plausible / GA4（任意） | 環境変数で切替可 |

> microCMS ではなく Markdown を選択しました。理由は、外部依存（API キー・スキーマ管理）を排し、Shota さんがエディタで直接書ける状態をデフォルトにするためです。後日、microCMS や Contentlayer に移行することは可能ですが、Phase 1 ではこの構成が最も摩擦が少ないと判断しました。

---

## 開発

```bash
# 依存をインストール
npm install

# 開発サーバ起動
npm run dev

# 型チェック
npm run typecheck

# 本番ビルド確認
npm run build && npm run start
```

開発サーバは `http://localhost:3000` で起動します。

---

## ディレクトリ構成

```
.
├── src/
│   ├── app/                 # ページ（App Router）
│   │   ├── page.tsx                # トップ
│   │   ├── about/page.tsx
│   │   ├── articles/page.tsx       # 記事一覧
│   │   ├── articles/[slug]/page.tsx
│   │   ├── articles/category/[category]/page.tsx
│   │   ├── subscribe/page.tsx
│   │   ├── privacy/page.tsx
│   │   ├── legal/page.tsx          # 特商法
│   │   ├── sitemap.ts
│   │   ├── robots.ts
│   │   ├── not-found.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/          # UI コンポーネント
│   └── lib/                 # ロジック（記事読み込み、サイト設定）
├── content/
│   └── articles/            # 記事 Markdown（11 本の骨子済み）
├── package.json
├── tailwind.config.ts
├── next.config.mjs
└── tsconfig.json
```

---

## 記事の追加

`content/articles/<slug>.md` を作成します。

```md
---
title: "記事タイトル"
slug: "url-slug"
category: "philosophy"          # philosophy | hyperhidrosis | acne | bromhidrosis | face
publishedAt: "2026-05-16"
status: "published"             # draft | published
excerpt: "一覧表示で出る短い抜粋。"
related: ["other-slug-1", "other-slug-2"]
---

本文を Markdown で書く。
```

- `status: "draft"` の記事はビルド時に除外されます。
- `related` を省略すると、同カテゴリの最新 3 本が自動で「関連する記録」に表示されます。

---

## 環境変数

`.env.local` で以下を設定できます（すべて任意）。

```
NEXT_PUBLIC_SITE_URL=https://hisrecoveries.com
```

アナリティクスを使う場合は、`src/app/layout.tsx` にスクリプトタグを追加してください。

---

## デプロイ（Vercel）

1. GitHub リポジトリを Vercel に連携する
2. 環境変数 `NEXT_PUBLIC_SITE_URL` を本番ドメインで設定する
3. 「Deploy」をクリックする

### 独自ドメイン

1. Vercel プロジェクトの **Settings → Domains** で `hisrecoveries.com` を追加
2. ドメインレジストラ側で、表示された DNS レコード（A / CNAME）を設定
3. Vercel が自動で HTTPS を有効化するのを待つ（数分〜数十分）
4. `hisrecoveries.jp` も同じプロジェクトに追加し、`hisrecoveries.com` へのリダイレクトとして設定

---

## 編集第一原則（実装に反映済み）

このサイトには、以下の機能は **実装していません**。

- ソーシャルシェアボタン
- いいね・リアクションボタン
- コメント欄
- ポップアップ通知 / 退出インテント
- 滞在時間バー / 読書進捗バー
- 関連記事の自動レコメンド（手動指定または同カテゴリ最新 3 本のみ）
- 広告 / アフィリエイト枠
- 検索バー（Phase 2 以降）

---

## 法務的な表示

- 法人名・代表者名は `/legal`（特商法）と `/privacy`（運営者欄）にのみ記載
- フッターは `© His Recoveries` のみ
- メタタグ・OGP には法人名を含めない
- 著者名は `Nagi` 固定（実名・年齢・顔は非公開）

---

## Lighthouse の確認

```bash
npm run build && npm run start
# 別ターミナルで
npx lighthouse http://localhost:3000 --view
```

すべての指標で 90 以上を目標としています。
