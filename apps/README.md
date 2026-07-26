# apps/

モノレポのアプリ層（ポリグロット：JS/Python 混在）。

> npm の `workspaces` は `packages/*` のみ（JSパッケージ）。`apps/` 配下は
> 言語を問わずアプリを置く場所で、npm workspace ではない。
> メインの Web サイト（Next.js）は Vercel 設定（Root Directory = ルート）を
> 壊さないため、当面リポジトリのルートに置いたまま。

## apps/threads — Threads 自動投稿（Python / "threads-ceo"）

HisRecoveries の Threads（@hisrecoveries_jp）自動投稿・分析システム。
8エージェント構成（Supervisor / Researcher / Monetize / Writer / Validator /
Poster / Analyst / Fetcher）。詳細は `apps/threads/README.md`・`SYSTEM_DESIGN.md`。

- **位置づけ**：AI Marketing Engine（`docs/AI_MARKETING_ENGINE.md`）の
  「Distribution（配信）」層＝Refine Marketing（SNSで育てる）。
- **コンプラ**：`core/validator.py` が薬機法/景表法/NG表現/文字数を公開前にチェック
  （＝ドキュメント §5-1/5-3 のガードレールが実装済み）。

### ⚠️ 取り込んだが、まだ"動いていない"

GitHub Actions は**リポジトリ直下の `.github/workflows/` しか実行しない**。
threads 側のワークフローは `apps/threads/.github/workflows/` にあり、この階層では
**発火しない**（参照用として保持）。自動投稿を monorepo で動かすには次が必要：

1. **ワークフローをルートへ移設＋改修**：`apps/threads/.github/workflows/*.yml` を
   ルート `.github/workflows/` に置き、各ジョブに `working-directory: apps/threads`
   と `paths: [apps/threads/**]` を付ける（既存の `deploy-vercel.yml` と名前衝突しない）。
2. **Secrets を hisrecoveries リポジトリに設定**（`.env.example` 参照）：
   `THREADS_APP_ID` / `THREADS_APP_SECRET` / `THREADS_ACCESS_TOKEN` /
   `THREADS_USER_ID` / `GEMINI_API_KEY` ほか。※リポジトリ管理者の操作が必要。
3. **admin ページ**（`admin/server.py`）を別途動かす場合は、その Vercel/ホスティング
   設定も別管理（メインサイトの Vercel プロジェクトとは分ける）。

1 は私（Claude）が用意できる。2 はあなたの操作（Secrets登録）。1→2 の順で。

### ローカル実行（参考）

```bash
cd apps/threads
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # 値を実際のトークンに
python -m core.main    # or run.sh
```
