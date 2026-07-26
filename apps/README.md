# apps/

モノレポのアプリ層。npm workspaces（ルート `package.json` の `workspaces`）で管理。

> 注：メインの Web サイト（Next.js）は、Vercel のデプロイ設定（Root Directory =
> リポジトリのルート）を壊さないため、**当面リポジトリのルートに置いたまま**にしている。
> 将来 `apps/web` へ移す場合は、Vercel ダッシュボードで Root Directory を `apps/web`
> に変更する必要がある（コードだけでは切り替わらない）。

## Shouta07/threads をここへ統合する

`apps/threads` に、履歴を保ったまま取り込む（ローカルのクローンで実行）:

```bash
git remote add threads https://github.com/Shouta07/threads.git
git fetch threads
git subtree add --prefix=apps/threads threads main   # 既定ブランチが master なら main→master
git push origin main
```

取り込んだあと、`apps/threads/package.json` の `name` を `@hr/threads` 等にすると
ワークスペースとして一括管理できる（依存も一括 install）。以後の追従は
`git subtree pull --prefix=apps/threads threads main`。
