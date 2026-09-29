# 決済を開くまでにやること

いまの状態は `/admin/setup` で見られます（Basic 認証の後ろ）。
このファイルは手順、あちらは現在地です。食い違ったら、あちらが正しい。

---

## 1. 代表者名と電話番号（特定商取引法）

これが入るまで、決済のボタンは出ません。API も 503 を返します。

**Vercel の環境変数に入れてください。**

| 名前 | 中身 |
|---|---|
| `LEGAL_REP_NAME` | 代表者名 |
| `LEGAL_TEL` | 電話番号 |

Vercel → プロジェクト → Settings → Environment Variables → Production

`src/lib/legal.ts` に直接書いても動きますが、**公開リポジトリに個人の
電話番号が残ります。** 環境変数のほうをおすすめします。

入れたあとは、再デプロイが要ります（環境変数は build 時に読まれます）。

---

## 2. Stripe の鍵

| 名前 | どこで取るか |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe ダッシュボード → 開発者 → APIキー → シークレットキー |
| `STRIPE_WEBHOOK_SECRET` | 開発者 → Webhook → エンドポイントを追加 → 署名シークレット |

**Webhook の宛先**

```
https://hisrecoveries.com/api/stripe/webhook
```

**送ってもらうイベント**

```
checkout.session.completed
payment_intent.succeeded
payment_intent.payment_failed
charge.refunded
checkout.session.expired
```

`STRIPE_WEBHOOK_SECRET` が無いと、Webhook は全部はじかれます（署名を
確かめられないため）。両方入れてください。

なお、決済から戻ってきた時点で Stripe に直接聞きにいくので、
Webhook が遅れても配信は始まります。Webhook は取りこぼしの受け皿です。

---

## 3. データベース

| 名前 |
|---|
| `SUPABASE_URL` |
| `SUPABASE_SERVICE_ROLE_KEY` |

サービスロールキーはサーバー側でしか使っていません（`src/lib/db.ts`）。
ブラウザには出ません。

---

## 4. テーブルを作る

`supabase/schema.sql` を本番の SQL エディタに貼って実行してください。
何度流しても壊れないように書いてあります（`if not exists` / `add column if not exists`）。

新しく増えているもの:

- 残高・台帳・出金（`responder_balances` / `responder_ledger` / `payouts`）
- 共有（`shares`）
- 紹介（`responders.referral_code` など）
- 恋愛の段階（`consultations.journey_step`）

---

## 5. 答えてくれる女性を集める

**ここだけは、コードで解決できません。**

1件に5人お届けするので、その1.5倍（**8人**）が「いま答えられる」状態に
ならないと、買うボタンが出ません。これは `src/lib/supply.ts` の判定です。

```
/join から登録してもらう
  ↓
年齢と立場を確認する
  ↓
responders の active と verified_age を true にする
  ↓
本人に /me/<token> のリンクを渡す
  ↓
その人が「今、答えられます」を ON にする
```

`token` は登録時に自動で作られます（`responders.token`、`p` で始まる33文字）。

---

## 確かめ方

1〜4 が終わったら `/admin/setup` を開いてください。全部 ✓ になっていれば、
トップの「いまお支払いを受け付けていません」が消えて、買うボタンが出ます。

5 が足りないあいだは、ボタンの代わりに
「いま答えられる方が◯人です」と出ます。これは正しい動きです。
