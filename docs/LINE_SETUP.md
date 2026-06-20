# LINE 連携セットアップ

> 軽診断（Web 完結）→ LINE で詳細診断・SaaS、という Path A の MVP で
> 必要な LINE 側の準備と、本リポジトリ側の差し込み手順。

---

## 1. LINE 側で用意するもの

### 1-1. LINE 公式アカウント
- LINE Official Account Manager で「His Recoveries」公式アカウントを作成。
- 基本設定 → 「友だち追加用の URL」をコピーする（`https://lin.ee/xxxxx` のような形）。
- これが `NEXT_PUBLIC_LINE_ADD_FRIEND_URL` になる。

### 1-2. LINE Developers コンソール（後で）
LIFF（LINE 内 Web）や LINE Login が必要になるのは、SaaS フェーズ（状態管理・本診断）に
入るタイミング。MVP では「友だち追加」リンクだけで十分。後で必要になったら:

- LINE Login Channel を作成（Provider 内）。
- LIFF を作成（Endpoint URL に本サイトの `/liff/...` を指定）。
- 取得した `LIFF ID` を `NEXT_PUBLIC_LINE_LIFF_URL` に
  `https://liff.line.me/{LIFF_ID}` の形で設定。

---

## 2. 本リポジトリ側の環境変数

Vercel の Environment Variables に以下を追加（Production / Preview / Development）:

```
NEXT_PUBLIC_LINE_ADD_FRIEND_URL=https://lin.ee/XXXXXXXX
NEXT_PUBLIC_LINE_LIFF_URL=
```

- `NEXT_PUBLIC_*` は **クライアント側でも露出して構わない値**（公開URL）。
- 空欄のままでも UI は壊れない（「準備中」表示にフォールバック）。

設定後、Vercel で再デプロイすると、以下が自動で表示される:
- `/screen/[slug]` の結果ページで「LINE を追加する →」CTA がアクティブに。
- 将来、Hero など他の場所で `site.line.addFriendUrl` を参照すると同じ値が出る。

---

## 3. 守るべき原則（Path A の堀）

- **LINE で送客しても、紹介手数料は受け取らない。** これは構造的な堀。
- LINE で出す推薦は **編集者の判断**であり、医療判断は医療機関に委ねる文言を必ず併記。
- LINE トーク内でも「通知も催促もありません。読まない週は、読まないでください。」の
  register を保つ（Substack と一貫）。

---

## 4. ロードマップ（このドキュメント時点 = MVP 着手日）

| フェーズ | 内容 | 必要な LINE 機能 |
|---|---|---|
| MVP (今) | 5問軽診断 + 結果 + 友だち追加リンク | 公式アカウント + 追加URL |
| Phase 1 | LINE トークで 30 問の詳細診断（手動運用） | 公式アカウント（手動配信） |
| Phase 2 | LIFF で本診断（30問・スコア・原因） | LIFF + LINE Login |
| Phase 3 | LIFF で SaaS（スコア推移・写真比較・通知） | LIFF + Messaging API（push） |
| Phase 4 | LINE で課金（月額 SaaS） | LINE Pay or Stripe via LIFF |

MVP 段階で必要なのは表の 1 行目だけ。残りはユーザーが集まってから順次。
