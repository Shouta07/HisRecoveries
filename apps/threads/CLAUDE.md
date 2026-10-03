# CLAUDE.md — タシカメ Threads 自動運用システム

新しいセッションはこの文書を読めば設計思想と構成を引き継げる。最終更新: 2026-10-03

## 0. これは何か

**タシカメ**（マッチングアプリで迷った男性が、送る前の文面・写真・自己紹介文を
実在する女性に読んでもらえるサービス）の **Threads 自動投稿＋管理＋分析システム**。
Python + GitHub Actions + Vercel(管理ページ)。外部依存は最小
（標準ライブラリ中心、python-dotenv/gspreadのみ）。

Threads の役割は「手が止まる瞬間に置かれること」。共感で広がり、
**/ask（相談の入口）** へ送る。

> **前史（重要）**: このシステムは旧事業 **His Recoveries**（男性ウェルネス。
> ギフト／母／緊急／悩み検索の4読者層、第一印象パッケージ、完全守秘訴求）の
> ために作られていた。アカウント設定（persona.json / hypotheses.json /
> thread_templates.json）はタシカメに書き換えられていたが、**生成プロンプトが
> コードに直接埋まっていた**ため、実際に生成されるのは旧事業のギフト訴求だった
> （`_build_gift_thread_prompt`）。2026-10-03にそこを persona 駆動へ直した。
> **事業の文面をコードに書かない。** 書くと同じことが起きる。

## 1. ブランド／編集の絶対ルール（全投稿で厳守）

- **女性の反応を、こちらで作らない。** 「女性はこう思っています」と書かない。
  実在の回答が集まるまで、具体的な「女性の声」は出さない。
  それを売っているサービスが、AIの作り話を出したら商品そのものが嘘になる。
- **相手の気持ちを判定しない。** 脈あり・脈なしは扱わない。
- **効果・結果を保証しない。** モテる・落とす・攻略・成功率は書かない。
- **読む人を責めない。** 手が止まるのは慎重さであって、欠点ではない。
- **AIや友達に聞くことを否定しない。** 足りないところだけを書く。
- 価格・割引には触れない。絵文字は0〜2、ハッシュタグは0〜1。
- これらは `core/validator.py` が機械的に弾く。線引きは
  `persona["character"]["ng_words"]`、厳格度は `persona["validation"]`。
  **コード側の既定値は旧事業向けなので、アカウント側の設定が優先される。**

## 2. アカウント構成（重要）

- **唯一のアカウント: `accounts/mens-body-lab/`**（`account_id` は内部IDなので変更しない。
  env のキーに使う）。
  - 表示名 **タシカメ**、実ハンドル **@koikame.jp**。
  - 旧ペルソナ「Nagi」は廃止。gift-only の別アカウント nagi-gift も削除済み。
- 投稿フォーマットは **thread（連投）**：`persona.json` の `posting.format = "thread"`。

### 5場面（hypotheses.json の slug）
| slug | 場面 | 心理の芯 | リンク先 |
|---|---|---|---|
| `message` | 送る前のLINE | 読み返しても自分の目しか無い | **/ask?c=message** |
| `photo` | 自己紹介文・プロフィール | 書いた本人がいちばん読めない | **/ask?c=photo** |
| `date` | 誘うタイミング | 早いと重い・遅いと冷める | **/ask?c=date** |
| `signal` | デートのあと | 温度感が自分の記憶からしか分からない | **/ask?c=signal** |
| `distance` | 距離感・言いにくいこと | 友達にも相手にも聞けない | **/ask?c=distance** |

**時間帯×場面の出し分け**: `persona.posting.slot_type_map`
= 朝9時→`["message","photo"]`（出す前のもの）/ 夜21時→`["date","signal","distance"]`
（会ったあと・誘う前・距離感。夜のほうが手が止まる）。
`writer._current_time_slot` がJSTで判定し、`select_hypothesis` に allowed_types として渡る。
スロット対象が全停止なら全activeにフォールバック。PDCA画面の停止/集中もそのまま効く。

**行き先の増やし方**: `hypotheses.link_config.base_urls` にキーを足し、
仮説に `link_key` を書く。無ければ type と同名のキー → `apply` の順で解決される
（`apply` が現在の /ask。キー名は歴史的なもの）。`no_link: true` ならリンク無し。

### 引用リソース（content_sources.json）
記事/体験メモを**1リソース=14投稿の在庫**に変換して積む型。仕様は
`accounts/mens-body-lab/CONTENT_SOURCES.md`（配分: 共感4/気づき4/問題提起3/実績2/誘導1、
**URLは誘導の1本だけ・必ず最後**）。`persona.posting.source_post_ratio`（現在0.5）の確率で
在庫から単発1本を消費し、在庫切れなら連投へフォールバック。`writer.generate_source_post` が実装。

## 2.6 前の系統: `Shouta07/threads`（2026-10-03 に停止）

**同じ Threads アカウントに毎日投稿していたのは、このリポジトリではなかった。**

`Shouta07/threads` は、この apps/threads が monorepo に移される前の単独
リポジトリ。移したあとも**消さずに残っていて、そちらの Actions が生きていた**。

| | Shouta07/threads（旧） | ここ（apps/threads） |
|---|---|---|
| post ワークフロー | `post.yml` 09:00/21:00 JST・**522回実行** | `threads-post.yml` 同じ時刻 |
| Secrets | 入っている（トークン自動更新も稼働） | **未設定** |
| 承認ゲート | **無し＝直接投稿** | 有り（承認待ちで止まる） |
| 内容 | 旧事業（gift/mother/urgent/areas） | タシカメの5場面 |
| 生成 | `post ... --mock` が**ワークフローに固定**＝常にテンプレート | Gemini（キーがあれば） |
| git push | 403 で失敗 → 履歴が残らず、7月から動いていないように見えた | 成功 |

2026-10-03 13:43 JST の実行で実際に出ていたもの:
```
仮説   areas-face（顔の印象（/areasへ））
CTA    https://hisrecoveries.com/areas/face?utm...
本文   「目の下のクマ、これ何だろう」——疲れだけじゃない気がしていた。
結果   3投の連投を実投稿（head=18129975754750497, replies=2/2）
```

**同じアカウントに2つの系統を向けない。** 旧リポジトリの KILL_SWITCH を消すなら、
先にこちらを止める（逆も同じ）。

### 引き継ぎに必要なこと
1. `Shouta07/threads` の Secrets（`THREADS_ACCESS_TOKEN` / `THREADS_USER_ID` /
   `THREADS_APP_SECRET`）を、このリポジトリの Secrets にコピーする（§5）
2. `threads-token-refresh.yml` を Enable に戻す（60日で切れる）
3. Vercel の管理ページの環境変数を直す（§4）。
   `GITHUB_REPO` が旧リポジトリを指していると、画面での編集が旧リポジトリに入る

## 2.5 承認ゲート（生成 → 人間の承認 → 投稿）

`persona.posting.posting_types.automated.immediate_posting_forbidden = true` の間、
`run_post_cycle` は**投稿せず承認キュー(`approvals.json`)に積む**。人間が承認した
ものだけを `post-approved` が投稿する。実装: `core/approvals.py`（キューの状態機械）＋
`core/main.py`（ゲート挿入 + `run_approved_cycle`）。`poster.check_approval_required`
がフラグを読む。CLI:
```
python -m core.main post <acct> --mock       # 生成→承認キューへ（投稿しない）
python -m core.main queue <acct>             # 承認待ち一覧（id確認）
python -m core.main approve <acct> <id>      # 承認（却下は reject）
python -m core.main post-approved <acct>     # 承認済みだけ投稿（cron想定）
```

## 3. 主要ファイル地図

```
accounts/mens-body-lab/
  persona.json          語り手＋トーン＋posting.format=thread＋validation緩和設定
  hypotheses.json       5場面 + link_config(base_urls: apply=/ask) + discovery_questions
  thread_templates.json 連投テンプレ(mock/フォールバック)。CTA投稿に {link} プレースホルダ
  seo_clusters.json     場面別の検索クラスタ＋GEO質問（生成の素・編集可。生成は読まない）
  content_sources.json  引用リソース（1件=14投稿の在庫）。管理ページで編集可
  CONTENT_SOURCES.md    引用リソースの型の仕様
  READ_DESIGN.md        読まれる投稿設計（フックの型×5場面）
  patterns.md           連投パターン（場面別の構造）
  approvals.json        承認キュー
  history.json          投稿履歴＋metrics(閲覧数など)。分析の元データ
  experiments.json      場面別の投稿数・フェーズ（旧事業の121本は2026-10-03にリセット）
core/
  writer.py    generate_post→format==thread なら generate_thread（本線）。
               プロンプトは _build_thread_prompt が persona.json から組む。
               mock/キー無しのときだけ thread_templates.json を使う。
               slug に対応するテンプレが無ければ生成を中止する（別場面の文面で代用しない）
  validator.py validate_post。persona["validation"] / allowed_topics でアカウント別に調整
  poster.py    Threads API。create_thread_post / create_thread_chain(連投=reply_to_id)
  collector.py collect_metrics(既存投稿の数値取得) / import_history(過去投稿を全件取込)
  fetcher.py   Threads API GET(insights/threads一覧)
  main.py      CLI: post / collect / import-history / validate / status …
scripts/
  delete_all_posts.py   アカウントの過去投稿をAPIで一括削除（--dry-run あり・取り消し不可）
admin/
  server.py    管理ページ本体(標準ライブラリ)。dispatch()をlocal http.server と Vercelで共用
  storage.py   LocalStorage / GitHubStorage(環境変数で自動切替)
  README.md    起動・Vercelデプロイ手順
../../.github/workflows/   ← 稼働ワークフローは monorepo ルートに置く（GitHubはルートのみ実行）
  threads-post.yml          朝09/夜21 JST 生成→承認キュー(approvals.json)。Gemini生成
  threads-post-approved.yml 承認済みだけを投稿(3hおき)。承認が無ければ何もしない
  threads-collect.yml       毎朝 import-history + collect(数値取得)
  threads-token-refresh.yml 長命トークンの更新(45日周期)
  threads-delete-all-posts.yml 過去投稿の一括削除(手動のみ・既定dry_run・取り消し不可)
  （いずれも working-directory: apps/threads で実行）
KILL_SWITCH      このファイルがあると threads-post / post-approved は投稿しない(存在=停止中)
pyproject.toml   [tool.vercel] entrypoint = "admin.server:Handler"
vercel.json      admin/server.py に core/accounts を同梱(includeFiles)
```

## 4. 管理ページ（admin）

- ローカル: `python -m admin.server` → http://127.0.0.1:8765
- Vercel: `admin.server:Handler` をサーバーレス配信。**編集＝GitHubへコミット**（GitHubStorage）。
- **monorepo では `GITHUB_PATH_PREFIX=apps/threads` が要る。** 無いとリポジトリ直下に
  `accounts/` を新規作成し、編集がどのワークフローにも届かない（実体は apps/threads/accounts）。
  `GITHUB_REPO` も旧リポジトリ（`Shouta07/threads`）のままだと、編集が旧リポジトリに入る。
- 機能: ダッシュボード / 連投テンプレ編集 / 設定ファイル編集(JSON検証付) /
  プレビュー生成(record=Falseで状態を汚さない) / 下書きCRUD /
  **閲覧数・分析**(投稿ごとのviews/いいね/返信/RP、場面別集計、キーワード検索、並び替え)。
- 認証: `ADMIN_USER`+`ADMIN_PASSWORD`（または複数人用 `ADMIN_USERS` JSON）。未設定ならローカル扱い。

## 5. 環境変数／シークレット（2系統・別物）

> **現状（2026-10-03 確認）: この系統はまだ1本も投稿していない。**
> `THREADS_ACCESS_TOKEN` と `THREADS_USER_ID` が未設定で、Actions のログに
> `THREADS_ACCESS_TOKEN is not set` が出ている。生成して承認キューに積むところ
> までしか動かない。`history.json` が空で `collect` が毎朝「0 posts」なのも
> 同じ理由。`threads-token-refresh.yml` も手動で Disable されている。
> 入れる値の作り方は §6。

> **実際に毎日投稿していたのは、別リポジトリ `Shouta07/threads` だった（§2.6）。**
> 2026-10-03 に KILL_SWITCH を置いて止めた。ここが引き継ぐには Secrets が要る。

**GitHub Secrets（自動投稿=Actions用）** Settings→Secrets and variables→Actions:
- `THREADS_ACCESS_TOKEN`（@koikame.jp の長命トークン。**アカウント変更時はここ**）
- `THREADS_USER_ID`（同アカウントのユーザーID）
- `THREADS_APP_SECRET`（Metaアプリのシークレット。トークン更新用）
- `GEMINI_API_KEY`（AI生成。mockなら不要）
- `GOOGLE_SHEETS_ID` / `GOOGLE_SHEETS_CREDENTIALS_JSON`（任意）

**Vercel Environment Variables（管理ページ用）**:
- `ADMIN_USER` / `ADMIN_PASSWORD`（ログイン）
- `GITHUB_TOKEN`（repo書込PAT）/ `GITHUB_REPO`=Shouta07/HisRecoveries /
  `GITHUB_BRANCH`=main / `GITHUB_PATH_PREFIX`=apps/threads

> 注意: account_id `mens-body-lab` は内部ID。ワークフローは**base**の
> `THREADS_ACCESS_TOKEN` を渡すので、アカウントを変えても**コード変更は不要**。

## 6. Threadsアカウントを変更する手順

1. 新アカウントの**長命アクセストークン**を発行（同じMetaアプリに新アカウントを接続）。
2. **GitHub Secrets** を更新: `THREADS_ACCESS_TOKEN`、`THREADS_USER_ID`、
   `THREADS_APP_SECRET`（Metaアプリが変わった場合のみ）。
3. `accounts/mens-body-lab/persona.json` の `threads_handle` を新ハンドルに（表示のみ）。
4. 動作確認: Actions で threads-post.yml を `dry_run=true, mock=true` 手動実行。
   `python -m core.main validate mens-body-lab` でも設定確認可。
- **account_id は変更しない**（envのbaseキーを使うため）。

## 7. 運用フロー・約束事

- **mainへ直pushは不可** → ブランチを切ってPRでマージ。
- 反映の流れ: **ブランチ→mainにマージ→(Vercel自動再デプロイ / 次のActionsで新内容)**。
  「画面や投稿に出ない＝たいていマージ待ち」。
- テスト: `python -m pytest -q`（現在 211 pass）。変更後は必ず実行。
- 一時停止: `KILL_SWITCH` を置く / Actionsでワークフローを Disable。再開は逆。

## 8. 現状と次の候補

- **最初にやること: GitHub Secrets（§5）と、旧系統からの引き継ぎ（§2.6）。**
  トークンが無いあいだ、ここからの投稿は1本も出ない。
- 実装済み: タシカメ一本化（生成プロンプトの persona 駆動化、5場面の連投、
  テンプレの {link} 修正、旧実験記録のリセット）、承認ゲート、連投投稿、
  管理ページ（編集・プレビュー・下書き・閲覧数分析＋検索）、過去取込、Vercel対応。
- 未了/候補: GA4遷移率を分析画面に統合、場面ごとの比率制御、
  content_sources の在庫追加（現在1リソース＝14本ぶんだけ）、note/X展開。
- 補足: 閲覧数はThreads API由来（保存数はAPIに無く取得不可）。/ask 遷移率はGA4側。
