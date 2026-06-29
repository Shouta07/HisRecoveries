# SEO / GEO 運用手順（Search Console ほか）

> 対象: His Recoveries（hisrecoveries.com）
> 前提: GA4（G-DWTE9DWQ0S）導入済み、sitemap.xml / llms.txt / 構造化データ（Article・FAQPage・Breadcrumb）実装済み、robots は主要AIクローラを全許可済み。

---

## 1. Google Search Console（最優先）

### 1-1. プロパティ登録・所有権確認
1. https://search.google.com/search-console → プロパティを追加。
2. **「ドメイン」プロパティ**を推奨（DNS TXT で確認 → www有無/httpsをまとめて計測）。
   - 取得した TXT レコードをドメインの DNS に追加。
   - DNS をいじれない場合は **「URL プレフィックス」プロパティ**（`https://hisrecoveries.com/`）にし、**GA4 連携で所有権確認**（GA4 が入っているので最短）。

### 1-2. サイトマップ送信
- 「サイトマップ」→ `sitemap.xml` を送信。
- ステータスが「成功しました」になるか数日後に確認。

### 1-3. 主要URLのインデックス登録リクエスト
「URL 検査」に以下を入れて **インデックス登録をリクエスト**：
- `https://hisrecoveries.com/`
- `https://hisrecoveries.com/areas/hair`
- `https://hisrecoveries.com/areas/sweat`
- `https://hisrecoveries.com/areas/skin`
- `https://hisrecoveries.com/areas/face`
- `https://hisrecoveries.com/areas/body-hair`
- `https://hisrecoveries.com/areas/self`

### 1-4. 旧URLの掃除（古いインデックス対策）
- 古い `/about`・`/legal` 等は `next.config.mjs` で 301 リダイレクト済み。
- まだ検索結果に古い内容が残る場合は、「**削除**」ツールで一時的に非表示にしつつ、リダイレクト反映で自然に更新されるのを待つ。
- 古い sitemap を以前送っていれば削除。

### 1-5. 構造化データの検証
- **リッチリザルト テスト**（https://search.google.com/test/rich-results）で各 `/areas/{id}` を検査 → FAQ / Article / パンくず が認識されるか確認。
- Search Console の「拡張」→ FAQ / パンくず のエラーを監視。

### 1-6. 継続監視（月次）
- 「検索パフォーマンス」でクエリ・表示回数・CTR・掲載順位を確認。
- 伸びているクエリ＝次に書く記事のヒント。CTRが低いページはタイトル/説明を改善。
- 「ページ エクスペリエンス / Core Web Vitals」も確認。

---

## 2. Bing Webmaster Tools

- https://www.bing.com/webmasters → **Search Console からインポート**（ワンクリックで移行可）。
- sitemap 送信。
- Bing は一部のAI回答（Copilot 等）の土台にもなるため、GEO 的にも有効。

---

## 3. GEO（生成エンジン最適化）の確認

- `https://hisrecoveries.com/llms.txt` が現行内容で配信されているか確認（AI クローラ向け要約）。
- `robots.txt`（`/robots.txt`）で GPTBot・ClaudeBot・PerplexityBot・Google-Extended 等が allow になっているか確認（実装済み）。
- 各 `/areas` ページの**冒頭「要点」**と**FAQ**が、AIに抽出されやすい自己完結文になっているか（実装済み）。
- 出典（引用）を入れるほど、AI が「根拠つき」で引用しやすくなる → `citations.ts` を充実。

---

## 4. これからのコンテンツSEO（トピッククラスタ）

- 6領域（/areas）＝ピラー。各領域に**関連ロングテール記事**を足し、相互内部リンク。
  - 例（薄毛）：「AGA 初期症状」「つむじ 薄い 原因」「生え際 後退 セルフチェック」
- すべて「悩み×原因/仕組み」で**理解の入口**を取り、`/#how`（Recovery Journey）→ `/apply` へ内部リンクで送る。
- E-E-A-T：医師監修の明記、出典リンク、最終更新日（実装済み）。

---

## 5. 効果測定（ファネル）

| 段階 | 指標 | ツール |
| --- | --- | --- |
| 流入 | 表示回数・クリック・順位 | Search Console |
| 回遊 | /areas → /#how → /apply の遷移 | GA4（経路データ探索） |
| CV | 予約フォーム送信 | GA4 イベント / Formspree |

> まずは Search Console 登録 → sitemap 送信 → /areas のインデックス登録リクエスト、の3つを実行すれば動き出します。
