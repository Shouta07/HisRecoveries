# 人が入れないと進めないもの

作業は止めていない。ここに書いたものだけ、人の手が要る。

---

## 1. 特定商取引法に基づく表記（最優先）

`LEGAL_REP_NAME` と `LEGAL_TEL`。

**これが入るまで、1円も課金できない。** `canCharge()` が false のまま、
`POST /api/checkout` は 503 を返す。ここまで作ったもの全部が動かない。

Vercel の環境変数に入れる。この会話やファイルに書かない。

## 2. Stripe

`STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET`。

Webhook の宛先は `/api/stripe/webhook`。署名の検証は実装済み。

## 3. Supabase

`SUPABASE_URL` / `SUPABASE_SERVICE_KEY` / `SUPABASE_ANON_KEY`。

**そのうえで `supabase/schema.sql` を流し直すこと。** 今回足したもの：

- `spend_pass`（関数）— これが無いとチケットが減らない
- `relationship_cases` / `consultations.case_id` / `case_timeline`
- `responses.fix`
- `responders.takes_sensitive`

`create table if not exists` と `add column if not exists` で書いてあるので、
既存のデータは消えない。関数は `create or replace`。

## 4. 通話（開けるとき）

`DAILY_API_KEY`。入るまで通話商品は自動的に「受付前」のまま。

## 5. 機械では確かめられないもの

- 通話を受ける女性が、新しい約束（`responder/policy.ts`）に同意しているか
- 本人確認が済んでいるか
- 話している最中に止める連絡先が、双方の画面から辿れるか
- 特商法の「役務の提供時期」に、予約日時のことが書いてあるか
