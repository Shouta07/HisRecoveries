# His Recoveries — Threadsギフト導線（完全自動・連投マーケティング）

His Recoveries『**第一印象パッケージ**（カウンセリング＋メイク＋服選び 1日完結）』を、
**パートナー（妻・彼女）向けのギフト**としてThreadsに連投で届ける。
唯一のThreads自動アカウント（**@hisrecoveries_jp** / account_id `mens-body-lab`）。

投稿の文面仕様は **GIFT_PROMPT.md** が正本。本書は仕組み（自動化）の説明。

## 位置づけ（全体戦略の中で）

集客の主エンジンはSEO/GEO×オウンドメディア(/areas)。Threadsはソーシャルの主力で、
「悩みに寄り添う共感 ＋ 大切な人へ贈れるギフト」のアングルで拡散とギフト需要を取り、
**完全守秘の予約導線（/apply）**へ橋渡しする。売らない・煽らない・効果断定しないを厳守。

> かつての当事者ペルソナ「Nagi」は廃止。His Recoveries 一本に統合済み。
> 女性（贈り手）の気づきから、彼氏・夫の申込（/apply）へ橋渡しする。

## 仕組み（このトラック専用の追加開発）

完全自動化のために、以下を新規実装した。

### 1. 連投（スレッド）投稿
- `persona.json` の `posting.format = "thread"` で連投モードになる。
- `writer.generate_thread()` が機会別に3〜6投を生成（共感→気づき→紹介→CTA→リプ誘発）。
- `poster.create_thread_chain()` が1投目→返信→返信…とThreads APIの `reply_to_id` で連結。
- CTAリンクは**最終投稿に1つだけ**（`/apply?utm_campaign=<機会>`）。

### 2. アカウント別バリデーション緩和
- `persona.json` の `validation` ブロックで、giftだけ規律を緩める：
  - `require_first_person_boku: false`（一人称「私」を許可）
  - `max_emoji: 2` / `max_hashtags: 1`
  - `require_recommended_words / require_allowed_topics / require_three_stage: false`
  - `check_similarity: false`（機会別テンプレの反復を許可）
- **安全装置は維持**：パートナー否定・効果保証・医療断定・ビフォーアフター・
  強い売り込み（ぜひ/おすすめです）・リアクション誘導（いいねして等）は
  緩和後も `validate_post` が弾く。

### 3. 機会別の仮説（5 slug）
| slug | 機会 | UTM campaign |
|---|---|---|
| gift-birthday | 誕生日 | gift-birthday |
| gift-anniversary | 記念日・プロポーズ前 | gift-anniversary |
| gift-wedding | 結婚式（友人として） | gift-wedding |
| gift-career | 転職・昇進・就活 | gift-career |
| gift-fathersday | 父の日・クリスマス | gift-fathersday |

explore フェーズで均等出稿し、どの機会が `/apply` 遷移を生むかを検証する。

## 配信

- ワークフロー: `.github/workflows/post.yml`（毎日自動 ＋ `workflow_dispatch` 手動）。
- `mock=true` でテンプレ連投、`mock=false` かつ Gemini キーありでAI連投（GIFT_PROMPT準拠）。
- トークン: `THREADS_ACCESS_TOKEN`（@hisrecoveries_jp の実アカウント）。
- まず `dry_run=true` で生成結果だけ確認 → 問題なければ `dry_run=false` で実投稿。

## 計測

- `/apply?utm_source=threads&utm_medium=social&utm_campaign=gift-<機会>` を GA4 で受ける。
- どの機会の連投が申込導線（/apply）への遷移を生むかを比較し、勝ち筋を横展開する。

## ローカル確認

```bash
# 連投をmockで生成して内容を確認（投稿しない）
python -m core.main post mens-body-lab --mock --dry
```
