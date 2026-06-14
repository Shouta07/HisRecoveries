# His Recoveries — 技術仕様（最小実装の設計）

> 対象: §10（データ戦略 / Recovery Graph / 設計原則 / 技術所有）の最小実装。
> 方針: **今は「同意モデル」と「データモデル（リンクのスキーマ）」を確定する**。
> 実装ランタイム（LINE ボット等）は必要時に建てる。後から付け替えると最も高くつく層を先に固める。
> 関連: [`BUSINESS_PLAN.md`](./BUSINESS_PLAN.md) §10。

---

## 0. 原則（実装に効く形で）

- **持つ**: リンクのデータモデル / 同意・プライバシー層 / 低摩擦の取得・推論 / 声と判断 / 一次データ。
- **借りる**: 基盤モデル(LLM)・クラウド・LINE・可視化部品。
- **持たない**: デバイス・現場・製品。
- **PII を Graph に入れない**: 個人識別はハッシュ/仮名 ID のみ。生メールは保存しない（SHA-256）。
- **"覗かずに繋ぐ"**: 生の連続データではなく、可能な限り**特徴量/要約**を保持。
- **同意なきデータは存在しないものとして扱う**（収集も連携もしない）。

## 1. 同意モデル（Consent）

目的別・粒度ありの同意。いつでも撤回でき、撤回＝以後の利用停止＋消去要求に応じる。

- **粒度（purpose-bound）**: データ種別ごとに個別同意。
  - `check`（Recovery Check 回答の保存・編集者の閲覧）
  - `device`（外部デバイスの read-only 連携：睡眠/活動/食事など、種別ごと）
  - `contact`（メール等での連絡）
  - `research`（匿名集計＝Recovery Data への利用）
- **記録（versioned）**: 同意は版・時刻・スコープ付きで保存。文言変更時は再同意。
- **撤回・消去**: `revoked_at` を立て、以後利用停止。消去要求で当人データを物理/論理削除。
- **最小化**: 目的に不要なデータは取得しない。

## 2. データモデル — Recovery Graph（スキーマ確定）

ノード（人・行動・課題・行動・結果）と、それを結ぶ**エッジ（リンク）が独占資産**。
以下は Postgres（Supabase）想定の最小スキーマ。生 PII は持たない。

```sql
-- 仮名の人（PIIなし。メールは別テーブルでハッシュのみ）
create table person (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  locale        text default 'ja'
);

-- 連絡先はハッシュのみ（生メールは保存しない / 連絡は別経路の暗号化保管を検討）
create table identity (
  person_id     uuid references person(id) on delete cascade,
  email_sha256  text unique,           -- SHA-256(lower(trim(email)))
  line_user_id  text unique,           -- LINE連携時のみ
  primary key (person_id)
);

-- 目的別・版付き同意
create table consent (
  id            uuid primary key default gen_random_uuid(),
  person_id     uuid references person(id) on delete cascade,
  scope         text not null,         -- 'check'|'device'|'contact'|'research'
  version       text not null,
  granted_at    timestamptz not null default now(),
  revoked_at    timestamptz
);

-- 課題（悩み）：Check / feeling 由来
create table concern (
  id            uuid primary key default gen_random_uuid(),
  person_id     uuid references person(id) on delete cascade,
  territory     text not null,         -- 'sweat-odor' 等（既存6領域）
  self_rating   int,                   -- 本人の自己評価 1-5
  observed_at   timestamptz not null default now()
);

-- 行動/生活シグナル：device(read-only) / check / self 由来。生streamでなく特徴量。
create table signal (
  id            uuid primary key default gen_random_uuid(),
  person_id     uuid references person(id) on delete cascade,
  source        text not null,         -- 'device'|'check'|'self'
  kind          text not null,         -- 'sleep'|'activity'|'diet'|'stress'...
  feature       text not null,         -- 'sleep_debt'|'avg_steps' 等の特徴量名
  value         numeric,
  observed_at   timestamptz not null,
  ingested_at   timestamptz not null default now()
);

-- 行動（とった半歩）：online/offline 問わず
create table action (
  id            uuid primary key default gen_random_uuid(),
  person_id     uuid references person(id) on delete cascade,
  kind          text not null,         -- 'self_care'|'salon'|'clinic'|'rest'...
  partner_id    uuid,                  -- 認証パートナー（任意）
  taken_at      timestamptz not null default now()
);

-- 結果（変化）：自己申告 or シグナル由来
create table outcome (
  id            uuid primary key default gen_random_uuid(),
  person_id     uuid references person(id) on delete cascade,
  concern_id    uuid references concern(id) on delete set null,
  delta         text,                  -- 'better'|'same'|'worse' or 数値
  source        text not null,         -- 'self'|'signal'
  observed_at   timestamptz not null default now()
);

-- ★ エッジ（リンク）＝独占資産：どの signal/行動 が どの課題/結果 と結びつくか
create table link (
  id            uuid primary key default gen_random_uuid(),
  person_id     uuid references person(id) on delete cascade,
  from_kind     text not null,         -- 'signal'|'action'
  from_id       uuid not null,
  to_kind       text not null,         -- 'concern'|'outcome'
  to_id         uuid not null,
  weight        numeric,               -- 相関の強さ（学習で更新）
  note          text,
  created_at    timestamptz not null default now()
);
```

- **RLS / 権限**: 既存方針通り、サービスキーはサーバ専用。匿名挿入は最小限。
- **Recovery Data（§10）**: `signal/concern/action/outcome/link` を **person を伏せて集計**し
  エクスポート（research 同意者のみ・k-匿名性等の確認）。

## 3. プライバシー / PETs（段階）

- **MVP（今）**: 仮名化 + メール SHA-256 + データ最小化 + アクセス制御 + 保存時暗号化 +
  分析に PII を出さない。
- **次段**: デバイス特徴量の**オンデバイス/エッジ算出**（生データを送らない）。
- **将来**: Recovery Data の集計に**差分プライバシー**、必要なら秘密計算。

## 4. LINE 伴走 AI（PoC アーキテクチャ）

```
LINE 公式アカウント
  ├ Messaging API（Webhook）→ バックエンド → LLM(借用) [声のSystemプロンプト+ガードレール]
  ├ LIFF（Web）→ Recovery Check / 状態の可視化 / 同意UI / 決済
  └ identity: line_user_id ⇄ person（consent 必須）
```

- **LLM は借りる**が、**声・判断・ガードレール・評価セットは自前**（§10.3）。
- **ガードレール（必須）**: 医療の断定・診断・受診勧奨をしない／一人称・過去形の声を保つ／
  不安を煽らない／確信が持てない時は人(編集者)へエスカレーション。
- **低摩擦入力**: 会話で1問ずつ・1タップ・写真/音声。フォームを出さない。
- **評価**: 声の一貫性・禁止表現・安全性を測る eval セットを用意（リグレッション防止）。

## 5. 最小ビルド順序（PoC）

1. **同意 + person + Check 取り込み**（スパイン）— ここだけは自前で確定。
2. **Check への声の AI 返信**（伴走の種）— 既存 `checkReport` を LLM＋ガードレールで強化。
3. **LINE チャネル**（公式アカウント + LIFF で Check と返信）。
4. （後）**デバイス read-only 連携**（HealthKit/Google Fit/Oura）→ `signal`。
5. （後）**link の生成・学習**（相関）→ Recovery Data / 兆候→アクション。

## 6. 今は作らない
- デバイス/ハード、フル Recovery Path（ゲーミフィケーション本体）、本格 ML パイプライン、
  ネイティブアプリ（海外フェーズまで）。

## 7. 推奨スタック（軽い・既存と整合）
- DB: Supabase(Postgres)（既存）。Graph は同 DB のリレーションで開始（専用 graph DB は不要）。
- バックエンド: Next.js API もしくは小さな専用サービス。
- LINE: Messaging API + LIFF。LLM: API 経由（差し替え可能に抽象化）。

## 8. 未決事項
- 連絡先（生メール）の扱い: 送信が要る局面の暗号化保管 vs LINE 一本化。
- `signal` の特徴量セットの初期定義（睡眠/活動/食事で何を持つか）。
- link の学習方法（初期はルール/相関、後で統計/ML）。
- PoC を toB（パートナー院内）と toC のどちらで先に回すか。
