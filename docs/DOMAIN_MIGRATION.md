# tashikame.app に移す手順

更新 2026-10-03

コード側は済んでいる。残りは設定で、**順番を間違えると取り返しがつかない**。

---

## 先に知っておくこと

### いちばん危ないのは、301 を早く入れること

旧ドメインから新ドメインへ 301 を入れると、**旧ドメインは開けなくなる**。
新しい側が壊れていても、戻る道が無い。

だから 301 は**いちばん最後**。新しい側を本番で確認してから。

### 旧ドメインを手放さない

301 を返している期間が、そのまま移行期間になる。
切れた瞬間に、それまでの評価と、外から貼られているリンクが全部死ぬ。

最低1年は持つ。

### .app は HTTPS でしか開けない

`.app` は HSTS preload されたTLDで、ブラウザが HTTP を拒否する。
Mixed Content があると、画像1枚でもページが壊れる。

コード側に判定を置いてある（`site.ts`）。
`http://` や `www.` が正式URLに入ると、公開前に止まる。

---

## コード側で、もう済んでいること

| | |
|---|---|
| 正式URLの既定値 | `NEXT_PUBLIC_APP_URL ?? NEXT_PUBLIC_SITE_URL ?? "https://tashikame.app"` |
| 旧ブランドの削除 | `His Recoveries` は配信物から0件（全ページ実測済み） |
| `www` の正規化 | `www.tashikame.app` → `tashikame.app` の301（`next.config.mjs`） |
| Threads の CTA | 投稿に載る行き先を新ドメインへ（下記） |
| Search Console のリンク | `site.url` から作る形に |
| 戻ってこない判定 | 旧ドメイン・`www`・`http`・末尾スラッシュ・旧ブランドで、公開前に止まる |

**canonical・OGP・sitemap・robots・feed・Stripe の戻り先は、全部 `site.url` を読んでいる。**
環境変数を1つ入れれば、全部ついてくる。

### 実測した配信物（ローカルの本番ビルド）

| | |
|---|---|
| canonical | `https://tashikame.app/...`（`/` `/trial` `/legal` で確認） |
| `og:url` / `og:site_name` | `https://tashikame.app` ／ `タシカメ` |
| `sitemap.xml` | 出てくるホストは `tashikame.app` だけ |
| `robots.txt` | `Host:` と `Sitemap:` が新ドメイン |
| `feed.xml` | 同上 |
| 構造化データ | `url` は新ドメイン（`sameAs` は後述） |
| `llms.txt` | 新ドメイン |
| Stripe の `success_url` / `cancel_url` | `site.url` から作る（`api/checkout/route.ts`） |

`src/` の中に、自サイトのURLをベタ書きしている場所は **0件**。
正式URLを持つのは `lib/site.ts` だけ。

### src の外にも、外へ出ていく口があった

`src/` を直しても、**Threads に投稿されるCTAは旧ドメインのまま**だった。
`apps/threads` は別のアプリで `site.ts` を読めないので、取り残されていた。

直したもの（投稿の行き先を作る側）:

- `accounts/mens-body-lab/hypotheses.json` の `link_config.base_urls.apply`
  — **新しい投稿のCTAは、ここ1か所から作られる**
- `seo_clusters.json` の `ask_url`
- `content_sources.json`
- `approvals.json`（まだ**1件も投稿していない**ので、6件すべてが「これから出すもの」）
- 文書とテスト

> 投稿**済み**のものは書き換えない。何を出したかの記録なので、
> 書き換えると記録が嘘になる。`check-domain.mjs` も、
> `posted_at` が入っているものは見ない。

### 戻ってこないようにした

`scripts/check-domain.mjs` が、公開の前に2つを見る。

1. 旧ドメインが**URLとして**残っていないこと（コメントと `*.md` は見ない）
2. 正式ドメインが `src/` に**ベタ書き**されていないこと（持つのは `site.ts` だけ）

見る範囲は `src` / `apps/threads` / `packages` / `scripts` / `next.config.mjs`。
どちらかに当たると `npm run build` が止まる。

### ログイン／登録URLについて

**このサービスに会員登録とログインは無い。**
相談ごとに発行されるリンク（トークン）だけで結果を見る形なので、
認証の戻りURLは存在しない。Supabase Auth の設定は、
将来使うときのために入れておく（下の手順6）。

### 外部アカウントは、勝手に変えていない

構造化データの `sameAs` に、こう残っている。

```
https://hisrecoveries.substack.com
https://www.threads.com/@hisrecoveries_jp
https://x.com/his_recoveries
https://note.com/his_recoveries
```

これらは**旧ドメインではなく、実在する外部アカウントの名前**。
こちらで書き換えるとリンクが切れる。

アカウント名を変えるかどうかは運営の判断。変えたら `lib/site.ts` の
`social` と `handle` を直す（`sameAs` は自動でついてくる）。

---

## 手順

### 1. ドメインを用意する

- `tashikame.app` を取得（まだなら）
- `www.tashikame.app` も押さえておく（301で寄せる先として）

### 2. Vercel にドメインを足す

1. Project → Settings → Domains
2. `tashikame.app` を追加
3. `www.tashikame.app` も追加
4. **`tashikame.app` を Primary にする**
5. 表示される DNS レコードを、ドメイン側に設定

> ここまでで、`https://tashikame.app` が開くようになる。
> **まだ旧ドメインも開く。** これでいい。

### 3. 環境変数を入れる

Vercel → Settings → Environment Variables

```
NEXT_PUBLIC_APP_URL = https://tashikame.app
```

Production / Preview / Development のうち、**Production に入れる**。

### 4. 再デプロイする

**環境変数を入れただけでは反映されない。**
`/legal` `/terms` `/privacy` などは静的生成なので、ビルドし直さないと古いURLのまま。

Vercel → Deployments → 最新のものを Redeploy。

### 5. 新しい側を、実際に確認する

`https://tashikame.app` を開いて、次を見る。

- [ ] トップが出る
- [ ] `/plans` `/legal` `/terms` `/privacy` が出る
- [ ] ページのソースで `rel="canonical"` が `tashikame.app` になっている
- [ ] `og:url` と `og:site_name` が新しいものになっている
- [ ] `His Recoveries` がソースに出てこない
- [ ] `/sitemap.xml` の中身が `tashikame.app` になっている
- [ ] `/robots.txt` が出る
- [ ] 画像・CSS が全部 HTTPS（Mixed Content が無い）

**ここが全部通るまで、次へ進まない。**

### 6. Supabase Auth

Supabase → Authentication → URL Configuration

| | |
|---|---|
| Site URL | `https://tashikame.app` |
| Redirect URLs | `https://tashikame.app/**` を追加 |

開発用（`http://localhost:3000/**`）は**消さない**。消すと手元で開発できなくなる。

旧ドメインの Redirect URL は、301 を入れるまで残しておく。

### 7. Stripe

| | |
|---|---|
| Webhook | エンドポイントのURLを `https://tashikame.app/api/stripe/webhook` に |
| Checkout の戻り先 | **設定不要**（`site.url` から作っているので、環境変数で追従する） |
| Customer Portal の戻り先 | 同上 |

Webhook を付け替えたら、**署名シークレットが変わる**。
新しい `STRIPE_WEBHOOK_SECRET` を Vercel に入れ直して、再デプロイ。

> Stripe に事業内容を出したあとなら、**住所が変わったことを伝える**。
> 申請時と違うドメインで決済が動いていると、そこを聞かれる。

### 8. Search Console

1. `tashikame.app` をプロパティとして追加
2. `sitemap.xml` を送信
3. **まだ「アドレス変更」は使わない**（301 を入れてから）

### 9. SNS・外部

- Threads のプロフィールのリンク
- そのほか貼ってあるところ

Threads の投稿内のCTAは、コード側で新ドメインに直してある。

### 10. ここで、はじめて 301 を入れる

**5〜9 が全部済んでから。**

Vercel で `hisrecoveries.com` を `tashikame.app` へリダイレクトする設定にする
（Vercel の Domains で、Redirect to を指定する）。

入れたら確認する。

- [ ] `https://hisrecoveries.com/` が `https://tashikame.app/` へ 301 で飛ぶ
- [ ] `https://hisrecoveries.com/articles` が `https://tashikame.app/articles` へ飛ぶ（パスが保たれる）
- [ ] 301 であること（302 ではない）

### 11. Search Console で「アドレス変更」

301 が動いてから申請する。

### 12. しばらく見る

- Search Console の「カバレッジ」でエラーが増えていないか
- 旧ドメインの表示回数が減り、新ドメインが増えているか

完全に移りきるまで数か月かかる。**その間に旧ドメインを切らさない。**

---

## 記事55本について

本文に旧ドメインは **0件**。書き換えは要らない。

URL は `/articles` `/areas/...` のまま、ドメインだけ変わる。
301 でパスが保たれるので、記事の評価は新ドメインへ移っていく。

ただし、**55本のうち46本は前の商売のもの**（AGA・肌・体毛・健康）。
どれだけ読まれているかを把握しないまま消さないこと。
消すのは簡単だが、戻せない。

---

## 困ったら

### 新しい側が壊れた

**301 を入れる前なら、旧ドメインがそのまま生きている。**
環境変数を旧ドメインに戻して再デプロイすれば、元に戻る。

301 を入れたあとなら、まず 301 を外す。

### 検索から消えた

移行直後は一時的に落ちる。301 が正しく動いていれば戻る。
焦って旧ドメインを切らないこと。
