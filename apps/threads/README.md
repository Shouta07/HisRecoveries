# Threads CEO - 完全自動SNS収益化システム

8エージェント構成によるThreads完全自動投稿・マネタイズシステム。
マルチテナント対応で、複数アカウントの同時運用・他社納品が可能。

## アーキテクチャ（8エージェント）

| # | エージェント | ファイル | 役割 |
|---|------------|---------|------|
| 1 | Supervisor | `core/supervisor.py` | KILL_SWITCH・レートリミット・エラー閾値 |
| 2 | Researcher | `core/researcher.py` | RSSからのトレンドネタ収集 |
| 3 | Monetize | `core/monetize.py` | CTA挿入・商材選定・収益トラッキング |
| 4 | Writer | `core/writer.py` | 投稿文生成（類似度 + 検証 + CTA統合） |
| 5 | Validator | `core/validator.py` | NG表現・薬機法/景表法・文字数チェック |
| 6 | Poster | `core/poster.py` | Threads API投稿（リトライ + ランダム待機） |
| 7 | Analyst | `core/analyst.py` | パフォーマンス分析・改善提案 |
| 8 | Fetcher | `core/fetcher.py` | Threads APIデータ取得（ページネーション対応） |

**司令塔**: `core/main.py` が8エージェントを統括。

## セットアップ

```bash
pip install -r requirements.txt
cp .env.example .env
vi .env   # THREADS_ACCESS_TOKEN, OPENAI_API_KEY を入力
```

## CLIコマンド一覧

```bash
# 投稿
python -m core.main post mens-body-lab           # 1回の投稿サイクル
python -m core.main post mens-body-lab --dry-run  # テスト実行（API呼ばない）

# スケジューラ（persona.jsonのtime_slotsに基づいて自動投稿）
python -m core.main schedule mens-body-lab
python -m core.main schedule mens-body-lab --dry-run

# 設定検証
python -m core.main validate              # 全アカウント
python -m core.main validate mens-body-lab

# システム状態
python -m core.main status

# 収益ダッシュボード
python -m core.main revenue

# アカウント管理
python -m core.main new-account client-01 --genre "美容" --display-name "Beauty Bot"

# 緊急停止
python -m core.main kill on --reason "メンテナンス"
python -m core.main kill off
python -m core.main kill status

# トークン更新
python -m core.main token-refresh exchange   # 短命→長命（60日）
python -m core.main token-refresh refresh    # 長命の延長
```

## マネタイズの仕組み

```
投稿 → プロフィールリンクへ誘導（CTA） → リンクまとめページ → 商材LP
```

### 収益化フロー
1. **Writer** が投稿文を生成
2. **Monetize** が商材に関連したネタを優先的にWriterに供給
3. 投稿の40%にCTA（プロフ誘導文）を自動挿入
4. プロフィールリンク（lit.link等）経由でアフィリエイト/自社商品に誘導
5. 収益トラッキングでCTA率・商材別投稿数を記録

### monetize.json の設定

```json
{
  "enabled": true,
  "cta_insertion_rate": 0.4,
  "profile_link": "https://lit.link/your-account",
  "cta_templates": [
    {"text": "→ 詳しくはプロフのリンクからどうぞ", "weight": 3},
    {"text": "→ 無料で読めるキャリア診断、プロフから飛べます", "weight": 1}
  ],
  "products": [
    {
      "id": "career-guide",
      "name": "転職完全ガイド",
      "type": "affiliate",
      "topic_hint": "転職の具体的な手順やコツ",
      "weight": 3,
      "active": true
    }
  ]
}
```

## 投稿サイクルのフロー

```
1. Supervisor   →  KILL_SWITCH / レートリミットチェック
2. Researcher   →  RSSからネタ収集・ジャンルフィルタリング
3. Monetize     →  商材関連のネタを優先選定
4. Writer       →  OpenAI APIで投稿文生成
   └─ Validator →  NG表現・薬機法/景表法・文字数チェック
   └─ Monetize  →  CTA自動挿入（40%確率）
5. Supervisor   →  最終安全チェック
6. Poster       →  Threads APIで投稿（ランダム30〜120秒待機）
7. Monetize     →  収益トラッキング記録
8. Analyst      →  パフォーマンス分析（10投稿ごと）
```

## 安全機能

| 機能 | 詳細 |
|------|------|
| KILL_SWITCH | 環境変数 or ファイルで即時全停止 |
| レートリミット | 1時間あたり最大5投稿 |
| エラー閾値 | 1時間に10エラーで自動KILL_SWITCH |
| 類似度チェック | 過去100投稿とSequenceMatcher比較（閾値0.6） |
| コンテンツ検証 | NGワード・薬機法/景表法リスク表現・文字数・ハッシュタグ数 |
| ランダム待機 | 投稿前に30〜120秒の遅延 |
| APIリトライ | 指数バックオフで最大3回リトライ |
| トークン更新 | CLI経由で長命トークンの取得・延長 |

## 本番デプロイ

```bash
# 自動セットアップ
sudo bash deploy/setup.sh

# systemdサービス
sudo systemctl start threads-ceo
sudo systemctl enable threads-ceo

# または crontab
sudo -u threads crontab deploy/crontab.example
```

## ディレクトリ構成

```
threads/
├── core/                          # エージェント本体
│   ├── main.py                    # CLI + 連携司令塔
│   ├── supervisor.py              # KILL_SWITCH・レートリミット
│   ├── researcher.py              # RSSネタ収集
│   ├── monetize.py                # CTA・商材選定・収益トラッキング
│   ├── writer.py                  # 投稿文生成（検証+CTA統合）
│   ├── validator.py               # コンテンツ検証
│   ├── poster.py                  # Threads API投稿（リトライ付き）
│   ├── analyst.py                 # パフォーマンス分析
│   ├── fetcher.py                 # Threads APIデータ取得
│   ├── config.py                  # 共通設定管理
│   └── scheduler.py               # 定時投稿スケジューラ
├── accounts/                      # マルチテナント：アカウント別設定
│   └── mens-body-lab/
│       ├── persona.json           # キャラ・口調・投稿ルール
│       ├── patterns.md            # 15種バズ構文パターン
│       ├── history.json           # 投稿履歴（ループ防止）
│       ├── rss_feeds.json         # RSS設定
│       └── monetize.json          # マネタイズ設定
├── tests/                         # テスト（69件）
├── deploy/                        # 本番デプロイ用
│   ├── setup.sh                   # 自動セットアップ
│   ├── threads-ceo.service        # systemdサービス
│   └── crontab.example            # cron設定例
├── data/                          # ランタイムデータ（gitignored）
├── logs/                          # ログ出力（gitignored）
├── .env                           # APIキー（gitignored）
├── .env.example                   # APIキーテンプレート
└── requirements.txt
```

## テスト

```bash
python -m pytest tests/ -v   # 69 tests
```

## 他社納品時のチェックリスト

1. `new-account` で顧客用アカウントを作成
2. `persona.json` を顧客のジャンル・キャラに合わせて設定
3. `patterns.md` をジャンルに特化したバズ構文に書き換え
4. `rss_feeds.json` にジャンル関連のRSSフィードを設定
5. `monetize.json` で顧客のアフィリエイトリンク・商材を設定
6. `validate` で設定チェック
7. `post --dry-run` で生成テスト
8. 本番デプロイ（systemd or crontab）
