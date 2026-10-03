# CLAUDE.md — タシカメ Threads 自動運用システム

新しいセッションはこの文書を読めば設計思想と構成を引き継げる。最終更新: 2026-10-03

## 0. これは何か

**恋亀**（タシカメのキャラクター）が日々恋愛について喋っている Threads
アカウントの、**自動投稿＋管理＋分析システム**。
Python + GitHub Actions + Vercel(管理ページ)。外部依存は最小
（標準ライブラリ中心、python-dotenv/gspreadのみ）。

Threads は広告媒体ではなく**会話の発生装置**。恋亀が問いを出し、人が答える。
サービスを売り込まず、キャラクターへの好意から「自分の話も聞いてほしい」を作る。

**回し方・測り方・やめ方は `GROWTH.md`。** この文書は実装の地図。
人格の正は `src/lib/koi/prompt.ts`（アプリの恋亀と同じ人格にする）。

> **前史（重要）**: このシステムは旧事業 **His Recoveries**（男性ウェルネス。
> ギフト／母／緊急／悩み検索の4読者層、第一印象パッケージ、完全守秘訴求）の
> ために作られていた。アカウント設定（persona.json / hypotheses.json）は
> タシカメに書き換えられていたが、**生成プロンプトが
> コードに直接埋まっていた**ため、実際に生成されるのは旧事業のギフト訴求だった
> （`_build_gift_thread_prompt`）。2026-10-03にそこを persona 駆動へ直した。
> **事業の文面をコードに書かない。** 書くと同じことが起きる。

## 1. ブランド／編集の絶対ルール（全投稿で厳守）

`src/lib/koi/prompt.ts` の `NEVER` と同じ線。**アプリの恋亀と Threads の恋亀を
別人にしない**（好きになった人が、話してみた瞬間に離れる）。

- **異性全体を代弁しない。** 「女性はこう思っています」と書かない。
  **聞くのは可**（「女性はどう受け取る？」）。言い切るのが不可。
  「やっぱこれ割れるな」は代弁の逆で、むしろ出したい形。
- **相手の気持ちを当てない。** ただし**語そのものは禁じない**。
  読む人に**聞く**のと、恋亀が**言い切る**のは別のこと。
    これ脈ありだと思う？ … 通す（問いは判定ではない）
    これは脈あり        … 止める
  利用規約 第12条の約束は「サービスが相手の気持ちを判定しない」こと。
  判定は `validation.forbid_verdict`。文の終わりで問いかどうかを見る。
- **効果・結果を保証しない。** モテる・落とす・攻略・成功率は書かない。
- **読む人を責めない。** 迷うのは相手を大事に思っているから。
- **小細工を扱わない。** 既読スルー・駆け引き・焦らす。
- **企業として名乗らない。** 弊社・当社・運営。恋亀本人として書く。
- 価格・割引には触れない。**🐢を1個だけ**、ハッシュタグは使わない。
- これらは `core/validator.py` と `src/lib/threadsEval.ts` が機械的に弾く。
  線引きは `persona["character"]["ng_words"]`、厳格度は `persona["validation"]`。
  代弁は `validation.forbid_speaking_for` で正規表現が見る。
  **コード側の既定値は旧事業向けなので、アカウント側の設定が優先される。**

## 2. アカウント構成（重要）

- **唯一のアカウント: `accounts/mens-body-lab/`**（`account_id` は内部IDなので変更しない。
  env のキーに使う）。
  - 表示名 **恋亀**、実ハンドル **@koikame.jp**、住所 **tashikame.app**。
    ハンドルと住所は一致していない（`docs/DOMAIN_MIGRATION.md` に経緯）。
  - 旧ペルソナ「Nagi」は廃止。gift-only の別アカウント nagi-gift も削除済み。
- 投稿フォーマットは **single（単発）**：`persona.json` の `posting.format = "single"`。
  1日3本（08:00 / 12:30 / 21:00 JST）。
  連投（`generate_thread`）の経路は残っているが、どのアカウントも使っていない。

### 投稿の型（post_forms.json）

**何を書くか**は型が決め、**何について書くか**はテーマが決める。掛け合わせて1本になる。

| カテゴリ | 比率 | リンク | 承認 | 型 |
|---|---:|---|---|---|
| 1 共感 | 30% | 無し | 自動 | 違和感 / 二択 |
| 2 実用 | 25% | 無し | 自動 | 恋亀のやり方 |
| 3 ケース | 15% | 無し | 自動 | 男女差 / 二択 |
| 4 ChatGPT活用 | 10% | 無し | 自動 | ChatGPT活用 |
| 5 実在異性の反応 | 10% | 無し | **人** | 実在異性の反応（`human_only`） |
| 6 直接CTA | 10% | **有り** | **人** | 直接CTA |

**リンクが付くのは 6 だけ**（`categories[].link`）。Threadsはリンク付き投稿の
露出を落とすので、送客はプロフィールが担う（`GROWTH.md` §5）。

**5 は `human_only: true`。** 自動生成の対象から外れる。実際に集まった回答が
無いのに書くと、女性の反応の創作になる（§1 の最初の行）。
書き方・許可の取り方・匿名化は `REAL_VOICES.md`。
外したぶんの比率は、残りが重みの比で吸う。

### テーマ（hypotheses.json の slug・13個）

`before-line` 送る前のLINE / `slow-reply` 返信が遅い / `when-to-ask` 次に誘うタイミング /
`after-first` 初デートのあと / `second-date` 2回目デート / `they-asked` 相手からの誘い /
`warm-cold` 会うと優しいのにLINEが冷たい / `many-at-once` 複数人と進行中 /
`not-sure` 確信が持てない / `polite-no` 社交辞令 / `before-ask` 告白の前 /
`distance` 距離感 / `temperature` 相手の温度感

**時間帯でテーマを縛らない。** 縛ると、夜のテーマが朝に出せなくなって同じ話が続く。
散らすのは型の比率が担う。PDCA画面の停止/集中はそのまま効く。

**行き先の増やし方**: `hypotheses.link_config.base_urls` にキーを足し、
仮説に `link_key` を書く。無ければ type と同名のキー → `apply` の順で解決される
（`apply` が現在の /ask）。**告知で行き先が引けなければ生成を中止する**
（別の型で代用しない）。

`utm_content` には投稿ごとの追跡コードが入る。Threads のIDは投稿後にしか
分からないが、リンクは投稿前に埋め込まれるので、こちらで先に振る
（`writer._tracking_code`）。`history.json` に一緒に残るので、
サイト側の着地・購入を投稿まで戻せる。

### 引用リソース（content_sources.json）
記事/体験メモを**1リソース=14投稿の在庫**に変換して積む型。仕様は
`accounts/mens-body-lab/CONTENT_SOURCES.md`。
**恋亀では使っていない**（`source_post_ratio = 0`）。経路は残してある。

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
1. `Shouta07/threads` の Secrets（`THREADS_ACCESS_TOKEN` / `THREADS_APP_SECRET`）
   を、このリポジトリの Secrets に入れ直す（§5。値は読み出せないので再発行）。
   `THREADS_USER_ID` は**入れない**（§5の注を参照）
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

**自動承認（2026-10-03〜）**: ゲートは残したまま、型で分ける。
設定は `persona.posting.posting_types.automated.auto_approve`、判定は
`core/approvals.py` の `auto_approve_decision`。

- A（共感）B（問い）C（恋亀）は自動で承認される。リンクも商品の話も持たない
- D（告知）だけ人が承認する。URLを貼ってサービスの話をするので、書き方を
  1つ間違えると、できないことを売ることになる（GROWTH.md §0.1）
- 歯止め: `max_per_day`（1日5本）/ `max_pending_approved`（投稿待ち10本）/
  `accounts/<id>/KILL_SWITCH`（置けば全部止まる）
- 自動で通したものは `decided_by: "auto"` が残る。人が押したぶんは枠を食わない

`post-approved` は1回につき `max_per_run`（既定1本）だけ出す。全部出すと、
夜にまとめて積んだ3本が、朝の枠で立て続けに出てしまう。

**週次の集計**: `python -m core.main report <acct> --days 7`。
型・テーマべつの表示数（中央値）と返信率、`utm_content` → 投稿 の対応表を出す。
毎朝の `threads-collect` が `reports/weekly.md` に上書きするので、推移は
そのファイルの git の履歴が持つ。**数字を出すだけで、設定は書き換えない。**

## 3. 主要ファイル地図

```
GROWTH.md               恋亀Threads運用設計。「何を回すか・何を測るか・何をやめるか」
accounts/mens-body-lab/
  persona.json          恋亀の人格（prompt.ts の写し）＋posting.format=single＋validation
  hypotheses.json       13テーマ + link_config(base_urls: apply=/ask) + discovery_questions
  post_forms.json       投稿の型。A/B/C/D の比率と型1〜5（構造・規則・例）。告知の例に {link}
  seo_clusters.json     検索クラスタ＋GEO質問（生成の素・編集可。生成は読まない）
  content_sources.json  引用リソース（恋亀では未使用。source_post_ratio=0）
  CONTENT_SOURCES.md    引用リソースの型の仕様
  READ_DESIGN.md        読まれる投稿設計（フックの型）。「どう書くか」
  REPLY_PLAYBOOK.md     恋亀の返信。1日20〜30件・人がやる。この設計で最も効く手
  REAL_VOICES.md        実在異性の反応（型F）。唯一、自動生成しない型。許可と匿名化
  OPENING.md            最初の10本。手で積む。告知は10本目まで出さない
  patterns.md           連投パターン（恋亀は単発なので未使用）
  approvals.json        承認キュー
  account_metrics.json  アカウント全体の数字（日次。フォロワー・表示数ほか）
  history.json          投稿履歴＋metrics(閲覧数など)。分析の元データ
  experiments.json      テーマ別の投稿数・フェーズ（2026-10-03に13テーマで作り直し）
reports/
  weekly.md             直近7日の集計。毎朝 threads-collect が上書きする
core/
  report.py    週次の集計。型・テーマべつの表示数（中央値）と返信率、
               utm_content → 投稿 の対応表。数字を出すだけで設定は変えない
  writer.py    generate_post→format==single なら generate_single（本線）。
               型（post_forms.json）とテーマ（hypotheses.json）を選び、
               _build_single_prompt が persona.json から組む。
               mock/キー無しのときは型の examples を使う。
               重複は history.json と突き合わせて見る（validator の類似チェックは
               プロセス内バッファで、毎回新プロセスの本番では常に空だった）
  validator.py validate_post。persona["validation"] / allowed_topics でアカウント別に調整
  poster.py    Threads API。create_thread_post / create_thread_chain(連投=reply_to_id)
  collector.py collect_metrics(既存投稿の数値取得) / import_history(過去投稿を全件取込)
               / collect_account_metrics(アカウント全体の数字を日次で残す)
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
  threads-ci.yml            apps/threads の変更で pytest + validate
                            （以前は apps/threads/.github/workflows/ci.yml にあり、
                              GitHubはルートしか読まないので一度も走っていなかった）
  （いずれも working-directory: apps/threads で実行）
KILL_SWITCH      このファイルがあると threads-post / post-approved は投稿しない(存在=停止中)

2026-10-03 に削除したもの（どこにもデプロイされておらず、承認ゲートを
通らずに投稿する経路だった）:
  deploy/            VPS用（setup.sh / systemd / crontab。/opt/threads-ceo 前提）
  Procfile / run.sh  Heroku・Railway用のワーカーと起動スクリプト
  archive/           さらに前のペルソナ（りょうた｜マチアプ5人同時進行）
  .github/workflows/ GitHubはルートしか読まないので、一度も走っていなかった
                     （ci.yml はルートの threads-ci.yml に移した）
pyproject.toml   [tool.vercel] entrypoint = "admin.server:Handler"
vercel.json      admin/server.py に core/accounts を同梱(includeFiles)
```

## 4. 管理ページ（admin）

- ローカル: `python -m admin.server` → http://127.0.0.1:8765
- Vercel: `admin.server:Handler` をサーバーレス配信。**編集＝GitHubへコミット**（GitHubStorage）。
- **monorepo では `GITHUB_PATH_PREFIX=apps/threads` が要る。** 無いとリポジトリ直下に
  `accounts/` を新規作成し、編集がどのワークフローにも届かない（実体は apps/threads/accounts）。
  `GITHUB_REPO` も旧リポジトリ（`Shouta07/threads`）のままだと、編集が旧リポジトリに入る。
- 機能: ダッシュボード / 投稿の型を編集（例文のみ）/ 設定ファイル編集(JSON検証付) /
  プレビュー生成(record=Falseで状態を汚さない) / 下書きCRUD /
  **閲覧数・分析**(投稿ごとのviews/いいね/返信/RP、テーマ別集計、キーワード検索、並び替え)。
- 認証: `ADMIN_USER`+`ADMIN_PASSWORD`（または複数人用 `ADMIN_USERS` JSON）。未設定ならローカル扱い。

## 5. 環境変数／シークレット（2系統・別物）

> **現状（2026-10-03 確認）: この系統はまだ1本も投稿していない。**
> `THREADS_ACCESS_TOKEN` が未設定で、Actions のログに
> `THREADS_ACCESS_TOKEN is not set` が出ている。生成して承認キューに積むところ
> までしか動かない。`history.json` が空で `collect` が毎朝「0 posts」なのも
> 同じ理由。`threads-token-refresh.yml` も手動で Disable されている。
> 入れる値の作り方は §6。

> **実際に毎日投稿していたのは、別リポジトリ `Shouta07/threads` だった（§2.6）。**
> 2026-10-03 に KILL_SWITCH を置いて止めた。ここが引き継ぐには Secrets が要る。

**GitHub Secrets（自動投稿=Actions用）** Settings→Secrets and variables→Actions:
- `THREADS_ACCESS_TOKEN`（@koikame.jp の長命トークン。**アカウント変更時はここ**）
- `THREADS_APP_SECRET`（Metaアプリのシークレット。トークン更新用）
- `GEMINI_API_KEY`（AI生成。mockなら不要）
- `GOOGLE_SHEETS_ID` / `GOOGLE_SHEETS_CREDENTIALS_JSON`（任意）

**Vercel Environment Variables（管理ページ用）**:
- `ADMIN_USER` / `ADMIN_PASSWORD`（ログイン）
- `GITHUB_TOKEN`（repo書込PAT）/ `GITHUB_REPO`=Shouta07/HisRecoveries /
  `GITHUB_BRANCH`=main / `GITHUB_PATH_PREFIX`=apps/threads

> **`THREADS_USER_ID` は設定しない。** Threads のユーザーIDは**アプリごとに
> 別の値**になるので、保存すると再認可やアプリ移行のたびに黙って壊れる。
> 2026-10-03、`threads_delete` を足すため再認可した直後、保存してあったIDで
> 削除が落ちた（`HTTP 400 code 100 / subcode 33 Object with ID ... does not
> exist`）。未設定なら `me` を使い、トークンの指すアカウントに自動で当たる。

> 注意: account_id `mens-body-lab` は内部ID。ワークフローは**base**の
> `THREADS_ACCESS_TOKEN` を渡すので、アカウントを変えても**コード変更は不要**。

## 6. Threadsアカウントを変更する手順

1. 新アカウントの**長命アクセストークン**を発行（同じMetaアプリに新アカウントを接続）。
2. **GitHub Secrets** を更新: `THREADS_ACCESS_TOKEN`、
   `THREADS_APP_SECRET`（Metaアプリが変わった場合のみ）。
3. `accounts/mens-body-lab/persona.json` の `threads_handle` を新ハンドルに（表示のみ）。
4. 動作確認: Actions で threads-post.yml を `dry_run=true, mock=true` 手動実行。
   `python -m core.main validate mens-body-lab` でも設定確認可。
- **account_id は変更しない**（envのbaseキーを使うため）。

## 7. 運用フロー・約束事

- **mainへ直pushは不可** → ブランチを切ってPRでマージ。
- 反映の流れ: **ブランチ→mainにマージ→(Vercel自動再デプロイ / 次のActionsで新内容)**。
  「画面や投稿に出ない＝たいていマージ待ち」。
- テスト: `python -m pytest -q`（現在 243 pass）。変更後は必ず実行。
  web側は `npx tsc --noEmit` と `npm run build`（リポジトリのルートで）。
- 一時停止: `KILL_SWITCH` を置く / Actionsでワークフローを Disable。再開は逆。

## 8. 現状と次の候補

**最初にやること**

1. **GitHub Secrets**（§5）と、旧系統からの引き継ぎ（§2.6）。
   トークンが無いあいだ、ここからの投稿は1本も出ない。
2. **Vercel に `tashikame.app` を足して DNS を向ける**（`docs/DOMAIN_MIGRATION.md`）。
   ドメインが生きる前にデプロイすると、Checkout の `success_url` の行き先が無い。

**実装済み（2026-10-03）**

恋亀への切り替え（人格の移植・単発化・型と13テーマ・代弁チェック）、
承認ゲート＋A/B/Cの自動承認、`utm_content` の追跡コード、
アカウント指標の日次記録、週次の集計（`reports/weekly.md`）、
管理ページ（編集・プレビュー・下書き・閲覧数分析＋検索）、過去取込、Vercel対応。

**まだのもの**

- C・D を「恋亀に話す」版へ（`REALTIME_API_KEY` が入ったら。`GROWTH.md` §0.1）
- 着地・購入を投稿に戻す（`events` × `utm_content`。投稿が出はじめてから）
- 負けているテーマの自動停止（母数が溜まってから。いまは集計を出すだけ）

**補足**: 閲覧数は Threads API 由来（保存数はAPIに無く取得不可）。
プロフィール閲覧が API で取れるかは未確認で、`profile_views` / `clicks` /
`link_clicks` を1つずつ試している（`fetcher.UNCERTAIN_USER_METRICS`）。
