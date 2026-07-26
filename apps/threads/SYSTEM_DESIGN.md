# His Recoveries — 事業仮説探索システム

## 概要

| 項目 | 内容 |
|---|---|
| アカウント | @hisrecoveries_jp (Nagi) |
| ブランド | His Recoveries / バイタリティデザイン合同会社 |
| プロフURL | https://his-recoveries.vercel.app |
| 目的 | **事業仮説の発見**（フォロワー増ではない） |
| 現フェーズ | Phase 0: 探索期（8仮説を均等検証） |

**このシステムはコンテンツ自動化ツールではない。事業仮説探索システムである。**

---

## 自動フロー（毎日3回実行）

```
07:30  Hypothesis Engine → Writer → Validator → Poster → 投稿
22:30  Hypothesis Engine → Writer → Validator → Poster → 投稿
09:00  Collector → Threads API → 成果回収 → hypothesis_results.json
```

---

## Hypothesis Engine（8仮説）

| ID | 仮説 |
|---|---|
| hygiene | 男性は清潔感に強く反応する |
| aging_anxiety | 男性は老化不安に強く反応する |
| confidence | 男性は自信喪失に強く反応する |
| presence | 男性はPresenceに強く反応する |
| recovery_story | 男性は回復実例に強く反応する |
| loneliness | 男性は孤独に強く反応する |
| self_investment | 男性は自己投資に強く反応する |
| conditioning | 男性はコンディション維持に強く反応する |

### CTA実験（4バリアント）

| ID | CTA |
|---|---|
| none | CTAなし |
| profile_nudge | 整え方、プロフにまとめています。 |
| assessment | 自分の状態を知りたい方へ。プロフから。 |
| dm_invite | 同じ悩みを抱えていたら、いつでも。 |

### 実験フェーズ

| フェーズ | 期間 | 内容 |
|---|---|---|
| explore | 最初の5週 | 8仮説を均等配分 |
| focus | 6〜10週 | 上位3仮説に集中 |
| commit | 11週〜 | 最強仮説に全投下 |

---

## コアモジュール（15ファイル）

| モジュール | 役割 |
|---|---|
| `hypothesis.py` | **仮説選択・実験管理・配分制御** |
| `collector.py` | **投稿成果回収・仮説別集計** |
| `writer.py` | 仮説起点の投稿生成 |
| `validator.py` | 17項目品質チェック |
| `poster.py` | Threads API投稿 |
| `sheets.py` | Google Sheets連携 |
| `researcher.py` | トレンド収集 |
| `fetcher.py` | データ取得 |
| `analyst.py` | 効果分析 |
| `supervisor.py` | 安全装置 |
| `monetize.py` | 無効 |
| `scheduler.py` | 時間管理 |
| `daemon.py` | 半自動運用 |
| `config.py` | 設定管理 |
| `main.py` | CLI司令塔 |

---

## テンプレート（30種）

- 悩み系 8種（清潔感/ワキガ/多汗症/匂い/鏡/スキンケア/皮膚科/季節）
- モテ・信頼系 3種
- 写真キャプション系 3種（カフェ/横顔/日常）
- コミュニティ系 2種（共感/DM）
- 体験導線系 2種
- 短文系 6種（一言_清潔感/匂い/鏡/整える/汗/信頼）
- 問いかけ系 4種（問い_清潔感/匂い/スキンケア/皮膚科）
- Discovery Questions 6種（ユーザー理解用）

---

## GitHub Actions

| ワークフロー | スケジュール | 内容 |
|---|---|---|
| post.yml | 毎日 07:30 + 22:30 JST | 仮説起点で投稿 |
| collect.yml | 毎日 09:00 JST | 前日の投稿の数値を回収 |

---

## 技術スタック

- Python 3.10+
- Threads Graph API v1.0
- Gemini API（gemini-2.0-flash）
- Google Sheets API（gspread、接続待ち）
- GitHub Actions
- pytest 131件パス
