# 投稿管理ページ（admin）

アカウントの**テンプレート・プロンプト・ペルソナ・下書き**を、ブラウザから
確認・修正するためのローカルWeb UI。**追加依存ゼロ**（Python標準ライブラリのみ）。

## 起動

```bash
cd ~/threads
python -m admin.server          # http://127.0.0.1:8765 を開く
python -m admin.server --port 9000
```

ブラウザで `http://127.0.0.1:8765` を開く。停止は Ctrl+C。

> ネットワークには出ません。`accounts/<id>/` のファイルを読み書きするだけです。
> 実際のThreads投稿は従来どおり GitHub Actions / CLI が行います。

## できること

### ダッシュボード（`/`）
- 全アカウント一覧（表示名・ID・投稿フォーマット・下書き件数）

### アカウント画面（`/a/<id>`）
- **連投テンプレを編集**（thread_templates.json があるアカウント）
- **投稿をプレビュー生成**（mockで1本作って確認）
- **下書き一覧**
- **設定ファイルの編集**: persona.json / hypotheses.json / patterns.md /
  GIFT_PROMPT.md / GIFT_STRATEGY.md（存在するものだけ表示）

### 連投テンプレ編集（`/a/<id>/templates`）
- 機会別（誕生日・記念日…）に連投テンプレを編集
- **投稿の区切りは `---` だけの行**。CTA投稿には `{link}` を置く（投稿時にUTM付きURLへ置換）
- 保存すると `thread_templates.json` に書き込まれ、次回生成から反映

### プレビュー（`/a/<id>/preview`）
- mockで連投を1本生成して表示（**状態は汚さない**＝history/experimentsは変わらない）
- 「別の案を生成」で引き直し
- 「この案を下書き保存」で drafts.json に保存

### 下書き（`/a/<id>/drafts`）
- 生成した案を保存・**本文を直接修正**・削除
- 区切りは `---` だけの行

### 設定ファイル編集（`/a/<id>/edit?f=...`）
- テキスト/Markdown/JSONをそのまま編集
- **JSONは保存時に検証**（壊れたJSONは保存されない）

## 安全性

- 編集は `accounts/<id>/` 配下に限定（ディレクトリトラバーサル防止）
- JSONファイルは保存前にパース検証
- プレビュー生成は状態ファイルをスナップショット＆復元（副作用なし）

## Vercel デプロイ（常時アクセス版）

サーバーレスでは repo ファイルに直接保存できないため、**保存は GitHub API 経由の
コミット**になる（編集＝リポジトリへのコミット）。読み書きの保存先は環境変数で自動切替。

### 設定（Vercel プロジェクト）

1. GitHub から `Shouta07/threads` をインポート（Framework: Python）
2. エントリポイントは `pyproject.toml` の `[tool.vercel] entrypoint = "admin.server:Handler"`
   と `vercel.json` で設定済み（追加作業不要）
3. **Environment Variables** を設定:

   | 変数 | 値 | 用途 |
   |---|---|---|
   | `ADMIN_USER` | 任意のID（例 `hr-marketing`） | ログインID |
   | `ADMIN_PASSWORD` | 強いパスワード | ログインパスワード |
   | `GITHUB_TOKEN` | repo書込権限のPAT | 編集をコミットするため（必須） |
   | `GITHUB_REPO` | `Shouta07/threads` | コミット先リポジトリ |
   | `GITHUB_BRANCH` | `main` | コミット先ブランチ |

4. デプロイ。`https://<project>.vercel.app` を開くと **ID＋パスワード**を求められます
   （ブラウザのBasic認証ダイアログ）。正しく入れた人だけが閲覧・編集できます。

### ログイン方式（3パターン）

`admin/server.py` の認証は環境変数で切り替わります:

- **ID＋パスワード（推奨）**: `ADMIN_USER` ＋ `ADMIN_PASSWORD` を設定。友人にこの2つを渡す。
- **複数人に別々のID/パスワードを発行**: `ADMIN_USERS` に JSON を設定。
  例: `ADMIN_USERS={"owner":"パス1","tomodachi":"パス2"}`（各自に別の資格情報を配れる）
- **パスワードのみ**: `ADMIN_PASSWORD` だけ設定（IDは任意）。

いずれも未設定だと認証なし（ローカル用）。Vercelでは必ずどれかを設定してください。

### 挙動

- **閲覧・編集・下書き**: GitHub API 経由。保存＝コミット → Vercel が自動再デプロイ
- **プレビュー生成**: 同梱した `core/` `accounts/`（`vercel.json` の includeFiles）で実行。
  実行できない環境では「ローカルで実行」と案内（編集・保存は引き続き可能）
- `GITHUB_TOKEN`/`GITHUB_REPO` が未設定なら自動的にローカルFSモードになる

## 注意

- ローカル版は `127.0.0.1` のみ待受（外部公開しない）。Vercel版は `ADMIN_PASSWORD` 必須
- ローカルで編集した場合は、git でコミット／プッシュして恒久化してください
- Vercel版の編集は GitHub へ即コミットされます（バージョン管理される）
