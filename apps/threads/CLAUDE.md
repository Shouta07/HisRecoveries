# CLAUDE.md — His Recoveries Threads 自動運用システム

新しいセッションはこの文書を読めば設計思想と構成を引き継げる。最終更新: 2026-07-05

## 0. これは何か

His Recoveries（男性のコンプレックスに、完全守秘・中立で伴走するウェルネス
サービス）の **Threads 自動投稿＋管理＋分析システム**。Python + GitHub Actions +
Vercel(管理ページ)。外部依存は最小（標準ライブラリ中心、python-dotenv/gspreadのみ）。

集客全体の中で Threads は「**ソーシャル＝二本目の流入**」。主エンジンは Web(/areas)の
SEO/GEO。Threads は共感で拡散し、サイト(/areas)と予約(/apply)へ送客する役割。

## 1. ブランド／編集の絶対ルール（全投稿で厳守）

- **売らない・煽らない・断定しない。** 効果を保証しない。ビフォーアフター誇張禁止。
  医療的断定（治る/若返る等）禁止（薬機法・景表法）。
- **一般化しない**（「男はみんな〜」等）。
- **完全守秘を安心材料に。** 「本人だけが内容を決められる」「贈り主にも知らされない」。
- **ギフト訴求は"応援"であって"指摘"ではない（侮辱回避が最重要）。**
  ○「いつも頑張ってるから」「これからの自分に」「もっと自信を持つあなたが見たい」
  ✕「あなたのここを直して」「気になってたから」
- 絵文字は0〜2、ハッシュタグは0〜1。
- これらは `core/validator.py` が機械的に弾く（アカウント別に緩和可 = `persona["validation"]`）。

## 2. アカウント構成（重要）

- **唯一のアカウント: `accounts/mens-body-lab/`**（`account_id` は内部IDなので変更しない）。
  - 表示名 His Recoveries、実ハンドル **@hisrecoveries_jp**。
  - かつての当事者ペルソナ「Nagi」は**廃止**。gift-only の別アカウント nagi-gift も**削除済み**。
- 投稿フォーマットは **thread（連投）**：`persona.json` の `posting.format = "thread"`。

### 4系統のコンテンツ＝3読者層＋SEO増幅（hypotheses.json の type で分岐）
| type | 読者 | 内容 | リンク先 | 例slug |
|---|---|---|---|---|
| `gift` | 妻・彼女 | ギフトを贈る連投（応援フレーミング） | **/apply** | gift-birthday … |
| `mother` | 息子を想う母 | 直接言えない気がかり→守秘の伴走を入口に | **/apply** | mother-teen-skin … |
| `urgent` | 本人（期日層） | 結婚式/面接/決意の夜→今できる準備 | **/apply** | urgent-wedding … |
| `areas` | 本人（検索層） | 悩みに寄り添う短文（GEO質問=見出し） | **/areas/{slug}** | hair, sweat … |

**時間帯×読者層の出し分け**: `persona.posting.slot_type_map`
= 朝9時→`["mother","areas"]` / 夜21時→`["gift","urgent"]`（writer.\_current_time_slot がJSTで判定、
select_hypothesis に allowed_types として渡る。スロット対象が全停止なら全activeにフォールバック）。
均等選択は各スロット内で機能。PDCA画面の停止/集中もそのまま効く。
**訴求は「完全守秘」**（完全匿名は廃止。「内容は本人以外に知らされない」が安心材料）。

### 第3の系統: 引用リソース（content_sources.json）
記事/体験メモを**1リソース=14投稿の在庫**に変換して積む型。仕様は
`accounts/mens-body-lab/CONTENT_SOURCES.md`（配分: 共感4/気づき4/問題提起3/実績2/誘導1、
**URLは誘導の1本だけ・必ず最後**）。`persona.posting.source_post_ratio`（現在0.5）の確率で
在庫から単発1本を消費し、在庫切れなら連投へフォールバック。`writer.generate_source_post` が実装。

## 3. 主要ファイル地図

```
accounts/mens-body-lab/
  persona.json          ペルソナ＋posting.format=thread＋validation緩和設定
  hypotheses.json       gift/areas仮説 + link_config(base_urls: apply/gift/areas)
  thread_templates.json 連投テンプレ(mock)。CTA投稿に {link} プレースホルダ
  seo_clusters.json     /areasクラスタ＋GEO質問＋キーワード（生成の素・編集可）
  content_sources.json  引用リソース（1件=14投稿の在庫）。管理ページで編集可
  CONTENT_SOURCES.md    引用リソースの型の仕様（作り方Q1-Q5対応表つき）
  GIFT_PROMPT.md        ギフト投稿の正式プロンプト仕様
  GIFT_STRATEGY.md      ギフト自動化の仕組み説明
  history.json          投稿履歴＋metrics(閲覧数など)。分析の元データ
core/
  writer.py    generate_post→format==thread なら generate_thread。type別リンク。
               mock=テンプレ / 非mock=Geminiで生成。record=Falseで副作用なし生成
  validator.py validate_post。persona["validation"]でアカウント別に厳格度調整
  poster.py    Threads API。create_thread_post / create_thread_chain(連投=reply_to_id)
  collector.py collect_metrics(既存投稿の数値取得) / import_history(過去投稿を全件取込)
  fetcher.py   Threads API GET(insights/threads一覧)
  main.py      CLI: post / collect / import-history / validate / status …
admin/
  server.py    管理ページ本体(標準ライブラリ)。dispatch()をlocal http.server と Vercelで共用
  storage.py   LocalStorage / GitHubStorage(環境変数で自動切替)
  README.md    起動・Vercelデプロイ手順
.github/workflows/
  post.yml       毎日22:30 JST 連投1本(mock)。KILL_SWITCHで停止可
  collect.yml    毎朝 import-history + collect(数値取得)
  token-refresh.yml 長命トークンの更新
KILL_SWITCH      このファイルがあると post.yml は投稿しない(存在=停止中)
pyproject.toml   [tool.vercel] entrypoint = "admin.server:Handler"
vercel.json      admin/server.py に core/accounts を同梱(includeFiles)
```

## 4. 管理ページ（admin）

- ローカル: `python -m admin.server` → http://127.0.0.1:8765
- Vercel: `admin.server:Handler` をサーバーレス配信。**編集＝GitHubへコミット**（GitHubStorage）。
- 機能: ダッシュボード / 連投テンプレ編集 / 設定ファイル編集(JSON検証付) /
  プレビュー生成(record=Falseで状態を汚さない) / 下書きCRUD /
  **閲覧数・分析**(投稿ごとのviews/いいね/返信/RP、機会別集計、キーワード検索、並び替え)。
- 認証: `ADMIN_USER`+`ADMIN_PASSWORD`（または複数人用 `ADMIN_USERS` JSON）。未設定ならローカル扱い。

## 5. 環境変数／シークレット（2系統・別物）

**GitHub Secrets（自動投稿=Actions用）** Settings→Secrets and variables→Actions:
- `THREADS_ACCESS_TOKEN`（@hisrecoveries_jp の長命トークン。**アカウント変更時はここ**）
- `THREADS_USER_ID`（同アカウントのユーザーID）
- `THREADS_APP_SECRET`（Metaアプリのシークレット。トークン更新用）
- `GEMINI_API_KEY`（AI生成する場合。mockなら不要）
- `GOOGLE_SHEETS_ID` / `GOOGLE_SHEETS_CREDENTIALS_JSON`（任意）

**Vercel Environment Variables（管理ページ用）**:
- `ADMIN_USER` / `ADMIN_PASSWORD`（ログイン）
- `GITHUB_TOKEN`（repo書込PAT）/ `GITHUB_REPO`=Shouta07/threads / `GITHUB_BRANCH`=main

> 注意: account_id `mens-body-lab` は内部ID。ワークフローは**base**の
> `THREADS_ACCESS_TOKEN` を渡すので、アカウントを変えても**コード変更は不要**。

## 6. Threadsアカウントを変更する手順

Instagram/Threadsアカウントが変わったら、以下だけ更新すれば回る:
1. 新アカウントの**長命アクセストークン**を発行（同じMetaアプリに新アカウントを接続）。
2. **GitHub Secrets** を更新: `THREADS_ACCESS_TOKEN`（新トークン）、`THREADS_USER_ID`（新ID）、
   `THREADS_APP_SECRET`（Metaアプリが変わった場合のみ）。
3. `accounts/mens-body-lab/persona.json` の `threads_handle` を新ハンドルに（表示のみ・任意）。
4. 動作確認: Actions で post.yml を `dry_run=true, mock=true` 手動実行 → 生成が通るか。
   実投稿は `dry_run=false`。`python -m core.main validate mens-body-lab` でも設定確認可。
- **account_id は変更しない**（envのbaseキーを使うため）。コードもワークフローも変更不要。

## 7. 運用フロー・約束事

- 開発ブランチ: `claude/setup-ryota-marketing-tL9Vg`。**mainへ直pushは不可** → PRでマージ。
- 反映の流れ: **ブランチ→mainにマージ→(Vercel自動再デプロイ / 次のActionsで新内容)**。
  「画面や投稿に出ない＝たいていマージ待ち」。
- テスト: `python -m pytest -q`（現在 173+ pass）。変更後は必ず実行。
- 一時停止: `KILL_SWITCH` を置く / Actionsでワークフローを Disable。再開は逆。

## 8. 現状と次の候補

- 実装済み: His Recoveries一本化、gift(応援フレーミング)＋areas(SEO/GEO→/areas)の生成、
  連投投稿、管理ページ(編集・プレビュー・下書き・**閲覧数分析＋検索**)、過去取込、Vercel対応(GitHub保存＋ID/PW)。
- 未了/候補: GA4遷移率を分析画面に統合、gift↔areasの比率制御、note/X展開、
  贈り手向け/areasクラスタ記事の連携、AI生成(GEMINI)本番化。
- 補足: 閲覧数はThreads API由来（保存数はAPIに無く取得不可）。/apply・/areas遷移率はGA4側。
