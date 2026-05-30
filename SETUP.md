# His Recoveries — Setup Guide

サイトを本番で動かすために必要な、3 つの外部サービスの設定手順です。
すべて無料枠で完結します。所要時間は合計 **約 60 分**。

| 設定項目 | 所要時間 | 必須度 |
|---|---|---|
| 1. Vercel デプロイ | 10 分 | ★ 必須 |
| 2. 解析プロバイダ接続 | 10 分 | ★ 必須 |
| 3. Supabase（Insight DB） | 30 分 | ★ 推奨 |
| 4. Admin Dashboard 認証 | 5 分 | ★ 推奨 |
| 5. （任意）独自ドメイン | 5 分 | △ |

---

## 1. Vercel にデプロイ

すでにデプロイ済みであれば飛ばして OK。

1. [vercel.com](https://vercel.com) にログイン
2. New Project → GitHub の `shouta07/hisrecoveries` をインポート
3. Framework Preset: **Next.js**（自動）
4. Deploy

このあと、**Project → Settings → Environment Variables** の場所を覚えておいてください。
以降の手順で環境変数を入れていきます。

---

## 2. 解析プロバイダの接続

どちらか 1 つで OK。両方入れても可。

### A. Vercel Analytics（最も簡単・¥0）

1. Vercel プロジェクトの **Analytics** タブを開く
2. **Enable Web Analytics** をクリック
3. 完了。コード変更不要

### B. GA4（高機能・¥0）

1. [analytics.google.com](https://analytics.google.com) でプロパティ作成
2. 測定 ID（`G-XXXXXXXXXX`）をコピー
3. Vercel の Environment Variables に追加：

   ```
   NEXT_PUBLIC_GA_ID = G-XXXXXXXXXX
   ```

4. 再デプロイ（Vercel が自動で実行）

### C. Plausible（プライバシー重視・$9/月）

1. [plausible.io](https://plausible.io) でサイト登録
2. Vercel に追加：

   ```
   NEXT_PUBLIC_PLAUSIBLE_DOMAIN = hisrecoveries.com
   ```

---

## 3. Supabase（Insight Database）

### 3.1 プロジェクト作成

1. [supabase.com](https://supabase.com) で **Start your project** → サインアップ（GitHub 連携が早い）
2. New Project
   - Name: `his-recoveries`
   - Database Password: 強力なものを生成、保管
   - Region: **Northeast Asia (Tokyo)**
   - Pricing Plan: Free（無料枠 500MB で当分十分）
3. プロジェクト作成完了まで 2-3 分待つ

### 3.2 スキーマ実行

1. Supabase ダッシュボードの左メニューから **SQL Editor**
2. 右上 **New query**
3. このリポジトリの `supabase/schema.sql` の中身を全部コピペ
4. 右下 **Run** をクリック
5. "Success. No rows returned" と出れば OK

これで 4 テーブル（`assessments` / `stories` / `letters` / `events`）+ 5 View
（`daily_signals` ほか）が作成されます。

### 3.3 API キーを Vercel に設定

1. Supabase ダッシュボードの左下 **Project Settings** → **API**
2. 以下の 3 つをコピー：
   - **Project URL**（`https://xxxxx.supabase.co`）
   - **Project API keys → anon public**（長い文字列）
   - **Project API keys → service_role**（さらに長い文字列、要注意：他人に見せない）

3. Vercel の Environment Variables に追加（**Production** にチェック）：

   ```
   SUPABASE_URL          = https://xxxxx.supabase.co
   SUPABASE_ANON_KEY     = eyJ...（anon public）
   SUPABASE_SERVICE_KEY  = eyJ...（service_role）
   ```

   ⚠️ `SUPABASE_SERVICE_KEY` は **絶対に `NEXT_PUBLIC_` を付けない**。サーバ専用です。

4. **Save** → Vercel が自動で再デプロイ

### 3.4 動作確認

1. デプロイ完了後、サイトの `/assessment` に行って 5 問回答 → 送信
2. Supabase ダッシュボードの **Table Editor** → `assessments` を開く
3. 1 行追加されていれば成功 ✓

データが入らない場合：
- Vercel の **Deployments → 最新の Function Logs** で `/api/assessment` のエラーを確認
- env が反映されたかチェック（変更後は要再デプロイ）

---

## 4. Admin Dashboard 認証

`/admin/insights` を保護するパスワードを設定します。

1. 強いパスワードを生成（例：1Password でランダム 20 文字）
2. Vercel に追加：

   ```
   ADMIN_PASSWORD = （生成したパスワード）
   ```

3. 再デプロイ後、`https://hisrecoveries.com/admin/insights` を開く
4. ブラウザが認証ダイアログを出す
   - ユーザー名：`admin`
   - パスワード：上で設定した値

入れれば Insight Dashboard が表示されます。

---

## 5. 独自ドメイン（任意・推奨）

`hisrecoveries.com` を取得して接続すると、アフィリ ASP 審査の通過率が大幅に上がります。

1. ムームードメインなどで `hisrecoveries.com` を取得（年 ¥1,500 程度）
2. Vercel の **Project → Settings → Domains** に追加
3. Vercel の指示通り DNS の `A`/`CNAME` レコードを設定
4. 反映後、Vercel の env を更新：

   ```
   NEXT_PUBLIC_SITE_URL = https://hisrecoveries.com
   ```

5. 再デプロイ

---

## 環境変数の総まとめ（コピペ用）

Vercel の Environment Variables にこの 7 つ（最低 5 つ）を入れる：

```
# 必須
NEXT_PUBLIC_SITE_URL = https://hisrecoveries.com

# 解析（どちらか 1 つ以上）
NEXT_PUBLIC_GA_ID = G-XXXXXXXXXX            # GA4
NEXT_PUBLIC_PLAUSIBLE_DOMAIN = hisrecoveries.com  # Plausible

# Supabase（推奨）
SUPABASE_URL = https://xxxxx.supabase.co
SUPABASE_ANON_KEY = eyJ...
SUPABASE_SERVICE_KEY = eyJ...

# Admin（推奨）
ADMIN_PASSWORD = ...
```

---

## トラブルシューティング

### Q. フォーム送信は成功するが、Supabase にデータが入らない

1. Vercel の **Deployments → 最新 → Functions → /api/assessment** のログを見る
2. 「`db:noop` insert」ログがあれば **env が読まれていない**
3. env を再保存 → 再デプロイ

### Q. `/admin/insights` で 401 エラーが消えない

- `ADMIN_PASSWORD` env を設定しているか確認
- ブラウザのキャッシュを Cmd+Shift+R で全削除
- 別ブラウザで試す（ユーザー名は必ず `admin`）

### Q. ダッシュボードに「データがありません」と出る

- まだ誰もフォームを送信していない、または `SUPABASE_SERVICE_KEY` が未設定
- 自分で `/assessment` を 1 回完了 → 1-2 分後にダッシュボードをリロード

### Q. 計測イベントが GA4 に出ない

- GA4 の **DebugView** で `gtag` 動作を確認
- `NEXT_PUBLIC_GA_ID` が `G-` から始まっているか
- 広告ブロッカーを無効にして検証

---

## アフィリエイト準備（並行作業）

サイト稼働とは独立に進めて OK。

1. **A8.net** 登録（Shota さん名義）
2. **もしもアフィリエイト** 登録（同上）
3. **楽天アフィリエイト** 登録（楽天会員なら即時）
4. **Amazon アソシエイト** 登録（180 日以内 3 件売上の条件あり）

承認されたら：
- `content/products/_template.md` をコピーして 6 件分作成（領域別 1 件）
- `links.amazon` / `links.rakuten` / `links.asp` にアフィリリンクを貼付
- `status: published` に変更 → 自動で `/shelf` と記事末に表示

---

## 完成後のチェックリスト

- [ ] Vercel デプロイ成功
- [ ] サイトが `https://hisrecoveries.com` で表示される
- [ ] 解析プロバイダに pageview が記録される
- [ ] `/assessment` で送信 → Supabase に行が増える
- [ ] `/submit-story` で送信 → Supabase に行が増える
- [ ] `/letters` で送信 → Supabase に行が増える
- [ ] `/admin/insights` に Basic Auth でログインできる
- [ ] ダッシュボードに自分のテスト送信データが表示される
- [ ] ASP 登録（少なくとも楽天・もしも）
- [ ] `content/products/` に最低 1 件の本物のアフィリ商品

ここまで揃ったら **本格運用スタート可能**。あとは Threads 投稿でユーザーを呼ぶだけ。
