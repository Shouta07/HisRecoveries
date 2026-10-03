# タシカメ — Threads 自動運用システム

## 概要

| 項目 | 内容 |
|---|---|
| アカウント | @koikame.jp |
| プロダクト | タシカメ（送る前に、女性の目を通す） |
| 運営 | His Recoveries / バイタリティデザイン合同会社 |
| 行き先 | https://tashikame.app/ask （相談の入口） |
| 目的 | 手が止まる瞬間に置かれること。5場面のどれが反応されるかを測る |
| 現フェーズ | explore（5場面を均等検証） |
| 内部ID | `accounts/mens-body-lab/`（env のキーに使うので変更しない） |

旧構成（His Recoveries＝男性ウェルネス。8仮説 hygiene/aging_anxiety…、
読者4層 gift/mother/urgent/areas、ペルソナ Nagi）は廃止。
このドキュメントはその置き換え。

---

## 自動フロー

```
09:00 JST  場面選択(朝) → Writer(Gemini) → Validator → 承認キュー(approvals.json)
21:00 JST  場面選択(夜) → Writer(Gemini) → Validator → 承認キュー
3hおき     承認済みだけを投稿（approvals.json の approved）
毎朝       import-history + collect（閲覧数などの回収）
```

**投稿は人間の承認を通る。** `persona.posting.posting_types.automated.immediate_posting_forbidden`
が true のあいだ、生成は投稿せずキューに積むだけ。

---

## 5場面（hypotheses.json）

| slug | 場面 | 出す時間帯 |
|---|---|---|
| `message` | 送る前のLINEで止まる | 朝 |
| `photo` | 自己紹介文が読まれているか | 朝 |
| `date` | 誘うタイミングが決まらない | 夜 |
| `signal` | デートのあと、どう動くか | 夜 |
| `distance` | 距離感で迷う | 夜 |

時間帯の出し分けは `persona.posting.slot_type_map`。
朝＝出す前のもの、夜＝会ったあと・誘う前・距離感。

CTAは最終投稿に1本だけ。行き先は `/ask?plan=review&c={slug}` で、
押した人はその場面を選んだ状態で書き始められる。

### 問いかけ投稿（週2回・リンク無し）
`hypotheses.discovery_questions`。2つに割れる問いで閉じる。正解は書かない。

### 引用リソース（content_sources.json）
1リソース = 14投稿の在庫。`posting.source_post_ratio`（現在0.5）の確率で
在庫から単発1本を消費する。在庫切れなら連投にフォールバック。
仕様は `accounts/mens-body-lab/CONTENT_SOURCES.md`。

---

## 書かないこと（validator が機械的に弾く）

- 相手の気持ちの判定（脈あり・脈なし・本命）
- 効果の保証（モテる・落とす・攻略・成功率・必ず・絶対）
- 女性の反応の創作（「女性はこう思っています」）← 商品そのものが嘘になる
- 読む人や相手を見下す書き方（ダサい・痛い・キモい）
- 価格・割引

線引きは `persona.json` の `character.ng_words` / `never_write_list` が持つ。
厳格度は `persona["validation"]`。コード側（`core/validator.py`）の既定値は
旧事業向けなので、アカウント側の設定が優先される。

---

## コアモジュール

| モジュール | 役割 |
|---|---|
| `writer.py` | 生成。`generate_thread` が本線（連投）。プロンプトは persona から組む |
| `hypothesis.py` | 場面選択・均等配分・フェーズ管理 |
| `validator.py` | NG表現・文字数・品質チェック |
| `approvals.py` | 承認キューの状態機械 |
| `poster.py` | Threads API 投稿（連投は reply_to_id で連結） |
| `collector.py` | 投稿成果の回収・場面別集計 |
| `fetcher.py` | Threads API GET |
| `analyst.py` / `trend_analyzer.py` | 効果分析・伸びた構造の抽出 |
| `supervisor.py` | KILL_SWITCH・レートリミット |
| `scheduler.py` / `daemon.py` | 時間管理・半自動運用 |
| `config.py` / `main.py` | 設定・CLI司令塔 |
| `monetize.py` | 無効（`monetize.json` の enabled=false） |

**事業の文面をコードに書かない。** 書くと、アカウントを入れ替えても
前の事業の投稿が出続ける（実際に起きた。`_build_gift_thread_prompt` が
persona を無視して旧事業のギフト訴求を生成していた）。

---

## GitHub Actions（monorepo ルートの `.github/workflows/`）

| ワークフロー | スケジュール | 内容 |
|---|---|---|
| threads-post.yml | 毎日 09:00 / 21:00 JST | 生成 → 承認キュー |
| threads-post-approved.yml | 3hおき | 承認済みだけ投稿 |
| threads-collect.yml | 毎朝 | import-history + 数値回収 |
| threads-token-refresh.yml | 45日周期 | 長命トークンの更新 |

`KILL_SWITCH` ファイルがあると post / post-approved は投稿しない。

---

## 技術スタック

- Python 3.10+（標準ライブラリ中心。python-dotenv / gspread のみ）
- Threads Graph API v1.0
- Gemini API（gemini-2.0-flash）
- Google Sheets API（任意）
- GitHub Actions
- pytest 211件パス
