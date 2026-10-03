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

## 1.5. 体験の受け付け（Stripe が通るまでの入口）

審査が終わるまでのあいだ、相談する人の入口は `/trial`。
**設定は要らない。既定で開いている。**

| 名前 | |
|---|---|
| `TRIAL_OPEN` | `0` で閉じる。入れなければ開いている |

> 保存先（上の Supabase）が入っていないと、API は 503 を返し、
> 画面はメールで送る道に切り替わる。**書いたものは消えない。**
>
> ただし、そのあいだ申し込みはデータベースに残らない。
> 広告を回す前に、Supabase の鍵が本番に入っているかを見ること。
> `trial_mailto` のイベントが出ていたら、保存できていない。

受け取ったあとの手順は `docs/TRIAL.md`。

---

## 2. Stripe の鍵

| 名前 | どこで取るか |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe ダッシュボード → 開発者 → APIキー → シークレットキー |
| `STRIPE_WEBHOOK_SECRET` | 開発者 → Webhook → エンドポイントを追加 → 署名シークレット |
| `STRIPE_PASS_PRICE_ID` | 月額を売るときだけ。商品カタログで「Tashikame Pass」を作り、月額 1,980円（JPY・定期）の Price を足して、その Price ID（`price_` で始まる）を入れる |

> `STRIPE_PASS_PRICE_ID` が入っていないあいだ、月額は受付前のまま。
> 単発（はじめの1件・3人に見せる・3人×5回）は、これが無くても売れる。
>
> 月額を開くと、特商法の表記と利用規約に、自動更新・更新日・解約の条件が
> ひとりでに足される（`passEnabled` を見ている）。
> 書き換え忘れが起きないよう、食い違ったらビルドが止まる。

**Webhook の宛先**

```
https://tashikame.app/api/stripe/webhook
```

**送ってもらうイベント**

単発だけを売るとき（5つ）

```
checkout.session.completed
payment_intent.succeeded
payment_intent.payment_failed
charge.refunded
checkout.session.expired
```

月額も売るとき（上の5つに、これを足して10）

```
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
invoice.paid
invoice.payment_failed
```

> 実装は `src/app/api/stripe/webhook/route.ts`。
> 上の5つは switch が、下の5つは月額の分岐（`lib/pass/store.ts` の PASS_EVENTS）が受ける。
> `checkout.session.completed` は両方に来るので、`mode` で分けている。
> 足りないと、払われたのに会員にならない状態になる。

`STRIPE_WEBHOOK_SECRET` が無いと、Webhook は全部はじかれます（署名を
確かめられないため）。両方入れてください。

なお、決済から戻ってきた時点で Stripe に直接聞きにいくので、
Webhook が遅れても配信は始まります。Webhook は取りこぼしの受け皿です。

---

## 3. データベース

| 名前 |
|---|
| `SUPABASE_URL` |
| `SUPABASE_SERVICE_KEY` |

名前を間違えないでください。`SUPABASE_SERVICE_ROLE_KEY` ではありません
（この文書が長らく間違っていました）。コードが読むのは `SUPABASE_SERVICE_KEY`
です（`src/lib/db.ts`）。違う名前で入れると、つながらないまま静かに動きます。

サービスロールキーはサーバー側でしか使っていません。ブラウザには出ません。

---

## 4. テーブルを作る

`supabase/schema.sql` を本番の SQL エディタに貼って実行してください。
何度流しても壊れないように書いてあります（`if not exists` / `add column if not exists`）。

新しく増えているもの:

- 残高・台帳・出金（`responder_balances` / `responder_ledger` / `payouts`）
- 共有（`shares`）
- 紹介（`responders.referral_code` など）
- 恋愛の段階（`consultations.journey_step`）
- 販売の集計（`sales_daily` / `sales_by_source` / `funnel_by_source` / `checkout_blocks`）

`payments` の列名が、以前ここに書いてあったものと違います（`amount` /
`payment_status`）。古い DB で作っている場合も、このファイルを流せば直ります。
コードと schema がずれていないかは、ビルドのたびに機械が見ています
（`npm run check:schema`。ずれているとビルドが落ちます）。

---

## 5. 計測と広告のタグ（販売を回すなら）

入れた鍵の分だけ動きます。無ければ、そのタグは読み込みません。

| 名前 | 何のため |
|---|---|
| `NEXT_PUBLIC_GA_ID` | GA4（`G-` で始まる） |
| `NEXT_PUBLIC_GOOGLE_ADS_ID` | Google 広告（`AW-` で始まる） |
| `NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL` | 購入のコンバージョンラベル（`AW-…/` の後ろ） |
| `NEXT_PUBLIC_META_PIXEL_ID` | Meta（Facebook / Instagram）ピクセル |

`NEXT_PUBLIC_` が付くものはブラウザに出ます。どれも公開してよい値です。
秘密の鍵をここに入れないでください。

入れると、購入時に媒体が成果として読める形でも送られます。
媒体は受け取った成果で配信を寄せるので、これを渡さないかぎり
出稿を増やしても効率は上がりません。

計測は利用者が `/privacy` から止められます。止めた端末では、
タグそのものを読み込みません。

---

## 6. 毎日見る画面

`/admin/sales`（Basic 認証の後ろ）。

- 今日 / 7日 / 30日 の売上・件数・平均単価
- どこで落ちているか（着地 → 料金 → 送信 → 決済へ → 購入）
- どの流入が売上になったか
- 決済を始められなかった理由（法令や鍵の不足がここに数で出ます）
- 出稿用リンクの作成（utm を手で書かない）

広告費はこちらでは分かりません。件数と売上を、媒体側の費用と
突き合わせてください。

---

## 7. 答えてくれる女性を集める

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

7 が足りないあいだは、ボタンの代わりに
「いま答えられる方が◯人です」と出ます。これは正しい動きです。

---

## 集客を開ける前に、1件だけ自分で買う

ここまでの設定は、本番で一度も通していません。出稿を始める前に、
自分で1件買って、最後まで通ることだけは確かめてください。

1. `/ask` から相談を1件出して、実際にカードで払う
2. `/admin/sales` の「今日」に、件数と金額が出ることを確認する
3. Stripe のダッシュボードで、Webhook が 200 を返していることを確認する
4. `/admin/sales` の「注文の状況」で、回答が集まりはじめているのを確認する
5. `/admin/sales` の「決済を始められなかった回」が増えていないことを確認する

ここが通らないまま出稿すると、払わせておいて何も返せません。
